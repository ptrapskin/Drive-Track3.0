import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { ReactNode } from "react";

interface EnhancedSummaryCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  goalValue?: number;
  currentValue?: number;
  unit?: string;
}

export default function EnhancedSummaryCard({ 
  title, 
  value, 
  icon, 
  goalValue, 
  currentValue, 
  unit 
}: EnhancedSummaryCardProps) {
  const hasGoal = goalValue !== undefined && goalValue > 0 && currentValue !== undefined;
  const progressPercentage = hasGoal ? Math.min((currentValue / goalValue) * 100, 100) : 0;
  const isCompleted = hasGoal ? currentValue >= goalValue : false;

  return (
    <Card className={isCompleted ? "border-green-200 bg-green-50/50" : ""}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-2">{value}</div>
        
        {hasGoal && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>Goal: {goalValue} {unit}</span>
              <span className={isCompleted ? "text-green-600 font-medium" : ""}>
                {progressPercentage.toFixed(0)}%
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            {isCompleted && (
              <div className="text-xs text-green-600 font-medium">
                ✓ Goal achieved!
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
