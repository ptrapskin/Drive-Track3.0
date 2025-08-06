import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Session } from "@/lib/types";
import { format } from "date-fns";
import {
  Sun,
  Cloud,
  CloudRain,
  Snowflake,
  Moon,
  Home,
  Building2,
  Tractor,
} from "lucide-react";

interface SessionsLogProps {
  sessions: Session[];
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

export default function SessionsLog({ sessions }: SessionsLogProps) {
  return (
    <div className="rounded-lg border">
        <Table>
        <TableHeader>
            <TableRow>
            <TableHead>Date</TableHead>
            <TableHead className="text-center">Duration</TableHead>
            <TableHead className="text-center">Miles</TableHead>
            <TableHead className="text-center">Conditions</TableHead>
            <TableHead>Road Types</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {sessions.map((session) => (
            <TableRow key={session.id}>
                <TableCell className="font-medium">
                {format(new Date(session.date), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="text-center">
                {(session.duration / 3600).toFixed(1)} hrs
                </TableCell>
                <TableCell className="text-center">
                {session.miles.toFixed(1)}
                </TableCell>
                <TableCell className="flex justify-center items-center gap-2">
                <WeatherIcon weather={session.weather} />
                {session.isNight && <Moon className="w-5 h-5" />}
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
            </TableRow>
            ))}
        </TableBody>
        </Table>
    </div>
  );
}
