/**
 * Dating Service
 * Handles all dating-related API calls
 */

const API_URL = 'http://localhost:3001/api';

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

export interface Match {
  matchId: string;
  matchedUserId: string;
  matchedUserEmail: string;
  matchedUserName: string;
  matchedUserAlias: string;
  matchedUserPhoto: string;
  matchedAt: any;
}

export interface SwipeResult {
  success: boolean;
  message: string;
  isMatch?: boolean;
  matchId?: string;
}

/**
 * Get profiles to swipe on
 */
export const getSwipeableProfiles = async (userId: string): Promise<DatingProfile[]> => {
  try {
    console.log('🌐 Fetching profiles from:', `${API_URL}/dating/profiles?userId=${userId}`);
    const response = await fetch(`${API_URL}/dating/profiles?userId=${userId}`);
    
    console.log('📡 Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Response not OK:', errorText);
      // Return empty array instead of throwing error
      return [];
    }

    const data = await response.json();
    console.log('📦 Response data:', data);
    return data.profiles || [];
  } catch (error) {
    console.error('❌ Error fetching profiles:', error);
    // Return empty array instead of throwing error - no popup!
    return [];
  }
};

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
    const response = await fetch(`${API_URL}/dating/swipe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        swiperId,
        swiperEmail,
        swipedId,
        swipedEmail,
        direction,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to record swipe');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error recording swipe:', error);
    return {
      success: false,
      message: error.message || 'Failed to record swipe',
    };
  }
};

/**
 * Get user's matches
 */
export const getUserMatches = async (userId: string): Promise<Match[]> => {
  try {
    const response = await fetch(`${API_URL}/dating/matches?userId=${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch matches');
    }

    const data = await response.json();
    return data.matches || [];
  } catch (error) {
    console.error('Error fetching matches:', error);
    return [];
  }
};
