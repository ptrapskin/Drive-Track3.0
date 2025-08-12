
"use client";

import { useEffect, useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import SessionsLog from '@/components/sessions-log';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { UserOptions } from 'jspdf-autotable';
import { format } from 'date-fns';
import { useSessions } from '@/context/sessions-context';
import DashboardHeader from '@/components/dashboard-header';
import type { UserProfile } from '@/lib/types';

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: UserOptions) => jsPDF;
}

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


  const downloadPdf = () => {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Drive-Track Driving Log', 15, 22);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Report Generated: ${format(new Date(), 'MMM d, yyyy')}`, 15, 28);
    
    // User Info
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Driver Information', 15, 45);
    doc.setFont('helvetica', 'normal');
    doc.autoTable({
        startY: 48,
        head: [['Name', 'Date of Birth', 'Permit Issue Date', 'Total Goal (hrs)', 'Night Goal (hrs)']],
        body: [[
            user?.email?.split('@')[0] || "Student Driver",
            profile?.dateOfBirth ? format(new Date(profile.dateOfBirth), 'MMM d, yyyy') : 'N/A',
            profile?.permitDate ? format(new Date(profile.permitDate), 'MMM d, yyyy') : 'N/A',
            profile?.totalHoursGoal || 50,
            profile?.nightHoursGoal || 10
        ]],
        theme: 'grid',
        styles: { fontSize: 10 },
    });

    // Summary
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Overall Progress', 15, (doc as any).lastAutoTable.finalY + 10);
    doc.setFont('helvetica', 'normal');
    doc.autoTable({
        startY: (doc as any).lastAutoTable.finalY + 13,
        head: [['Total Hours', 'Total Miles', 'Night Hours']],
        body: [[totalHours, totalMiles, nightHours]],
        theme: 'grid',
        styles: { fontSize: 10 },
    });

    // Sessions Log
    doc.autoTable({
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [['Date', 'Duration (hrs)', 'Miles', 'Time of Day', 'Weather', 'Road Types']],
      body: sessions.map(session => [
        format(new Date(session.date), "MMM d, yyyy"),
        (session.duration / 3600).toFixed(1),
        session.miles.toFixed(1),
        session.timeOfDay,
        session.weather,
        session.roadTypes.join(', '),
      ]),
      theme: 'striped',
      headStyles: { fillColor: [38, 38, 180] },
      styles: { fontSize: 9 },
    });

    doc.save('driving-log.pdf');
  };
  
  const loading = authLoading || sessionsLoading;

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
        <header className="mb-8 flex flex-col md:flex-row justify-between md:items-center">
            <div className="md:hidden">
                 <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-4xl font-bold font-headline tracking-tight text-primary">
                        Full Driving Log
                    </h1>
                </div>
                <p className="text-muted-foreground">
                    A complete record of all your driving sessions.
                </p>
            </div>
            <Button onClick={downloadPdf} className="mt-4 md:mt-0">
                <Download className="mr-2 h-4 w-4" />
                Download PDF
            </Button>
        </header>
        <div className="rounded-lg border">
            <SessionsLog sessions={sessions} />
        </div>
      </div>
    </main>
  );
}
