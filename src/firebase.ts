
"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, indexedDBLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  projectId: "drive-track-7027f",
  appId: "1:94983186341:web:8f5205b1df8a48ae66ea4c",
  storageBucket: "drive-track-7027f.firebasestorage.app",
  apiKey: "AIzaSyCjNqgaLkmO63zOlgU0XwPduuNOdDy1D7k",
  authDomain: "drive-track-7027f.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "94983186341"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app, {
  persistence: indexedDBLocalPersistence
});
const db = getFirestore(app);
const functions = getFunctions(app);

const signInWithGoogle = async () => {
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        return result.user;
    } catch (error) {
        console.error("Google Sign-In Error:", error);
        throw error;
    }
};

export { app, auth, db, functions, signInWithGoogle };
