
"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/firebase';
import { getCurrentUser } from '@/firebase-capacitor';
import type { User, UserProfile, Share } from '@/lib/types';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  profile: UserProfile | null;
  shares: Share[];
  activeProfileUid: string | null;
  activeProfileEmail: string | null;
  isViewingSharedAccount: boolean;
  setActiveProfile: (uid: string, email: string) => void;
  resetActiveProfile: () => void;
  refetchProfile: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  profile: null,
  shares: [],
  activeProfileUid: null,
  activeProfileEmail: null,
  isViewingSharedAccount: false,
  setActiveProfile: () => {},
  resetActiveProfile: () => {},
  refetchProfile: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [shares, setShares] = useState<Share[]>([]);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  const [activeProfileUid, setActiveProfileUid] = useState<string | null>(null);
  const [activeProfileEmail, setActiveProfileEmail] = useState<string | null>(null);
  const isViewingSharedAccount = user ? activeProfileUid !== user.uid : false;

  // Add timeout for loading state
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading && !authInitialized) {
        console.warn('Auth initialization timeout - forcing completion');
        setLoading(false);
        setAuthInitialized(true);
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(timeout);
  }, [loading, authInitialized]);


  const fetchProfile = useCallback(async (uid: string) => {
    const docRef = doc(db, "profiles", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const profileData = docSnap.data() as UserProfile;
      setProfile(profileData);
      return profileData;
    }
    setProfile(null); // Explicitly set profile to null if not found
    return null;
  }, []);
  
  const createProfile = useCallback(async(firebaseUser: FirebaseUser) => {
    const newProfile: Omit<UserProfile, 'id' | 'totalHoursGoal' | 'nightHoursGoal' | 'dateOfBirth' | 'permitDate'> = {
      name: firebaseUser.displayName || 'New User',
      email: firebaseUser.email,
    };
    await setDoc(doc(db, "profiles", firebaseUser.uid), newProfile, { merge: true });
    setProfile(newProfile as UserProfile);
    return newProfile;
  }, []);

  const fetchShares = useCallback(async (email: string) => {
    if (!email) {
        setShares([]);
        return;
    }
    const q = query(collection(db, "shares"), where("guardianEmail", "==", email));
    const querySnapshot = await getDocs(q);
    const sharesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Share));
    setShares(sharesData);
  }, []);

  const refetchProfile = useCallback(async () => {
    if (activeProfileUid) {
        await fetchProfile(activeProfileUid);
    }
  }, [activeProfileUid, fetchProfile]);
  
  const setActiveProfile = (uid: string, email: string) => {
    setLoading(true);
    setActiveProfileUid(uid);
    setActiveProfileEmail(email);
    fetchProfile(uid).finally(() => setLoading(false)); 
  };
  
  const resetActiveProfile = () => {
    if (user) {
        setLoading(true);
        setActiveProfileUid(user.uid);
        setActiveProfileEmail(user.email);
        fetchProfile(user.uid).finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    console.log('Setting up auth state listener');
    let unsubscribe: (() => void) | null = null;
    
    // Check if we're in Capacitor
    const isCapacitor = typeof window !== 'undefined' && 
      (window as any).Capacitor !== undefined;
    
    console.log('Environment:', { isCapacitor });

    // Function to handle user authentication
    const handleAuthUser = async (firebaseUser: FirebaseUser | null, source: string = 'firebase') => {
      console.log(`Auth state changed from ${source}:`, firebaseUser ? `User: ${firebaseUser.uid}` : 'No user');
      setLoading(true);
      
      try {
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
          });
          setActiveProfileUid(firebaseUser.uid);
          setActiveProfileEmail(firebaseUser.email);
          
          let existingProfile = await fetchProfile(firebaseUser.uid);
          if (!existingProfile) {
            console.log('Creating new profile for user');
            existingProfile = await createProfile(firebaseUser) as UserProfile;
          }
          setProfile(existingProfile);

          if (firebaseUser.email) {
              await fetchShares(firebaseUser.email);
          }
        } else {
          setUser(null);
          setProfile(null);
          setShares([]);
          setActiveProfileUid(null);
          setActiveProfileEmail(null);
        }
      } catch (error) {
        console.error('Error handling auth user:', error);
      } finally {
        setLoading(false);
        setAuthInitialized(true);
      }
    };

    // Check for existing Capacitor Firebase user first
    if (isCapacitor) {
      getCurrentUser().then((capacitorUser) => {
        if (capacitorUser) {
          console.log('Found existing Capacitor Firebase user:', capacitorUser.uid);
          handleAuthUser({
            uid: capacitorUser.uid,
            email: capacitorUser.email,
            displayName: capacitorUser.displayName
          } as FirebaseUser, 'capacitor');
        } else {
          console.log('No existing Capacitor Firebase user found');
          setLoading(false);
          setAuthInitialized(true);
        }
      }).catch((error) => {
        console.error('Error checking Capacitor user:', error);
        setLoading(false);
        setAuthInitialized(true);
      });
    }

    try {
      unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
        // Only handle web Firebase auth if not in Capacitor or if Capacitor user doesn't exist
        if (!isCapacitor) {
          handleAuthUser(firebaseUser, 'web-firebase');
        }
      });
            }
          } else {
            console.log('User signed out, clearing state');
            setUser(null);
            setProfile(null);
            setShares([]);
            setActiveProfileUid(null);
            setActiveProfileEmail(null);
          }
        } catch (error) {
          console.error('Error in auth state change handler:', error);
        } finally {
          console.log('Auth loading finished');
          setLoading(false);
          setAuthInitialized(true);
        }
      });
    } catch (error) {
      console.error('Failed to set up auth listener:', error);
      setLoading(false);
      setAuthInitialized(true);
    }

    // Set a backup timer to ensure auth initializes even if listener doesn't fire
    const backupTimer = setTimeout(() => {
      if (!authInitialized) {
        console.warn('Auth listener did not fire, forcing initialization');
        setLoading(false);
        setAuthInitialized(true);
      }
    }, isCapacitor ? 5000 : 3000); // Longer timeout for Capacitor

    return () => {
      console.log('Cleaning up auth listener');
      clearTimeout(backupTimer);
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [fetchProfile, createProfile, fetchShares, authInitialized]);
  
  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, profile, shares, activeProfileUid, activeProfileEmail, isViewingSharedAccount, setActiveProfile, resetActiveProfile, refetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
