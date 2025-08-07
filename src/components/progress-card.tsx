
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ProgressCardProps {
  title: string;
  currentValue: number;
  goalValue: number;
  unit: string;
}

export default function ProgressCard({ title, currentValue, goalValue, unit }: ProgressCardProps) {
  const progressPercentage = goalValue > 0 ? (currentValue / goalValue) * 100 : 0;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-baseline mb-2">
            <span className="text-3xl font-bold text-primary">{currentValue.toFixed(1)}</span>
            <span className="text-muted-foreground">/ {goalValue} {unit}</span>
        </div>
        <Progress value={progressPercentage} className="h-3" />
      </CardContent>
    </Card>
  );
}
