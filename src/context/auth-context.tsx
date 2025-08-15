"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, signOut, User as FirebaseUser, getAuth, signInWithCustomToken } from 'firebase/auth';
import { auth, db } from '@/firebase';
import type { User, UserProfile, Share } from '@/lib/types';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { FirebaseFirestore } from '@capacitor-firebase/firestore';

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
  checkCapacitorAuth: () => Promise<void>;
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
  checkCapacitorAuth: async () => {},
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

  const fetchProfile = useCallback(async (uid: string) => {
    try {
      if (Capacitor.isNativePlatform()) {
        // Use Capacitor Firebase for native platforms
        console.log("Auth: Using Capacitor Firebase to fetch profile");
        const result = await FirebaseFirestore.getDocument({
          reference: `profiles/${uid}`,
        });
        
        if (result.snapshot.data) {
          const profileData = result.snapshot.data as UserProfile;
          console.log("Auth: Capacitor profile fetched:", profileData);
          setProfile(profileData);
          return profileData;
        } else {
          console.log("Auth: No profile found in Capacitor");
          setProfile(null);
          return null;
        }
      } else {
        // Use web Firebase for browser/development
        console.log("Auth: Using web Firebase to fetch profile");
        const docRef = doc(db, "profiles", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const profileData = docSnap.data() as UserProfile;
          console.log("Auth: Web profile fetched:", profileData);
          setProfile(profileData);
          return profileData;
        }
        setProfile(null);
        return null;
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
      return null;
    }
  }, []);
  
  const createProfile = useCallback(async(firebaseUser: FirebaseUser) => {
    try {
      const newProfile: Omit<UserProfile, 'id' | 'totalHoursGoal' | 'nightHoursGoal' | 'dateOfBirth' | 'permitDate'> = {
        name: firebaseUser.displayName || 'New User',
        email: firebaseUser.email,
      };
      
      if (Capacitor.isNativePlatform()) {
        // Use Capacitor Firebase for native platforms
        console.log("Auth: Using Capacitor Firebase to create profile");
        await FirebaseFirestore.setDocument({
          reference: `profiles/${firebaseUser.uid}`,
          data: newProfile,
          merge: true,
        });
      } else {
        // Use web Firebase for browser/development
        console.log("Auth: Using web Firebase to create profile");
        await setDoc(doc(db, "profiles", firebaseUser.uid), newProfile, { merge: true });
      }
      
      setProfile(newProfile as UserProfile);
      return newProfile;
    } catch (error) {
      console.error('Error creating profile:', error);
      return null;
    }
  }, []);

  const fetchShares = useCallback(async (email: string) => {
    try {
      if (!email) {
          setShares([]);
          return;
      }
      
      if (Capacitor.isNativePlatform()) {
        // For now, skip sharing functionality on native platforms
        // Complex queries are not easily supported in Capacitor Firebase
        console.log("Auth: Skipping shares fetch on native platform");
        setShares([]);
        return;
      } else {
        // Use web Firebase for browser/development
        console.log("Auth: Using web Firebase to fetch shares");
        const q = query(collection(db, "shares"), where("guardianEmail", "==", email));
        const querySnapshot = await getDocs(q);
        const sharesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Share));
        setShares(sharesData);
      }
    } catch (error) {
      console.error('Error fetching shares:', error);
      setShares([]);
    }
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

  // Force loading to false after a timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.warn('Auth initialization timeout - forcing completion');
      setLoading(false);
      setAuthInitialized(true);
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    console.log('Setting up auth state listener');
    let unsubscribe: (() => void) | null = null;
    
    try {
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
        console.log('Auth state changed:', firebaseUser ? `User: ${firebaseUser.uid}` : 'No user');
        
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

            if (firebaseUser.email) {
                await fetchShares(firebaseUser.email);
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

    return () => {
      console.log('Cleaning up auth listener');
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [fetchProfile, createProfile, fetchShares]);
  
  const logout = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        // Use Capacitor Firebase for native platforms
        console.log("Auth: Using Capacitor Firebase to sign out");
        await FirebaseAuthentication.signOut();
      } else {
        // Use web Firebase for browser/development
        console.log("Auth: Using web Firebase to sign out");
        await signOut(auth);
      }
      
      // Clear local state
      setUser(null);
      setProfile(null);
      setShares([]);
      setActiveProfileUid(null);
      setActiveProfileEmail(null);
      console.log("Auth: Logout completed successfully");
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const checkCapacitorAuth = async () => {
    try {
      const isCapacitor = typeof window !== 'undefined' && (window as any).Capacitor !== undefined;
      if (!isCapacitor) return;
      
      console.log('Checking Capacitor Firebase auth...');
      const result = await FirebaseAuthentication.getCurrentUser();
      console.log('Capacitor auth result:', result);
      
      if (result.user) {
        console.log('Found Capacitor user, updating context');
        const capacitorUser = result.user;
        
        setUser({
          uid: capacitorUser.uid,
          email: capacitorUser.email,
        });
        setActiveProfileUid(capacitorUser.uid);
        setActiveProfileEmail(capacitorUser.email);
        
        // Sync auth tokens between Capacitor and web Firebase
        try {
          console.log('Getting ID token from Capacitor Firebase...');
          const tokenResult = await FirebaseAuthentication.getIdToken({ forceRefresh: true });
          console.log('Got ID token, length:', tokenResult.token.length);
          
          // Try to use the ID token to authenticate the web Firebase instance
          console.log('Attempting to authenticate web Firebase...');
          
          // Method 1: Try using onIdTokenChanged to force auth state sync
          const { onIdTokenChanged } = await import('firebase/auth');
          
          // Create a mock user object and manually trigger auth state
          const mockUser = {
            uid: capacitorUser.uid,
            email: capacitorUser.email,
            emailVerified: capacitorUser.emailVerified || false,
            isAnonymous: false,
            displayName: capacitorUser.displayName,
            photoURL: capacitorUser.photoUrl,
            phoneNumber: capacitorUser.phoneNumber,
            tenantId: capacitorUser.tenantId,
            providerData: capacitorUser.providerData || [],
            metadata: {
              creationTime: new Date(capacitorUser.metadata?.creationTime || Date.now()).toISOString(),
              lastSignInTime: new Date(capacitorUser.metadata?.lastSignInTime || Date.now()).toISOString()
            },
            getIdToken: async () => tokenResult.token,
            getIdTokenResult: async () => ({ token: tokenResult.token }),
            reload: async () => {},
            toJSON: () => ({})
          };
          
          // Force the auth state to recognize the user
          (auth as any)._updateCurrentUser(mockUser);
          console.log('Successfully set web Firebase auth state');
          console.log('Web Firebase auth state after sync:', auth.currentUser?.uid);
          
        } catch (tokenError: any) {
          console.error('Failed to sync auth tokens:', tokenError);
          console.log('Token error details:', tokenError?.message, tokenError?.code);
          
          // Fallback: try a simpler approach
          console.log('Attempting fallback auth sync...');
          try {
            // Just wait a bit and check if auth state syncs naturally
            await new Promise(resolve => setTimeout(resolve, 1000));
            await auth.authStateReady();
            console.log('Web Firebase auth state after fallback:', auth.currentUser?.uid);
          } catch (fallbackError) {
            console.error('Fallback auth sync failed:', fallbackError);
          }
        }
        
        // Fetch or create profile
        let existingProfile = await fetchProfile(capacitorUser.uid);
        if (!existingProfile && capacitorUser.email) {
          console.log('Creating new profile for Capacitor user');
          const newProfile: Omit<UserProfile, 'id' | 'totalHoursGoal' | 'nightHoursGoal' | 'dateOfBirth' | 'permitDate'> = {
            name: capacitorUser.displayName || 'New User',
            email: capacitorUser.email,
          };
          
          // Use Capacitor Firebase to create profile
          await FirebaseFirestore.setDocument({
            reference: `profiles/${capacitorUser.uid}`,
            data: newProfile,
            merge: true,
          });
          setProfile(newProfile as UserProfile);
        }

        if (capacitorUser.email) {
          await fetchShares(capacitorUser.email);
        }
        
        setLoading(false);
        setAuthInitialized(true);
        console.log('Capacitor auth sync complete');
      }
    } catch (error) {
      console.error('Error checking Capacitor auth:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      logout, 
      profile, 
      shares, 
      activeProfileUid, 
      activeProfileEmail, 
      isViewingSharedAccount, 
      setActiveProfile, 
      resetActiveProfile, 
      refetchProfile,
      checkCapacitorAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
