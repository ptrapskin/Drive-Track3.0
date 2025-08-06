import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  projectId: "drive-track-7027f",
  appId: "1:94983186341:web:8f5205b1df8a48ae66ea4c",
  storageBucket: "drive-track-7027f.firebasestorage.app",
  apiKey: "AIzaSyCjNqgaLkmO63zOlgU0XwPduuNOdDy1D7k",
  authDomain: "drive-track-7027f.firebaseapp.com",
  messagingSenderId: "94983186341"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
