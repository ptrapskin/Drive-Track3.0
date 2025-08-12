
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Skill } from '@/lib/types';
import { initialSkills as skillsTemplate } from '@/lib/skills-data';
import { useAuth } from './auth-context';
import { db } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface SkillsContextType {
  skills: Skill[];
  toggleSkillCompletion: (skillId: number) => void;
  completedSkillsCount: number;
  loading: boolean;
}

const SkillsContext = createContext<SkillsContextType>({
  skills: [],
  toggleSkillCompletion: () => {},
  completedSkillsCount: 0,
  loading: true,
});

export const SkillsProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSkills = useCallback(async () => {
    if (!user) {
        setSkills([]);
        setLoading(false);
        return;
    };

    setLoading(true);
    const docRef = doc(db, 'profiles', user.uid, 'skills', 'userSkills');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const skillsData = docSnap.data().skills as Skill[];
        setSkills(skillsData);
    } else {
        // If no skills doc, create one from the template
        const newSkills = skillsTemplate.map(skill => ({ ...skill, completed: false }));
        setSkills(newSkills);
        try {
            await setDoc(docRef, { skills: newSkills });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error initializing skills', description: error.message });
        }
    }
    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const toggleSkillCompletion = async (skillId: number) => {
    if (!user) return;
    
    const newSkills = skills.map(skill =>
        skill.id === skillId ? { ...skill, completed: !skill.completed } : skill
    );
    setSkills(newSkills);

    try {
        const docRef = doc(db, 'profiles', user.uid, 'skills', 'userSkills');
        await setDoc(docRef, { skills: newSkills });
    } catch (error: any) {
        // Revert UI change on error
        setSkills(skills);
        toast({ variant: 'destructive', title: 'Error updating skill', description: error.message });
    }
  };

  const completedSkillsCount = skills.filter(skill => skill.completed).length;

  return (
    <SkillsContext.Provider value={{ skills, toggleSkillCompletion, completedSkillsCount, loading }}>
      {children}
    </SkillsContext.Provider>
  );
};

export const useSkills = () => useContext(SkillsContext);
