"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gauge, Play, StopCircle, CloudSun, Milestone, Hourglass } from "lucide-react";
import type { Session, RoadType, WeatherCondition, TimeOfDay } from "@/lib/types";
import SaveSessionDialog from "./save-session-dialog";

interface TrackerProps {
  onSaveSession: (session: Omit<Session, "id" | "date">) => void;
}

type TrackingStatus = "idle" | "tracking" | "paused" | "stopped";

const weatherOptions: WeatherCondition[] = ["Sunny", "Cloudy", "Rainy", "Snowy"];

const formatTime = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;
};

const getTimeOfDay = (): TimeOfDay => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Morning";
    if (hour >= 12 && hour < 17) return "Afternoon";
    if (hour >= 17 && hour < 21) return "Evening";
    return "Night";
}

export default function Tracker({ onSaveSession }: TrackerProps) {
  const [status, setStatus] = useState<TrackingStatus>("idle");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [miles, setMiles] = useState(0);
  const [currentRoadType, setCurrentRoadType] = useState<RoadType>("Residential");
  const [sessionRoadTypes, setSessionRoadTypes] = useState<Set<RoadType>>(new Set());
  const [sessionWeather, setSessionWeather] = useState<WeatherCondition>("Sunny");
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("Afternoon");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === "tracking") {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);

        // Simulate driving
        const randomSpeed = Math.random() * 80; // 0 to 80 mph
        const milesPerSecond = randomSpeed / 3600;
        setMiles((prev) => prev + milesPerSecond);

        let roadType: RoadType;
        if (randomSpeed < 30) {
          roadType = "Residential";
        } else if (randomSpeed < 55) {
          roadType = "Arterial";
        } else {
          roadType = "Highway";
        }
        setCurrentRoadType(roadType);
        setSessionRoadTypes((prev) => new Set(prev).add(roadType));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  const handleStart = () => {
    setTimeOfDay(getTimeOfDay());
    setSessionWeather(weatherOptions[Math.floor(Math.random() * weatherOptions.length)]);
    setSessionRoadTypes(new Set<RoadType>().add("Residential"));
    setStatus("tracking");
  };

  const handleStop = () => {
    setStatus("stopped");
    setIsDialogOpen(true);
  };

  const resetTracker = useCallback(() => {
    setStatus("idle");
    setElapsedSeconds(0);
    setMiles(0);
    setCurrentRoadType("Residential");
    setSessionRoadTypes(new Set());
  }, []);

  const handleSave = useCallback(
    (editedSession: Omit<Session, "id" | "date">) => {
      onSaveSession(editedSession);
      resetTracker();
      setIsDialogOpen(false);
    },
    [onSaveSession, resetTracker]
  );
  
  const handleResume = () => {
    setStatus("tracking");
    setIsDialogOpen(false);
  };
  
  const handleDiscard = () => {
    resetTracker();
    setIsDialogOpen(false);
  };
  
  const finalSessionData = useMemo<Omit<Session, "id" | "date">>(() => ({
      duration: elapsedSeconds,
      miles: miles,
      weather: sessionWeather,
      roadTypes: Array.from(sessionRoadTypes),
      timeOfDay: timeOfDay,
  }), [elapsedSeconds, miles, sessionWeather, sessionRoadTypes, timeOfDay]);

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <Hourglass className="text-primary" />
            New Driving Session
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground">Duration</p>
            <div
              className={`text-6xl font-bold font-mono tracking-tighter ${
                status === "tracking" ? "animate-pulse text-primary" : ""
              }`}
            >
              {formatTime(elapsedSeconds)}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 w-full text-center">
            <div>
              <p className="text-muted-foreground text-sm">Miles</p>
              <p className="font-bold text-2xl flex items-center justify-center gap-2">
                <Gauge />
                {miles.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Weather</p>
              <p className="font-bold text-2xl flex items-center justify-center gap-2">
                <CloudSun />
                {sessionWeather}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Road Type</p>
              <p className="font-bold text-2xl flex items-center justify-center gap-2">
                <Milestone />
                {currentRoadType}
              </p>
            </div>
          </div>

          {status === "idle" ? (
            <Button size="lg" className="w-full" onClick={handleStart}>
              <Play className="mr-2 h-5 w-5" /> Start Tracking
            </Button>
          ) : (
            <Button
              size="lg"
              className="w-full"
              variant="destructive"
              onClick={handleStop}
            >
              <StopCircle className="mr-2 h-5 w-5" /> Stop Session
            </Button>
          )}
        </CardContent>
      </Card>
      
      {finalSessionData && (
        <SaveSessionDialog
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            session={finalSessionData}
            onSave={handleSave}
            onResume={handleResume}
            onDiscard={handleDiscard}
        />
      )}
    </>
  );
}
