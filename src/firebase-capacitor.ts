"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

const firebaseConfig = {
  projectId: "drive-track-7027f",
  appId: "1:94983186341:web:8f5205b1df8a48ae66ea4c",
  storageBucket: "drive-track-7027f.firebasestorage.app",
  apiKey: "AIzaSyCjNqgaLkmO63zOlgU0XwPduuNOdDy1D7k",
  authDomain: "drive-track-7027f.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "94983186341"
};

// Check if we're in a Capacitor environment
const isCapacitor = typeof window !== 'undefined' && 
  (window as any).Capacitor !== undefined;

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

console.log('Firebase initialized with Capacitor plugin support', { isCapacitor });

// Capacitor-specific authentication functions
export const signInWithEmailAndPassword = async (email: string, password: string) => {
  if (isCapacitor) {
    console.log('Using Capacitor Firebase plugin for email/password sign in');
    try {
      const result = await FirebaseAuthentication.signInWithEmailAndPassword({
        email,
        password,
      });
      console.log('Capacitor Firebase sign in successful:', result);
      return result;
    } catch (error) {
      console.error('Capacitor Firebase sign in error:', error);
      throw error;
    }
  } else {
    console.log('Using web Firebase SDK for email/password sign in');
    return firebaseSignInWithEmailAndPassword(auth, email, password);
  }
};

export const signInWithGoogle = async () => {
  if (isCapacitor) {
    console.log('Using Capacitor Firebase Authentication plugin for Google sign in');
    try {
      console.log('About to call FirebaseAuthentication.signInWithGoogle()...');
      
      // Check if we're in a valid environment
      const platform = (window as any).Capacitor?.getPlatform();
      console.log('Platform check:', platform);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Google Sign-In timeout after 30 seconds. This may indicate a configuration issue.'));
        }, 30000);
      });
      
      console.log('Calling FirebaseAuthentication.signInWithGoogle() with timeout...');
      
      // Add more detailed logging
      console.log('Plugin availability check:', typeof FirebaseAuthentication?.signInWithGoogle);
      
      // Configure Google Sign-In with proper scopes and setup
      const signInOptions = {
        scopes: ['profile', 'email'],
        // Request server auth code for backend authentication if needed
        serverAuthCode: false,
        // Force account selection to avoid cached accounts issues
        forceCodeForRefreshToken: false
      };
      
      console.log('Calling FirebaseAuthentication.signInWithGoogle with options:', signInOptions);
      
      const signInPromise = FirebaseAuthentication.signInWithGoogle(signInOptions).then(
        (result) => {
          console.log('✅ Google Sign-In plugin success:', result);
          return result;
        },
        (error) => {
          console.log('❌ Google Sign-In plugin error:', error);
          throw error;
        }
      );
      
      const result = await Promise.race([signInPromise, timeoutPromise]) as any;
      console.log('Capacitor Firebase Google sign in successful:', result);
      return result;
    } catch (error: any) {
      console.error('Capacitor Firebase Google sign in error:', error);
      console.error('Error details:', {
        code: error?.code,
        message: error?.message,
        stack: error?.stack,
        fullError: error
      });
      
      // Check if this is our timeout error or a real plugin error
      if (error?.message?.includes('timeout')) {
        console.error('🔍 Google Sign-In timed out. Debugging info:');
        console.error('- Plugin function type:', typeof FirebaseAuthentication?.signInWithGoogle);
        console.error('- Capacitor platform:', (window as any).Capacitor?.getPlatform());
        console.error('- Capacitor available:', typeof (window as any).Capacitor);
        
        // Try to get current user to test plugin connectivity
        try {
          const currentUser = await FirebaseAuthentication.getCurrentUser();
          console.error('- Plugin getCurrentUser test:', currentUser);
        } catch (pluginError) {
          console.error('- Plugin getCurrentUser failed:', pluginError);
        }
      }
      
      // Provide better error messages with specific guidance
      let errorMessage = error?.message || 'Google Sign-In failed';
      
      if (error?.message?.includes('timeout')) {
        errorMessage = 'Google Sign-In timed out. This usually indicates:\n' +
                     '• GoogleService-Info.plist configuration issue\n' +
                     '• Missing URL schemes in Info.plist\n' +
                     '• Plugin not properly initialized\n' +
                     'Try testing on a real device instead of simulator.';
      } else if (error?.code === 'popup_closed_by_user' || error?.message?.includes('canceled') || error?.message?.includes('cancelled')) {
        errorMessage = 'Google Sign-In was canceled by user.';
      } else if (error?.code === 'network_error') {
        errorMessage = 'Network error during Google Sign-In. Please check your connection.';
      } else if (error?.message?.includes('not initialized') || error?.message?.includes('RuntimeError') || error?.code === 'not-initialized') {
        errorMessage = 'Google Sign-In configuration error. Please ensure the app is properly configured for iOS.';
      } else if (error?.code === 'sign-in-cancelled' || error?.code === 'cancelled') {
        errorMessage = 'Google Sign-In was canceled.';
      } else if (error?.code === 'sign-in-failed') {
        errorMessage = 'Google Sign-In failed. Please try again or use email/password sign-in.';
      } else if (error?.message?.includes('timeout')) {
        errorMessage = 'Google Sign-In timed out. Please try again.';
      } else if (error?.message?.includes('No user interaction') || error?.code === 'no-user-interaction') {
        errorMessage = 'Google Sign-In requires user interaction. Please try again.';
      }
      
      throw new Error(errorMessage);
    }
  } else {
    console.log('Using web Firebase SDK for Google sign in');
    const { signInWithPopup } = await import('firebase/auth');
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  }
};

export const getCurrentUser = async () => {
  if (isCapacitor) {
    try {
      const result = await FirebaseAuthentication.getCurrentUser();
      return result.user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  } else {
    return auth.currentUser;
  }
};

export const signOut = async () => {
  if (isCapacitor) {
    await FirebaseAuthentication.signOut();
  } else {
    await auth.signOut();
  }
};

export { app, auth, db, googleProvider };
