
"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Gauge, Play, StopCircle, Milestone } from "lucide-react";
import type { Session, RoadType, WeatherCondition, TimeOfDay } from "@/lib/types";
import SaveSessionDialog from "./save-session-dialog";
import { TimeOfDayIcon } from "./sessions-log";
import { haversineDistance } from "@/lib/geolocation";
import { Sun, Cloud, CloudRain, Snowflake } from "lucide-react";
import { Geolocation } from '@capacitor/geolocation';


interface TrackerProps {
  onSaveSession: (session: Omit<Session, "id" | "date">) => void;
}

type TrackingStatus = "idle" | "tracking" | "paused" | "stopped";

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

const mapWeatherCondition = (weatherId: number): WeatherCondition => {
    if (weatherId >= 200 && weatherId < 600) return "Rainy";
    if (weatherId >= 600 && weatherId < 700) return "Snowy";
    if (weatherId === 800) return "Sunny";
    if (weatherId > 800) return "Cloudy";
    return "Sunny";
};

const WeatherIcon = ({ weather }: { weather: WeatherCondition }) => {
  switch (weather) {
    case "Sunny":
      return <Sun className="w-5 h-5 text-yellow-500" />;
    case "Cloudy":
      return <Cloud className="w-5 h-5 text-gray-500" />;
    case "Rainy":
      return <CloudRain className="w-5 h-5 text-blue-500" />;
    case "Snowy":
      return <Snowflake className="w-5 h-5 text-cyan-500" />;
    default:
      return <Sun className="w-5 h-5" />;
  }
};


export default function Tracker({ onSaveSession }: TrackerProps) {
  const [status, setStatus] = useState<TrackingStatus>("idle");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [miles, setMiles] = useState(0);
  const [currentRoadType, setCurrentRoadType] = useState<RoadType>("Residential");
  const [sessionRoadTypes, setSessionRoadTypes] = useState<Set<RoadType>>(new Set());
  const [sessionWeather, setSessionWeather] = useState<WeatherCondition>("Sunny");
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("Afternoon");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const watchIdRef = useRef<string | null>(null);
  const lastPositionRef = useRef<{latitude: number, longitude: number} | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchWeather = async (lat: number, lon: number) => {
    try {
        const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
        if (!apiKey || apiKey === 'your_api_key_here') {
            console.warn("OpenWeather API key is not configured. Using fallback weather.");
            setSessionWeather("Sunny");
            return;
        }
        
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Weather API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        const weatherId = data.weather[0].id;
        const mappedWeather = mapWeatherCondition(weatherId);
        setSessionWeather(mappedWeather);
        
        console.log(`Weather updated: ${mappedWeather} (${data.weather[0].description})`);
    } catch (error) {
        console.error("Could not fetch weather:", error);
        // Fallback to a default weather
        setSessionWeather("Sunny");
    }
  };


  useEffect(() => {
    if (status === "tracking") {
        // Start timer
        timerIntervalRef.current = setInterval(() => {
            setElapsedSeconds((prev) => prev + 1);
        }, 1000);

        // Start GPS tracking with native Capacitor plugin
        const startGPSTracking = async () => {
            try {
                console.log('Starting GPS tracking...');
                
                // Check current permission status first
                const currentPermissions = await Geolocation.checkPermissions();
                console.log('Current location permissions:', currentPermissions);
                
                if (currentPermissions.location === 'denied') {
                    alert("Location access is denied. Please go to Settings > Privacy & Security > Location Services and enable location access for Drive-Track.");
                    setStatus("idle");
                    return;
                }
                
                // Request permissions if not granted
                if (currentPermissions.location !== 'granted') {
                    console.log('Requesting location permissions...');
                    const permissions = await Geolocation.requestPermissions();
                    console.log('Permission request result:', permissions);
                    
                    if (permissions.location !== 'granted') {
                        alert("Location permission is required for GPS tracking. Please enable location access in Settings > Privacy & Security > Location Services > Drive-Track.");
                        setStatus("idle");
                        return;
                    }
                }

                console.log('Location permissions granted, starting position watch...');

                // Start watching position with more robust settings
                watchIdRef.current = await Geolocation.watchPosition(
                    {
                        enableHighAccuracy: true,
                        timeout: 30000, // Increased timeout to 30 seconds
                        maximumAge: 5000 // Allow slightly older position data
                    },
                    (position, err) => {
                        if (err) {
                            console.error("Geolocation error:", err);
                            console.error("Error details:", {
                                code: err.code,
                                message: err.message
                            });
                            
                            // Provide specific error messages based on error code
                            let errorMessage = "GPS tracking error occurred.";
                            if (err.code === 1) {
                                errorMessage = "Location access denied. Please enable location services for Drive-Track in Settings.";
                            } else if (err.code === 2) {
                                errorMessage = "Unable to determine location. Please ensure GPS is enabled and try again outdoors.";
                            } else if (err.code === 3) {
                                errorMessage = "Location request timed out. Please try again, preferably outdoors with clear GPS signal.";
                            }
                            
                            alert(errorMessage);
                            setStatus("idle");
                            return;
                        }

                        if (position) {
                            console.log('GPS position received:', {
                                lat: position.coords.latitude,
                                lon: position.coords.longitude,
                                accuracy: position.coords.accuracy,
                                speed: position.coords.speed
                            });
                            
                            const coords = {
                                latitude: position.coords.latitude,
                                longitude: position.coords.longitude,
                                speed: position.coords.speed
                            };
                            
                            if (lastPositionRef.current) {
                                // Calculate distance using simple coordinate difference
                                const distance = haversineDistance(
                                    {
                                        latitude: lastPositionRef.current.latitude,
                                        longitude: lastPositionRef.current.longitude
                                    } as any,
                                    {
                                        latitude: coords.latitude,
                                        longitude: coords.longitude
                                    } as any
                                );
                                setMiles((prevMiles) => prevMiles + distance);
                            } else {
                                // This is the first location update, fetch weather
                                console.log('First GPS position received, fetching weather...');
                                fetchWeather(coords.latitude, coords.longitude);
                            }

                            lastPositionRef.current = coords;
                            const speedMph = coords.speed ? coords.speed * 2.23694 : 0;
                            
                            let roadType: RoadType;
                            if (speedMph <= 30) {
                                roadType = "Residential";
                            } else if (speedMph <= 55) {
                                roadType = "Arterial";
                            } else {
                                roadType = "Highway";
                            }
                            setCurrentRoadType(roadType);
                            setSessionRoadTypes((prev) => new Set(prev).add(roadType));
                        }
                    }
                );
                
                console.log('GPS watch started with ID:', watchIdRef.current);
                
            } catch (error) {
                console.error("Failed to start GPS tracking:", error);
                alert("Unable to start GPS tracking. Please ensure location services are enabled in Settings > Privacy & Security > Location Services > Drive-Track.");
                setStatus("idle");
            }
        };

        startGPSTracking();
    } else {
        // Clear timers and watchers
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
        }
        if (watchIdRef.current) {
            Geolocation.clearWatch({ id: watchIdRef.current });
            watchIdRef.current = null;
        }
        lastPositionRef.current = null;
    }

    return () => {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        if (watchIdRef.current) Geolocation.clearWatch({ id: watchIdRef.current });
    };
  }, [status]);


  const handleStart = () => {
    setTimeOfDay(getTimeOfDay());
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
    if(timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if(watchIdRef.current) Geolocation.clearWatch({ id: watchIdRef.current });
    lastPositionRef.current = null;
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
      roadTypes: Array.from(sessionRoadTypes).sort(),
      timeOfDay: timeOfDay,
  }), [elapsedSeconds, miles, sessionWeather, sessionRoadTypes, timeOfDay]);

  return (
    <>
      <Card className="shadow-lg">
        <CardContent className="flex flex-col items-center justify-center space-y-6 pt-6">
          <div className="text-center">
            <p className="text-muted-foreground">Duration</p>
            <div
              className={`text-5xl font-bold font-mono tracking-tighter ${
                status === "tracking" ? "animate-pulse text-primary" : ""
              }`}
            >
              {formatTime(elapsedSeconds)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 w-full text-center">
            <div>
              <p className="text-muted-foreground text-sm">Miles</p>
              <p className="font-bold text-2xl flex items-center justify-center gap-2">
                <Gauge />
                {miles.toFixed(2)}
              </p>
            </div>
             <div>
              <p className="text-muted-foreground text-sm">Time of Day</p>
              <p className="font-bold text-2xl flex items-center justify-center gap-2">
                <TimeOfDayIcon timeOfDay={timeOfDay} />
                {timeOfDay}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Weather</p>
              <p className="font-bold text-2xl flex items-center justify-center gap-2">
                <WeatherIcon weather={sessionWeather} />
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
