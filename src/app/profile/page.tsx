
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { KeyRound } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import DashboardHeader from '@/components/dashboard-header';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '@/firebase';
import { updatePassword } from 'firebase/auth';
import type { UserProfile } from '@/lib/types';

export default function ProfilePage() {
  const { user, loading, profile, logout, refetchProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(profile);
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>();
  const [permitDate, setPermitDate] = useState<Date | undefined>();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Passwords do not match',
        description: 'Please re-enter your new password.',
      });
      return;
    }
    if (!auth.currentUser) return;
    try {
      await updatePassword(auth.currentUser, newPassword);
      setNewPassword('');
      setConfirmPassword('');
      toast({
        title: 'Password Updated',
        description: 'Your password has been changed successfully.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error Changing Password',
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
                                        onChange={(e) => setCurrentProfile({...currentProfile, totalHoursGoal: Number(e.target.value)})}
                                        placeholder="e.g. 50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="night-hours-goal">Night Driving Hours Goal</Label>
                                    <Input
                                        id="night-hours-goal"
                                        type="number"
                                        value={currentProfile.nightHoursGoal || ''}
                                        onChange={(e) => setCurrentProfile({...currentProfile, nightHoursGoal: Number(e.target.value)})}
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
                    <CardTitle className="flex items-center gap-2">
                        <KeyRound className="w-5 h-5"/>
                        Security
                    </CardTitle>
                    <CardDescription>Update your password.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleChangePassword} className="space-y-6">
                         <fieldset className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="new-password">New Password</Label>
                                    <Input
                                        id="new-password"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new password"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                                    <Input
                                        id="confirm-password"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm new password"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit">Change Password</Button>
                            </div>
                        </fieldset>
                    </form>
                </CardContent>
             </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
