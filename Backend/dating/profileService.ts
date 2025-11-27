/**
 * Dating Profile Service
 * Gets profiles for swiping with filtering logic
 */

import { adminDb } from '../config/firebaseAdmin';
import { SwipeService } from './swipeService';

const USERS_COLLECTION = 'users';
const PROFILES_PER_BATCH = 10;

export interface DatingProfile {
  userId: string;
  email: string;
  name: string;
  alias: string;
  age: number;
  bio: string;
  interests: string;
  photos: string[];
  gender?: string;
  ethnicity?: string;
}

/**
 * Get profiles for swiping
 * Excludes:
 * - Current user
 * - Already swiped users (in cooldown)
 * - Users without photos
 * - Incomplete profiles
 */
export const getSwipeableProfiles = async (
  currentUserId: string,
  limitCount: number = PROFILES_PER_BATCH
): Promise<DatingProfile[]> => {
  try {
    console.log('🔍 Getting swipeable profiles for user:', currentUserId);
    const usersRef = adminDb.collection(USERS_COLLECTION);

    // Get current user's gender preference
    const currentUserSnapshot = await usersRef.where('uid', '==', currentUserId).get();
    const currentUserData = currentUserSnapshot.docs[0]?.data();
    const genderPreference = currentUserData?.genderPreference || 'Both';
    console.log('👤 User gender preference:', genderPreference);

    // Get list of already swiped user IDs
    const swipedIds = await SwipeService.getSwipedUserIds(currentUserId);
    console.log('📋 Already swiped IDs:', swipedIds.length, swipedIds);

    // Query for complete profiles with photos
    const querySnapshot = await usersRef
      .where('profileComplete', '==', true)
      .limit(limitCount + swipedIds.length + 10)
      .get();
    console.log('📊 Query returned', querySnapshot.size, 'documents');
    const profiles: DatingProfile[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const userId = doc.id;

      console.log('👤 Processing user:', userId, {
        hasPhotos: !!(data.photos && data.photos.length > 0),
        photosCount: data.photos?.length || 0,
        profileComplete: data.profileComplete,
        isCurrentUser: userId === currentUserId,
        alreadySwiped: swipedIds.includes(userId)
      });

      // Skip current user
      if (userId === currentUserId) {
        console.log('⏭️  Skipping current user');
        return;
      }

      // Skip already swiped users
      if (swipedIds.includes(userId)) {
        console.log('⏭️  Skipping already swiped user');
        return;
      }

      // Skip users without photos
      if (!data.photos || data.photos.length === 0) {
        console.log('⏭️  Skipping user without photos');
        return;
      }

      // Filter by gender preference
      if (genderPreference !== 'Both') {
        if (data.gender !== genderPreference) {
          console.log('⏭️  Skipping user - gender mismatch (want:', genderPreference, 'got:', data.gender, ')');
          return;
        }
      }

      // Add to profiles list
      console.log('✅ Adding profile to list');
      profiles.push({
        userId,
        email: data.email || '',
        name: data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim(),
        alias: data.alias || 'Wildcat',
        age: data.age || 0,
        bio: data.bio || '',
        interests: data.interests || '',
        photos: data.photos || [],
        gender: data.gender,
        ethnicity: data.ethnicity,
      });

      // Stop once we have enough profiles
      if (profiles.length >= limitCount) {
        return;
      }
    });

    console.log('🎯 Final profiles count:', profiles.length);
    // Shuffle profiles for variety
    return shuffleArray(profiles).slice(0, limitCount);
  } catch (error) {
    console.error('Error getting swipeable profiles:', error);
    return [];
  }
};

/**
 * Get a specific user's dating profile
 */
export const getDatingProfile = async (
  userId: string
): Promise<DatingProfile | null> => {
  try {
    const usersRef = adminDb.collection(USERS_COLLECTION);
    const querySnapshot = await usersRef.where('uid', '==', userId).get();

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();

    return {
      userId: doc.id,
      email: data.email || '',
      name: data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim(),
      alias: data.alias || 'Wildcat',
      age: data.age || 0,
      bio: data.bio || '',
      interests: data.interests || '',
      photos: data.photos || [],
      gender: data.gender,
      ethnicity: data.ethnicity,
    };
  } catch (error) {
    console.error('Error getting dating profile:', error);
    return null;
  }
};

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export const ProfileService = {
  getSwipeableProfiles,
  getDatingProfile,
};
