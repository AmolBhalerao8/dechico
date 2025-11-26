# 🗺️ DeChico Development Roadmap

## **✅ Phase 1: Authentication (COMPLETED)**

### **What's Done:**
- ✅ Backend API server with Express
- ✅ Email verification with @csuchico.edu validation
- ✅ Step-by-step signup flow
- ✅ Login functionality
- ✅ Logout functionality
- ✅ Firebase Auth integration
- ✅ User profile storage in Firestore
- ✅ Profile loading on login

---

## **📋 Phase 2: Global Chat (Real-time)**

### **Goal:** Anonymous global chat where all Chico State students can talk

### **Backend Tasks:**
1. **Create Chat Service** (`Backend/chat/globalChatService.ts`)
   - Send message to global chat
   - Get recent messages (last 50)
   - Real-time listener setup
   - Anonymous user handling

2. **Firestore Collection:**
   ```typescript
   global_chat/
     └── {messageId}
         ├── userId: string
         ├── alias: string          // Anonymous display name
         ├── message: string
         ├── timestamp: Timestamp
         └── createdAt: Date
   ```

3. **API Endpoints:**
   - `POST /api/chat/send` - Send message
   - `GET /api/chat/messages` - Get recent messages

### **Frontend Tasks:**
1. **Update ChatView Component**
   - Connect to Firestore real-time listener
   - Display messages with timestamps
   - Send messages to backend
   - Auto-scroll to latest message

2. **Features:**
   - Real-time message updates
   - Show user's alias
   - Timestamp for each message
   - Message input with send button

### **Estimated Time:** 2-3 hours

---

## **📋 Phase 3: Dating/Swipe System**

### **Goal:** Tinder-like swipe system with matching logic

### **Backend Tasks:**

#### **1. Swipe Service** (`Backend/dating/swipeService.ts`)
- Record swipe (left/right)
- Check if already swiped
- Implement 10-day cooldown logic
- Get profiles for swiping (exclude already swiped)

#### **2. Match Service** (`Backend/dating/matchService.ts`)
- Detect matches (both right swiped)
- Create match record
- Get user's matches

#### **3. Profile Service** (`Backend/dating/profileService.ts`)
- Get swipeable profiles
- Filter logic:
  - Not current user
  - Not already swiped (or cooldown expired)
  - Has photos
  - Profile complete

#### **4. Firestore Collections:**
```typescript
swipes/
  └── {swipeId}
      ├── swiperId: string        // Who swiped
      ├── swipedId: string         // Who was swiped
      ├── direction: 'left' | 'right'
      ├── timestamp: Timestamp
      └── cooldownUntil: Timestamp // For 10-day logic

matches/
  └── {matchId}
      ├── user1Id: string
      ├── user2Id: string
      ├── matchedAt: Timestamp
      └── chatId: string           // Reference to chat
```

#### **5. API Endpoints:**
- `GET /api/dating/profiles` - Get profiles to swipe
- `POST /api/dating/swipe` - Record a swipe
- `GET /api/dating/matches` - Get user's matches

### **Frontend Tasks:**

#### **1. Create Swipeable Card Component**
- Display profile photo
- Show name, age, bio
- Swipe gestures (left/right)
- Buttons for like/pass

#### **2. Update DatingView**
- Load profiles from backend
- Handle swipe actions
- Show "It's a Match!" modal
- Navigate to next profile

#### **3. Match Modal**
- Celebrate match
- Show matched user's profile
- "Send Message" button

### **Estimated Time:** 6-8 hours

---

## **📋 Phase 4: Leaderboard System**

### **Goal:** Show top 3 most right-swiped users daily

### **Backend Tasks:**

#### **1. Leaderboard Service** (`Backend/leaderboard/leaderboardService.ts`)
- Track daily right swipes per user
- Get top 3 users for today
- Reset daily (midnight)
- Optional: Separate by gender

#### **2. Firestore Collection:**
```typescript
daily_leaderboard/
  └── {date}              // Format: YYYY-MM-DD
      ├── date: Timestamp
      └── users: [{
          userId: string,
          rightSwipesReceived: number,
          gender: string,
          name: string,
          photoUrl: string
      }]
```

#### **3. API Endpoints:**
- `GET /api/leaderboard/today` - Get today's top 3
- `POST /api/leaderboard/update` - Update swipe count (called after swipe)

### **Frontend Tasks:**

#### **1. Update LeaderboardView**
- Remove current "brainrot" voting
- Show top 3 users
- Display profile pictures
- Show swipe count
- Daily reset indicator

#### **2. Features:**
- Podium display (1st, 2nd, 3rd)
- User profile preview
- Swipe count badge
- "Updated X hours ago" timestamp

### **Estimated Time:** 3-4 hours

---

## **📋 Phase 5: Match Chat (Personal)**

### **Goal:** Private chat for matched users

### **Backend Tasks:**

#### **1. Match Chat Service** (`Backend/chat/matchChatService.ts`)
- Create chat for match
- Send message to match
- Get chat history
- Real-time listener

#### **2. Firestore Collection:**
```typescript
match_chats/
  └── {chatId}
      ├── matchId: string
      ├── participants: [userId1, userId2]
      ├── createdAt: Timestamp
      └── messages: [{
          senderId: string,
          message: string,
          timestamp: Timestamp,
          read: boolean
      }]
```

#### **3. API Endpoints:**
- `GET /api/chat/matches` - Get all match chats
- `POST /api/chat/match/send` - Send message to match
- `GET /api/chat/match/:chatId` - Get chat history

### **Frontend Tasks:**

#### **1. Create Match List View**
- Show all matches
- Display last message
- Unread indicator
- Click to open chat

#### **2. Create Match Chat View**
- Full-screen chat interface
- Message bubbles (sent/received)
- Real-time updates
- Send message input

### **Estimated Time:** 4-5 hours

---

## **📋 Phase 6: Photo Upload (Firebase Storage)**

### **Goal:** Store photos in Firebase Storage instead of base64

### **Backend Tasks:**
1. **Storage Service** (`Backend/storage/photoService.ts`)
   - Upload photo to Firebase Storage
   - Get photo URL
   - Delete photo

### **Frontend Tasks:**
1. **Update Photo Upload**
   - Upload to Firebase Storage
   - Show upload progress
   - Store URL in Firestore

### **Estimated Time:** 2-3 hours

---

## **📋 Phase 7: Polish & Features**

### **Additional Features:**

1. **Profile Editing**
   - Edit all profile fields
   - Add/remove photos
   - Save changes

2. **Notifications**
   - New match notification
   - New message notification
   - Badge counts

3. **Settings**
   - Change password
   - Delete account
   - Privacy settings

4. **Admin Panel** (Optional)
   - View all users
   - Moderate content
   - Ban users

### **Estimated Time:** 4-6 hours

---

## **🎯 Total Estimated Time:**

- **Phase 2 (Global Chat):** 2-3 hours
- **Phase 3 (Dating/Swipe):** 6-8 hours
- **Phase 4 (Leaderboard):** 3-4 hours
- **Phase 5 (Match Chat):** 4-5 hours
- **Phase 6 (Photo Storage):** 2-3 hours
- **Phase 7 (Polish):** 4-6 hours

**Total:** ~21-29 hours of development

---

## **📊 Development Order (Recommended):**

### **Session 1: Global Chat** (2-3 hours)
- Quick win
- Users can start chatting
- Tests real-time functionality

### **Session 2: Dating Backend** (4 hours)
- Swipe service
- Match service
- Profile service

### **Session 3: Dating Frontend** (4 hours)
- Swipeable cards
- Match detection
- UI polish

### **Session 4: Leaderboard** (3-4 hours)
- Backend tracking
- Frontend display
- Daily reset

### **Session 5: Match Chat** (4-5 hours)
- Private messaging
- Chat UI
- Real-time sync

### **Session 6: Photo Storage** (2-3 hours)
- Firebase Storage integration
- Upload progress
- URL management

### **Session 7: Polish** (4-6 hours)
- Bug fixes
- UI improvements
- Testing

---

## **🚀 Next Steps:**

**Ready to start Phase 2: Global Chat?**

This is the easiest next feature and will:
- ✅ Test Firestore real-time listeners
- ✅ Give users something to do immediately
- ✅ Build momentum for bigger features

**Let me know when you're ready to start!** 🎉
