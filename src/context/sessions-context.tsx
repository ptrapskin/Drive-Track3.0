
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Session } from '@/lib/types';
import { useAuth } from './auth-context';
import { db } from '@/firebase';
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
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSessions = useCallback(async () => {
    if (!user) {
        setSessions([]);
        setLoading(false);
        return;
    };
    try {
        setLoading(true);
        const sessionsCollection = collection(db, 'profiles', user.uid, 'sessions');
        const q = query(sessionsCollection, orderBy('date', 'desc'));
        const querySnapshot = await getDocs(q);
        const sessionsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Session));
        setSessions(sessionsData);
    } catch (error: any) {
        toast({ variant: 'destructive', title: "Error fetching sessions", description: error.message });
    } finally {
        setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);
  
  const addSession = async (newSession: Omit<Session, 'id'>) => {
    if (!user) return;
    try {
        const docRef = await addDoc(collection(db, 'profiles', user.uid, 'sessions'), newSession);
        const sessionWithId: Session = { ...newSession, id: docRef.id };
        setSessions(prevSessions => [sessionWithId, ...prevSessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error: any) {
        toast({ variant: 'destructive', title: "Error adding session", description: error.message });
    }
  };

  const updateSession = async (updatedSession: Session) => {
    if (!user) return;
    try {
        const sessionRef = doc(db, 'profiles', user.uid, 'sessions', updatedSession.id);
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
    if (!user) return;
    try {
        await deleteDoc(doc(db, 'profiles', user.uid, 'sessions', sessionId));
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
