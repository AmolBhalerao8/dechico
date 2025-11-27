import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  type Auth,
  type UserCredential,
} from "firebase/auth";
import {
  getApp,
  getApps,
  initializeApp,
  type FirebaseApp,
} from "firebase/app";
import { firebaseConfig } from "./firebaseConfig";

const getFirebaseApp = (): FirebaseApp => {
  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }

  return getApp();
};

let authInstance: Auth;

const getAuthClient = (): Auth => {
  if (!authInstance) {
    authInstance = getAuth(getFirebaseApp());
  }

  return authInstance;
};

/**
 * Adds a new user to Firebase Authentication using username + password.
 */
export const addUser = (
  username: string,
  password: string,
): Promise<UserCredential> =>
  createUserWithEmailAndPassword(getAuthClient(), username, password);

/**
 * Logs in an existing user by validating the credentials via Firebase Auth.
 */
export const userLogin = (
  username: string,
  password: string,
): Promise<UserCredential> =>
  signInWithEmailAndPassword(getAuthClient(), username, password);

export const DatabaseGateway = {
  addUser,
  userLogin,
};

export type DatabaseGatewayType = typeof DatabaseGateway;