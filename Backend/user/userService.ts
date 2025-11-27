/**
 * User Service
 * Handles all user-related database operations
 */

import { adminDb, adminAuth } from "../config/firebaseAdmin";
import { RANK_POLL_VOTE_COLLECTION } from "../ranking/rankPollService";

const USERS_COLLECTION = "users";

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
    const usersRef = adminDb.collection(USERS_COLLECTION);
    const querySnapshot = await usersRef.where("email", "==", email.toLowerCase()).get();
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
    const userRef = adminDb.collection(USERS_COLLECTION).doc(uid);
    const userDoc = await userRef.get();
    return userDoc.exists;
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
    const userRef = adminDb.collection(USERS_COLLECTION).doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
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
    const userRef = adminDb.collection(USERS_COLLECTION).doc(uid);
    
    const now = new Date().toISOString();
    const userProfile: UserProfile = {
      uid,
      email: email.toLowerCase(),
      createdAt: now,
      lastLogin: now,
      profileComplete: false,
      ...additionalData,
    };
    
    await userRef.set(userProfile);
    
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
    const userRef = adminDb.collection(USERS_COLLECTION).doc(uid);
    await userRef.set(
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
    const userRef = adminDb.collection(USERS_COLLECTION).doc(uid);
    await userRef.set(updates, { merge: true });
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

/**
 * Append photo URLs to the user's profile gallery
 */
export const appendPhotos = async (
  uid: string,
  photos: string[]
): Promise<UserProfile> => {
  if (!photos.length) {
    throw new Error("No photo URLs provided.");
  }

  try {
    const userRef = adminDb.collection(USERS_COLLECTION).doc(uid);

    const updatedProfile = await adminDb.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(userRef);

      if (!snapshot.exists) {
        throw new Error("User profile not found.");
      }

      const currentProfile = snapshot.data() as UserProfile;
      const mergedPhotos = [...(currentProfile.photos ?? []), ...photos];

      transaction.set(
        userRef,
        {
          photos: mergedPhotos,
        },
        { merge: true }
      );

      return {
        ...currentProfile,
        photos: mergedPhotos,
      };
    });

    return updatedProfile;
  } catch (error) {
    console.error("Error appending user photos:", error);
    throw error;
  }
};

export const deleteUserAccount = async (uid: string): Promise<void> => {
  try {
    await adminDb.collection(USERS_COLLECTION).doc(uid).delete();

    const voteSnapshot = await adminDb
      .collection(RANK_POLL_VOTE_COLLECTION)
      .where("userId", "==", uid)
      .get();
    await Promise.all(voteSnapshot.docs.map((doc) => doc.ref.delete()));

    const chatSnapshot = await adminDb
      .collection("global_chat")
      .where("userId", "==", uid)
      .get();
    await Promise.all(chatSnapshot.docs.map((doc) => doc.ref.delete()));
  } catch (error) {
    console.error("Error deleting user account data:", error);
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
  appendPhotos,
  deleteUserAccount,
};

export type UserServiceType = typeof UserService;
