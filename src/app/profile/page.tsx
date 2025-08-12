
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Share2, Trash2, KeyRound } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import DashboardHeader from '@/components/dashboard-header';
import { doc, setDoc, getDoc, collection, addDoc, getDocs, query, where, deleteDoc } from 'firebase/firestore';
import { db, auth } from '@/firebase';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import type { UserProfile } from '@/lib/types';

interface Share {
    id: string;
    studentUid: string;
    studentEmail: string;
    guardianEmail: string;
}

export default function ProfilePage() {
  const { user, loading, profile, isViewingSharedAccount, logout, activeProfileEmail, refetchProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(profile);
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>();
  const [permitDate, setPermitDate] = useState<Date | undefined>();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [shareEmail, setShareEmail] = useState('');
  const [sharedWith, setSharedWith] = useState<Share[]>([]);

  const fetchShares = useCallback(async () => {
    if (!user) return;
    const q = query(collection(db, "shares"), where("studentUid", "==", user.uid));
    const querySnapshot = await getDocs(q);
    const shares: Share[] = [];
    querySnapshot.forEach((doc) => {
        shares.push({ id: doc.id, ...doc.data() } as Share);
    });
    setSharedWith(shares);
  }, [user]);

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
    } else if (user) {
      fetchShares();
    }
  }, [user, loading, router, fetchShares]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };
  
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !currentProfile) return;

    // Create a clean object for Firestore, converting undefined to null
    const profileToSave: Omit<UserProfile, 'id'> = {
        name: currentProfile.name || '',
        email: user.email,
        dateOfBirth: dateOfBirth?.toISOString() || null,
        permitDate: permitDate?.toISOString() || null,
        totalHoursGoal: currentProfile.totalHoursGoal || 50,
        nightHoursGoal: currentProfile.nightHoursGoal || 10,
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
  
  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareEmail || !user || !user.email) return;
    
    const shareData = {
        studentUid: user.uid,
        studentEmail: user.email,
        guardianEmail: shareEmail,
        status: 'pending'
    };

    try {
        const docRef = await addDoc(collection(db, "shares"), shareData);
        setSharedWith([...sharedWith, { id: docRef.id, ...shareData }]);
        setShareEmail('');
        toast({
          title: 'Account Shared',
          description: `Invitation sent to ${shareEmail}. They will see it upon their next login.`,
        });
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Error Sharing Account",
            description: error.message,
        });
    }
  };

  const handleRemoveShare = async (shareId: string) => {
    try {
        await deleteDoc(doc(db, "shares", shareId));
        setSharedWith(sharedWith.filter((share) => share.id !== shareId));
        toast({
          title: 'Sharing Removed',
          description: `Access has been revoked.`,
        });
    } catch(error: any) {
        toast({
            variant: "destructive",
            title: "Error Removing Share",
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
            userEmail={activeProfileEmail || user.email}
            onLogout={handleLogout}
            isViewingSharedAccount={isViewingSharedAccount}
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
        
        {isViewingSharedAccount && (
            <Card className="mb-8 bg-destructive/10 border-destructive">
                <CardContent className="p-4">
                    <p className="font-medium text-center text-destructive-foreground">
                        You are viewing another user's profile. Editing is disabled.
                    </p>
                </CardContent>
            </Card>
        )}

        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Your Information</CardTitle>
                    <CardDescription>Keep your details up to date.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSave} className="space-y-6">
                        <fieldset disabled={isViewingSharedAccount} className="space-y-6">
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
                                        value={currentProfile.totalHoursGoal || 50}
                                        onChange={(e) => setCurrentProfile({...currentProfile, totalHoursGoal: Number(e.target.value)})}
                                        placeholder="e.g. 50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="night-hours-goal">Night Driving Hours Goal</Label>
                                    <Input
                                        id="night-hours-goal"
                                        type="number"
                                        value={currentProfile.nightHoursGoal || 10}
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
                         <fieldset disabled={isViewingSharedAccount} className="space-y-6">
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
                 <fieldset disabled={isViewingSharedAccount}>
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
                          {sharedWith.map((share) => (
                            <li key={share.id} className="flex items-center justify-between text-sm p-2 rounded-md bg-muted">
                              <span>{share.guardianEmail}</span>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRemoveShare(share.id)}>
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">You are not sharing your account with anyone.</p>
                      )}
                  </div>
                  </fieldset>
                </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
