"use client";

import React, { createContext, useContext, useState } from 'react';
import type { Session } from '@/lib/types';
import { initialSessions } from '@/lib/data';

interface SessionsContextType {
  sessions: Session[];
  addSession: (newSession: Omit<Session, 'id' | 'date'>) => void;
}

const SessionsContext = createContext<SessionsContextType>({
  sessions: [],
  addSession: () => {},
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

  return (
    <SessionsContext.Provider value={{ sessions, addSession }}>
      {children}
    </SessionsContext.Provider>
  );
};

export const useSessions = () => useContext(SessionsContext);
