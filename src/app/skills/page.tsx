
"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useSkills } from "@/context/skills-context";
import { Accordion } from "@/components/ui/accordion";
import { Award, CheckCircle2 } from "lucide-react";
import SkillItem from "@/components/skill-item";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import DashboardHeader from "@/components/dashboard-header";

export default function SkillsPage() {
  const { user, loading, logout, activeProfileEmail, isViewingSharedAccount } = useAuth();
  const router = useRouter();
  const { skills, completedSkillsCount } = useSkills();
  const totalSkills = skills.length;
  const progressPercentage = totalSkills > 0 ? (completedSkillsCount / totalSkills) * 100 : 0;

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);
  
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
        <header className="mb-8 md:hidden">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold font-headline tracking-tight text-primary">
              Driving Skills
            </h1>
          </div>
          <p className="text-muted-foreground">
            Learn these skills to become a safe and confident driver.
          </p>
        </header>

        {isViewingSharedAccount && (
            <Card className="mb-8 bg-destructive/10 border-destructive">
                <CardContent className="p-4">
                    <p className="font-medium text-center text-destructive-foreground">
                        You are viewing another user's skills. Editing is disabled.
                    </p>
                </CardContent>
            </Card>
        )}
        
        <Card className="mb-8">
            <CardHeader>
                <CardTitle>Your Progress</CardTitle>
                <CardDescription>You've completed {completedSkillsCount} of {totalSkills} skills.</CardDescription>
            </CardHeader>
            <CardContent>
                <Progress value={progressPercentage} className="h-4" />
            </CardContent>
        </Card>

        <Accordion type="single" collapsible className="w-full">
          {skills.map((skill) => (
            <SkillItem key={skill.id} skill={skill} />
          ))}
        </Accordion>
      </div>
    </main>
  );
}
