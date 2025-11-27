/**
 * Swipe Service
 * Handles swipe logic with 10-day cooldown
 */

import {
  adminDb,
  adminFieldValue,
  adminTimestamp,
} from '../config/firebaseAdmin';
import type { Timestamp } from 'firebase-admin/firestore';

const SWIPES_COLLECTION = 'swipes';
const COOLDOWN_DAYS = 10;

export interface SwipeRecord {
  id?: string;
  swiperId: string;
  swiperEmail: string;
  swipedId: string;
  swipedEmail: string;
  direction: 'left' | 'right';
  timestamp: Timestamp;
  cooldownUntil: Timestamp;
}

export interface SwipeResult {
  success: boolean;
  message: string;
  isMatch?: boolean;
  matchId?: string;
}

/**
 * Record a swipe (left or right)
 */
export const recordSwipe = async (
  swiperId: string,
  swiperEmail: string,
  swipedId: string,
  swipedEmail: string,
  direction: 'left' | 'right'
): Promise<SwipeResult> => {
  try {
    // Validate inputs
    if (!swiperId || !swiperEmail || !swipedId || !swipedEmail || !direction) {
      return {
        success: false,
        message: 'All fields are required',
      };
    }

    if (swiperId === swipedId) {
      return {
        success: false,
        message: 'Cannot swipe on yourself',
      };
    }

    // Check if already swiped
    const alreadySwiped = await hasSwipedRecently(swiperId, swipedId);
    if (alreadySwiped) {
      return {
        success: false,
        message: 'Already swiped on this user recently',
      };
    }

    const swipesRef = adminDb.collection(SWIPES_COLLECTION);

    // Calculate cooldown date (10 days from now)
    const now = new Date();
    const cooldownDate = new Date(now.getTime() + COOLDOWN_DAYS * 24 * 60 * 60 * 1000);

    // Record the swipe
    await swipesRef.add({
      swiperId,
      swiperEmail,
      swipedId,
      swipedEmail,
      direction,
      timestamp: adminFieldValue.serverTimestamp(),
      cooldownUntil: adminTimestamp.fromDate(cooldownDate),
    });

    // If right swipe, check for match
    let isMatch = false;
    if (direction === 'right') {
      isMatch = await checkForMatch(swiperId, swipedId);
    }

    return {
      success: true,
      message: 'Swipe recorded successfully',
      isMatch,
    };
  } catch (error: any) {
    console.error('Error recording swipe:', error);
    return {
      success: false,
      message: error.message || 'Failed to record swipe',
    };
  }
};

/**
 * Check if user has already swiped on target within cooldown period
 */
export const hasSwipedRecently = async (
  swiperId: string,
  swipedId: string
): Promise<boolean> => {
  try {
    const swipesRef = adminDb.collection(SWIPES_COLLECTION);

    const now = adminTimestamp.now();

    const querySnapshot = await swipesRef
      .where('swiperId', '==', swiperId)
      .where('swipedId', '==', swipedId)
      .where('cooldownUntil', '>', now)
      .get();
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking swipe history:', error);
    return false;
  }
};

/**
 * Check if there's a mutual match (both users right swiped)
 */
export const checkForMatch = async (
  userId1: string,
  userId2: string
): Promise<boolean> => {
  try {
    const swipesRef = adminDb.collection(SWIPES_COLLECTION);

    const querySnapshot = await swipesRef
      .where('swiperId', '==', userId2)
      .where('swipedId', '==', userId1)
      .where('direction', '==', 'right')
      .get();
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking for match:', error);
    return false;
  }
};

/**
 * Get list of user IDs that current user has already swiped on
 */
export const getSwipedUserIds = async (userId: string): Promise<string[]> => {
  try {
    const swipesRef = adminDb.collection(SWIPES_COLLECTION);

    const now = adminTimestamp.now();

    const querySnapshot = await swipesRef
      .where('swiperId', '==', userId)
      .where('cooldownUntil', '>', now)
      .get();
    const swipedIds: string[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      swipedIds.push(data.swipedId);
    });

    return swipedIds;
  } catch (error) {
    console.error('Error getting swiped users:', error);
    return [];
  }
};

export const SwipeService = {
  recordSwipe,
  hasSwipedRecently,
  checkForMatch,
  getSwipedUserIds,
};
