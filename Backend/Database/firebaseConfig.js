import { getApp, getApps, initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCPAUFQncvY2I5tKsZG4rRsj8tOR1O22gE",
  authDomain: "dechico-7b466.firebaseapp.com",
  projectId: "dechico-7b466",
  storageBucket: "dechico-7b466.firebasestorage.app",
  messagingSenderId: "155328150736",
  appId: "1:155328150736:web:03b76b693b5f012d5932d5",
  measurementId: "G-SMTLDDZNWD",
};

/**
 * Initializes the Firebase app once and returns the shared instance.
 */
export const getFirebaseApp = () => {
  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }

  return getApp();
};

/**
 * Lazily resolves Analytics only when the runtime supports it.
 * Returns null for non-browser runtimes or when Analytics is unavailable.
 */
export const getFirebaseAnalytics = async () => {
  if (typeof window === "undefined") {
    return null;
  }

  const supported = await isSupported().catch(() => false);
  if (!supported) {
    return null;
  }

  const app = getFirebaseApp();
  return getAnalytics(app);
};

export const firebaseConfigObject = firebaseConfig;

