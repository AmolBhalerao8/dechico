/**
 * Match Service
 * Handles match creation and retrieval
 */

import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp,
  or,
  and,
} from 'firebase/firestore';
import { DatabaseGateway } from '../Database/databaseGateway';
import { UserService } from '../user/userService';

const MATCHES_COLLECTION = 'matches';

export interface Match {
  id?: string;
  user1Id: string;
  user1Email: string;
  user2Id: string;
  user2Email: string;
  matchedAt: Timestamp;
  chatId?: string;
}

export interface MatchWithProfile {
  matchId: string;
  matchedUserId: string;
  matchedUserEmail: string;
  matchedUserName: string;
  matchedUserAlias: string;
  matchedUserPhoto: string;
  matchedAt: Timestamp;
}

/**
 * Create a match between two users
 */
export const createMatch = async (
  user1Id: string,
  user1Email: string,
  user2Id: string,
  user2Email: string
): Promise<{ success: boolean; message: string; matchId?: string }> => {
  try {
    // Check if match already exists
    const existingMatch = await getMatchBetweenUsers(user1Id, user2Id);
    if (existingMatch) {
      return {
        success: false,
        message: 'Match already exists',
      };
    }

    const db = DatabaseGateway.getFirestore();
    const matchesRef = collection(db, MATCHES_COLLECTION);

    // Create match document
    const docRef = await addDoc(matchesRef, {
      user1Id,
      user1Email,
      user2Id,
      user2Email,
      matchedAt: serverTimestamp(),
    });

    return {
      success: true,
      message: 'Match created successfully',
      matchId: docRef.id,
    };
  } catch (error: any) {
    console.error('Error creating match:', error);
    return {
      success: false,
      message: error.message || 'Failed to create match',
    };
  }
};

/**
 * Get match between two specific users
 */
export const getMatchBetweenUsers = async (
  userId1: string,
  userId2: string
): Promise<Match | null> => {
  try {
    const db = DatabaseGateway.getFirestore();
    const matchesRef = collection(db, MATCHES_COLLECTION);

    // Query for match in either direction
    const q = query(
      matchesRef,
      or(
        and(
          where('user1Id', '==', userId1),
          where('user2Id', '==', userId2)
        ),
        and(
          where('user1Id', '==', userId2),
          where('user2Id', '==', userId1)
        )
      )
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as Match;
  } catch (error) {
    console.error('Error getting match:', error);
    return null;
  }
};

/**
 * Get all matches for a user with profile information
 */
export const getUserMatches = async (
  userId: string
): Promise<MatchWithProfile[]> => {
  try {
    const db = DatabaseGateway.getFirestore();
    const matchesRef = collection(db, MATCHES_COLLECTION);

    // Query for matches where user is either user1 or user2
    const q = query(
      matchesRef,
      or(
        where('user1Id', '==', userId),
        where('user2Id', '==', userId)
      )
    );

    const querySnapshot = await getDocs(q);
    const matches: MatchWithProfile[] = [];

    // Get profile info for each matched user
    for (const doc of querySnapshot.docs) {
      const matchData = doc.data() as Match;
      
      // Determine which user is the matched user (not current user)
      const matchedUserId = matchData.user1Id === userId 
        ? matchData.user2Id 
        : matchData.user1Id;
      
      const matchedUserEmail = matchData.user1Id === userId
        ? matchData.user2Email
        : matchData.user1Email;

      // Get matched user's profile
      const profile = await UserService.getUserProfile(matchedUserId);

      if (profile) {
        matches.push({
          matchId: doc.id,
          matchedUserId,
          matchedUserEmail,
          matchedUserName: (profile as any).name || 'Unknown',
          matchedUserAlias: (profile as any).alias || 'Unknown',
          matchedUserPhoto: profile.photos?.[0] || '',
          matchedAt: matchData.matchedAt,
        });
      }
    }

    // Sort by most recent first
    matches.sort((a, b) => {
      const timeA = a.matchedAt?.toMillis() || 0;
      const timeB = b.matchedAt?.toMillis() || 0;
      return timeB - timeA;
    });

    return matches;
  } catch (error) {
    console.error('Error getting user matches:', error);
    return [];
  }
};

/**
 * Check if two users are matched
 */
export const areUsersMatched = async (
  userId1: string,
  userId2: string
): Promise<boolean> => {
  const match = await getMatchBetweenUsers(userId1, userId2);
  return match !== null;
};

export const MatchService = {
  createMatch,
  getMatchBetweenUsers,
  getUserMatches,
  areUsersMatched,
};
