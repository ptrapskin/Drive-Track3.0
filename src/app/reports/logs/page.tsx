
"use client";

import { useEffect, useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import type { Session } from '@/lib/types';
import SessionsLog from '@/components/sessions-log';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { UserOptions } from 'jspdf-autotable';
import { format } from 'date-fns';
import DriveTrackIcon from '@/components/drive-track-icon';
import { useSessions } from '@/context/sessions-context';

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: UserOptions) => jsPDF;
}

const getTimeOfDay = (date: Date) => {
    const hour = date.getHours();
    if (hour >= 5 && hour < 12) return "Morning";
    if (hour >= 12 && hour < 17) return "Afternoon";
    if (hour >= 17 && hour < 21) return "Evening";
    return "Night";
};

export default function LogsPage() {
  const { sessions } = useSessions();
  const { user, loading } = useAuth();
  const router = useRouter();

  // Mock user profile data - in a real app, this would be fetched from your database
  const userProfile = {
      name: user?.email?.split('@')[0] || "Student Driver",
      dob: 'Jan 1, 2008',
      permitDate: 'Jan 1, 2024',
      totalHoursGoal: 50,
      nightHoursGoal: 10,
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const { totalHours, totalMiles, nightHours } = useMemo(() => {
    const totals = sessions.reduce(
      (acc, session) => {
        acc.totalDuration += session.duration;
        acc.totalMiles += session.miles;
        if (session.isNight) {
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
    
    // Header
    const canvas = document.createElement('canvas');
    const img = document.querySelector('[data-ai-hint="steering wheel"]') as HTMLImageElement;
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(img, 0, 0, img.width, img.height);
    const dataUrl = canvas.toDataURL('image/png');

    doc.addImage(dataUrl, 'PNG', 15, 12, 20, 20);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Drive-Track Driving Log', 40, 22);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Report Generated: ${format(new Date(), 'MMM d, yyyy')}`, 40, 28);
    
    // User Info
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Driver Information', 15, 45);
    doc.setFont('helvetica', 'normal');
    doc.autoTable({
        startY: 48,
        head: [['Name', 'Date of Birth', 'Permit Issue Date', 'Total Goal (hrs)', 'Night Goal (hrs)']],
        body: [[userProfile.name, userProfile.dob, userProfile.permitDate, userProfile.totalHoursGoal, userProfile.nightHoursGoal]],
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
      head: [['Date', 'Duration (hrs)', 'Miles', 'Time of Day', 'Weather', 'Road Types', 'Night Drive']],
      body: sessions.map(session => [
        format(new Date(session.date), "MMM d, yyyy"),
        (session.duration / 3600).toFixed(1),
        session.miles.toFixed(1),
        getTimeOfDay(new Date(session.date)),
        session.weather,
        session.roadTypes.join(', '),
        session.isNight ? 'Yes' : 'No'
      ]),
      theme: 'striped',
      headStyles: { fillColor: [38, 38, 180] },
      styles: { fontSize: 9 },
    });

    doc.save('driving-log.pdf');
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
        <header className="mb-8 flex flex-col md:flex-row justify-between md:items-center">
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
