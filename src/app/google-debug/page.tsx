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

  const checkPluginDetailed = async () => {
    setPluginInfo('');
    try {
      // Detailed plugin check
      console.log('🔍 Starting detailed plugin check...');
      
      const checks = [];
      
      // Check if Capacitor is available
      const capacitorAvailable = typeof (window as any).Capacitor !== 'undefined';
      checks.push(`Capacitor available: ${capacitorAvailable}`);
      
      if (capacitorAvailable) {
        const platform = (window as any).Capacitor.getPlatform();
        const isNative = (window as any).Capacitor.isNativePlatform();
        checks.push(`Platform: ${platform}`);
        checks.push(`Is Native: ${isNative}`);
      }
      
      // Check if FirebaseAuthentication plugin is available
      const pluginAvailable = typeof FirebaseAuthentication !== 'undefined';
      checks.push(`FirebaseAuthentication plugin: ${pluginAvailable}`);
      
      if (pluginAvailable) {
        const methods = Object.getOwnPropertyNames(FirebaseAuthentication);
        checks.push(`Available methods: ${methods.join(', ')}`);
        
        // Test getCurrentUser (should work even when not signed in)
        try {
          const currentUser = await FirebaseAuthentication.getCurrentUser();
          checks.push(`getCurrentUser test: SUCCESS - ${JSON.stringify(currentUser)}`);
        } catch (err: any) {
          checks.push(`getCurrentUser test: ERROR - ${err.message}`);
        }
        
        // Check if we can call isSignInWithEmailLink (another safe method)
        try {
          if (typeof FirebaseAuthentication.isSignInWithEmailLink === 'function') {
            const result = await FirebaseAuthentication.isSignInWithEmailLink({ emailLink: 'test' });
            checks.push(`isSignInWithEmailLink test: SUCCESS - ${JSON.stringify(result)}`);
          } else {
            checks.push(`isSignInWithEmailLink: Method not available`);
          }
        } catch (err: any) {
          checks.push(`isSignInWithEmailLink test: ERROR - ${err.message}`);
        }
      }
      
      setPluginInfo(checks.join('\n'));
      
    } catch (err: any) {
      setPluginInfo(`Detailed check error: ${err.message}`);
    }
  };

  const testPluginConfiguration = async () => {
    setLoading(true);
    setResult('');
    setError('');
    
    try {
      console.log('Testing plugin configuration...');
      
      // First, try to check if we need to configure the plugin
      console.log('Checking plugin configuration status...');
      
      // Try a simple method first
      const currentUser = await FirebaseAuthentication.getCurrentUser();
      console.log('Current user check:', currentUser);
      
      // Now try Google Sign-In with additional logging
      console.log('Attempting Google Sign-In with detailed logging...');
      
      // Create a promise that resolves/rejects with more details
      const googleSignIn = new Promise(async (resolve, reject) => {
        try {
          console.log('Calling FirebaseAuthentication.signInWithGoogle()...');
          const result = await FirebaseAuthentication.signInWithGoogle();
          console.log('Raw plugin result:', result);
          resolve(result);
        } catch (err) {
          console.log('Plugin error details:', err);
          reject(err);
        }
      });
      
      // Shorter timeout for testing
      const timeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Configuration test timeout (15s)')), 15000);
      });
      
      const result = await Promise.race([googleSignIn, timeout]);
      setResult(`Configuration Test Success!\n${JSON.stringify(result, null, 2)}`);
      
    } catch (err: any) {
      console.error('Configuration test failed:', err);
      setError(`Configuration Test Error: ${err.message}\n\nCheck console for detailed logs.`);
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
          
          <Button onClick={checkPluginDetailed} className="w-full" variant="outline">
            Check Plugin Status (Detailed)
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
            onClick={testPluginConfiguration} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Testing Configuration...' : 'Test Plugin Configuration'}
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
