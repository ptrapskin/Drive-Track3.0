

"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Skill } from '@/lib/types';
import { useAuth } from './auth-context';
import { db } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

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
  const { activeProfileUid } = useAuth();
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
    const docRef = doc(db, 'profiles', activeProfileUid, 'skills', 'userSkills');
    try {
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const skillsData = docSnap.data().skills as Skill[];
            setSkills(skillsData);
        } else {
            setSkills([]);
        }
    } catch (error) {
        console.error("Error fetching skills: ", error);
        setSkills([]);
    } finally {
        setLoading(false);
    }
  }, [activeProfileUid]);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const toggleSkillCompletion = async (skillId: number) => {
    if (!activeProfileUid) return;
    
    const newSkills = skills.map(skill =>
        skill.id === skillId ? { ...skill, completed: !skill.completed } : skill
    );
    setSkills(newSkills);

    try {
        const docRef = doc(db, 'profiles', activeProfileUid, 'skills', 'userSkills');
        await setDoc(docRef, { skills: newSkills });
    } catch (error: any) {
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
