import { createTransport, type Transporter } from "nodemailer";
import {
  getAuth,
  createUserWithEmailAndPassword,
  type UserCredential,
  type Auth,
} from "firebase/auth";
import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { google } from "googleapis";

// Import Firebase config from Database folder
import { firebaseConfig } from "../Database/firebaseConfig";
import { adminDb, adminTimestamp } from "../config/firebaseAdmin";
import type { Timestamp } from "firebase-admin/firestore";

// Constants
const CSU_CHICO_DOMAIN = "@csuchico.edu";
const VERIFICATION_COLLECTION = "email_verifications";
const CODE_EXPIRATION_MINUTES = 15;
const CODE_LENGTH = 6;
const MAX_RETRY_ATTEMPTS = 5;

// Firebase instances
let firebaseAppInstance: FirebaseApp;
let authInstance: Auth;

const getFirebaseApp = (): FirebaseApp => {
  if (!firebaseAppInstance) {
    if (!getApps().length) {
      firebaseAppInstance = initializeApp(firebaseConfig);
    } else {
      firebaseAppInstance = getApp();
    }
  }
  return firebaseAppInstance;
};

const getAuthClient = (): Auth => {
  if (!authInstance) {
    authInstance = getAuth(getFirebaseApp());
  }
  return authInstance;
};

// Email transporter (configured via environment variables with OAuth2)
let emailTransporter: Transporter | null = null;

const getEmailTransporter = (): Transporter => {
  if (!emailTransporter) {
    const emailUser = process.env.EMAIL_USER;
    const clientId = process.env.GMAIL_CLIENT_ID;
    const clientSecret = process.env.GMAIL_CLIENT_SECRET;
    const refreshToken = process.env.GMAIL_REFRESH_TOKEN;

    if (!emailUser || !clientId || !clientSecret || !refreshToken) {
      throw new Error(
        "Email OAuth2 credentials not configured. Set EMAIL_USER, GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, and GMAIL_REFRESH_TOKEN environment variables."
      );
    }

    // Create OAuth2 client
    const OAuth2 = google.auth.OAuth2;
    const oauth2Client = new OAuth2(
      clientId,
      clientSecret,
      "https://developers.google.com/oauthplayground" // Redirect URL
    );

    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    emailTransporter = createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: emailUser,
        clientId: clientId,
        clientSecret: clientSecret,
        refreshToken: refreshToken,
      },
    });
  }
  return emailTransporter;
};

/**
 * Validates if the email is a CSU Chico email address
 */
export const validateCsuChicoEmail = (email: string): boolean => {
  const trimmedEmail = email.trim().toLowerCase();
  return trimmedEmail.endsWith(CSU_CHICO_DOMAIN);
};

/**
 * Generates a random 6-digit verification code
 */
const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Stores verification code in Firestore
 */
const storeVerificationCode = async (
  email: string,
  code: string
): Promise<void> => {
  const verificationRef = adminDb.collection(VERIFICATION_COLLECTION).doc(email);

  const existingDoc = await verificationRef.get();
  let attempts = 0;

  if (existingDoc.exists) {
    const data = existingDoc.data();
    const attemptCount = data?.attempts ?? 0;

    if (attemptCount >= MAX_RETRY_ATTEMPTS) {
      throw new Error(
        "Maximum verification attempts reached. Please try again later."
      );
    }

    attempts = attemptCount;
  }

  await verificationRef.set({
    email,
    code,
    createdAt: adminTimestamp.now(),
    expiresAt: adminTimestamp.fromMillis(
      Date.now() + CODE_EXPIRATION_MINUTES * 60 * 1000
    ),
    verified: false,
    attempts: attempts + 1,
  });
};

/**
 * Sends verification code email to the user
 */
const sendVerificationEmail = async (
  email: string,
  code: string
): Promise<void> => {
  const transporter = getEmailTransporter();

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "DeChico - Email Verification Code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to DeChico!</h2>
        <p>Your verification code is:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${code}
        </div>
        <p>This code will expire in ${CODE_EXPIRATION_MINUTES} minutes,<br>
        But my Love for you stays forever 😉</p>
        <p>If you didn't request this code, please ignore this email.</p>
        <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 12px;">DeChico - CSU Chico Dating App</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Sends a verification code to the CSU Chico email address
 * @param email - Must be a valid @csuchico.edu email
 * @returns The verification code (for testing purposes - remove in production)
 */
export const sendVerificationCode = async (email: string): Promise<string> => {
  // Validate CSU Chico email
  if (!validateCsuChicoEmail(email)) {
    throw new Error(
      "Invalid email domain. Only @csuchico.edu email addresses are allowed."
    );
  }

  const normalizedEmail = email.trim().toLowerCase();
  const code = generateVerificationCode();

  // Store code in Firestore
  await storeVerificationCode(normalizedEmail, code);

  // Send email
  await sendVerificationEmail(normalizedEmail, code);

  console.log(`Verification code sent to ${normalizedEmail}`);

  // Return code for testing - REMOVE THIS IN PRODUCTION
  return code;
};

/**
 * Verifies the code entered by the user
 * @param email - The email address
 * @param code - The verification code entered by the user
 * @returns true if verification successful, false otherwise
 */
export const verifyCode = async (
  email: string,
  code: string
): Promise<boolean> => {
  const normalizedEmail = email.trim().toLowerCase();
  const verificationRef = adminDb.collection(VERIFICATION_COLLECTION).doc(normalizedEmail);

  const verificationDoc = await verificationRef.get();

  if (!verificationDoc.exists) {
    throw new Error("No verification code found for this email.");
  }

  const data = verificationDoc.data();
  if (!data) {
    throw new Error("Verification record is corrupted.");
  }

  // Check if already verified
  if (data.verified) {
    return true;
  }

  // Check if expired
  const now = adminTimestamp.now();
  if (now.toMillis() > data.expiresAt.toMillis()) {
    throw new Error("Verification code has expired. Please request a new one.");
  }

  // Check if code matches
  if (data.code !== code) {
    throw new Error("Invalid verification code.");
  }

  // Mark as verified
  await verificationRef.set(
    {
      verified: true,
      verifiedAt: adminTimestamp.now(),
    },
    { merge: true }
  );

  return true;
};

/**
 * Checks if an email has been verified
 * @param email - The email address to check
 * @returns true if verified, false otherwise
 */
export const isEmailVerified = async (email: string): Promise<boolean> => {
  const normalizedEmail = email.trim().toLowerCase();
  const verificationRef = adminDb.collection(VERIFICATION_COLLECTION).doc(normalizedEmail);

  const verificationDoc = await verificationRef.get();

  if (!verificationDoc.exists) {
    return false;
  }

  const data = verificationDoc.data();
  return data?.verified === true;
};

/**
 * Creates a new user account ONLY if email is verified
 * @param email - Must be verified @csuchico.edu email
 * @param password - User's password
 * @returns UserCredential from Firebase Auth
 */
export const createVerifiedUser = async (
  email: string,
  password: string
): Promise<UserCredential> => {
  const normalizedEmail = email.trim().toLowerCase();

  // Validate CSU Chico email
  if (!validateCsuChicoEmail(normalizedEmail)) {
    throw new Error(
      "Invalid email domain. Only @csuchico.edu email addresses are allowed."
    );
  }

  // Check if email is verified
  const verified = await isEmailVerified(normalizedEmail);
  if (!verified) {
    throw new Error(
      "Email not verified. Please verify your email before creating an account."
    );
  }

  // Create user in Firebase Auth
  const userCredential = await createUserWithEmailAndPassword(
    getAuthClient(),
    normalizedEmail,
    password
  );

  // Clean up verification record after successful account creation
  const verificationRef = adminDb.collection(VERIFICATION_COLLECTION).doc(normalizedEmail);
  await verificationRef.delete();

  return userCredential;
};

/**
 * Deletes verification record (useful for cleanup or retry)
 */
export const deleteVerificationRecord = async (email: string): Promise<void> => {
  const normalizedEmail = email.trim().toLowerCase();
  const verificationRef = adminDb.collection(VERIFICATION_COLLECTION).doc(normalizedEmail);
  await verificationRef.delete();
};

// Export as a module
export const EmailVerification = {
  validateCsuChicoEmail,
  sendVerificationCode,
  verifyCode,
  isEmailVerified,
  createVerifiedUser,
  deleteVerificationRecord,
};

export type EmailVerificationType = typeof EmailVerification;
