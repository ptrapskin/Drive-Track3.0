
"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/firebase';
import type { User, UserProfile, Share, GuardianInvite } from '@/lib/types';
import { doc, getDoc, setDoc, collection, query, where, getDocs, collectionGroup } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  profile: UserProfile | null;
  refetchProfile: () => void;
  shares: Share[];
  activeProfileUid: string | null;
  setActiveProfileUid: (uid: string | null) => void;
  isViewingSharedAccount: boolean;
  activeStudentName: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  profile: null,
  refetchProfile: () => {},
  shares: [],
  activeProfileUid: null,
  setActiveProfileUid: () => {},
  isViewingSharedAccount: false,
  activeStudentName: null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [shares, setShares] = useState<Share[]>([]);
  const [activeProfileUid, setActiveProfileUid] = useState<string | null>(null);

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

  const fetchShares = useCallback(async (uid: string) => {
    const guardianInviteRef = doc(db, 'guardianInvites', uid);
    try {
      const docSnap = await getDoc(guardianInviteRef);
      if (docSnap.exists()) {
        const inviteData = docSnap.data() as GuardianInvite;
        const sharesData = Object.entries(inviteData.students).map(([studentUid, studentInfo]) => ({
          studentUid,
          studentEmail: studentInfo.email,
          studentName: studentInfo.name,
        }));
        setShares(sharesData);
      } else {
        setShares([]);
      }
    } catch (e) {
      console.error("Error fetching shares", e);
      setShares([]);
    }
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
        const currentActiveUid = activeProfileUid || user.uid;
        await fetchProfile(currentActiveUid);
    }
  }, [user, fetchProfile, activeProfileUid]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setLoading(true);
      if (firebaseUser) {
        const userPayload = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
        };
        setUser(userPayload);
        setActiveProfileUid(firebaseUser.uid);
        
        let existingProfile = await fetchProfile(firebaseUser.uid);
        if (!existingProfile) {
          existingProfile = await createProfile(firebaseUser) as UserProfile;
        }
        
        await fetchShares(firebaseUser.uid);

      } else {
        setUser(null);
        setProfile(null);
        setShares([]);
        setActiveProfileUid(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchProfile, createProfile, fetchShares]);

  useEffect(() => {
    if (activeProfileUid) {
      fetchProfile(activeProfileUid)
    }
  }, [activeProfileUid, fetchProfile])
  
  const logout = async () => {
    await signOut(auth);
  };

  const isViewingSharedAccount = !!(user && activeProfileUid && user.uid !== activeProfileUid);
  const activeStudentName = isViewingSharedAccount ? shares.find(s => s.studentUid === activeProfileUid)?.studentName || null : null;
  
  const handleSetActiveProfileUid = (uid: string | null) => {
    setActiveProfileUid(uid);
  };


  return (
    <AuthContext.Provider value={{ user, loading, logout, profile, refetchProfile, shares, activeProfileUid, setActiveProfileUid: handleSetActiveProfileUid, isViewingSharedAccount, activeStudentName }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
