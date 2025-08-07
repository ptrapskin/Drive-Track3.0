
"use client";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSkills } from "@/context/skills-context";
import type { Skill } from "@/lib/types";
import { Check, CheckCircle, Award } from "lucide-react";

interface SkillItemProps {
  skill: Skill;
}

export default function SkillItem({ skill }: SkillItemProps) {
  const { toggleSkillCompletion } = useSkills();

  return (
    <AccordionItem value={`item-${skill.id}`}>
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-4">
          {skill.completed ? (
            <Award className="w-6 h-6 text-yellow-500" />
          ) : (
            <div className="w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center">
                 <span className="text-xs font-bold">{skill.id}</span>
            </div>
          )}
          <span className="text-lg font-semibold">{skill.title}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="pl-10">
          <ul className="list-disc space-y-2 pl-5 mb-4">
            {skill.teachingPoints.map((point, index) => (
              <li key={index} className="text-foreground/80">
                {point}
              </li>
            ))}
          </ul>
          <Button
            variant={skill.completed ? "secondary" : "default"}
            onClick={() => toggleSkillCompletion(skill.id)}
          >
            <Check className="mr-2 h-4 w-4" />
            {skill.completed ? "Mark as Incomplete" : "Mark as Completed"}
          </Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
