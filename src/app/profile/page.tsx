
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Share2, Trash2 } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import DriveTrackLogo from '@/components/drive-track-logo';
import { doc, setDoc, getDoc, collection, addDoc, getDocs, query, where, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import type { UserProfile } from '@/lib/types';

interface Share {
    id: string;
    studentUid: string;
    studentEmail: string;
    guardianEmail: string;
}

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [profile, setProfile] = useState<UserProfile>({ email: null });
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>();
  const [permitDate, setPermitDate] = useState<Date | undefined>();

  const [shareEmail, setShareEmail] = useState('');
  const [sharedWith, setSharedWith] = useState<Share[]>([]);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    const docRef = doc(db, "profiles", user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as UserProfile;
      setProfile(data);
      if (data.dateOfBirth) setDateOfBirth(new Date(data.dateOfBirth));
      if (data.permitDate) setPermitDate(new Date(data.permitDate));
    } else {
      setProfile({
        email: user.email,
        totalHoursGoal: 50,
        nightHoursGoal: 10,
      })
    }
  }, [user]);
  
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
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      fetchProfile();
      fetchShares();
    }
  }, [user, loading, router, fetchProfile, fetchShares]);
  
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const profileToSave: UserProfile = {
        ...profile,
        email: user.email,
        dateOfBirth: dateOfBirth?.toISOString(),
        permitDate: permitDate?.toISOString(),
    };

    try {
        await setDoc(doc(db, "profiles", user.uid), profileToSave, { merge: true });
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
                                    value={profile.totalHoursGoal || 50}
                                    onChange={(e) => setProfile({...profile, totalHoursGoal: Number(e.target.value)})}
                                    placeholder="e.g. 50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="night-hours-goal">Night Driving Hours Goal</Label>
                                <Input
                                    id="night-hours-goal"
                                    type="number"
                                    value={profile.nightHoursGoal || 10}
                                    onChange={(e) => setProfile({...profile, nightHoursGoal: Number(e.target.value)})}
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
                </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
