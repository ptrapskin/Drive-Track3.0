
"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, connectAuthEmulator, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

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
console.log('Firebase initialized successfully', { isCapacitor });

const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Configure auth for Capacitor
if (typeof window !== 'undefined') {
  // Test network connectivity
  const testConnectivity = async () => {
    try {
      const response = await fetch('https://firebase.googleapis.com/favicon.ico', { 
        method: 'HEAD',
        mode: 'no-cors'
      });
      console.log('Network connectivity test passed');
    } catch (error) {
      console.warn('Network connectivity test failed:', error);
    }
  };
  
  // Set persistence for better mobile support
  setPersistence(auth, browserLocalPersistence).then(() => {
    console.log('Auth persistence set successfully');
  }).catch((error) => {
    console.warn('Failed to set auth persistence:', error);
  });
  
  // Capacitor-specific settings
  if (isCapacitor) {
    console.log('Configuring Firebase for Capacitor environment');
    // Disable app verification for Capacitor
    auth.settings.appVerificationDisabledForTesting = true;
    
    // Test connectivity
    testConnectivity();
  }
}

const signInWithGoogle = async () => {
    try {
        console.log('Attempting Google sign-in');
        const result = await signInWithPopup(auth, googleProvider);
        console.log('Google sign-in successful:', result.user.uid);
        return result.user;
    } catch (error) {
        console.error("Google Sign-In Error:", error);
        throw error;
    }
};

export { app, auth, db, signInWithGoogle };
