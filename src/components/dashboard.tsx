"use client";

import type { Session } from "@/lib/types";
import { useMemo } from "react";
import SummaryCard from "./summary-card";
import SessionsLog from "./sessions-log";
import { Clock, Milestone, Moon } from "lucide-react";

interface DashboardProps {
  sessions: Session[];
}

export default function Dashboard({ sessions }: DashboardProps) {
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

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold font-headline mb-4">Overall Progress</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SummaryCard
            title="Total Hours"
            value={totalHours}
            icon={<Clock className="w-6 h-6 text-primary" />}
          />
          <SummaryCard
            title="Total Miles"
            value={totalMiles}
            icon={<Milestone className="w-6 h-6 text-primary" />}
          />
          <SummaryCard
            title="Night Hours"
            value={nightHours}
            icon={<Moon className="w-6 h-6 text-primary" />}
          />
        </div>
      </section>
      <section>
        <h2 className="text-2xl font-bold font-headline mb-4">Recent Sessions</h2>
        <SessionsLog sessions={sessions} />
      </section>
    </div>
  );
}
