"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import DriveTrackLogo from '@/components/drive-track-logo';

export default function SimpleLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    
    // Simulate login process
    console.log('Simple login attempt with:', email);
    
    // Wait 2 seconds to simulate authentication
    setTimeout(() => {
      console.log('Simple login complete, navigating to test dashboard');
      router.push('/test-dashboard');
      setIsLoggingIn(false);
    }, 2000);
  };

  if (isLoggingIn) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-2xl">Simulating login...</div>
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
          <CardDescription>Simple Login Test (No Firebase)</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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
              />
            </div>
            <Button type="submit" className="w-full">
              Simple Login Test
            </Button>
          </form>
          <p className="mt-4 text-center text-sm">
            <Link href="/debug" className="text-primary hover:underline">
              Go to Debug Page
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
