/**
 * DeChico Backend - Main Entry Point
 * 
 * This file initializes the backend services and loads environment variables.
 */

// Load environment variables FIRST
import dotenv from 'dotenv';
dotenv.config();

// Import modules
import { EmailVerification } from './emailVerification';
import { DatabaseGateway } from './Database/databaseGateway';

// Verify environment variables are loaded
if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
  console.warn('⚠️  Warning: Email credentials not configured in .env file');
  console.warn('   Email verification will not work until you set up:');
  console.warn('   - EMAIL_USER');
  console.warn('   - EMAIL_APP_PASSWORD');
  console.warn('   See Backend/SETUP.md for instructions');
}

// Export all modules for use in your app
export { EmailVerification, DatabaseGateway };
export { AuthController } from './authController';
export { SignupController } from './signupController';
export { LoginController } from './loginController';
export { UserService } from './userService';

console.log('✅ DeChico Backend initialized');
