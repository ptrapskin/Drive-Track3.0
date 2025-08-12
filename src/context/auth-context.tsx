
"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/firebase';
import type { User, UserProfile } from '@/lib/types';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  profile: UserProfile | null;
  refetchProfile: () => void;
  activeProfileUid: string | null; // Keep for context consumers
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  profile: null,
  refetchProfile: () => {},
  activeProfileUid: null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (uid: string) => {
    const docRef = doc(db, "profiles", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const profileData = { id: docSnap.id, ...docSnap.data() } as UserProfile;
      setProfile(profileData);
      return profileData;
    }
    setProfile(null);
    return null;
  }, []);

  const createProfile = useCallback(async(firebaseUser: FirebaseUser) => {
    const newProfile: Omit<UserProfile, 'id'> = {
      name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'New User',
      email: firebaseUser.email,
      dateOfBirth: null,
      permitDate: null,
      totalHoursGoal: null,
      nightHoursGoal: null,
    };
    await setDoc(doc(db, "profiles", firebaseUser.uid), newProfile, { merge: true });
    const createdProfile = { ...newProfile, id: firebaseUser.uid };
    setProfile(createdProfile);
    return createdProfile;
  }, []);

  const refetchProfile = useCallback(async () => {
    if (user) {
        await fetchProfile(user.uid);
    }
  }, [user, fetchProfile]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setLoading(true);
      if (firebaseUser) {
        const userPayload = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
        };
        setUser(userPayload);
        
        let existingProfile = await fetchProfile(firebaseUser.uid);
        if (!existingProfile) {
          existingProfile = await createProfile(firebaseUser) as UserProfile;
        }

      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchProfile, createProfile]);
  
  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, profile, refetchProfile, activeProfileUid: user?.uid || null }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
