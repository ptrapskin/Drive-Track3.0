
"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/firebase';
import type { User, UserProfile, Share } from '@/lib/types';
import { doc, getDoc, setDoc, collection, query, where, getDocs, writeBatch, serverTimestamp } from 'firebase/firestore';

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
  
  const processPendingShares = async (firebaseUser: FirebaseUser) => {
    if (!firebaseUser.email) return;

    const sharesQuery = query(
      collection(db, "shares"),
      where("guardianEmail", "==", firebaseUser.email),
      where("status", "==", "pending")
    );

    const querySnapshot = await getDocs(sharesQuery);
    if (querySnapshot.empty) return;

    const batch = writeBatch(db);
    let familyId: string | null = null;
    
    querySnapshot.forEach(docSnap => {
      const share = docSnap.data() as Share;
      familyId = share.familyId; // Use the familyId from the first pending share.
      batch.update(docSnap.ref, { status: "accepted", acceptedAt: serverTimestamp() });
    });

    if (familyId) {
      const userDocRef = doc(db, "users", firebaseUser.uid);
      batch.set(userDocRef, { familyId }, { merge: true });
      await batch.commit();
      return familyId;
    }
    
    return null;
  };

  const createUserAndProfile = useCallback(async(firebaseUser: FirebaseUser) => {
    let familyId = await processPendingShares(firebaseUser);
    
    if (!familyId) {
      familyId = firebaseUser.uid; // New user owns their profile initially
    }

    // Create user document
    const userDoc: User = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      familyId: familyId,
    };
    await setDoc(doc(db, "users", firebaseUser.uid), userDoc);

    // Create profile document only if this user is starting a new family
    if (familyId === firebaseUser.uid) {
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
    }

    return userDoc;
  }, []);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setLoading(true);
      if (firebaseUser) {
        let userDoc = await fetchUserDocument(firebaseUser.uid);
        
        if (!userDoc) {
          userDoc = await createUserAndProfile(firebaseUser);
        } else if (!userDoc.familyId) {
          // If user exists but has no family, check for shares
          const updatedFamilyId = await processPendingShares(firebaseUser);
          if (updatedFamilyId) {
            userDoc.familyId = updatedFamilyId;
          }
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
