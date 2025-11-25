/**
 * Login Controller
 * Handles existing user login flow
 */

import { DatabaseGateway } from "./Database/databaseGateway";
import { UserService } from "./userService";
import type { UserCredential } from "firebase/auth";

export interface LoginResult {
  success: boolean;
  message: string;
  user?: {
    uid: string;
    email: string;
    profileComplete: boolean;
  };
}

/**
 * Login existing user
 * Call this when user submits email and password on login page
 */
export const loginUser = async (
  email: string,
  password: string
): Promise<LoginResult> => {
  try {
    // Step 1: Authenticate with Firebase Auth
    const userCredential = await DatabaseGateway.userLogin(email, password);
    
    // Step 2: Get user profile from Firestore
    const userProfile = await UserService.getUserProfile(userCredential.user.uid);
    
    if (!userProfile) {
      // User exists in Auth but not in Firestore - create profile
      await UserService.createUserProfile(
        userCredential.user.uid,
        userCredential.user.email!
      );
      
      return {
        success: true,
        message: "Login successful! Please complete your profile.",
        user: {
          uid: userCredential.user.uid,
          email: userCredential.user.email!,
          profileComplete: false,
        },
      };
    }
    
    // Step 3: Update last login timestamp
    await UserService.updateLastLogin(userCredential.user.uid);
    
    return {
      success: true,
      message: "Welcome back to DeChico!",
      user: {
        uid: userProfile.uid,
        email: userProfile.email,
        profileComplete: userProfile.profileComplete,
      },
    };
  } catch (error: any) {
    // Handle specific Firebase Auth errors
    if (error.code === "auth/user-not-found") {
      return {
        success: false,
        message: "No account found with this email. Please sign up first.",
      };
    }
    
    if (error.code === "auth/wrong-password") {
      return {
        success: false,
        message: "Incorrect password. Please try again.",
      };
    }
    
    if (error.code === "auth/invalid-email") {
      return {
        success: false,
        message: "Invalid email address.",
      };
    }
    
    if (error.code === "auth/too-many-requests") {
      return {
        success: false,
        message: "Too many failed login attempts. Please try again later.",
      };
    }
    
    return {
      success: false,
      message: error.message || "Login failed. Please try again.",
    };
  }
};

/**
 * Check if user can login (user exists in system)
 */
export const canUserLogin = async (email: string): Promise<boolean> => {
  try {
    return await UserService.userExistsByEmail(email);
  } catch (error) {
    console.error("Error checking if user can login:", error);
    return false;
  }
};

export const LoginController = {
  loginUser,
  canUserLogin,
};

export type LoginControllerType = typeof LoginController;
