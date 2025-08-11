
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
import { ArrowLeft, Share2, Trash2 } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import DriveTrackLogo from '@/components/drive-track-logo';
import { Separator } from '@/components/ui/separator';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>();
  const [permitDate, setPermitDate] = useState<Date | undefined>();
  const [totalHoursGoal, setTotalHoursGoal] = useState<number>(50);
  const [nightHoursGoal, setNightHoursGoal] = useState<number>(10);

  const [shareEmail, setShareEmail] = useState('');
  const [sharedWith, setSharedWith] = useState(['friend@example.com']);

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
  
  const handleShare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareEmail) return;
    // In a real app, you'd send an invitation or add to a database
    setSharedWith([...sharedWith, shareEmail]);
    setShareEmail('');
    toast({
      title: 'Account Shared',
      description: `Invitation sent to ${shareEmail}.`,
    });
  };

  const handleRemoveShare = (emailToRemove: string) => {
    // In a real app, you'd update the database
    setSharedWith(sharedWith.filter((email) => email !== emailToRemove));
    toast({
      title: 'Sharing Removed',
      description: `Access for ${emailToRemove} has been revoked.`,
    });
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
        <header className="mb-8 flex justify-between items-center md:hidden">
             <div>
                 <div className="flex items-center gap-3 mb-2">
                    <DriveTrackLogo />
                    <h1 className="text-4xl font-bold font-headline tracking-tight text-primary">
                        User Profile
                    </h1>
                </div>
                <p className="text-muted-foreground">
                    Manage your personal details and driving goals.
                </p>
            </div>
        </header>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
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
          <div className="md:col-span-1">
            <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Share2 className="w-5 h-5"/>
                    Share Account
                  </CardTitle>
                  <CardDescription>
                    Grant access to a guardian or friend to view your logs and progress.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleShare} className="space-y-2">
                    <Label htmlFor="share-email">Guardian/Friend Email</Label>
                    <div className="flex gap-2">
                        <Input
                            id="share-email"
                            type="email"
                            value={shareEmail}
                            onChange={(e) => setShareEmail(e.target.value)}
                            placeholder="name@example.com"
                            required
                        />
                        <Button type="submit" variant="outline">Share</Button>
                    </div>
                  </form>
                  <div className="space-y-4">
                      <Label>Currently Sharing With</Label>
                      {sharedWith.length > 0 ? (
                        <ul className="space-y-2">
                          {sharedWith.map((email) => (
                            <li key={email} className="flex items-center justify-between text-sm p-2 rounded-md bg-muted">
                              <span>{email}</span>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRemoveShare(email)}>
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">You are not sharing your account with anyone.</p>
                      )}
                  </div>
                </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
