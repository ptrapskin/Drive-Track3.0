
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Session } from '@/lib/types';
import { useAuth } from './auth-context';
import { db, auth } from '@/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface SessionsContextType {
  sessions: Session[];
  addSession: (newSession: Omit<Session, 'id'>) => void;
  updateSession: (updatedSession: Session) => void;
  deleteSession: (sessionId: string) => void;
  loading: boolean;
}

const SessionsContext = createContext<SessionsContextType>({
  sessions: [],
  addSession: () => {},
  updateSession: () => {},
  deleteSession: () => {},
  loading: true,
});

export const SessionsProvider = ({ children }: { children: React.ReactNode }) => {
  const { activeProfileUid } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSessions = useCallback(async () => {
    console.log('Sessions: fetchSessions called with activeProfileUid:', activeProfileUid);
    if (!activeProfileUid) {
        console.log('Sessions: No activeProfileUid, clearing sessions');
        setSessions([]);
        setLoading(false);
        return;
    };
    
    try {
        console.log('Sessions: Starting to fetch sessions for uid:', activeProfileUid);
        setLoading(true);
        
        // Check if we're in Capacitor environment
        const isCapacitor = typeof window !== 'undefined' && (window as any).Capacitor !== undefined;
        
        if (isCapacitor) {
            console.log('Sessions: Using Capacitor Firebase Firestore');
            
            // Use Capacitor Firebase Firestore plugin
            const { FirebaseFirestore } = await import('@capacitor-firebase/firestore');
            
            const collectionPath = `profiles/${activeProfileUid}/sessions`;
            console.log('Sessions: Querying collection path:', collectionPath);
            
            const result = await FirebaseFirestore.getCollection({
              reference: collectionPath,
              compositeFilter: {
                type: 'and',
                queryConstraints: []
              }
            });
            
            console.log('Sessions: Capacitor Firestore result:', result);
            
            const sessions: Session[] = result.snapshots.map((snap: any) => ({
              id: snap.id,
              ...snap.data
            })).sort((a: Session, b: Session) => new Date(b.date).getTime() - new Date(a.date).getTime());
            
            console.log('Sessions: Processed sessions from Capacitor:', sessions);
            setSessions(sessions);
            
        } else {
            console.log('Sessions: Using web Firebase SDK');
            
            // Test Firestore connectivity and auth state
            console.log('Sessions: Testing Firestore connectivity...');
            console.log('Sessions: Current web auth state:', auth.currentUser?.uid);
            console.log('Sessions: Auth matches activeProfileUid:', auth.currentUser?.uid === activeProfileUid);
            console.log('Sessions: DB instance:', !!db);
            console.log('Sessions: Collection function:', !!collection);
            
            // Add timeout protection for web SDK
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Sessions fetch timeout')), 10000);
            });
            
            const fetchPromise = (async () => {
                console.log('Sessions: Creating collection reference...');
                const sessionsCollection = collection(db, 'profiles', activeProfileUid, 'sessions');
                console.log('Sessions: Collection reference created for path:', `profiles/${activeProfileUid}/sessions`);
                
                console.log('Sessions: Creating query...');
                const q = query(sessionsCollection, orderBy('date', 'desc'));
                console.log('Sessions: Query created with orderBy date desc');
                
                console.log('Sessions: Executing getDocs...');
                const querySnapshot = await getDocs(q);
                console.log('Sessions: getDocs completed successfully');
                console.log('Sessions: Query snapshot metadata:', querySnapshot.metadata);
                console.log('Sessions: Query executed, got', querySnapshot.docs.length, 'documents');
                console.log('Sessions: Empty query?', querySnapshot.empty);
                console.log('Sessions: From cache?', querySnapshot.metadata.fromCache);
                console.log('Sessions: Has pending writes?', querySnapshot.metadata.hasPendingWrites);
                
                const sessions = querySnapshot.docs.map((docSnap: any) => {
                    const data = docSnap.data();
                    console.log('Sessions: Processing doc:', docSnap.id, 'data:', data);
                    return { id: docSnap.id, ...data } as Session;
                });
                return sessions;
            })();
            
            const sessionsData = await Promise.race([fetchPromise, timeoutPromise]) as Session[];
            console.log('Sessions: Fetched', sessionsData.length, 'sessions');
            setSessions(sessionsData);
        }
    } catch (error: any) {
        console.error('Sessions: Error fetching sessions - full error:', error);
        console.error('Sessions: Error message:', error?.message);
        console.error('Sessions: Error code:', error?.code);
        console.error('Sessions: Error stack:', error?.stack);
        console.error('Sessions: Error name:', error?.name);
        
        // Don't show toast for timeout, just log it
        if (!error.message?.includes('timeout')) {
            toast({ variant: 'destructive', title: "Error fetching sessions", description: error.message });
        }
        // Set empty sessions on error so dashboard still loads
        setSessions([]);
    } finally {
        console.log('Sessions: Finished fetching, setting loading to false');
        setLoading(false);
    }
  }, [activeProfileUid, toast]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Safety timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.warn('Sessions: Loading timeout - forcing completion');
      setLoading(false);
    }, 15000);

    return () => clearTimeout(timeout);
  }, []);
  
  const addSession = async (newSession: Omit<Session, 'id'>) => {
    console.log('Sessions: addSession called with:', newSession);
    console.log('Sessions: activeProfileUid:', activeProfileUid);
    
    if (!activeProfileUid) {
      console.error('Sessions: No activeProfileUid available for saving session');
      toast({ variant: 'destructive', title: "Error", description: "User not authenticated" });
      return;
    }
    
    try {
        console.log('Sessions: Attempting to save session to Firestore...');
        console.log('Sessions: Session data to save:', newSession);
        
        // Check if we're in Capacitor environment
        const isCapacitor = typeof window !== 'undefined' && (window as any).Capacitor !== undefined;
        
        if (isCapacitor) {
            console.log('Sessions: Using Capacitor Firebase Firestore');
            
            // Use Capacitor Firebase Firestore plugin
            const { FirebaseFirestore } = await import('@capacitor-firebase/firestore');
            
            const collectionPath = `profiles/${activeProfileUid}/sessions`;
            console.log('Sessions: Adding document to collection path:', collectionPath);
            
            const result = await FirebaseFirestore.addDocument({
              reference: collectionPath,
              data: newSession
            });
            
            console.log('Sessions: Capacitor Firestore addDocument result:', result);
            
            const sessionWithId: Session = { ...newSession, id: result.reference.id };
            setSessions(prevSessions => {
              const updated = [sessionWithId, ...prevSessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
              console.log('Sessions: Updated sessions list, now has', updated.length, 'sessions');
              return updated;
            });
            
            toast({ variant: 'default', title: "Success", description: "Session saved successfully!" });
            
        } else {
            console.log('Sessions: Using web Firebase SDK');
            console.log('Sessions: Current web auth state:', auth.currentUser?.uid);
            console.log('Sessions: Auth matches activeProfileUid:', auth.currentUser?.uid === activeProfileUid);
            console.log('Sessions: DB instance available:', !!db);
            console.log('Sessions: Collection function available:', !!collection);
            console.log('Sessions: AddDoc function available:', !!addDoc);
            
            console.log('Sessions: Creating collection reference...');
            const sessionsCollection = collection(db, 'profiles', activeProfileUid, 'sessions');
            console.log('Sessions: Collection reference created for path:', `profiles/${activeProfileUid}/sessions`);
            
            console.log('Sessions: Calling addDoc...');
            const docRef = await addDoc(sessionsCollection, newSession);
            console.log('Sessions: Session saved successfully with ID:', docRef.id);
            
            const sessionWithId: Session = { ...newSession, id: docRef.id };
            setSessions(prevSessions => {
              const updated = [sessionWithId, ...prevSessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
              console.log('Sessions: Updated sessions list, now has', updated.length, 'sessions');
              return updated;
            });
            
            toast({ variant: 'default', title: "Success", description: "Session saved successfully!" });
        }
    } catch (error: any) {
        console.error('Sessions: Error adding session - full error:', error);
        console.error('Sessions: Error message:', error?.message);
        console.error('Sessions: Error code:', error?.code);
        console.error('Sessions: Error stack:', error?.stack);
        console.error('Sessions: Error name:', error?.name);
        toast({ variant: 'destructive', title: "Error adding session", description: error.message || 'Unknown error occurred' });
    }
  };

  const updateSession = async (updatedSession: Session) => {
    if (!activeProfileUid) return;
    try {
        const sessionRef = doc(db, 'profiles', activeProfileUid, 'sessions', updatedSession.id);
        const { id, ...sessionData } = updatedSession;
        await updateDoc(sessionRef, sessionData);
        setSessions(prevSessions => 
          prevSessions.map(session => 
            session.id === updatedSession.id ? updatedSession : session
          ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        );
    } catch (error: any) {
         toast({ variant: 'destructive', title: "Error updating session", description: error.message });
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (!activeProfileUid) return;
    try {
        await deleteDoc(doc(db, 'profiles', activeProfileUid, 'sessions', sessionId));
        setSessions(prevSessions => 
          prevSessions.filter(session => session.id !== sessionId)
        );
    } catch (error: any) {
        toast({ variant: 'destructive', title: "Error deleting session", description: error.message });
    }
  };

  return (
    <SessionsContext.Provider value={{ sessions, addSession, updateSession, deleteSession, loading }}>
      {children}
    </SessionsContext.Provider>
  );
};

export const useSessions = () => useContext(SessionsContext);
