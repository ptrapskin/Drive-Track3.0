
"use client";

import { useEffect } from 'react';
import Dashboard from '@/components/dashboard';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useSessions } from '@/context/sessions-context';
import DashboardHeader from '@/components/dashboard-header';

export default function DashboardPage() {
  const { sessions, loading: sessionsLoading } = useSessions();
  const { user, loading: authLoading, logout, activeProfileEmail, isViewingSharedAccount } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const loading = authLoading || sessionsLoading;

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (loading || !user) {
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
        <Dashboard sessions={sessions} />
      </div>
    </main>
  );
}
