
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DatePicker } from "./ui/date-picker";
import type { RoadType, Session, WeatherCondition } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { MultiSelect } from "./ui/multi-select";
import { Save } from "lucide-react";

const roadTypeOptions: { value: RoadType; label: string }[] = [
    { value: "Residential", label: "Residential" },
    { value: "Arterial", label: "Arterial" },
    { value: "Highway", label: "Highway" },
];

const manualLogSchema = z.object({
  date: z.date({
    required_error: "A date is required.",
  }),
  duration: z.coerce.number().min(1, "Duration must be at least 1 minute."),
  miles: z.coerce.number().min(0.1, "Miles must be at least 0.1."),
  weather: z.enum(["Sunny", "Cloudy", "Rainy", "Snowy"], {
      required_error: "Weather condition is required."
  }),
  roadTypes: z.array(z.string()).min(1, "At least one road type is required."),
  isNight: z.boolean().default(false),
});

type ManualLogFormValues = z.infer<typeof manualLogSchema>;

interface ManualLogFormProps {
    onSave: (newSession: Omit<Session, 'id' | 'date'>) => void;
}

export default function ManualLogForm({ onSave }: ManualLogFormProps) {
  const { toast } = useToast();
  const form = useForm<ManualLogFormValues>({
    resolver: zodResolver(manualLogSchema),
    defaultValues: {
      date: new Date(),
      duration: 30,
      miles: 10,
      weather: "Sunny",
      roadTypes: ["Residential"],
      isNight: false,
    },
  });

  function onSubmit(data: ManualLogFormValues) {
    const newSession = {
        ...data,
        duration: data.duration * 60, // Convert minutes to seconds
        date: data.date.toISOString(),
        roadTypes: data.roadTypes as RoadType[],
    };
    onSave(newSession);

    toast({
        title: "Session Saved",
        description: "Your manual driving log has been added.",
    });
    form.reset();
  }

  return (
    <Card className="shadow-lg">
        <CardHeader>
            <CardTitle>Enter Driving Session</CardTitle>
            <CardDescription>Manually add a driving session to your log.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                            <FormLabel>Miles Driven</FormLabel>
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
                        name="isNight"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                <FormLabel className="text-base">Night Driving</FormLabel>
                                <FormDescription>
                                    Was this session driven at night?
                                </FormDescription>
                                </div>
                                <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                                </FormControl>
                            </FormItem>
                        )}
                        />
                </div>
                <div className="flex justify-end">
                    <Button type="submit">
                        <Save className="mr-2 h-4 w-4"/>
                        Save Manual Session
                    </Button>
                </div>
            </form>
            </Form>
        </CardContent>
    </Card>
  );
}
