# 📚 DeChico Codebase Explanation

## 🎯 Project Overview

**DeChico** is a Chico State University-exclusive social application that combines:
- **Dating Features**: Tinder-like swipe system with matching
- **Global Chat**: Anonymous-ish real-time chat for all students
- **Ranking Polls**: Fun "brainrot" polls where students vote on campus-related questions
- **Leaderboard**: Daily rankings (planned feature)

The app is designed exclusively for students with `@csuchico.edu` email addresses, creating a closed community for the Chico State student body.

---

## 🏗️ Architecture & Tech Stack

### **Technology Stack:**

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, Vite, TypeScript, TailwindCSS |
| **Backend** | Node.js 18, Express, TypeScript |
| **Database** | Firebase Firestore (NoSQL) |
| **Authentication** | Firebase Auth (email/password) |
| **Email Service** | Nodemailer + Gmail OAuth2 |
| **Hosting** | Vercel (frontend), GCP Cloud Run (backend) |

### **Architecture Pattern:**
- **Monorepo**: Single repository with separate `backend/` and `frontend/` directories
- **RESTful API**: Backend exposes REST endpoints for all operations
- **Firebase Admin SDK**: Backend uses Firebase Admin for server-side database operations
- **Client SDK**: Frontend uses Firebase client SDK for authentication only
- **Service Layer**: Backend organized into service modules (auth, chat, dating, ranking, user)

---

## 📁 Project Structure

```
dechico/
├── backend/                    # Express API Server
│   ├── auth/                   # Authentication logic
│   │   ├── authController.ts   # Auth flow orchestration
│   │   ├── signupController.ts # Signup process
│   │   ├── loginController.ts  # Login process
│   │   └── emailVerification.ts # Email verification codes
│   ├── chat/                   # Chat features
│   │   └── globalChatService.ts # Global chat service
│   ├── config/                 # Configuration files
│   │   ├── firebaseAdmin.ts    # Firebase Admin initialization
│   │   └── .env                # Environment variables (not committed)
│   ├── Database/               # Database utilities
│   │   ├── firebaseConfig.ts   # Firebase config
│   │   └── databaseGateway.ts  # Database abstraction layer
│   ├── dating/                 # Dating features
│   │   ├── matchService.ts     # Match detection
│   │   ├── profileService.ts   # Profile retrieval for dating
│   │   └── swipeService.ts     # Swipe logic
│   ├── ranking/                # Ranking polls
│   │   └── rankPollService.ts  # Poll management & voting
│   ├── user/                   # User management
│   │   └── userService.ts      # Profile CRUD operations
│   ├── scripts/                # Utility scripts
│   │   ├── addTestProfiles.ts  # Seed test data
│   │   ├── deleteTestProfiles.ts
│   │   └── resetRankPolls.ts   # Reset polls
│   ├── server.ts               # Express server & routes
│   └── package.json            # Backend dependencies
│
└── frontend/                   # React SPA
    ├── src/
    │   ├── App.tsx             # Main application component
    │   ├── components/         # React components
    │   │   ├── AuthModalImproved.tsx # Authentication UI
    │   │   ├── RankingView.tsx      # Polls UI
    │   │   ├── MatchModal.tsx       # Match celebration
    │   │   └── SwipeCard.tsx        # Swipeable cards
    │   ├── config/
    │   │   └── firebase.ts     # Firebase client config
    │   ├── hooks/
    │   │   └── useAuth.ts      # Authentication hook
    │   ├── services/           # API client services
    │   │   ├── apiClient.ts    # HTTP client wrapper
    │   │   ├── authService.ts  # Auth API calls
    │   │   ├── chatService.ts  # Chat API calls
    │   │   ├── datingService.ts # Dating API calls
    │   │   └── userService.ts  # User API calls
    │   └── main.tsx            # Entry point
    └── package.json            # Frontend dependencies
```

---

## ✨ Key Features & Current Status

### ✅ **Completed Features:**

#### 1. **Authentication System**
- Email verification with `@csuchico.edu` domain validation
- Multi-step signup flow:
  1. Enter name & email
  2. Verify 6-digit code sent to email
  3. Set password
- Login/logout functionality
- Session persistence with Firebase Auth
- User profiles stored in Firestore

#### 2. **User Profile Management**
- Profile creation during onboarding
- Profile editing with photo uploads
- Fields: name, alias, age, bio, ethnicity, interests, gender, gender preference
- Photo gallery support (currently base64, Firebase Storage coming)
- Profile completion tracking

#### 3. **Global Chat** ✅
- Real-time chat for all authenticated users
- Messages stored in Firestore `global_chat` collection
- Frontend polls every 5 seconds for new messages
- Message limit enforcement (500 characters, rate limiting)
- Users post with aliases for privacy
- Email stored for moderation but not displayed

#### 4. **Ranking Polls (Brainrot)** ✅
- Fun polls about Chico State stereotypes and culture
- Users can vote once per poll
- Real-time vote percentages
- Default polls automatically seeded:
  - "Which Chico student stereotype is MOST delusional?"
  - "Which dorm has the CRAZIEST hookups?"
  - "Which 2AM food spot gives you WORST life decisions?"

### ⏳ **In Progress / Planned:**

#### 5. **Dating/Swipe System** (Backend complete, UI placeholder)
- Swipe left/right on profiles
- Match detection when both users swipe right
- 10-day cooldown before re-showing profiles
- Currently shows "Coming Soon" message

#### 6. **Leaderboard** (Partially implemented)
- UI exists but shows ranking polls instead of swipe leaderboard
- Backend structure ready for daily swipe tracking

#### 7. **Match Chat** (Planned)
- Private chat for matched users
- Chat history
- Real-time messaging

---

## 🔧 Backend Architecture

### **Server Entry Point** (`backend/server.ts`)
- Express server running on port 3001
- CORS configured for allowed origins
- JSON body parser with 25MB limit (for image uploads)
- Health check endpoint: `GET /api/health`

### **Authentication Flow:**
1. **Email Check** → `POST /api/auth/check-email`
   - Validates email domain
   - Checks if user exists

2. **Send Verification Code** → `POST /api/auth/send-verification-code`
   - Generates 6-digit code
   - Stores in Firestore with 15-minute expiration
   - Sends email via Nodemailer/Gmail

3. **Verify Code** → `POST /api/auth/verify-code`
   - Validates code against Firestore record

4. **Signup** → `POST /api/auth/signup`
   - Creates Firebase Auth user
   - Creates Firestore profile document

5. **Login** → `POST /api/auth/login`
   - Authenticates with Firebase Auth
   - Returns user data

### **Request Authentication:**
Currently uses headers (`x-user-id`, `x-user-email`) for authenticated requests. Planned upgrade to Firebase ID token verification.

### **Service Pattern:**
Each feature area has a service class/module:
- **UserService**: Profile CRUD operations
- **GlobalChatService**: Message sending/retrieval
- **RankPollService**: Poll management and voting
- **SwipeService**: Swipe recording and cooldown logic
- **MatchService**: Match detection and retrieval

### **Database Access:**
- All database operations use Firebase Admin SDK
- Service account JSON file required (not committed to git)
- Database operations abstracted through service layer

---

## 🎨 Frontend Architecture

### **Main App Component** (`frontend/src/App.tsx`)
- Single Page Application (SPA) with tab navigation
- Four main tabs: Dating, Leaderboard, Chat, Profile
- Responsive design: sidebar on desktop, bottom nav on mobile

### **State Management:**
- React hooks for local state
- `useAuth()` hook for authentication state
- Firebase Auth listener for session persistence
- Profile state synced from Firestore

### **Component Structure:**

#### **LandingPage**
- Video background
- Login/Signup buttons
- Shown when user is not authenticated

#### **Sidebar** (Desktop)
- Navigation tabs
- User profile card
- Logout button

#### **MobileNav** (Mobile)
- Bottom navigation bar
- Profile indicator arrow

#### **Tab Views:**
1. **DatingView**: Currently shows "Coming Soon" placeholder
2. **RankingView**: Displays voting polls with percentages
3. **ChatView**: Global chat interface with message list and input
4. **ProfileView**: Profile editing form with photo upload

### **API Communication:**
- Service layer in `src/services/` makes HTTP requests to backend
- `apiClient.ts` provides base URL configuration
- All requests include authentication headers
- Error handling with user-friendly messages

### **Image Handling:**
- Images compressed client-side before upload
- Max 800px width/height
- JPEG compression at 70% quality
- Currently stored as base64 in Firestore (Firebase Storage migration planned)

---

## 🗄️ Database Structure

### **Firestore Collections:**

#### 1. **`users`**
```typescript
{
  uid: string,              // Firebase Auth UID
  email: string,            // @csuchico.edu email
  firstName: string,
  lastName: string,
  alias: string,            // Display name for chat
  bio: string,
  age: string,
  ethnicity: string,
  interests: string,
  gender: string,
  genderPreference: string,
  avatarUrl: string,        // Base64 for now
  photos: string[],         // Gallery (base64)
  profileComplete: boolean,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### 2. **`email_verifications`**
```typescript
{
  email: string,
  code: string,             // 6-digit code
  createdAt: Timestamp,
  expiresAt: Timestamp      // 15 minutes
}
```

#### 3. **`global_chat`**
```typescript
{
  userId: string,
  email: string,            // For moderation (not shown in UI)
  alias: string,            // Shown to users
  message: string,          // Max 500 chars
  timestamp: Timestamp,
  createdAt: string         // ISO string
}
```

#### 4. **`rank_polls`**
```typescript
{
  question: string,
  options: [{
    id: string,
    label: string,
    votes: number
  }],
  createdAt: Timestamp
}
```

#### 5. **`rank_poll_votes`**
```typescript
{
  pollId: string,
  userId: string,
  optionId: string,
  createdAt: Timestamp
}
```

#### 6. **`swipes`** (Dating feature - ready)
```typescript
{
  swiperId: string,
  swipedId: string,
  direction: 'left' | 'right',
  timestamp: Timestamp,
  cooldownUntil: Timestamp  // 10 days
}
```

#### 7. **`matches`** (Dating feature - ready)
```typescript
{
  user1Id: string,
  user2Id: string,
  matchedAt: Timestamp,
  chatId: string
}
```

---

## 🔌 API Endpoints

### **Authentication:**
- `POST /api/auth/check-email` - Validate email and check if user exists
- `POST /api/auth/send-verification-code` - Send 6-digit code
- `POST /api/auth/verify-code` - Verify code
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login user

### **Profile:**
- `GET /api/profile/me` - Get current user's profile (requires auth)
- `PATCH /api/profile/me` - Update profile (requires auth)
- `POST /api/profile/me/photos` - Add photos to gallery (requires auth)
- `DELETE /api/profile/me` - Delete account (requires auth)

### **Chat:**
- `POST /api/chat/send` - Send message to global chat (requires auth)
- `GET /api/chat/messages` - Get recent messages (public)

### **Ranking Polls:**
- `GET /api/rank/polls` - Get all polls with percentages
- `POST /api/rank/vote` - Vote on a poll (requires auth)

### **Health Check:**
- `GET /api/health` - Server status

---

## 🚀 Development Status

### **Current Phase:** Feature Complete for MVP, Polish & Expansion

**Completed (~70%):**
- ✅ Authentication system
- ✅ User profiles
- ✅ Global chat
- ✅ Ranking polls
- ✅ Backend dating services (swipe, match, profile)

**In Progress:**
- ⏳ Dating UI (backend ready, frontend needs implementation)
- ⏳ Leaderboard transformation (polls → swipe leaderboard)
- ⏳ Firebase Storage integration for photos

**Planned:**
- ⏳ Match chat system
- ⏳ Real-time listeners (replace polling)
- ⏳ ID token authentication (replace header-based)
- ⏳ Admin panel for moderation

---

## 📊 Key Design Decisions

### **Why Firebase?**
- Rapid development with authentication + database + storage
- Real-time capabilities (though currently using polling)
- Generous free tier for student projects
- Easy deployment integration

### **Why Polling Instead of Real-time Listeners?**
- Simpler initial implementation
- Better for production cost control
- Frontend polling every 5 seconds is acceptable for chat
- Can upgrade to real-time listeners later

### **Why Base64 Images?**
- Quick MVP implementation
- No additional service configuration needed
- Works for small user base
- Migration to Firebase Storage planned

### **Why Email Stored Everywhere?**
- Moderation and accountability
- Support and debugging
- Security and abuse prevention
- Email never shown in UI (only alias)

### **Why Header-Based Auth?**
- Temporary solution for MVP
- Easier to implement quickly
- Planned migration to Firebase ID tokens
- Headers sufficient for current security needs

---

## 🔮 Future Roadmap

### **Short Term:**
1. Complete dating UI with swipeable cards
2. Implement daily leaderboard for swipes
3. Migrate photos to Firebase Storage
4. Upgrade to ID token authentication

### **Medium Term:**
1. Match chat system
2. Real-time Firestore listeners
3. Push notifications for matches/messages
4. Admin moderation panel

### **Long Term:**
1. Advanced matching algorithm
2. Interests-based filtering
3. Event/activity discovery
4. Campus news feed
5. Photo verification system

---

## 🛠️ Development Workflow

### **Local Setup:**

#### Backend:
```bash
cd backend
npm install
# Configure backend/config/.env with Firebase service account
npm run dev  # Runs on http://localhost:3001
```

#### Frontend:
```bash
cd frontend
npm install
# Configure frontend/.env with Firebase config
npm run dev  # Runs on http://localhost:5173
```

### **Utility Scripts:**
```bash
npm run add-test-profiles      # Seed test user profiles
npm run delete-test-profiles   # Remove test profiles
npm run reset-rank-polls       # Reset poll votes
```

### **Testing:**
- Manual testing through UI
- Backend test files in `backend/tests/`
- Firebase emulator support available

---

## 📝 Code Quality & Patterns

### **TypeScript:**
- Full TypeScript implementation
- Type-safe API interfaces
- Strong typing in services

### **Error Handling:**
- Try-catch blocks in all async operations
- User-friendly error messages
- Console logging for debugging

### **Code Organization:**
- Service layer pattern
- Separation of concerns
- Reusable utility functions
- Consistent naming conventions

### **Documentation:**
- Inline comments for complex logic
- README files in key directories
- Progress tracking in STATUS.md and PROGRESS.md

---

## 🎯 Production Deployment

### **Frontend (Vercel):**
- URL: https://dechico-life-skfv.vercel.app/
- Automatic deployments on git push
- Environment variables configured in Vercel dashboard

### **Backend (GCP Cloud Run):**
- URL: https://dechico-backend-772774227494.us-central1.run.app/api
- Docker container deployment
- Environment variables and secrets in GCP

### **Environment Variables Required:**

**Backend:**
- `EMAIL_USER`, `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN`
- `FIREBASE_SERVICE_ACCOUNT_PATH`
- `CORS_ORIGIN`
- `PORT`

**Frontend:**
- `VITE_API_BASE_URL`
- `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, etc.

---

## 🎓 Summary

**DeChico** is a well-structured, modern full-stack application built with:
- **Solid architecture** separating frontend, backend, and database
- **Type-safe codebase** using TypeScript throughout
- **Scalable patterns** ready for growth
- **Production-ready** features with deployment infrastructure
- **Clear roadmap** for future enhancements

The codebase demonstrates best practices in:
- Service layer architecture
- RESTful API design
- React component organization
- Firebase integration
- Error handling and user experience

**Status:** MVP complete with core features working. Ready for expansion into dating UI and advanced features.

