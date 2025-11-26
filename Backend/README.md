# DeChico Backend

Backend services for the DeChico dating app - CSU Chico students only.

## Features

✅ **CSU Chico Email Verification** - Only @csuchico.edu emails allowed  
✅ **Firebase Authentication** - Secure user management  
✅ **Email Verification Codes** - 6-digit codes sent via Gmail  
✅ **Firestore Integration** - Verification data storage  

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Email Service
1. Open `Backend/.env`
2. Add your Gmail credentials (see `SETUP.md` for detailed instructions)

### 3. Enable Firestore
- Go to Firebase Console → Firestore Database → Create Database

### 4. Use in Your App
```typescript
import { EmailVerification, DatabaseGateway } from './Backend';

// Send verification code
await EmailVerification.sendVerificationCode('student@csuchico.edu');

// Verify code
await EmailVerification.verifyCode('student@csuchico.edu', '123456');

// Create verified account
await EmailVerification.createVerifiedUser('student@csuchico.edu', 'password');
```

## Project Structure

```
Backend/
├── index.ts                    # Main entry point
├── emailVerification.ts        # CSU Chico email verification
├── .env                        # Environment variables (Gmail credentials)
├── env.example                 # Template for .env
├── package.json                # Dependencies
├── SETUP.md                    # Detailed setup guide
└── Database/
    ├── firebaseConfig.ts       # Firebase configuration
    ├── databaseGateway.ts      # Auth helpers
    └── README.md               # Database module docs
```

## Documentation

- **[SETUP.md](./SETUP.md)** - Complete setup instructions
- **[Database/README.md](./Database/README.md)** - Database module documentation

## Email Verification Flow

```
1. User enters email → validateCsuChicoEmail()
2. System sends code → sendVerificationCode()
3. User enters code → verifyCode()
4. System creates account → createVerifiedUser()
```

## Security

- Only @csuchico.edu emails accepted
- Verification codes expire in 15 minutes
- Maximum 5 attempts per email
- Automatic cleanup after account creation

## Dependencies

- `firebase` - Authentication & Firestore
- `nodemailer` - Email sending (Gmail)
- `dotenv` - Environment variables
- `@types/node` - TypeScript support
- `@types/nodemailer` - TypeScript support

## Environment Variables

Required in `.env`:
- `EMAIL_USER` - Gmail address for sending emails
- `EMAIL_APP_PASSWORD` - Gmail app password

## Support

See `SETUP.md` for troubleshooting and detailed documentation.
