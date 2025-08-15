
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Skill } from '@/lib/types';
import { initialSkills as skillsTemplate } from '@/lib/skills-data';
import { useAuth } from './auth-context';
import { useToast } from '@/hooks/use-toast';
import { Capacitor } from '@capacitor/core';
import { FirebaseFirestore } from '@capacitor-firebase/firestore';
import { db } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface SkillsContextType {
  skills: Skill[];
  toggleSkillCompletion: (skillId: number) => void;
  completedSkillsCount: number;
  loading: boolean;
  refetchSkills: () => void;
}

const SkillsContext = createContext<SkillsContextType>({
  skills: [],
  toggleSkillCompletion: () => {},
  completedSkillsCount: 0,
  loading: true,
  refetchSkills: () => {},
});

export const SkillsProvider = ({ children }: { children: React.ReactNode }) => {
  const { activeProfileUid, isViewingSharedAccount } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSkills = useCallback(async () => {
    if (!activeProfileUid) {
        setSkills([]);
        setLoading(false);
        return;
    };

    setLoading(true);
    
    try {
        let skillsData: Skill[] = [];
        
        if (Capacitor.isNativePlatform()) {
            // Use Capacitor Firebase for native platforms
            console.log("Skills: Using Capacitor Firebase to fetch skills");
            const result = await FirebaseFirestore.getDocument({
                reference: `profiles/${activeProfileUid}/skills/userSkills`,
            });
            
            if (result.snapshot.data && result.snapshot.data.skills) {
                skillsData = result.snapshot.data.skills as Skill[];
                console.log("Skills: Capacitor Firestore result:", skillsData);
            } else {
                console.log("Skills: No skills document found in Capacitor");
            }
        } else {
            // Use web Firebase for browser/development
            console.log("Skills: Using web Firebase to fetch skills");
            const docRef = doc(db, 'profiles', activeProfileUid, 'skills', 'userSkills');
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                skillsData = docSnap.data().skills as Skill[];
                console.log("Skills: Web Firestore result:", skillsData);
            } else {
                console.log("Skills: No skills document found in web Firebase");
            }
        }
        
        setSkills(skillsData);
    } catch (error) {
        console.error("Error fetching skills: ", error);
        setSkills([]); // Reset on error
    } finally {
        setLoading(false);
    }
  }, [activeProfileUid]);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const toggleSkillCompletion = async (skillId: number) => {
    if (!activeProfileUid || isViewingSharedAccount) return;
    
    const newSkills = skills.map(skill =>
        skill.id === skillId ? { ...skill, completed: !skill.completed } : skill
    );
    setSkills(newSkills);

    try {
        if (Capacitor.isNativePlatform()) {
            // Use Capacitor Firebase for native platforms
            console.log("Skills: Using Capacitor Firebase to update skills");
            await FirebaseFirestore.setDocument({
                reference: `profiles/${activeProfileUid}/skills/userSkills`,
                data: { skills: newSkills },
            });
        } else {
            // Use web Firebase for browser/development
            console.log("Skills: Using web Firebase to update skills");
            const docRef = doc(db, 'profiles', activeProfileUid, 'skills', 'userSkills');
            await setDoc(docRef, { skills: newSkills });
        }
    } catch (error: any) {
        // Revert UI change on error
        setSkills(skills);
        toast({ variant: 'destructive', title: 'Error updating skill', description: error.message });
    }
  };

  const completedSkillsCount = skills.filter(skill => skill.completed).length;

  return (
    <SkillsContext.Provider value={{ skills, toggleSkillCompletion, completedSkillsCount, loading, refetchSkills: fetchSkills }}>
      {children}
    </SkillsContext.Provider>
  );
};

export const useSkills = () => useContext(SkillsContext);
