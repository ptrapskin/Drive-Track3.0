"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const router = useRouter();

  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toISOString()}: ${info}`]);
  };

  useEffect(() => {
    addDebugInfo('Debug page mounted');
    addDebugInfo(`User agent: ${navigator.userAgent}`);
    addDebugInfo(`Location: ${window.location.href}`);
  }, []);

  const testNavigation = () => {
    addDebugInfo('Testing navigation to dashboard');
    router.push('/dashboard');
  };

  const testBack = () => {
    addDebugInfo('Testing navigation back to home');
    router.push('/');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Debug Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Button onClick={testNavigation} className="w-full">
              Test Navigation to Dashboard
            </Button>
            <Button onClick={testBack} variant="outline" className="w-full">
              Test Navigation to Home
            </Button>
          </div>
          
          <div className="border rounded-lg p-4 bg-muted max-h-96 overflow-y-auto">
            <h3 className="font-semibold mb-2">Debug Log:</h3>
            {debugInfo.map((info, index) => (
              <div key={index} className="text-sm font-mono mb-1">
                {info}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
