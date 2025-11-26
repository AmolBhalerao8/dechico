/**
 * Test Authentication Flow
 * Tests the complete auth system: check user -> signup/login
 */

import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '..', 'config', '.env') });

import { AuthController } from '../auth/authController';
import { SignupController } from '../auth/signupController';
import { LoginController } from '../auth/loginController';

async function testAuthFlow() {
  console.log('=== DeChico Authentication Flow Test ===\n');
  
  const testEmail = 'asbhalerao@csuchico.edu';
  const testPassword = 'TestPassword123!';
  
  try {
    // ========================================
    // Test 1: Check User Status
    // ========================================
    console.log('Test 1: Checking user status...');
    const authCheck = await AuthController.initiateAuth(testEmail);
    console.log('✓ Auth check result:', authCheck);
    console.log('  Action:', authCheck.action);
    console.log('  Message:', authCheck.message);
    console.log('');
    
    // ========================================
    // Test 2: Invalid Email
    // ========================================
    console.log('Test 2: Testing invalid email...');
    const invalidCheck = await AuthController.initiateAuth('test@gmail.com');
    console.log('✓ Invalid email result:', invalidCheck.action);
    console.log('  Message:', invalidCheck.message);
    console.log('');
    
    // ========================================
    // Test 3: Signup Flow (if new user)
    // ========================================
    if (authCheck.action === 'signup') {
      console.log('Test 3: New user - Testing signup flow...');
      
      // Step 1: Send verification code
      console.log('  Step 1: Sending verification code...');
      const sendCodeResult = await SignupController.sendVerificationCode(testEmail);
      console.log('  ✓ Code sent:', sendCodeResult.success);
      console.log('    Message:', sendCodeResult.message);
      
      if (sendCodeResult.success) {
        console.log('\n  ⚠️  Check your email for the verification code');
        console.log('  Then manually test Step 2 & 3 with the code you received:');
        console.log('');
        console.log('  // Step 2: Verify code');
        console.log(`  const verifyResult = await SignupController.verifyEmailCode('${testEmail}', 'YOUR_CODE');`);
        console.log('');
        console.log('  // Step 3: Create account');
        console.log(`  const createResult = await SignupController.createAccount('${testEmail}', '${testPassword}');`);
      }
      console.log('');
    }
    
    // ========================================
    // Test 4: Login Flow (if existing user)
    // ========================================
    if (authCheck.action === 'login') {
      console.log('Test 4: Existing user - Testing login flow...');
      console.log('  Note: This will fail if you haven\'t set a password yet');
      console.log('  Attempting login...');
      
      const loginResult = await LoginController.loginUser(testEmail, testPassword);
      console.log('  ✓ Login result:', loginResult.success);
      console.log('    Message:', loginResult.message);
      
      if (loginResult.success && loginResult.user) {
        console.log('    User ID:', loginResult.user.uid);
        console.log('    Email:', loginResult.user.email);
        console.log('    Profile Complete:', loginResult.user.profileComplete);
      }
      console.log('');
    }
    
    console.log('=== Test Complete ===\n');
    console.log('Summary:');
    console.log(`- Email: ${testEmail}`);
    console.log(`- Status: ${authCheck.action === 'signup' ? 'New User' : 'Existing User'}`);
    console.log(`- Next Step: ${authCheck.action === 'signup' ? 'Complete signup with verification code' : 'Login with password'}`);
    
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.error('Full error:', error);
  }
}

testAuthFlow();
