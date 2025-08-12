

"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { DatePicker } from '@/components/ui/date-picker';
import DashboardHeader from '@/components/dashboard-header';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/firebase';
import type { UserProfile } from '@/lib/types';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Mail, Share2 } from 'lucide-react';
import { getAuth } from 'firebase/auth';

export default function ProfilePage() {
  const { user, loading, profile, logout, refetchProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>();
  const [permitDate, setPermitDate] = useState<Date | undefined>();
  const [guardianEmail, setGuardianEmail] = useState('');
  
  useEffect(() => {
    if (profile) {
      setCurrentProfile(profile);
      if (profile.dateOfBirth) setDateOfBirth(new Date(profile.dateOfBirth));
      if (profile.permitDate) setPermitDate(new Date(profile.permitDate));
    }
  }, [profile]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };
  
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !currentProfile) return;

    const profileToSave: Omit<UserProfile, 'id'> = {
        name: currentProfile.name || '',
        email: user.email,
        dateOfBirth: dateOfBirth?.toISOString() || null,
        permitDate: permitDate?.toISOString() || null,
        totalHoursGoal: currentProfile.totalHoursGoal || null,
        nightHoursGoal: currentProfile.nightHoursGoal || null,
    };

    try {
        await setDoc(doc(db, "profiles", user.uid), profileToSave, { merge: true });
        refetchProfile();
        toast({
            title: "Profile Saved",
            description: "Your information has been updated successfully.",
        });
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Error Saving Profile",
            description: error.message,
        });
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No email address found for this user.",
      });
      return;
    }
    try {
      await sendPasswordResetEmail(auth, user.email);
      toast({
        title: "Password Reset Email Sent",
        description: "Check your inbox for a link to reset your password.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error Sending Email",
        description: error.message,
      });
    }
  };

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !guardianEmail || !profile) return;
    
    try {
        // This is a placeholder for a cloud function that would get the guardian's UID from their email
        // For now, we assume the guardian has to sign up first, and we can't get their UID directly.
        // The rules are now structured around the guardian's UID, not their email.
        // This functionality needs a backend component (Cloud Function) to be fully secure and robust.
        // The current implementation is a placeholder to demonstrate the UI flow.
        
        toast({
            title: "Sharing Logic Update Required",
            description: "A backend function is needed to securely look up guardian UID by email. This is a UI placeholder.",
            variant: "destructive"
        });

    } catch (error: any) {
         toast({
            variant: "destructive",
            title: "Error Sharing Account",
            description: error.message,
        });
    }
  };


  if (loading || !user || !currentProfile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
        <DashboardHeader 
            userEmail={user.email}
            onLogout={handleLogout}
        />
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-8 flex justify-between items-center md:hidden">
             <div>
                 <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-4xl font-bold font-headline tracking-tight text-primary">
                        User Profile
                    </h1>
                </div>
                <p className="text-muted-foreground">
                    Manage your personal details and driving goals.
                </p>
            </div>
        </header>

        <div className="grid gap-8">
          <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Your Information</CardTitle>
                    <CardDescription>Keep your details up to date.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSave} className="space-y-6">
                        <fieldset className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={currentProfile.name || ''}
                                        onChange={(e) => setCurrentProfile({...currentProfile, name: e.target.value})}
                                        placeholder="e.g. Alex Doe"
                                    />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={user.email || ''}
                                        disabled
                                    />
                                </div>
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
                                        value={currentProfile.totalHoursGoal || ''}
                                        onChange={(e) => setCurrentProfile({...currentProfile, totalHoursGoal: e.target.value ? Number(e.target.value) : null})}
                                        placeholder="e.g. 50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="night-hours-goal">Night Driving Hours Goal</Label>
                                    <Input
                                        id="night-hours-goal"
                                        type="number"
                                        value={currentProfile.nightHoursGoal || ''}
                                        onChange={(e) => setCurrentProfile({...currentProfile, nightHoursGoal: e.target.value ? Number(e.target.value) : null})}
                                        placeholder="e.g. 10"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit">Save Changes</Button>
                            </div>
                        </fieldset>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Share Your Account</CardTitle>
                    <CardDescription>Allow a parent or guardian to view your driving logs and progress.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleShare} className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-grow space-y-2">
                            <Label htmlFor="guardian-email">Guardian's Email Address</Label>
                            <Input
                                id="guardian-email"
                                type="email"
                                value={guardianEmail}
                                onChange={(e) => setGuardianEmail(e.target.value)}
                                placeholder="guardian@example.com"
                                required
                            />
                        </div>
                        <div className="self-end">
                             <Button type="submit">
                                <Share2 className="mr-2 h-4 w-4" />
                                Share
                            </Button>
                        </div>
                    </form>
                    <p className="text-xs text-muted-foreground mt-2">Note: For this to work, a backend function is required to look up a guardian's User ID from their email. The current implementation is a placeholder.</p>
                </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>Manage your password.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    To change your password, we'll send a secure link to your email address.
                  </p>
                  <Button onClick={handlePasswordReset} variant="outline">
                    Send Password Reset Email
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Questions or Feedback?</CardTitle>
                <CardDescription>We're here to help. Reach out to us with any questions.</CardDescription>
              </CardHeader>
              <CardContent>
                 <a href="mailto:hello@drive-track.com" className="inline-block w-full">
                    <Button variant="outline" className="w-full">
                      <Mail className="mr-2 h-4 w-4" />
                      Contact Support
                    </Button>
                  </a>
                  <p className="text-sm text-center text-muted-foreground mt-4">
                    hello@drive-track.com
                 </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

