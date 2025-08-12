
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useSkills } from "@/context/skills-context";
import { Accordion } from "@/components/ui/accordion";
import { Award, CheckCircle2 } from "lucide-react";
import SkillItem from "@/components/skill-item";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import DashboardHeader from "@/components/dashboard-header";
import { initialSkills } from "@/lib/skills-data";
import { db } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";

export default function SkillsPage() {
  const { user, loading, logout, activeProfileEmail, isViewingSharedAccount, activeProfileUid } = useAuth();
  const router = useRouter();
  const { skills, completedSkillsCount, loading: skillsLoading } = useSkills();
  const [initialized, setInitialized] = useState(false);
  
  const totalSkills = initialSkills.length;
  const progressPercentage = totalSkills > 0 ? (completedSkillsCount / totalSkills) * 100 : 0;

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);
  
  useEffect(() => {
    // If skills are loaded and the list is empty, this is the first visit.
    // Initialize the skills from the template.
    const initialize = async () => {
      if (!skillsLoading && skills.length === 0 && activeProfileUid && !isViewingSharedAccount) {
        try {
          const newSkills = initialSkills.map(skill => ({ ...skill, completed: false }));
          const docRef = doc(db, 'profiles', activeProfileUid, 'skills', 'userSkills');
          await setDoc(docRef, { skills: newSkills });
          // The context will refetch, but we can optimistically update here if needed
          // For now, we'll let the context's listener handle the update.
        } catch (error) {
          console.error("Failed to initialize skills:", error);
        }
      }
      setInitialized(true);
    };

    if (activeProfileUid) {
      initialize();
    }
  }, [skillsLoading, skills, activeProfileUid, isViewingSharedAccount]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const pageLoading = loading || (skillsLoading && !initialized);

  if (pageLoading || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  const skillsToDisplay = skills.length > 0 ? skills : initialSkills.map(s => ({...s, completed: false}));

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
          {skillsToDisplay.map((skill) => (
            <SkillItem key={skill.id} skill={skill} />
          ))}
        </Accordion>
      </div>
    </main>
  );
}
