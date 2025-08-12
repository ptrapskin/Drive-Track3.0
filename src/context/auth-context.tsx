
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

  const [activeProfileUid, setActiveProfileUid] = useState<string | null>(null);
  const [activeProfileEmail, setActiveProfileEmail] = useState<string | null>(null);
  const isViewingSharedAccount = user ? activeProfileUid !== user.uid : false;


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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setLoading(true);
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
        });
        setActiveProfileUid(firebaseUser.uid);
        setActiveProfileEmail(firebaseUser.email);
        
        let existingProfile = await fetchProfile(firebaseUser.uid);
        if (!existingProfile) {
          existingProfile = await createProfile(firebaseUser) as UserProfile;
        }
        setProfile(existingProfile); // Ensure profile is set after fetch/create

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
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchProfile, createProfile, fetchShares]);
  
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
