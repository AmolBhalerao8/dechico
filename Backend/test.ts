import dotenv from 'dotenv';
dotenv.config();

import { EmailVerification } from './emailVerification';

async function test() {
  try {
    console.log('=== DeChico Email Verification Test ===\n');

    // Test 1: Validate email domain
    console.log('Test 1: Validating CSU Chico email domain...');
    const validEmail = EmailVerification.validateCsuChicoEmail('student@csuchico.edu');
    const invalidEmail = EmailVerification.validateCsuChicoEmail('student@gmail.com');
    console.log('✓ student@csuchico.edu is valid:', validEmail);
    console.log('✓ student@gmail.com is valid:', invalidEmail);
    console.log('');

    // Test 2: Send verification code
    console.log('Test 2: Sending verification code...');
    console.log('Enter a CSU Chico email to test (or press Enter to skip):');
    
    // Testing with CSU Chico email
    const testEmail = 'asbhalerao@csuchico.edu';
    
    console.log(`Sending verification code to: ${testEmail}`);
    console.log('This will send a real email...\n');
    
    const code = await EmailVerification.sendVerificationCode(testEmail);
    console.log('✓ Verification code sent successfully!');
    console.log('Code (for testing):', code);
    console.log('Check your email inbox at:', testEmail);
    console.log('\n⚠️  Note: In production, do NOT return the code - users should get it from email only\n');
    
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.error('\nFull error:', error);
  }
}

test();
