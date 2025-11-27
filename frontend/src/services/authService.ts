/**
 * Authentication Service for Frontend
 * Handles all authentication operations using Firebase
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
  type UserCredential,
} from 'firebase/auth';
import { collection, doc, getDoc, setDoc, query, where, getDocs } from 'firebase/firestore';
import { getFirebaseAuth, getFirebaseDb } from '../config/firebase';

// Email verification code storage
const VERIFICATION_COLLECTION = 'email_verifications';
const USERS_COLLECTION = 'users';

/**
 * Validate CSU Chico email domain
 */
export const validateCsuChicoEmail = (email: string): boolean => {
  return email.toLowerCase().endsWith('@csuchico.edu');
};

/**
 * Check if user exists in database
 */
export const checkUserExists = async (email: string): Promise<boolean> => {
  try {
    const db = getFirebaseDb();
    const usersRef = collection(db, USERS_COLLECTION);
    const q = query(usersRef, where('email', '==', email.toLowerCase()));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking user existence:', error);
    return false;
  }
};

/**
 * Send verification code to email
 * This calls the backend email service
 */
export const sendVerificationCode = async (email: string): Promise<string> => {
  try {
    // Validate email domain
    if (!validateCsuChicoEmail(email)) {
      throw new Error('Only @csuchico.edu email addresses are allowed.');
    }

    // Check if user already exists
    const userExists = await checkUserExists(email);
    if (userExists) {
      throw new Error('An account with this email already exists. Please login instead.');
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in Firestore
    const db = getFirebaseDb();
    const verificationRef = doc(db, VERIFICATION_COLLECTION, email.toLowerCase());
    
    await setDoc(verificationRef, {
      email: email.toLowerCase(),
      code,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      verified: false,
      attempts: 1,
    });

    // In production, this would call the backend to send the actual email
    // For now, we'll return the code for testing
    console.log('Verification code:', code);
    
    return code;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to send verification code');
  }
};

/**
 * Verify the code entered by user
 */
export const verifyCode = async (email: string, code: string): Promise<boolean> => {
  try {
    const db = getFirebaseDb();
    const verificationRef = doc(db, VERIFICATION_COLLECTION, email.toLowerCase());
    const verificationDoc = await getDoc(verificationRef);

    if (!verificationDoc.exists()) {
      throw new Error('No verification code found. Please request a new one.');
    }

    const data = verificationDoc.data();
    
    // Check if code matches
    if (data.code !== code) {
      return false;
    }

    // Check if code expired
    const expiresAt = data.expiresAt.toDate();
    if (new Date() > expiresAt) {
      throw new Error('Verification code has expired. Please request a new one.');
    }

    // Mark as verified
    await setDoc(verificationRef, { ...data, verified: true }, { merge: true });
    
    return true;
  } catch (error: any) {
    throw new Error(error.message || 'Verification failed');
  }
};

/**
 * Create new user account
 */
export const createAccount = async (
  email: string,
  password: string,
  name: string
): Promise<UserCredential> => {
  try {
    // Check if email is verified
    const db = getFirebaseDb();
    const verificationRef = doc(db, VERIFICATION_COLLECTION, email.toLowerCase());
    const verificationDoc = await getDoc(verificationRef);

    if (!verificationDoc.exists() || !verificationDoc.data().verified) {
      throw new Error('Email not verified. Please verify your email first.');
    }

    // Create Firebase Auth user
    const auth = getFirebaseAuth();
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Create user profile in Firestore
    const userRef = doc(db, USERS_COLLECTION, userCredential.user.uid);
    await setDoc(userRef, {
      uid: userCredential.user.uid,
      email: email.toLowerCase(),
      name,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      profileComplete: false,
      // Profile fields
      firstName: '',
      lastName: '',
      alias: '',
      bio: '',
      age: '',
      ethnicity: '',
      interests: '',
      gender: '',
      photos: [],
      // Dating stats
      swipeStats: {
        rightSwipesReceived: 0,
        leftSwipesReceived: 0,
        rightSwipesGiven: 0,
        leftSwipesGiven: 0,
      },
    });

    // Delete verification record
    await setDoc(verificationRef, { verified: true, used: true }, { merge: true });

    return userCredential;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create account');
  }
};

/**
 * Login existing user
 */
export const loginUser = async (
  email: string,
  password: string
): Promise<UserCredential> => {
  try {
    const auth = getFirebaseAuth();
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    // Check if user profile exists in Firestore
    const db = getFirebaseDb();
    const userRef = doc(db, USERS_COLLECTION, userCredential.user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // Profile was deleted but auth account still exists
      // Sign out and throw error
      await signOut(auth);
      throw new Error('Your account has been deleted. Please sign up for your fun dating journey! 🎉');
    }

    // Update last login
    await setDoc(
      userRef,
      {
        lastLogin: new Date().toISOString(),
      },
      { merge: true }
    );

    return userCredential;
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      throw new Error('No account found with this email. Please sign up for your fun dating journey! 🎉');
    }
    if (error.code === 'auth/wrong-password') {
      throw new Error('Incorrect password. Please try again.');
    }
    if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email address.');
    }
    throw new Error(error.message || 'Login failed');
  }
};

/**
 * Logout user
 */
export const logoutUser = async (): Promise<void> => {
  const auth = getFirebaseAuth();
  await signOut(auth);
};

/**
 * Listen to auth state changes
 */
export const onAuthChange = (callback: (user: User | null) => void) => {
  const auth = getFirebaseAuth();
  return onAuthStateChanged(auth, callback);
};

/**
 * Get current user
 */
export const getCurrentUser = (): User | null => {
  const auth = getFirebaseAuth();
  return auth.currentUser;
};
