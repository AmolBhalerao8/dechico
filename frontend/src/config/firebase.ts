/**
 * Firebase Configuration for Frontend
 * This connects the frontend to the same Firebase project as the backend
 */

import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Firebase configuration (same as Backend/Database/firebaseConfig.ts)
const firebaseConfig = {
  apiKey: "AIzaSyCPAUFQncvY2I5tKsZG4rRsj8tOR1O22gE",
  authDomain: "dechico-7b466.firebaseapp.com",
  projectId: "dechico-7b466",
  storageBucket: "dechico-7b466.firebasestorage.app",
  messagingSenderId: "155328150736",
  appId: "1:155328150736:web:03b76b693b5f012d5932d5",
  measurementId: "G-SMTLDDZNWD",
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

export const initializeFirebase = () => {
  if (!app) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  }
  return { app, auth, db };
};

// Export instances
export const getFirebaseApp = () => {
  if (!app) initializeFirebase();
  return app;
};

export const getFirebaseAuth = () => {
  if (!auth) initializeFirebase();
  return auth;
};

export const getFirebaseDb = () => {
  if (!db) initializeFirebase();
  return db;
};
