"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import type { Session, RoadType, WeatherCondition } from "@/lib/types";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Check, Edit, Trash2, Play, Save } from "lucide-react";
import { useState } from "react";

interface SaveSessionDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  session: Omit<Session, "id" | "date">;
  onSave: (session: Omit<Session, "id" | "date">) => void;
  onResume: () => void;
  onDiscard: () => void;
}

const sessionSchema = z.object({
  duration: z.number().positive("Duration must be positive."),
  miles: z.number().positive("Miles must be positive."),
  weather: z.enum(["Sunny", "Cloudy", "Rainy", "Snowy"]),
  isNight: z.boolean(),
});

export default function SaveSessionDialog({
  isOpen,
  onOpenChange,
  session,
  onSave,
  onResume,
  onDiscard,
}: SaveSessionDialogProps) {
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<z.infer<typeof sessionSchema>>({
    resolver: zodResolver(sessionSchema),
    values: {
      duration: session.duration,
      miles: parseFloat(session.miles.toFixed(2)),
      weather: session.weather,
      isNight: session.isNight,
    },
  });
  
  const onSubmit = (data: z.infer<typeof sessionSchema>) => {
    onSave({ ...session, ...data });
    setIsEditing(false);
  };

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle className="font-headline">Session Complete</DialogTitle>
              <DialogDescription>
                Review your driving session. Save it to your log or make edits.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (seconds)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} disabled={!isEditing} onChange={e => field.onChange(parseInt(e.target.value, 10))}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="miles"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Miles</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} disabled={!isEditing} onChange={e => field.onChange(parseFloat(e.target.value))}/>
                      </FormControl>
                       <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
               <FormField
                control={form.control}
                name="weather"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weather</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isEditing}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select weather" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Sunny">Sunny</SelectItem>
                        <SelectItem value="Cloudy">Cloudy</SelectItem>
                        <SelectItem value="Rainy">Rainy</SelectItem>
                        <SelectItem value="Snowy">Snowy</SelectItem>
                      </SelectContent>
                    </Select>
                     <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-2">
                 <Label>Road Types Driven</Label>
                 <div className="flex flex-wrap gap-2">
                    {session.roadTypes.map(type => <Badge key={type} variant="secondary">{type}</Badge>)}
                 </div>
              </div>
              <FormField
                control={form.control}
                name="isNight"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                        <FormLabel>Night Driving</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!isEditing}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditing(!isEditing)} className="col-span-1">
                {isEditing ? <Check className="mr-2 h-4 w-4"/> : <Edit className="mr-2 h-4 w-4" />}
                {isEditing ? "Done" : "Edit"}
              </Button>
              <Button type="button" variant="destructive" onClick={onDiscard} className="col-span-1">
                <Trash2 className="mr-2 h-4 w-4" /> Discard
              </Button>
              <Button type="button" onClick={onResume} className="col-span-1">
                <Play className="mr-2 h-4 w-4" /> Resume
              </Button>
              <Button type="submit" className="col-span-1">
                <Save className="mr-2 h-4 w-4" /> Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
