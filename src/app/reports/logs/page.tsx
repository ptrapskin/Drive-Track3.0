"use client";

import { useEffect, useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import SessionsLog from '@/components/sessions-log';
import PDFExportComponent from '@/components/pdf-export';
import { useSessions } from '@/context/sessions-context';
import DashboardHeader from '@/components/dashboard-header';
import type { UserProfile } from '@/lib/types';

export default function LogsPage() {
  const { sessions, loading: sessionsLoading } = useSessions();
  const { user, profile, loading: authLoading, logout, activeProfileEmail, isViewingSharedAccount } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);
  
  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const { totalHours, totalMiles, nightHours } = useMemo(() => {
    const totals = sessions.reduce(
      (acc, session) => {
        acc.totalDuration += session.duration;
        acc.totalMiles += session.miles;
        if (session.timeOfDay === 'Night') {
          acc.nightDuration += session.duration;
        }
        return acc;
      },
      { totalDuration: 0, totalMiles: 0, nightDuration: 0 }
    );
    return {
      totalHours: (totals.totalDuration / 3600).toFixed(1),
      totalMiles: totals.totalMiles.toFixed(1),
      nightHours: (totals.nightDuration / 3600).toFixed(1),
    };
  }, [sessions]);

  if (authLoading || sessionsLoading || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
       <DashboardHeader 
        userEmail={activeProfileEmail || user.email}
        onLogout={handleLogout}
        isViewingSharedAccount={isViewingSharedAccount}
       />
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-4 mb-6">
          <h1 className="text-2xl font-bold">Driving Sessions Log</h1>
          
          {/* Enhanced PDF Export Component */}
          <PDFExportComponent 
            sessions={sessions}
            userProfile={profile}
            className="w-full max-w-md"
          />
        </div>
        
        <SessionsLog sessions={sessions} />
      </div>
    </main>
  );
}
