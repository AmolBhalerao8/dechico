/**
 * User Profile Service for Frontend
 * Handles user profile operations
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { getFirebaseDb } from '../config/firebase';

const USERS_COLLECTION = 'users';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  createdAt: string;
  lastLogin: string;
  profileComplete: boolean;
  
  // Profile fields
  firstName: string;
  lastName: string;
  alias: string;
  bio: string;
  age: string;
  ethnicity: string;
  interests: string;
  gender: string;
  photos: string[];
  avatarUrl?: string;
  
  // Dating stats
  swipeStats: {
    rightSwipesReceived: number;
    leftSwipesReceived: number;
    rightSwipesGiven: number;
    leftSwipesGiven: number;
  };
}

/**
 * Get user profile from Firestore
 */
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const db = getFirebaseDb();
    const userRef = doc(db, USERS_COLLECTION, uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return null;
    }
    
    return userDoc.data() as UserProfile;
  } catch (error) {
    console.error('Error getting user profile:', error);
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
    const db = getFirebaseDb();
    const userRef = doc(db, USERS_COLLECTION, uid);
    
    await updateDoc(userRef, updates as any);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Save complete profile (for onboarding)
 */
export const saveProfile = async (
  uid: string,
  profileData: Partial<UserProfile>
): Promise<void> => {
  try {
    const db = getFirebaseDb();
    const userRef = doc(db, USERS_COLLECTION, uid);
    
    // Check if profile is complete
    const profileComplete = !!(
      profileData.photos &&
      profileData.photos.length > 0 &&
      (profileData.firstName || profileData.alias) &&
      profileData.age
    );
    
    await setDoc(
      userRef,
      {
        ...profileData,
        profileComplete,
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error saving profile:', error);
    throw error;
  }
};

/**
 * Upload photo to storage and get URL
 * For now, we'll store base64 images directly
 * In production, use Firebase Storage
 */
export const uploadPhoto = async (
  uid: string,
  photoData: string
): Promise<string> => {
  // For now, return the base64 data URL
  // In production, upload to Firebase Storage and return the URL
  return photoData;
};

/**
 * Add photo to user's gallery
 */
export const addPhotoToGallery = async (
  uid: string,
  photoUrl: string
): Promise<void> => {
  try {
    const profile = await getUserProfile(uid);
    if (!profile) throw new Error('User profile not found');
    
    const updatedPhotos = [...profile.photos, photoUrl];
    const avatarUrl = profile.avatarUrl || updatedPhotos[0];
    
    await updateUserProfile(uid, {
      photos: updatedPhotos,
      avatarUrl,
    });
  } catch (error) {
    console.error('Error adding photo to gallery:', error);
    throw error;
  }
};
