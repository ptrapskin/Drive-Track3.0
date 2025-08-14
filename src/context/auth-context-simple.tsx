"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/firebase';
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

  const fetchProfile = useCallback(async (uid: string) => {
    try {
      const docRef = doc(db, "profiles", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const profileData = docSnap.data() as UserProfile;
        setProfile(profileData);
        return profileData;
      }
      setProfile(null);
      return null;
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
      await setDoc(doc(db, "profiles", firebaseUser.uid), newProfile, { merge: true });
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
      const q = query(collection(db, "shares"), where("guardianEmail", "==", email));
      const querySnapshot = await getDocs(q);
      const sharesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Share));
      setShares(sharesData);
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
      await signOut(auth);
      // Clear local state
      setUser(null);
      setProfile(null);
      setShares([]);
      setActiveProfileUid(null);
      setActiveProfileEmail(null);
    } catch (error) {
      console.error('Error signing out:', error);
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
      refetchProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
