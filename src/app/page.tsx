"use client";

import { useState, useEffect } from 'react';
import { initialSessions } from '@/lib/data';
import type { Session } from '@/lib/types';
import Dashboard from '@/components/dashboard';
import Tracker from '@/components/tracker';
import { Car, LogOut } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [sessions, setSessions] = useState<Session[]>(initialSessions);
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const addSession = (newSession: Omit<Session, 'id' | 'date'>) => {
    const sessionWithId: Session = {
      ...newSession,
      id: new Date().getTime().toString(),
      date: new Date().toISOString(),
    };
    setSessions(prevSessions => [sessionWithId, ...prevSessions]);
  };
  
  if (loading || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Car className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-bold font-headline tracking-tight text-primary">
                Drive-Track
              </h1>
            </div>
            <p className="text-muted-foreground">
              Welcome, {user.email}! Your personal driving log.
            </p>
          </div>
          <Button onClick={logout} variant="outline">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
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
