/**
 * User Service
 * Handles all user-related database operations
 */

import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  query,
  where,
  getDocs,
  Timestamp,
  type Firestore,
} from "firebase/firestore";
import { getAuth, type User } from "firebase/auth";
import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { firebaseConfig } from "../Database/firebaseConfig";

const USERS_COLLECTION = "users";

let firebaseAppInstance: FirebaseApp;
let firestoreInstance: Firestore;

const getFirebaseApp = (): FirebaseApp => {
  if (!firebaseAppInstance) {
    if (!getApps().length) {
      firebaseAppInstance = initializeApp(firebaseConfig);
    } else {
      firebaseAppInstance = getApp();
    }
  }
  return firebaseAppInstance;
};

const getFirestoreClient = (): Firestore => {
  if (!firestoreInstance) {
    firestoreInstance = getFirestore(getFirebaseApp());
  }
  return firestoreInstance;
};

/**
 * User profile interface
 */
export interface UserProfile {
  uid: string;
  email: string;
  createdAt: string;
  lastLogin: string;
  profileComplete: boolean;
  // Add more fields as needed for dating app
  name?: string;
  age?: number;
  bio?: string;
  interests?: string[];
  photos?: string[];
}

/**
 * Check if a user exists in Firestore by email
 */
export const userExistsByEmail = async (email: string): Promise<boolean> => {
  try {
    const db = getFirestoreClient();
    const usersRef = collection(db, USERS_COLLECTION);
    const q = query(usersRef, where("email", "==", email.toLowerCase()));
    const querySnapshot = await getDocs(q);
    
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking user existence:", error);
    throw error;
  }
};

/**
 * Check if a user exists in Firestore by UID
 */
export const userExistsByUid = async (uid: string): Promise<boolean> => {
  try {
    const db = getFirestoreClient();
    const userRef = doc(db, USERS_COLLECTION, uid);
    const userDoc = await getDoc(userRef);
    
    return userDoc.exists();
  } catch (error) {
    console.error("Error checking user existence:", error);
    throw error;
  }
};

/**
 * Get user profile from Firestore
 */
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const db = getFirestoreClient();
    const userRef = doc(db, USERS_COLLECTION, uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return null;
    }
    
    return userDoc.data() as UserProfile;
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};

/**
 * Create a new user profile in Firestore
 */
export const createUserProfile = async (
  uid: string,
  email: string,
  additionalData?: Partial<UserProfile>
): Promise<UserProfile> => {
  try {
    const db = getFirestoreClient();
    const userRef = doc(db, USERS_COLLECTION, uid);
    
    const now = new Date().toISOString();
    const userProfile: UserProfile = {
      uid,
      email: email.toLowerCase(),
      createdAt: now,
      lastLogin: now,
      profileComplete: false,
      ...additionalData,
    };
    
    await setDoc(userRef, userProfile);
    
    return userProfile;
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};

/**
 * Update user's last login timestamp
 */
export const updateLastLogin = async (uid: string): Promise<void> => {
  try {
    const db = getFirestoreClient();
    const userRef = doc(db, USERS_COLLECTION, uid);
    
    await setDoc(
      userRef,
      {
        lastLogin: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Error updating last login:", error);
    throw error;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> => {
  try {
    const db = getFirestoreClient();
    const userRef = doc(db, USERS_COLLECTION, uid);
    
    await setDoc(userRef, updates, { merge: true });
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

export const UserService = {
  userExistsByEmail,
  userExistsByUid,
  getUserProfile,
  createUserProfile,
  updateLastLogin,
  updateUserProfile,
};

export type UserServiceType = typeof UserService;
