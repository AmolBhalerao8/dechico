/**
 * useAuth Hook
 * Manages authentication state across the app
 */

import { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { onAuthChange } from '../services/authService';
import { getUserProfile, type UserProfile } from '../services/userService';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        if (firebaseUser.email) {
          try {
            const userProfile = await getUserProfile(
              firebaseUser.uid,
              firebaseUser.email,
            );
            setProfile(userProfile);
          } catch (error) {
            console.error('Error loading user profile:', error);
          }
        } else {
          console.warn('Firebase user is missing an email address.');
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return {
    user,
    profile,
    loading,
    isLoggedIn: !!user,
  };
};
