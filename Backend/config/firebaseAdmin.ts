import fs from 'fs';
import path from 'path';
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const initAdmin = () => {
  if (admin.apps.length) {
    return admin.app();
  }

  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  if (!serviceAccountPath) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_PATH is not set');
  }

  const resolvedPath = path.resolve(serviceAccountPath);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Firebase service account file not found at ${resolvedPath}`);
  }

  const raw = fs.readFileSync(resolvedPath, 'utf8');
  const serviceAccount = JSON.parse(raw);

  const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });

  console.log('Firebase Admin initialized for project', serviceAccount.project_id);

  return app;
};

const adminApp = initAdmin();

export const adminDb = admin.firestore();
adminDb.settings({ ignoreUndefinedProperties: true });
export const adminAuth = admin.auth();
export const adminFieldValue = admin.firestore.FieldValue;
export const adminTimestamp = admin.firestore.Timestamp;

export default adminApp;

