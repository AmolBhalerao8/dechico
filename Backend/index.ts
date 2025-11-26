/**
 * DeChico Backend - Main Entry Point
 * 
 * This file initializes the backend services and loads environment variables.
 */

// Load environment variables FIRST
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, 'config', '.env') });

// Import modules
import { EmailVerification } from './auth/emailVerification';
import { DatabaseGateway } from './Database/databaseGateway';

// Verify environment variables are loaded
if (!process.env.EMAIL_USER || !process.env.GMAIL_CLIENT_ID) {
  console.warn('⚠️  Warning: Email credentials not configured in .env file');
  console.warn('   Email verification will not work until you set up:');
  console.warn('   - EMAIL_USER');
  console.warn('   - GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN');
  console.warn('   See Backend/docs/SETUP.md for instructions');
}

// Export all modules for use in your app
export { EmailVerification, DatabaseGateway };
export { AuthController } from './auth/authController';
export { SignupController } from './auth/signupController';
export { LoginController } from './auth/loginController';
export { UserService } from './user/userService';

console.log('✅ DeChico Backend initialized');
