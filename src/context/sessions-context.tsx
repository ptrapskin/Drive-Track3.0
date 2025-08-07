"use client";

import React, { createContext, useContext, useState } from 'react';
import type { Session } from '@/lib/types';
import { initialSessions } from '@/lib/data';

interface SessionsContextType {
  sessions: Session[];
  addSession: (newSession: Omit<Session, 'id' | 'date'>) => void;
  updateSession: (updatedSession: Session) => void;
  deleteSession: (sessionId: string) => void;
}

const SessionsContext = createContext<SessionsContextType>({
  sessions: [],
  addSession: () => {},
  updateSession: () => {},
  deleteSession: () => {},
});

export const SessionsProvider = ({ children }: { children: React.ReactNode }) => {
  const [sessions, setSessions] = useState<Session[]>(initialSessions);
  
  const addSession = (newSession: Omit<Session, 'id' | 'date'>) => {
    const sessionWithId: Session = {
      ...newSession,
      id: new Date().getTime().toString(),
      date: new Date().toISOString(),
    };
    setSessions(prevSessions => [sessionWithId, ...prevSessions]);
  };

  const updateSession = (updatedSession: Session) => {
    setSessions(prevSessions => 
      prevSessions.map(session => 
        session.id === updatedSession.id ? updatedSession : session
      )
    );
  };

  const deleteSession = (sessionId: string) => {
    setSessions(prevSessions => 
      prevSessions.filter(session => session.id !== sessionId)
    );
  };

  return (
    <SessionsContext.Provider value={{ sessions, addSession, updateSession, deleteSession }}>
      {children}
    </SessionsContext.Provider>
  );
};

export const useSessions = () => useContext(SessionsContext);