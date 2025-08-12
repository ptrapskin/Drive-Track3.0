
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
import { Badge } from "@/components/ui/badge";
import type { Session, TimeOfDay } from "@/lib/types";
import { useForm } from "react-hook-form";
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
import { useState, useEffect } from "react";

interface SaveSessionDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  session: Omit<Session, "id" | "date">;
  onSave: (session: Omit<Session, "id">) => void;
  onResume: () => void;
  onDiscard: () => void;
}

const sessionSchema = z.object({
  duration: z.number().positive("Duration must be positive."),
  miles: z.number().min(0, "Miles must be non-negative."),
  weather: z.enum(["Sunny", "Cloudy", "Rainy", "Snowy"]),
  timeOfDay: z.enum(["Morning", "Afternoon", "Evening", "Night"]),
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
    defaultValues: {
      duration: session.duration,
      miles: parseFloat(session.miles.toFixed(2)),
      weather: session.weather,
      timeOfDay: session.timeOfDay,
    },
  });

  useEffect(() => {
    if (session) {
        form.reset({
            duration: session.duration,
            miles: parseFloat(session.miles.toFixed(2)),
            weather: session.weather,
            timeOfDay: session.timeOfDay,
        });
    }
  }, [session, form]);
  
  const onSubmit = (data: z.infer<typeof sessionSchema>) => {
    onSave({ ...session, ...data, timeOfDay: data.timeOfDay as TimeOfDay, date: new Date().toISOString() });
    setIsEditing(false);
    onOpenChange(false);
  };

  const handleDiscardClick = () => {
    onDiscard();
    onOpenChange(false);
  }
  
  const handleResumeClick = () => {
    onResume();
    onOpenChange(false);
  }

  if (!isOpen) {
      return null;
  }

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
              <FormField
                control={form.control}
                name="timeOfDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time of Day</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isEditing}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time of day" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Morning">Morning</SelectItem>
                        <SelectItem value="Afternoon">Afternoon</SelectItem>
                        <SelectItem value="Evening">Evening</SelectItem>
                        <SelectItem value="Night">Night</SelectItem>
                      </SelectContent>
                    </Select>
                     <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-2">
                 <Label>Road Types Driven</Label>
                 <div className="flex flex-wrap gap-2">
                    {Array.from(session.roadTypes).map(type => <Badge key={type} variant="secondary">{type}</Badge>)}
                 </div>
              </div>

            </div>

            <DialogFooter className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:justify-start">
              <Button type="button" variant="outline" onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? <Check className="mr-2 h-4 w-4"/> : <Edit className="mr-2 h-4 w-4" />}
                {isEditing ? "Done" : "Edit"}
              </Button>
              <Button type="button" variant="destructive" onClick={handleDiscardClick}>
                <Trash2 className="mr-2 h-4 w-4" /> Discard
              </Button>
              <Button type="button" onClick={handleResumeClick}>
                <Play className="mr-2 h-4 w-4" /> Resume
              </Button>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" /> Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
