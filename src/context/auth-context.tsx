
"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { auth, db, functions } from '@/firebase';
import type { User, UserProfile } from '@/lib/types';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  profile: UserProfile | null;
  refetchProfile: () => void;
  activeProfileUid: string | null; 
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

  const fetchUserDocument = useCallback(async (uid: string) => {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as User;
    }
    return null;
  }, []);

  const fetchProfile = useCallback(async (familyId: string) => {
    if (!familyId) return null;
    const docRef = doc(db, "profiles", familyId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const profileData = { id: docSnap.id, ...docSnap.data() } as UserProfile;
      setProfile(profileData);
      return profileData;
    }
    setProfile(null);
    return null;
  }, []);

  const createUserAndProfile = useCallback(async(firebaseUser: FirebaseUser) => {
    const familyId = firebaseUser.uid; // New user owns their profile initially

    // Create user document
    const userDoc: User = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      familyId: familyId,
    };
    await setDoc(doc(db, "users", firebaseUser.uid), userDoc);

    // Create profile document
    const newProfile: Omit<UserProfile, 'id'> = {
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'New User',
        email: firebaseUser.email,
        dateOfBirth: null,
        permitDate: null,
        totalHoursGoal: 50,
        nightHoursGoal: 10,
        familyId: familyId,
        ownerId: firebaseUser.uid
    };
    await setDoc(doc(db, "profiles", familyId), newProfile);

    setProfile({ ...newProfile, id: familyId });
    return userDoc;
  }, []);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setLoading(true);
      if (firebaseUser) {
        let userDoc = await fetchUserDocument(firebaseUser.uid);

        // This block handles linking a new guardian to a student's family
        if (!userDoc?.familyId) {
          const processInvite = httpsCallable(functions, 'processInvite');
          try {
            await processInvite({ email: firebaseUser.email });
            // Re-fetch user doc after processing invite to get the new familyId
            userDoc = await fetchUserDocument(firebaseUser.uid);
          } catch(e) {
            console.log("No pending invite found or error processing it. Will create a new profile.");
          }
        }
        
        if (!userDoc) {
          userDoc = await createUserAndProfile(firebaseUser);
        }

        setUser(userDoc);
        if (userDoc.familyId) {
          await fetchProfile(userDoc.familyId);
        } else {
          setProfile(null);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchUserDocument, createUserAndProfile, fetchProfile]);
  
  const refetchProfile = useCallback(async () => {
    if (user?.familyId) {
        await fetchProfile(user.familyId);
    }
  }, [user, fetchProfile]);

  const logout = async () => {
    await signOut(auth);
  };

  // The activeProfileUid should be the familyId, as that's what links users.
  const activeProfileUid = profile?.id || null;

  return (
    <AuthContext.Provider value={{ user, loading, logout, profile, refetchProfile, activeProfileUid }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
