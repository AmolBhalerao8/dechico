# DeChico Backend Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
cd Backend
npm install
```

### 2. Configure Gmail OAuth2 for Email Verification

We use OAuth2 for secure Gmail authentication. Follow these steps carefully:

#### Step 1: Create Google Cloud Project

1. **Go to Google Cloud Console**
   - Visit https://console.cloud.google.com/
   - Sign in with your Gmail account (dechico.official@gmail.com)

2. **Create a New Project**
   - Click "Select a project" at the top
   - Click "NEW PROJECT"
   - Project name: `DeChico`
   - Click "CREATE"

#### Step 2: Enable Gmail API

1. **Enable the API**
   - In your project, go to "APIs & Services" > "Library"
   - Search for "Gmail API"
   - Click on it and click "ENABLE"

#### Step 3: Configure OAuth Consent Screen

1. **Set up OAuth consent**
   - Go to "APIs & Services" > "OAuth consent screen"
   - Select "External" (unless you have Google Workspace)
   - Click "CREATE"

2. **Fill in App Information**
   - App name: `DeChico Dating App`
   - User support email: `dechico.official@gmail.com`
   - Developer contact: `dechico.official@gmail.com`
   - Click "SAVE AND CONTINUE"

3. **Scopes** (click "ADD OR REMOVE SCOPES")
   - Search and add: `https://mail.google.com/`
   - Click "UPDATE" then "SAVE AND CONTINUE"

4. **Test users**
   - Click "ADD USERS"
   - Add: `dechico.official@gmail.com`
   - Click "SAVE AND CONTINUE"

#### Step 4: Create OAuth2 Credentials

1. **Create Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "CREATE CREDENTIALS" > "OAuth client ID"
   - Application type: "Web application"
   - Name: `DeChico Email Service`
   
2. **Add Authorized Redirect URIs**
   - Click "ADD URI"
   - Add: `https://developers.google.com/oauthplayground`
   - Click "CREATE"

3. **Save Your Credentials**
   - Copy the **Client ID** (looks like: `xxxxx.apps.googleusercontent.com`)
   - Copy the **Client Secret**
   - Click "OK"

#### Step 5: Generate Refresh Token

1. **Go to OAuth Playground**
   - Visit https://developers.google.com/oauthplayground

2. **Configure OAuth Playground**
   - Click the gear icon (⚙️) in the top right
   - Check "Use your own OAuth credentials"
   - Paste your **Client ID**
   - Paste your **Client Secret**
   - Close the settings

3. **Authorize Gmail API**
   - In the left panel, scroll to "Gmail API v1"
   - Select `https://mail.google.com/`
   - Click "Authorize APIs"
   - Sign in with `dechico.official@gmail.com`
   - Click "Allow" (you may see a warning - click "Continue")

4. **Get Refresh Token**
   - Click "Exchange authorization code for tokens"
   - Copy the **Refresh token** (long string)

#### Step 6: Update .env File

Open `Backend/.env` and fill in all the values:

```env
EMAIL_USER=dechico.official@gmail.com
GMAIL_CLIENT_ID=your-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your-client-secret
GMAIL_REFRESH_TOKEN=your-refresh-token
```

### 3. Test the Email Verification

Create a test file `Backend/test.ts`:

```typescript
import dotenv from 'dotenv';
dotenv.config();

import { EmailVerification } from './emailVerification';

async function test() {
  try {
    // Test 1: Validate email domain
    console.log('Testing email validation...');
    const isValid = EmailVerification.validateCsuChicoEmail('student@csuchico.edu');
    console.log('✓ CSU Chico email valid:', isValid);

    // Test 2: Send verification code
    console.log('\nSending verification code...');
    const code = await EmailVerification.sendVerificationCode('student@csuchico.edu');
    console.log('✓ Verification code sent:', code);

    // Test 3: Verify code
    console.log('\nVerifying code...');
    await EmailVerification.verifyCode('student@csuchico.edu', code);
    console.log('✓ Code verified successfully');

    // Test 4: Create verified user
    console.log('\nCreating verified user...');
    const user = await EmailVerification.createVerifiedUser(
      'student@csuchico.edu',
      'TestPassword123!'
    );
    console.log('✓ User created:', user.user.uid);

    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

test();
```

Run the test:
```bash
npx ts-node test.ts
```

## Usage in Your App

### Initialize dotenv at the top of your main file:

```typescript
import dotenv from 'dotenv';
dotenv.config();

// Rest of your imports...
import { EmailVerification } from './emailVerification';
```

### Registration Flow Example:

```typescript
// Step 1: User enters email
app.post('/api/send-verification', async (req, res) => {
  try {
    const { email } = req.body;
    await EmailVerification.sendVerificationCode(email);
    res.json({ success: true, message: 'Verification code sent' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Step 2: User enters code
app.post('/api/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body;
    await EmailVerification.verifyCode(email, code);
    res.json({ success: true, message: 'Email verified' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Step 3: Create account
app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const userCredential = await EmailVerification.createVerifiedUser(email, password);
    res.json({ 
      success: true, 
      userId: userCredential.user.uid 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

## Available Functions

| Function | Description | Parameters | Returns |
|----------|-------------|------------|---------|
| `validateCsuChicoEmail(email)` | Checks if email is @csuchico.edu | `email: string` | `boolean` |
| `sendVerificationCode(email)` | Sends 6-digit code to email | `email: string` | `Promise<string>` |
| `verifyCode(email, code)` | Validates verification code | `email: string, code: string` | `Promise<boolean>` |
| `isEmailVerified(email)` | Checks if email is verified | `email: string` | `Promise<boolean>` |
| `createVerifiedUser(email, password)` | Creates account if verified | `email: string, password: string` | `Promise<UserCredential>` |
| `deleteVerificationRecord(email)` | Removes verification data | `email: string` | `Promise<void>` |

## Security Features

- ✅ Only @csuchico.edu emails accepted
- ✅ Verification codes expire in 15 minutes
- ✅ Maximum 5 verification attempts per email
- ✅ Codes stored securely in Firestore
- ✅ Automatic cleanup after account creation

## Troubleshooting

### "Email credentials not configured"
- Make sure `.env` file exists in `Backend/` folder
- Verify `EMAIL_USER` and `EMAIL_APP_PASSWORD` are set
- Make sure you're calling `dotenv.config()` before using EmailVerification

### "Invalid email domain"
- Email must end with @csuchico.edu
- Check for typos in the email address

### "Verification code has expired"
- Codes expire after 15 minutes
- Request a new code with `sendVerificationCode()`

### "Maximum verification attempts reached"
- User has requested too many codes
- Use `deleteVerificationRecord(email)` to reset
- Or wait and try again later

## Firebase Setup

Make sure Firestore is enabled in your Firebase project:
1. Go to Firebase Console
2. Select your project (dechico-7b466)
3. Click "Firestore Database"
4. Click "Create database"
5. Choose "Start in test mode" for development
6. Select a location (us-central recommended)

## Next Steps

- [ ] Install dependencies (`npm install`)
- [ ] Configure Gmail credentials in `.env`
- [ ] Enable Firestore in Firebase Console
- [ ] Test email verification flow
- [ ] Integrate with your frontend
- [ ] Set up proper Firestore security rules for production

## Support

For issues or questions, check:
- Firebase Auth docs: https://firebase.google.com/docs/auth
- Nodemailer docs: https://nodemailer.com/
- Firestore docs: https://firebase.google.com/docs/firestore
