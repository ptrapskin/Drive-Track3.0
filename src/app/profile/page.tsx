
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useEmailSupport } from '@/hooks/use-email-support';
import { Share2, Trash2, Mail, HelpCircle, MessageSquare, ExternalLink, Copy } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import DashboardHeader from '@/components/dashboard-header';
import { Capacitor } from '@capacitor/core';
import { FirebaseFirestore } from '@capacitor-firebase/firestore';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
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
  const { user, loading, profile, isViewingSharedAccount, logout, activeProfileEmail, refetchProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { openEmail } = useEmailSupport();

  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(profile);
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>();
  const [permitDate, setPermitDate] = useState<Date | undefined>();

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

  const handleSupportEmail = async () => {
    const deviceInfo = navigator.userAgent.includes('iPhone') ? 'iPhone' : 
                     navigator.userAgent.includes('Android') ? 'Android' : 'Web';
    
    await openEmail({
      to: 'hello@drive-track.com',
      subject: 'Drive-Track Support Request',
      body: `Hi Drive-Track Team,

I need help with:

[Please describe your issue or question here]

Account Email: ${user?.email || 'N/A'}
Device: ${deviceInfo}

Thank you!`
    });
  };

  const handleFeedbackEmail = async () => {
    await openEmail({
      to: 'hello@drive-track.com',
      subject: 'Drive-Track App Feedback',
      body: `Hi Drive-Track Team,

I have feedback about the app:

[Please share your thoughts, suggestions, or report any bugs here]

What I like:

What could be improved:

Account Email: ${user?.email || 'N/A'}
App Version: ${new Date().getFullYear()}

Thank you for building such a helpful app!`
    });
  };

  const copyEmailToClipboard = async () => {
    try {
      await navigator.clipboard.writeText('hello@drive-track.com');
      toast({
        title: "Email Copied",
        description: "hello@drive-track.com has been copied to your clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Please manually copy: hello@drive-track.com",
        variant: "destructive",
      });
    }
  };

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
    console.log("Profile: handleLogout called");
    try {
      await logout();
      console.log("Profile: logout completed, navigating to login");
      router.push('/login');
    } catch (error) {
      console.error("Profile: logout error:", error);
    }
  };
  
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Use displayProfile instead of currentProfile
    const profileData = currentProfile || displayProfile;

    // Create a clean object for Firestore, converting undefined to null
    const profileToSave: Omit<UserProfile, 'id'> = {
        name: profileData.name || '',
        email: user.email || '',
        dateOfBirth: dateOfBirth?.toISOString() || null,
        permitDate: permitDate?.toISOString() || null,
        totalHoursGoal: profileData.totalHoursGoal || null,
        nightHoursGoal: profileData.nightHoursGoal || null,
    };

    try {
        if (Capacitor.isNativePlatform()) {
            // Use Capacitor Firebase for native platforms
            console.log("Profile: Using Capacitor Firebase to save profile");
            await FirebaseFirestore.setDocument({
                reference: `profiles/${user.uid}`,
                data: profileToSave,
                merge: true,
            });
        } else {
            // Use web Firebase for browser/development
            console.log("Profile: Using web Firebase to save profile");
            await setDoc(doc(db, "profiles", user.uid), profileToSave, { merge: true });
        }
        
        // Update the current profile state with saved data
        setCurrentProfile({ id: user.uid, ...profileToSave });
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

  // If currentProfile is null, create a default profile to allow the page to render
  const displayProfile = currentProfile || {
    id: user.uid,
    name: '',
    email: user.email || '',
    dateOfBirth: null,
    permitDate: null,
    totalHoursGoal: null,
    nightHoursGoal: null,
  };

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
                                        value={displayProfile.name || ''}
                                        onChange={(e) => setCurrentProfile({...displayProfile, name: e.target.value})}
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
                                        value={displayProfile.totalHoursGoal || ''}
                                        onChange={(e) => setCurrentProfile({...displayProfile, totalHoursGoal: Number(e.target.value)})}
                                        placeholder="e.g. 50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="night-hours-goal">Night Driving Hours Goal</Label>
                                    <Input
                                        id="night-hours-goal"
                                        type="number"
                                        value={displayProfile.nightHoursGoal || ''}
                                        onChange={(e) => setCurrentProfile({...displayProfile, nightHoursGoal: Number(e.target.value)})}
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

            {/* Help & Support Section */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <HelpCircle className="h-5 w-5 text-blue-600" />
                        <CardTitle>Help & Support</CardTitle>
                    </div>
                    <CardDescription>
                        Need assistance or have feedback? We're here to help!
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4">
                        {/* Contact Support */}
                        <div className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                            <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div className="flex-1">
                                <h3 className="font-semibold text-sm">Contact Support</h3>
                                <p className="text-sm text-gray-600 mb-2">
                                    Get help with technical issues, account problems, or general questions.
                                </p>
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={handleSupportEmail}
                                    className="flex items-center gap-2"
                                >
                                    <Mail className="h-4 w-4" />
                                    Email Support
                                    <ExternalLink className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>

                        {/* Submit Feedback */}
                        <div className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:border-green-300 transition-colors">
                            <MessageSquare className="h-5 w-5 text-green-600 mt-0.5" />
                            <div className="flex-1">
                                <h3 className="font-semibold text-sm">Submit Feedback</h3>
                                <p className="text-sm text-gray-600 mb-2">
                                    Share your thoughts, suggestions, or report bugs to help us improve.
                                </p>
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={handleFeedbackEmail}
                                    className="flex items-center gap-2"
                                >
                                    <MessageSquare className="h-4 w-4" />
                                    Send Feedback
                                    <ExternalLink className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>

                        {/* Quick Help */}
                        <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                            <h3 className="font-semibold text-sm text-blue-900 mb-2">Quick Help</h3>
                            <div className="space-y-2 text-sm text-blue-800">
                                <p><strong>• Tracking Sessions:</strong> Go to Track → Start Session to log your driving</p>
                                <p><strong>• Viewing Progress:</strong> Check Dashboard for hours summary and goals</p>
                                <p><strong>• Sharing Account:</strong> Add guardian email above to share your progress</p>
                                <p><strong>• Exporting Logs:</strong> Use Reports → Logs → Download PDF for official records</p>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="text-center pt-2 border-t border-gray-200">
                            <p className="text-sm text-gray-600">
                                Support Email: <span className="font-medium text-blue-600">hello@drive-track.com</span>
                            </p>
                            <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={copyEmailToClipboard}
                                className="mt-2 text-xs"
                            >
                                <Copy className="h-3 w-3 mr-1" />
                                Copy Email
                            </Button>
                            <p className="text-xs text-gray-500 mt-1">
                                We typically respond within 24 hours
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
