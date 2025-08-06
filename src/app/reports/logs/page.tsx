
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { initialSessions } from '@/lib/data';
import type { Session } from '@/lib/types';
import SessionsLog from '@/components/sessions-log';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import DriveTrackIcon from '@/components/drive-track-icon';

export default function LogsPage() {
  const [sessions, setSessions] = useState<Session[]>(initialSessions);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
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
                    <DriveTrackIcon className="w-8 h-8 text-primary" />
                    <h1 className="text-4xl font-bold font-headline tracking-tight text-primary">
                        Full Driving Log
                    </h1>
                </div>
                <p className="text-muted-foreground">
                    A complete record of all your driving sessions.
                </p>
            </div>
            <Button asChild variant="outline">
                <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Link>
            </Button>
        </header>
        <div className="rounded-lg border">
            <SessionsLog sessions={sessions} />
        </div>
      </div>
    </main>
  );
}
