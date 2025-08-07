"use client";

import React, { createContext, useContext, useState } from 'react';
import type { Skill } from '@/lib/types';
import { initialSkills } from '@/lib/skills-data';

interface SkillsContextType {
  skills: Skill[];
  toggleSkillCompletion: (skillId: number) => void;
  completedSkillsCount: number;
}

const SkillsContext = createContext<SkillsContextType>({
  skills: [],
  toggleSkillCompletion: () => {},
  completedSkillsCount: 0,
});

export const SkillsProvider = ({ children }: { children: React.ReactNode }) => {
  const [skills, setSkills] = useState<Skill[]>(initialSkills);

  const toggleSkillCompletion = (skillId: number) => {
    setSkills(prevSkills =>
      prevSkills.map(skill =>
        skill.id === skillId ? { ...skill, completed: !skill.completed } : skill
      )
    );
  };

  const completedSkillsCount = skills.filter(skill => skill.completed).length;

  return (
    <SkillsContext.Provider value={{ skills, toggleSkillCompletion, completedSkillsCount }}>
      {children}
    </SkillsContext.Provider>
  );
};

export const useSkills = () => useContext(SkillsContext);
