"use client";

import { useState } from 'react';
import { initialSessions } from '@/lib/data';
import type { Session } from '@/lib/types';
import Dashboard from '@/components/dashboard';
import Tracker from '@/components/tracker';
import { Car } from 'lucide-react';

export default function Home() {
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
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Car className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold font-headline tracking-tight text-primary">
              Drive-Track
            </h1>
          </div>
          <p className="text-muted-foreground">
            Your personal driving log and automatic session tracker.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <Tracker onSaveSession={addSession} />
          </div>
          <div className="lg:col-span-3">
            <Dashboard sessions={sessions} />
          </div>
        </div>
      </div>
    </main>
  );
}
