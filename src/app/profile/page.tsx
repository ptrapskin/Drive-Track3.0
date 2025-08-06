
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ArrowLeft, User as UserIcon } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import DriveTrackIcon from '@/components/drive-track-icon';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>();
  const [permitDate, setPermitDate] = useState<Date | undefined>();
  const [totalHoursGoal, setTotalHoursGoal] = useState<number>(50);
  const [nightHoursGoal, setNightHoursGoal] = useState<number>(10);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically save the data to a backend/database
    console.log({
        dateOfBirth,
        permitDate,
        totalHoursGoal,
        nightHoursGoal
    });
    toast({
        title: "Profile Saved",
        description: "Your information has been updated successfully.",
    })
  };

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-8 flex justify-between items-center">
             <div>
                 <div className="flex items-center gap-3 mb-2">
                    <UserIcon className="w-8 h-8 text-primary" />
                    <h1 className="text-4xl font-bold font-headline tracking-tight text-primary">
                        User Profile
                    </h1>
                </div>
                <p className="text-muted-foreground">
                    Manage your personal details and driving goals.
                </p>
            </div>
            <Button asChild variant="outline">
                <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Link>
            </Button>
        </header>

        <Card>
            <CardHeader>
                <CardTitle>Your Information</CardTitle>
                <CardDescription>Keep your details up to date.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="dob">Date of Birth</Label>
                            <DatePicker date={dateOfBirth} setDate={setDateOfBirth} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="permit-date">Permit Issue Date</Label>
                            <DatePicker date={permitDate} setDate={setPermitDate} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="total-hours-goal">Total Driving Hours Goal</Label>
                            <Input
                                id="total-hours-goal"
                                type="number"
                                value={totalHoursGoal}
                                onChange={(e) => setTotalHoursGoal(Number(e.target.value))}
                                placeholder="e.g. 50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="night-hours-goal">Night Driving Hours Goal</Label>
                            <Input
                                id="night-hours-goal"
                                type="number"
                                value={nightHoursGoal}
                                onChange={(e) => setNightHoursGoal(Number(e.target.value))}
                                placeholder="e.g. 10"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit">Save Changes</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
      </div>
    </main>
  );
}
