"use client";

import { useState } from 'react';
import { signInWithGoogle } from '@/firebase-capacitor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

export default function GoogleSignInDebug() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [pluginInfo, setPluginInfo] = useState<string>('');

  const checkPlugin = async () => {
    try {
      // Check if plugin is available
      const currentUser = await FirebaseAuthentication.getCurrentUser();
      setPluginInfo(`Plugin available. Current user: ${JSON.stringify(currentUser, null, 2)}`);
    } catch (err: any) {
      setPluginInfo(`Plugin check error: ${err.message}`);
    }
  };

  const testDirectPlugin = async () => {
    setLoading(true);
    setResult('');
    setError('');
    
    try {
      console.log('Testing direct plugin call...');
      
      // Add a shorter timeout for testing
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Direct plugin timeout after 15 seconds')), 15000);
      });
      
      const signInPromise = FirebaseAuthentication.signInWithGoogle();
      
      const user = await Promise.race([signInPromise, timeoutPromise]);
      console.log('Direct plugin sign-in successful:', user);
      setResult(`Direct Plugin Success! User: ${JSON.stringify(user, null, 2)}`);
    } catch (err: any) {
      console.error('Direct plugin sign-in failed:', err);
      setError(`Direct Plugin Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testWrappedFunction = async () => {
    setLoading(true);
    setResult('');
    setError('');
    
    try {
      console.log('Testing wrapped function...');
      const user = await signInWithGoogle();
      console.log('Wrapped function sign-in successful:', user);
      setResult(`Wrapped Function Success! User: ${JSON.stringify(user, null, 2)}`);
    } catch (err: any) {
      console.error('Wrapped function sign-in failed:', err);
      setError(`Wrapped Function Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Google Sign-In Debug</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>Platform: {Capacitor.getPlatform()}</p>
            <p>Is Native: {Capacitor.isNativePlatform() ? 'Yes' : 'No'}</p>
          </div>
          
          <Button onClick={checkPlugin} className="w-full" variant="outline">
            Check Plugin Status
          </Button>
          
          {pluginInfo && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800 font-medium">Plugin Info:</p>
              <pre className="text-xs text-blue-700 mt-1 overflow-auto whitespace-pre-wrap">
                {pluginInfo}
              </pre>
            </div>
          )}
          
          <Button 
            onClick={testDirectPlugin} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Testing Direct Plugin...' : 'Test Direct Plugin'}
          </Button>
          
          <Button 
            onClick={testWrappedFunction} 
            disabled={loading}
            className="w-full"
            variant="secondary"
          >
            {loading ? 'Testing Wrapped Function...' : 'Test Wrapped Function'}
          </Button>
          
          {result && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800 font-medium">Success!</p>
              <pre className="text-xs text-green-700 mt-1 overflow-auto whitespace-pre-wrap">
                {result}
              </pre>
            </div>
          )}
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800 font-medium">Error:</p>
              <p className="text-xs text-red-700 mt-1 whitespace-pre-wrap">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
