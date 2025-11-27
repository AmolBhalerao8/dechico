/**
 * User Profile Service for Frontend
 * Handles user profile operations
 */

import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import { getFirebaseDb, getFirebaseAuth } from '../config/firebase';

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
    
    // Use setDoc with merge instead of updateDoc to handle non-existent documents
    await setDoc(userRef, updates as any, { merge: true });
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
  email: string,
  profileData: Partial<UserProfile>
): Promise<void> => {
  try {
    const db = getFirebaseDb();
    const userRef = doc(db, USERS_COLLECTION, uid);
    
    // Check if profile exists
    const userDoc = await getDoc(userRef);
    
    // Check if profile is complete
    const profileComplete = !!(
      profileData.photos &&
      profileData.photos.length > 0 &&
      (profileData.firstName || profileData.alias) &&
      profileData.age
    );
    
    // If document doesn't exist, create it with all required fields
    if (!userDoc.exists()) {
      const now = new Date().toISOString();
      await setDoc(userRef, {
        uid,
        email: email.toLowerCase(),
        createdAt: now,
        lastLogin: now,
        firstName: '',
        lastName: '',
        alias: '',
        bio: '',
        age: '',
        ethnicity: '',
        interests: '',
        gender: '',
        photos: [],
        swipeStats: {
          rightSwipesReceived: 0,
          leftSwipesReceived: 0,
          rightSwipesGiven: 0,
          leftSwipesGiven: 0,
        },
        ...profileData,
        profileComplete,
      });
    } else {
      // Document exists, just update it
      await setDoc(
        userRef,
        {
          ...profileData,
          profileComplete,
        },
        { merge: true }
      );
    }
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

/**
 * Delete user profile from Firestore AND Firebase Auth
 * WARNING: This permanently deletes all user data
 */
export const deleteUserProfile = async (uid: string): Promise<void> => {
  try {
    const db = getFirebaseDb();
    const auth = getFirebaseAuth();
    const currentUser = auth.currentUser;

    if (!currentUser || currentUser.uid !== uid) {
      throw new Error('Cannot delete profile: User not authenticated or UID mismatch');
    }

    // Delete the Firestore document first
    const userRef = doc(db, USERS_COLLECTION, uid);
    await deleteDoc(userRef);
    console.log('✅ User profile deleted from Firestore:', uid);

    // Delete the Firebase Auth account
    await deleteUser(currentUser);
    console.log('✅ User account deleted from Firebase Auth:', uid);
  } catch (error: any) {
    console.error('❌ Error deleting user account:', error);
    if (error.code === 'auth/requires-recent-login') {
      throw new Error('For security, please log out and log back in before deleting your account.');
    }
    throw error;
  }
};
