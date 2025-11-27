/**
 * User Profile Service for Frontend
 * Talks to the Express backend instead of directly mutating Firestore.
 */

import { apiFetch, withAuthHeaders } from './apiClient';

export interface UserProfile {
  uid: string;
  email: string;
  createdAt: string;
  lastLogin: string;
  profileComplete: boolean;
  firstName?: string;
  lastName?: string;
  alias?: string;
  bio?: string;
  age?: string;
  ethnicity?: string;
  interests?: string;
  gender?: string;
  genderPreference?: string;
  avatarUrl?: string;
  photos?: string[];
}

type ProfileResponse = { profile?: UserProfile };

export const getUserProfile = async (
  uid: string,
  email: string,
): Promise<UserProfile | null> => {
  const data = await apiFetch<ProfileResponse>('/api/profile/me', {
    headers: withAuthHeaders(uid, email),
  });
  return data.profile ?? null;
};

export const updateUserProfile = async (
  uid: string,
  email: string,
  updates: Partial<UserProfile>,
): Promise<UserProfile | null> => {
  const data = await apiFetch<ProfileResponse>('/api/profile/me', {
    method: 'PATCH',
    headers: withAuthHeaders(uid, email),
    body: JSON.stringify(updates),
  });
  return data.profile ?? null;
};

export const saveProfile = async (
  uid: string,
  email: string,
  profileData: Partial<UserProfile>,
): Promise<UserProfile | null> => {
  return updateUserProfile(uid, email, profileData);
};

export const appendPhotos = async (
  uid: string,
  email: string,
  photos: string[],
): Promise<UserProfile | null> => {
  const data = await apiFetch<ProfileResponse>('/api/profile/me/photos', {
    method: 'POST',
    headers: withAuthHeaders(uid, email),
    body: JSON.stringify({ photos }),
  });
  return data.profile ?? null;
};

export const deleteUserProfile = async (uid: string, email: string): Promise<void> => {
  await apiFetch('/api/profile/me', {
    method: 'DELETE',
    headers: withAuthHeaders(uid, email),
  });
};
