
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
  const lastPositionRef = useRef<{latitude: number, longitude: number, speed?: number} | null>(null);
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
                        timeout: 15000, // Reduced timeout to 15 seconds
                        maximumAge: 10000 // Allow up to 10 seconds old position data as fallback
                    },
                    (position, err) => {
                        if (err) {
                            console.error("Geolocation error:", err);
                            console.error("Error details:", {
                                code: err.code,
                                message: err.message,
                                timestamp: new Date().toISOString()
                            });
                            
                            // Don't immediately stop tracking for timeout errors - they're common
                            if (err.code === 3) { // TIMEOUT
                                console.warn("GPS timeout occurred, waiting for next update...");
                                return; // Continue tracking, don't alert user for timeouts
                            }
                            
                            // Provide specific error messages based on error code
                            let errorMessage = "GPS tracking error occurred.";
                            let shouldStop = true;
                            
                            if (err.code === 1) { // PERMISSION_DENIED
                                errorMessage = "Location access denied. Please enable location services for Drive-Track in Settings.";
                            } else if (err.code === 2) { // POSITION_UNAVAILABLE
                                errorMessage = "Unable to determine location. Please ensure GPS is enabled and try again outdoors.";
                                shouldStop = false; // Don't stop, GPS might recover
                            }
                            
                            if (shouldStop) {
                                alert(errorMessage);
                                setStatus("idle");
                            } else {
                                console.warn(errorMessage);
                            }
                            return;
                        }

                        if (position && position.coords) {
                            console.log('GPS position received:', {
                                lat: position.coords.latitude,
                                lon: position.coords.longitude,
                                accuracy: position.coords.accuracy,
                                speed: position.coords.speed,
                                timestamp: new Date().toISOString()
                            });
                            
                            // Validate coordinates are reasonable
                            if (Math.abs(position.coords.latitude) > 90 || 
                                Math.abs(position.coords.longitude) > 180) {
                                console.error('Invalid GPS coordinates received:', position.coords);
                                return;
                            }
                            
                            // Filter out positions with very poor accuracy (> 100 meters)
                            if (position.coords.accuracy && position.coords.accuracy > 100) {
                                console.warn('Poor GPS accuracy, skipping update:', position.coords.accuracy);
                                return;
                            }
                            
                            const coords = {
                                latitude: position.coords.latitude,
                                longitude: position.coords.longitude,
                                speed: position.coords.speed || 0
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
                                
                                // Only add distance if it's reasonable (not a GPS jump)
                                if (distance < 0.5) { // Less than half a mile jump
                                    setMiles((prevMiles) => prevMiles + distance);
                                } else {
                                    console.warn('Large GPS jump detected, ignoring distance:', distance);
                                }
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
            timerIntervalRef.current = null;
        }
        if (watchIdRef.current) {
            try {
                Geolocation.clearWatch({ id: watchIdRef.current });
                console.log('GPS watch cleared successfully');
            } catch (error) {
                console.error('Error clearing GPS watch:', error);
            }
            watchIdRef.current = null;
        }
        lastPositionRef.current = null;
    }

    return () => {
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }
        if (watchIdRef.current) {
            Geolocation.clearWatch({ id: watchIdRef.current }).catch(console.error);
            watchIdRef.current = null;
        }
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
    
    // Clean up timers and GPS watch
    if(timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
    }
    if(watchIdRef.current) {
        try {
            Geolocation.clearWatch({ id: watchIdRef.current });
            console.log('GPS watch cleared in resetTracker');
        } catch (error) {
            console.error('Error clearing GPS watch in resetTracker:', error);
        }
        watchIdRef.current = null;
    }
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
