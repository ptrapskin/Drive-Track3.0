
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
    return null;
  }, []);
  
  const createProfile = useCallback(async(firebaseUser: FirebaseUser) => {
    const newProfile: UserProfile = {
      email: firebaseUser.email,
      totalHoursGoal: 50,
      nightHoursGoal: 10,
    };
    await setDoc(doc(db, "profiles", firebaseUser.uid), newProfile);
    setProfile(newProfile);
  }, []);

  const fetchShares = useCallback(async (email: string) => {
    const q = query(collection(db, "shares"), where("guardianEmail", "==", email));
    const querySnapshot = await getDocs(q);
    const sharesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Share));
    setShares(sharesData);
  }, []);
  
  const setActiveProfile = (uid: string, email: string) => {
    setActiveProfileUid(uid);
    setActiveProfileEmail(email);
    fetchProfile(uid); 
  };
  
  const resetActiveProfile = () => {
    if (user) {
        setActiveProfileUid(user.uid);
        setActiveProfileEmail(user.email);
        fetchProfile(user.uid);
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
        const existingProfile = await fetchProfile(firebaseUser.uid);
        if (!existingProfile) {
          await createProfile(firebaseUser);
        }
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
    <AuthContext.Provider value={{ user, loading, logout, profile, shares, activeProfileUid, activeProfileEmail, isViewingSharedAccount, setActiveProfile, resetActiveProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
