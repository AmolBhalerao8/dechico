/**
 * Authentication Controller
 * Main entry point for authentication - determines if user should signup or login
 */

import { UserService } from "../user/userService";
import { EmailVerification } from "./emailVerification";

export interface AuthCheckResult {
  userExists: boolean;
  email: string;
  isValidCsuEmail: boolean;
  action: "signup" | "login" | "invalid_email";
}

/**
 * Check if user exists and determine next action
 * This is the first step in the authentication flow
 * 
 * @param email - User's email address
 * @returns AuthCheckResult indicating what action to take
 */
export const checkUserStatus = async (email: string): Promise<AuthCheckResult> => {
  // Step 1: Validate CSU Chico email
  const isValidCsuEmail = EmailVerification.validateCsuChicoEmail(email);
  
  if (!isValidCsuEmail) {
    return {
      userExists: false,
      email,
      isValidCsuEmail: false,
      action: "invalid_email",
    };
  }
  
  // Step 2: Check if user exists in database
  const userExists = await UserService.userExistsByEmail(email);
  
  return {
    userExists,
    email: email.toLowerCase(),
    isValidCsuEmail: true,
    action: userExists ? "login" : "signup",
  };
};

/**
 * Main authentication flow
 * Call this when user enters their email on the landing page
 */
export const initiateAuth = async (email: string): Promise<{
  success: boolean;
  action: "signup" | "login" | "invalid_email";
  message: string;
  email?: string;
}> => {
  try {
    const result = await checkUserStatus(email);
    
    if (!result.isValidCsuEmail) {
      return {
        success: false,
        action: "invalid_email",
        message: "Only @csuchico.edu email addresses are allowed.",
      };
    }
    
    if (result.userExists) {
      return {
        success: true,
        action: "login",
        message: "Welcome back! Please login.",
        email: result.email,
      };
    } else {
      return {
        success: true,
        action: "signup",
        message: "New user! Let's create your account.",
        email: result.email,
      };
    }
  } catch (error: any) {
    return {
      success: false,
      action: "invalid_email",
      message: error.message || "An error occurred. Please try again.",
    };
  }
};

export const AuthController = {
  checkUserStatus,
  initiateAuth,
};

export type AuthControllerType = typeof AuthController;
