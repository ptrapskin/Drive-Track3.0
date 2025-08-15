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
      
      // Check if plugin is properly configured
      console.log('Checking Firebase Authentication plugin configuration...');
      
      // Shorter timeout for testing - 10 seconds
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Google Sign-In timeout after 10 seconds - this might be normal in iOS Simulator')), 10000);
      });
      
      console.log('Calling FirebaseAuthentication.signInWithGoogle() with 10 second timeout...');
      const signInPromise = FirebaseAuthentication.signInWithGoogle();
      
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
      
      // Provide better error messages with simulator-specific guidance
      let errorMessage = error?.message || 'Google Sign-In failed';
      if (error?.message?.includes('timeout')) {
        errorMessage = 'Google Sign-In timed out. Note: Google Sign-In may not work properly in iOS Simulator. Try testing on a real iOS device, or use email/password sign-in for testing.';
      } else if (error?.code === 'popup_closed_by_user' || error?.message?.includes('canceled')) {
        errorMessage = 'Google Sign-In was canceled by user.';
      } else if (error?.code === 'network_error') {
        errorMessage = 'Network error during Google Sign-In. Please check your connection.';
      } else if (error?.message?.includes('not initialized') || error?.message?.includes('RuntimeError')) {
        errorMessage = 'Google Sign-In configuration error. This may not work in iOS Simulator - try on a real device or use email/password sign-in.';
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
