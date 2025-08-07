
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "./ui/date-picker";
import type { RoadType, Session, TimeOfDay, WeatherCondition } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { MultiSelect } from "./ui/multi-select";
import { Save } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { useSessions } from "@/context/sessions-context";

const roadTypeOptions: { value: RoadType; label: string }[] = [
    { value: "Residential", label: "Residential" },
    { value: "Arterial", label: "Arterial" },
    { value: "Highway", label: "Highway" },
];

const editLogSchema = z.object({
  date: z.date({
    required_error: "A date is required.",
  }),
  duration: z.coerce.number().min(1, "Duration must be at least 1 minute."),
  miles: z.coerce.number().optional(),
  weather: z.enum(["Sunny", "Cloudy", "Rainy", "Snowy"], {
      required_error: "Weather condition is required."
  }),
  roadTypes: z.array(z.string()).min(1, "At least one road type is required."),
  timeOfDay: z.enum(["Morning", "Afternoon", "Evening", "Night"], {
      required_error: "Time of day is required."
  }),
});

type EditLogFormValues = z.infer<typeof editLogSchema>;

interface EditSessionDialogProps {
    session: Session;
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export default function EditSessionDialog({ session, isOpen, onOpenChange }: EditSessionDialogProps) {
  const { toast } = useToast();
  const { updateSession } = useSessions();
  
  const form = useForm<EditLogFormValues>({
    resolver: zodResolver(editLogSchema),
    defaultValues: {
      date: new Date(session.date),
      duration: session.duration / 60, // convert seconds to minutes
      miles: session.miles,
      weather: session.weather,
      roadTypes: session.roadTypes,
      timeOfDay: session.timeOfDay,
    },
  });

  function onSubmit(data: EditLogFormValues) {
    const updatedSession: Session = {
        ...session,
        ...data,
        miles: data.miles || 0,
        duration: data.duration * 60, // Convert minutes back to seconds
        date: data.date.toISOString(),
        roadTypes: data.roadTypes as RoadType[],
        timeOfDay: data.timeOfDay as TimeOfDay,
    };
    updateSession(updatedSession);
    onOpenChange(false); // Close dialog

    toast({
        title: "Session Updated",
        description: "Your driving session has been updated successfully.",
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Driving Session</DialogTitle>
          <DialogDescription>
            Make changes to your logged session here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                            <FormLabel>Date</FormLabel>
                            <DatePicker date={field.value} setDate={field.onChange} />
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                     <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Duration (in minutes)</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="e.g. 60" {...field} />
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
                            <FormLabel>Miles Driven (optional)</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="e.g. 25" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <FormField
                        control={form.control}
                        name="weather"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Weather Condition</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select weather..." />
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
                        name="roadTypes"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Road Types</FormLabel>
                                 <MultiSelect
                                    options={roadTypeOptions}
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    placeholder="Select road types..."
                                 />
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
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select time of day..." />
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
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button type="submit">
                        <Save className="mr-2 h-4 w-4"/>
                        Save Changes
                    </Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
