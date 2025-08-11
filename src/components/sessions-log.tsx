
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Session, TimeOfDay } from "@/lib/types";
import { format } from "date-fns";
import {
  Sun,
  Cloud,
  CloudRain,
  Snowflake,
  Moon,
  Sunrise,
  Sunset,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useSessions } from "@/context/sessions-context";
import { useState } from "react";
import EditSessionDialog from "./edit-session-dialog";

interface SessionsLogProps {
  sessions: Session[];
  showViewAll?: boolean;
}

const WeatherIcon = ({ weather }: { weather: Session["weather"] }) => {
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
      return null;
  }
};

export const TimeOfDayIcon = ({ timeOfDay }: { timeOfDay: TimeOfDay }) => {
    switch(timeOfDay) {
        case "Morning": return <Sunrise className="w-5 h-5 text-orange-400" />;
        case "Afternoon": return <Sun className="w-5 h-5 text-yellow-500" />;
        case "Evening": return <Sunset className="w-5 h-5 text-purple-500" />;
        case "Night": return <Moon className="w-5 h-5 text-gray-400" />;
        default: return null;
    }
}


export default function SessionsLog({ sessions, showViewAll = false }: SessionsLogProps) {
  const { deleteSession } = useSessions();
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  
  const displaySessions = showViewAll ? sessions : sessions.slice(0, 5);
  
  return (
    <div>
        <Table>
        <TableHeader>
            <TableRow>
            <TableHead>Date</TableHead>
            <TableHead className="text-center">Duration</TableHead>
            <TableHead className="text-center">Miles</TableHead>
            <TableHead className="text-center">Time of Day</TableHead>
            <TableHead className="text-center">Weather</TableHead>
            <TableHead>Road Types</TableHead>
            <TableHead className="text-right">Actions</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {displaySessions.map((session) => {
              const sessionDate = new Date(session.date);
              return (
                <TableRow key={session.id}>
                    <TableCell className="font-medium">
                        {format(sessionDate, "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-center">
                    {(session.duration / 3600).toFixed(1)} hrs
                    </TableCell>
                    <TableCell className="text-center">
                    {session.miles.toFixed(1)}
                    </TableCell>
                    <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2" title={session.timeOfDay}>
                            <TimeOfDayIcon timeOfDay={session.timeOfDay} />
                        </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <WeatherIcon weather={session.weather} />
                    </TableCell>
                    <TableCell>
                    <div className="flex flex-wrap gap-1">
                        {session.roadTypes.map((type) => (
                        <Badge variant="secondary" key={type}>
                            {type}
                        </Badge>
                        ))}
                    </div>
                    </TableCell>
                    <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => setEditingSession(session)}>
                                <Pencil className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <Trash2 className="w-4 h-4 text-destructive" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the driving session from your log.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteSession(session.id)}>
                                        Delete
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </TableCell>
                </TableRow>
              )
            })}
        </TableBody>
        </Table>
        {editingSession && (
          <EditSessionDialog 
            session={editingSession}
            isOpen={!!editingSession}
            onOpenChange={(isOpen) => !isOpen && setEditingSession(null)}
          />
        )}
    </div>
  );
}
