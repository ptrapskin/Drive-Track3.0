
"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useSkills } from "@/context/skills-context";
import { Accordion } from "@/components/ui/accordion";
import SkillItem from "@/components/skill-item";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import DashboardHeader from "@/components/dashboard-header";
import { initialSkills } from "@/lib/skills-data";
import { Button } from "@/components/ui/button";
import { Capacitor } from '@capacitor/core';
import { FirebaseFirestore } from '@capacitor-firebase/firestore';
import { db } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";

export default function SkillsPage() {
  const { user, loading, logout, activeProfileEmail, isViewingSharedAccount, activeProfileUid } = useAuth();
  const router = useRouter();
  const { skills, completedSkillsCount, loading: skillsLoading, refetchSkills } = useSkills();
  
  const totalSkills = initialSkills.length;
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

  const initializeSkills = async () => {
    if (!activeProfileUid) return;
    try {
      const newSkills = initialSkills.map(skill => ({ ...skill, completed: false }));
      
      if (Capacitor.isNativePlatform()) {
        // Use Capacitor Firebase for native platforms
        console.log("Skills: Using Capacitor Firebase to initialize skills");
        await FirebaseFirestore.setDocument({
          reference: `profiles/${activeProfileUid}/skills/userSkills`,
          data: { skills: newSkills },
        });
      } else {
        // Use web Firebase for browser/development
        console.log("Skills: Using web Firebase to initialize skills");
        const docRef = doc(db, 'profiles', activeProfileUid, 'skills', 'userSkills');
        await setDoc(docRef, { skills: newSkills });
      }
      
      refetchSkills();
    } catch (error) {
      console.error("Failed to initialize skills:", error);
    }
  };


  const pageLoading = loading || skillsLoading;

  if (pageLoading || !user) {
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
            <Card className="mb-8 bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                    <p className="font-medium text-center text-blue-700">
                        You are viewing a shared student account. You can help them track their driving skills.
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

        {skills.length === 0 ? (
            <Card>
                <CardContent className="pt-6 text-center">
                    <p className="mb-4">
                        {isViewingSharedAccount 
                            ? "This student hasn't started tracking skills yet." 
                            : "You haven't started tracking your skills yet."
                        }
                    </p>
                    <Button onClick={initializeSkills}>
                      Initialize Skills List
                    </Button>
                </CardContent>
            </Card>
        ) : (
            <Accordion type="single" collapsible className="w-full">
            {skills.map((skill) => (
                <SkillItem key={skill.id} skill={skill} />
            ))}
            </Accordion>
        )}
      </div>
    </main>
  );
}
