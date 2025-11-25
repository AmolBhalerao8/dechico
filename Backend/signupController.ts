/**
 * Signup Controller
 * Handles new user registration flow with email verification
 */

import { EmailVerification } from "./emailVerification";
import { UserService } from "./userService";
import type { UserCredential } from "firebase/auth";

export interface SignupStep1Result {
  success: boolean;
  message: string;
  verificationCodeSent: boolean;
}

export interface SignupStep2Result {
  success: boolean;
  message: string;
  verified: boolean;
}

export interface SignupStep3Result {
  success: boolean;
  message: string;
  user?: {
    uid: string;
    email: string;
  };
}

/**
 * Step 1: Send verification code to email
 * Call this when user clicks "Sign Up" button
 */
export const sendVerificationCode = async (
  email: string
): Promise<SignupStep1Result> => {
  try {
    // Validate email domain
    if (!EmailVerification.validateCsuChicoEmail(email)) {
      return {
        success: false,
        message: "Only @csuchico.edu email addresses are allowed.",
        verificationCodeSent: false,
      };
    }
    
    // Check if user already exists
    const userExists = await UserService.userExistsByEmail(email);
    if (userExists) {
      return {
        success: false,
        message: "An account with this email already exists. Please login instead.",
        verificationCodeSent: false,
      };
    }
    
    // Send verification code
    await EmailVerification.sendVerificationCode(email);
    
    return {
      success: true,
      message: `Verification code sent to ${email}. Please check your inbox.`,
      verificationCodeSent: true,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to send verification code. Please try again.",
      verificationCodeSent: false,
    };
  }
};

/**
 * Step 2: Verify the code entered by user
 * Call this when user submits the verification code
 */
export const verifyEmailCode = async (
  email: string,
  code: string
): Promise<SignupStep2Result> => {
  try {
    const verified = await EmailVerification.verifyCode(email, code);
    
    if (verified) {
      return {
        success: true,
        message: "Email verified successfully! You can now create your account.",
        verified: true,
      };
    } else {
      return {
        success: false,
        message: "Invalid verification code. Please try again.",
        verified: false,
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Verification failed. Please try again.",
      verified: false,
    };
  }
};

/**
 * Step 3: Create user account (only if email is verified)
 * Call this when user submits password and completes signup
 */
export const createAccount = async (
  email: string,
  password: string
): Promise<SignupStep3Result> => {
  try {
    // Create Firebase Auth user (this also checks if email is verified)
    const userCredential = await EmailVerification.createVerifiedUser(email, password);
    
    // Create user profile in Firestore
    await UserService.createUserProfile(
      userCredential.user.uid,
      userCredential.user.email!
    );
    
    return {
      success: true,
      message: "Account created successfully! Welcome to DeChico!",
      user: {
        uid: userCredential.user.uid,
        email: userCredential.user.email!,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to create account. Please try again.",
    };
  }
};

/**
 * Complete signup flow (all steps combined)
 * This is a helper function that combines all steps
 */
export const completeSignup = async (
  email: string,
  verificationCode: string,
  password: string
): Promise<SignupStep3Result> => {
  try {
    // Step 1: Verify code
    const verifyResult = await verifyEmailCode(email, verificationCode);
    if (!verifyResult.success) {
      return {
        success: false,
        message: verifyResult.message,
      };
    }
    
    // Step 2: Create account
    return await createAccount(email, password);
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Signup failed. Please try again.",
    };
  }
};

export const SignupController = {
  sendVerificationCode,
  verifyEmailCode,
  createAccount,
  completeSignup,
};

export type SignupControllerType = typeof SignupController;
