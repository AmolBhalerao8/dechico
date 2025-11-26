# DeChico Authentication Flow Documentation

## Overview

The authentication system is built with a modular, systematic approach where each feature has its own dedicated file.

## File Structure

```
Backend/
├── authController.ts       # Main auth logic - determines signup vs login
├── signupController.ts     # New user registration flow
├── loginController.ts      # Existing user login flow
├── userService.ts          # User database operations
├── emailVerification.ts    # Email verification (CSU Chico only)
└── Database/
    ├── databaseGateway.ts  # Firebase Auth helpers
    └── firebaseConfig.ts   # Firebase configuration
```

## Authentication Flow

### 1. Initial Check (Landing Page)

When a user enters their email on the landing page:

```typescript
import { AuthController } from './Backend';

const result = await AuthController.initiateAuth(email);

if (result.action === 'invalid_email') {
  // Show error: Only @csuchico.edu allowed
}

if (result.action === 'signup') {
  // Redirect to signup page
}

if (result.action === 'login') {
  // Redirect to login page
}
```

**What it does:**
- Validates email is @csuchico.edu
- Checks if user exists in database
- Returns appropriate action

---

### 2A. Signup Flow (New Users)

#### Step 1: Send Verification Code

```typescript
import { SignupController } from './Backend';

const result = await SignupController.sendVerificationCode(email);

if (result.success) {
  // Show "Check your email" message
  // Display code input field
}
```

**What it does:**
- Validates @csuchico.edu domain
- Checks user doesn't already exist
- Generates 6-digit code
- Stores in Firestore (expires in 15 min)
- Sends email via Gmail OAuth2

#### Step 2: Verify Code

```typescript
const result = await SignupController.verifyEmailCode(email, code);

if (result.verified) {
  // Show password input field
}
```

**What it does:**
- Checks code matches
- Checks code hasn't expired
- Marks email as verified in Firestore

#### Step 3: Create Account

```typescript
const result = await SignupController.createAccount(email, password);

if (result.success) {
  // Redirect to profile setup or home
  console.log('User ID:', result.user.uid);
}
```

**What it does:**
- Verifies email is verified
- Creates Firebase Auth account
- Creates user profile in Firestore
- Deletes verification record
- Returns user data

---

### 2B. Login Flow (Existing Users)

```typescript
import { LoginController } from './Backend';

const result = await LoginController.loginUser(email, password);

if (result.success) {
  // Redirect to home/profile
  console.log('User:', result.user);
  
  if (!result.user.profileComplete) {
    // Redirect to profile setup
  }
}
```

**What it does:**
- Authenticates with Firebase Auth
- Gets user profile from Firestore
- Updates last login timestamp
- Returns user data with profile status

---

## User Profile Structure

```typescript
interface UserProfile {
  uid: string;
  email: string;
  createdAt: string;
  lastLogin: string;
  profileComplete: boolean;
  
  // Optional fields for dating app
  name?: string;
  age?: number;
  bio?: string;
  interests?: string[];
  photos?: string[];
}
```

---

## API Reference

### AuthController

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `initiateAuth(email)` | `email: string` | `{ success, action, message }` | Determines if user should signup or login |
| `checkUserStatus(email)` | `email: string` | `AuthCheckResult` | Checks if user exists and validates email |

### SignupController

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `sendVerificationCode(email)` | `email: string` | `SignupStep1Result` | Sends verification code to email |
| `verifyEmailCode(email, code)` | `email, code: string` | `SignupStep2Result` | Verifies the code entered by user |
| `createAccount(email, password)` | `email, password: string` | `SignupStep3Result` | Creates user account (only if verified) |
| `completeSignup(email, code, password)` | `email, code, password: string` | `SignupStep3Result` | All-in-one signup function |

### LoginController

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `loginUser(email, password)` | `email, password: string` | `LoginResult` | Logs in existing user |
| `canUserLogin(email)` | `email: string` | `boolean` | Checks if user can login |

### UserService

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `userExistsByEmail(email)` | `email: string` | `Promise<boolean>` | Check if user exists |
| `getUserProfile(uid)` | `uid: string` | `Promise<UserProfile \| null>` | Get user profile |
| `createUserProfile(uid, email, data?)` | `uid, email: string, data?: Partial<UserProfile>` | `Promise<UserProfile>` | Create new profile |
| `updateLastLogin(uid)` | `uid: string` | `Promise<void>` | Update login timestamp |
| `updateUserProfile(uid, updates)` | `uid: string, updates: Partial<UserProfile>` | `Promise<void>` | Update profile |

### EmailVerification

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `validateCsuChicoEmail(email)` | `email: string` | `boolean` | Validates @csuchico.edu domain |
| `sendVerificationCode(email)` | `email: string` | `Promise<string>` | Sends code and returns it |
| `verifyCode(email, code)` | `email, code: string` | `Promise<boolean>` | Verifies code |
| `isEmailVerified(email)` | `email: string` | `Promise<boolean>` | Checks verification status |
| `createVerifiedUser(email, password)` | `email, password: string` | `Promise<UserCredential>` | Creates account if verified |

---

## Security Features

✅ **Email Validation** - Only @csuchico.edu emails  
✅ **Code Expiration** - 15-minute validity  
✅ **Rate Limiting** - Max 5 verification attempts  
✅ **Duplicate Prevention** - Can't signup with existing email  
✅ **Verification Required** - Must verify email before account creation  
✅ **Firebase Auth** - Secure password storage  
✅ **Firestore Rules** - Database access control  

---

## Error Handling

All functions return structured responses with:
- `success: boolean` - Operation status
- `message: string` - User-friendly message
- Additional data when successful

Example error messages:
- "Only @csuchico.edu email addresses are allowed."
- "An account with this email already exists. Please login instead."
- "Verification code has expired. Please request a new one."
- "Invalid verification code. Please try again."
- "Incorrect password. Please try again."

---

## Testing

Run the complete auth flow test:

```bash
cd Backend
npx tsx test-auth-flow.ts
```

This will:
1. Check if user exists
2. Determine signup vs login
3. Test invalid email rejection
4. Guide you through manual testing of signup/login

---

## Next Steps

- [ ] Build frontend UI for auth flows
- [ ] Add profile setup page
- [ ] Implement password reset
- [ ] Add social login (optional)
- [ ] Build matchmaking algorithm (later)
- [ ] Add user preferences
- [ ] Implement chat system (later)

---

## Notes

- Gmail OAuth2 has a limit of ~500 emails/day
- For production, consider switching to SendGrid or AWS SES
- Firestore rules are currently in test mode - secure before launch
- User profiles are stored in `users` collection
- Verification codes are stored in `email_verifications` collection
