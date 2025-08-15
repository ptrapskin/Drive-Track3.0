"use client";

import { useState } from 'react';
import { signInWithGoogle } from '@/firebase-capacitor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Capacitor } from '@capacitor/core';

export default function GoogleSignInTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  const testGoogleSignIn = async () => {
    setLoading(true);
    setResult('');
    setError('');
    
    try {
      console.log('Testing Google Sign-In...');
      console.log('Platform:', Capacitor.getPlatform());
      console.log('Is native:', Capacitor.isNativePlatform());
      
      const user = await signInWithGoogle();
      console.log('Sign-in successful:', user);
      setResult(`Success! User: ${JSON.stringify(user, null, 2)}`);
    } catch (err: any) {
      console.error('Sign-in failed:', err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Google Sign-In Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>Platform: {Capacitor.getPlatform()}</p>
            <p>Is Native: {Capacitor.isNativePlatform() ? 'Yes' : 'No'}</p>
          </div>
          
          <Button 
            onClick={testGoogleSignIn} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Testing...' : 'Test Google Sign-In'}
          </Button>
          
          {result && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800 font-medium">Success!</p>
              <pre className="text-xs text-green-700 mt-1 overflow-auto">
                {result}
              </pre>
            </div>
          )}
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800 font-medium">Error:</p>
              <p className="text-xs text-red-700 mt-1">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
