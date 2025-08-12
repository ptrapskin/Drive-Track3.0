

"use client";

import type { Session, Skill } from "@/lib/types";
import { useMemo } from "react";
import SummaryCard from "./summary-card";
import SessionsLog from "./sessions-log";
import { Clock, Milestone, Moon, Book, Award, Users } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "./ui/card";
import Link from "next/link";
import { Button } from "./ui/button";
import { useSkills } from "@/context/skills-context";
import ProgressCard from "./progress-card";
import { useAuth } from "@/context/auth-context";

interface DashboardProps {
  sessions: Session[];
}

export default function Dashboard({ sessions }: DashboardProps) {
  const { skills } = useSkills();
  const { profile, shares, isViewingSharedAccount, activeStudentName } = useAuth();

  const totalHoursGoal = profile?.totalHoursGoal;
  const nightHoursGoal = profile?.nightHoursGoal;
  const hasGoals = !!(totalHoursGoal && nightHoursGoal && totalHoursGoal > 0 && nightHoursGoal > 0);

  const { totalHours, totalMiles, nightHours } = useMemo(() => {
    if (!sessions || sessions.length === 0) {
      return { totalHours: 0, totalMiles: 0, nightHours: 0 };
    }
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
      totalHours: totals.totalDuration / 3600,
      totalMiles: totals.totalMiles,
      nightHours: totals.nightDuration / 3600,
    };
  }, [sessions]);

  const completedSkills = useMemo(() => {
    return skills.filter(skill => skill.completed);
  }, [skills]);

  if (shares.length > 0 && !isViewingSharedAccount) {
    return (
        <Card className="mt-8 text-center">
            <CardHeader>
                <CardTitle className="flex items-center justify-center gap-3">
                    <Users className="w-8 h-8 text-primary" />
                    Welcome, Guardian!
                </CardTitle>
                <CardDescription>
                    You have access to one or more student accounts.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p>
                    Please select a student from the dropdown menu at the top of the page to view their progress and logs.
                </p>
            </CardContent>
        </Card>
    )
  }

  return (
    <div className="space-y-8">
        {isViewingSharedAccount && activeStudentName && (
            <Card className="bg-primary/10 border-primary/20">
                <CardHeader>
                    <CardDescription className="text-primary font-semibold text-center">
                        You are currently viewing the dashboard for {activeStudentName}.
                    </CardDescription>
                </CardHeader>
            </Card>
        )}
       {hasGoals && profile && (
        <section>
          <h2 className="text-2xl font-bold font-headline mb-4">Goals</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ProgressCard 
                title="Total Hours Goal"
                currentValue={totalHours}
                goalValue={profile.totalHoursGoal || 0}
                unit="hours"
              />
              <ProgressCard 
                title="Night Hours Goal"
                currentValue={nightHours}
                goalValue={profile.nightHoursGoal || 0}
                unit="hours"
              />
          </div>
        </section>
       )}
      <section>
        <h2 className="text-2xl font-bold font-headline mb-4">Overall Progress</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SummaryCard
            title="Total Hours"
            value={totalHours.toFixed(1)}
            icon={<Clock className="w-6 h-6 text-primary" />}
          />
          <SummaryCard
            title="Total Miles"
            value={totalMiles.toFixed(1)}
            icon={<Milestone className="w-6 h-6 text-primary" />}
          />
          <SummaryCard
            title="Night Hours"
            value={nightHours.toFixed(1)}
            icon={<Moon className="w-6 h-6 text-primary" />}
          />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2">
            <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-2xl font-bold font-headline">Recent Sessions</CardTitle>
                <Button asChild variant="outline">
                <Link href="/reports/logs">
                    <Book className="mr-2 h-4 w-4" />
                    View Full Log
                </Link>
                </Button>
            </CardHeader>
            <CardContent>
                {sessions && sessions.length > 0 ? (
                    <SessionsLog sessions={sessions} showViewAll={false} />
                ) : (
                    <p className="text-muted-foreground">No driving sessions logged yet.</p>
                )}
            </CardContent>
            </Card>
        </section>

        <section>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold font-headline flex items-center gap-2">
                        <Award className="w-6 h-6 text-yellow-500" />
                        Badges Earned
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {completedSkills.length > 0 ? (
                         <div className="flex flex-wrap gap-4">
                            {completedSkills.map(skill => (
                                <div key={skill.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted" title={skill.title}>
                                    <Award className="w-5 h-5 text-yellow-500" />
                                    <span className="text-sm font-medium">{skill.title}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground">No badges earned yet. Keep practicing!</p>
                    )}
                     <Button asChild variant="outline" className="mt-4 w-full">
                        <Link href="/skills">
                            View All Skills
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </section>
      </div>
    </div>
  );
}

