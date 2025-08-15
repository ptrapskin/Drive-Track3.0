
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase';
import { signInWithGoogle } from '@/firebase-capacitor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import DriveTrackLogo from '@/components/drive-track-logo';
import { useAuth } from '@/context/auth-context';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 48 48" {...props}>
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
        <path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path>
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A8 8 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path>
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 35.245 44 30.028 44 24c0-1.341-.138-2.65-.389-3.917z"></path>
    </svg>
);


export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading, checkCapacitorAuth } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: "Passwords don't match.",
      });
      return;
    }
    
    console.log('Attempting signup with email:', email);
    console.log('Environment check:', {
      isCapacitor: typeof window !== 'undefined' && (window as any).Capacitor !== undefined,
      userAgent: navigator.userAgent
    });
    
    try {
      console.log('About to call createUserWithEmailAndPassword...');
      
      // Check if we're in Capacitor environment and use appropriate method
      const isCapacitor = typeof window !== 'undefined' && (window as any).Capacitor !== undefined;
      
      if (isCapacitor) {
        console.log('Using Capacitor Firebase Authentication plugin');
        const result = await FirebaseAuthentication.createUserWithEmailAndPassword({
          email,
          password,
        });
        console.log('Capacitor Firebase signup successful:', result);
        
        // Sync auth state with context
        console.log('Syncing Capacitor auth with context...');
        await checkCapacitorAuth();
        
      } else {
        console.log('Using web Firebase SDK');
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log('Web Firebase signup successful:', {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          emailVerified: userCredential.user.emailVerified
        });
      }
      
      // Don't redirect immediately - let the auth context handle the redirect
      // The useEffect above will redirect when user state updates
      console.log('Signup completed, waiting for auth context to update...');
      
    } catch (error: any) {
      console.error('Signup error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack,
        fullError: error
      });
      
      // Better error messages for common Firebase auth errors
      let errorMessage = error.message;
      if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error - please check your internet connection and try again';
      } else if (error.code === 'auth/timeout') {
        errorMessage = 'Request timed out - please try again';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use at least 6 characters';
      }
      
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: errorMessage,
      });
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      console.log('Starting Google sign-in...');
      const result = await signInWithGoogle();
      console.log('Google sign-in successful:', result);
      
      // Sync auth state with context if we're in Capacitor environment
      const isCapacitor = typeof window !== 'undefined' && (window as any).Capacitor !== undefined;
      if (isCapacitor) {
        console.log('Syncing Google auth with Capacitor context...');
        await checkCapacitorAuth();
      }
      
      // Let the auth context handle the redirect
      console.log('Google sign-in completed, waiting for auth context to update...');
      
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      toast({
        variant: 'destructive',
        title: 'Google Sign-In Failed',
        description: error.message || 'An error occurred during Google sign-in',
      });
    }
  };
  
  if (loading || user) {
      return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="text-2xl">Loading...</div>
        </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
             <Link href="/" className="flex justify-center items-center gap-3 mb-2">
                <DriveTrackLogo />
                <CardTitle className="text-4xl font-bold font-headline tracking-tight text-primary">
                Drive-Track
                </CardTitle>
            </Link>
          <CardDescription>Create a new account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                suppressHydrationWarning
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                suppressHydrationWarning
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                suppressHydrationWarning
              />
            </div>
            <Button type="submit" className="w-full">
              Sign Up
            </Button>
          </form>
          <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                  </span>
              </div>
          </div>
          <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
              <GoogleIcon className="mr-2 h-5 w-5" />
              Google
          </Button>
           <p className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
