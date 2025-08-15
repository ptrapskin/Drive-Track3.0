
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Target } from "lucide-react";

interface ProgressCardProps {
  title: string;
  currentValue: number;
  goalValue: number;
  unit: string;
}

export default function ProgressCard({ title, currentValue, goalValue, unit }: ProgressCardProps) {
  const progressPercentage = goalValue > 0 ? Math.min((currentValue / goalValue) * 100, 100) : 0;
  const isCompleted = currentValue >= goalValue;
  const isNearCompletion = progressPercentage >= 80;
  
  // Determine progress bar color based on completion status
  const getProgressColor = () => {
    if (isCompleted) return "bg-green-500";
    if (isNearCompletion) return "bg-yellow-500";
    return "bg-primary";
  };
  
  return (
    <Card className={isCompleted ? "border-green-200 bg-green-50/50" : ""}>
      <CardHeader>
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          {isCompleted ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <Target className="w-5 h-5 text-primary" />
          )}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-baseline mb-2">
          <span className={`text-3xl font-bold ${isCompleted ? "text-green-600" : "text-primary"}`}>
            {currentValue.toFixed(1)}
          </span>
          <span className="text-muted-foreground">/ {goalValue} {unit}</span>
        </div>
        
        <div className="space-y-2">
          <Progress 
            value={progressPercentage} 
            className="h-3"
            // Apply custom styling for different progress states
          />
          
          <div className="flex justify-between items-center text-sm">
            <span className={`font-medium ${isCompleted ? "text-green-600" : "text-muted-foreground"}`}>
              {progressPercentage.toFixed(0)}% Complete
            </span>
            {isCompleted && (
              <span className="text-green-600 font-medium flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Goal Achieved!
              </span>
            )}
            {!isCompleted && (
              <span className="text-muted-foreground">
                {(goalValue - currentValue).toFixed(1)} {unit} remaining
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
