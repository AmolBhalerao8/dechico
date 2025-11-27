# 📊 DeChico App - Complete Analysis

## **Current Frontend (App.tsx) - What Exists**

### **✅ Features Already Built:**

#### **1. Authentication System (UI Only)**
- ✅ Landing page with video
- ✅ Login/Signup modal
- ✅ Email input with @csuchico.edu validation (UI only)
- ✅ Verification code input (fake/demo code generation)
- ✅ Password input
- ❌ **NOT connected to Backend** - uses `handleFakeAuth()`

#### **2. User Profile**
- ✅ Profile form with fields:
  - First name, Last name, Alias
  - Age, Ethnicity, Bio, Interests
  - Avatar upload (local file reader)
  - Gallery upload (multiple photos)
- ✅ Profile completion check (requires at least 1 photo)
- ✅ Onboarding modal for new users
- ❌ **NOT saved to database** - only in local state

#### **3. Global Chat**
- ✅ Chat UI with message display
- ✅ Send message functionality
- ✅ Shows user's alias/name
- ✅ Timestamp display
- ✅ Seed messages (3 demo messages)
- ❌ **NOT connected to Firestore** - only local state
- ❌ **NOT real-time** - no sync between users

#### **4. Leaderboard**
- ✅ Leaderboard UI with voting
- ✅ Vote counter (local state)
- ✅ 5 hardcoded items about "Chico brainrot"
- ❌ **NOT the dating leaderboard** you described
- ❌ **NOT connected to database** - votes reset on refresh

#### **5. Dating View**
- ✅ Placeholder UI saying "Real matchmaking starts after Thanksgiving"
- ✅ Profile completion check
- ❌ **NO swipe functionality**
- ❌ **NO profile rotation**
- ❌ **NO matching logic**
- ❌ **Completely not implemented**

---

## **🎯 What You Need vs What Exists**

### **Your Requirements:**

#### **A. Global Chat (Anonymous)**
**Status:** ✅ **70% Complete**
- ✅ UI exists
- ✅ Message sending works
- ❌ Need: Real-time Firestore sync
- ❌ Need: Anonymous user handling
- ❌ Need: Message persistence

#### **B. Dating (Swipe System)**
**Status:** ❌ **0% Complete**
- ❌ No swipe UI
- ❌ No profile cards
- ❌ No swipe logic (left/right)
- ❌ No match detection
- ❌ No 10-day cooldown logic
- ❌ No personal chat for matches
- **Everything needs to be built**

#### **C. Leaderboard (Most Swiped)**
**Status:** ❌ **Wrong Implementation**
- Current: Voting on "Chico brainrot" items
- Need: Top 3 most right-swiped users (daily)
- Need: Separate boys/girls or combined
- Need: Daily reset
- **Needs complete rebuild**

---

## **🔧 What Needs to Be Built**

### **Backend Requirements:**

#### **1. User Profile Service** ✅ **EXISTS**
- Already have `userService.ts`
- Need to add fields:
  - `gender` (for leaderboard filtering)
  - `photos[]` (array of photo URLs)
  - `swipeStats` (right swipes received count)
  - `lastSwipeReset` (for daily leaderboard)

#### **2. Dating/Swipe Service** ❌ **NEW**
Create: `Backend/dating/swipeService.ts`
- Store swipe history (who swiped whom, direction, timestamp)
- Match detection (both right swiped)
- Profile rotation logic
- 10-day cooldown tracking
- Exclude already-seen profiles

#### **3. Match Service** ❌ **NEW**
Create: `Backend/dating/matchService.ts`
- Create match when both right swipe
- Store match data
- Enable personal chat for matches

#### **4. Chat Service** ❌ **NEW**
Create: `Backend/chat/chatService.ts`
- Global chat (anonymous)
- Personal chat (for matches)
- Real-time Firestore listeners

#### **5. Leaderboard Service** ❌ **NEW**
Create: `Backend/leaderboard/leaderboardService.ts`
- Track daily right swipes per user
- Get top 3 users
- Daily reset logic
- Gender filtering (optional)

---

## **📁 Proposed Backend Structure**

```
Backend/
├── auth/                    ✅ EXISTS
│   ├── authController.ts
│   ├── signupController.ts
│   ├── loginController.ts
│   └── emailVerification.ts
│
├── user/                    ✅ EXISTS (needs updates)
│   └── userService.ts       - Add: gender, photos, swipeStats
│
├── dating/                  ❌ NEW
│   ├── swipeService.ts      - Swipe logic, history, cooldown
│   ├── matchService.ts      - Match detection, storage
│   └── profileService.ts    - Get profiles for swiping
│
├── chat/                    ❌ NEW
│   ├── globalChatService.ts - Global anonymous chat
│   └── matchChatService.ts  - Personal chat for matches
│
├── leaderboard/             ❌ NEW
│   └── leaderboardService.ts - Daily top 3 most swiped
│
├── Database/                ✅ EXISTS
├── tests/                   ✅ EXISTS
├── docs/                    ✅ EXISTS
└── config/                  ✅ EXISTS
```

---

## **🗄️ Firestore Collections Needed**

### **Existing:**
1. `users` - User profiles ✅
2. `email_verifications` - Email verification codes ✅

### **New Collections Needed:**

3. **`swipes`** - Swipe history
```typescript
{
  id: string,
  swiperId: string,        // Who swiped
  swipedId: string,         // Who was swiped
  direction: 'left' | 'right',
  timestamp: Date,
  cooldownUntil: Date       // For 10-day logic
}
```

4. **`matches`** - Matched users
```typescript
{
  id: string,
  user1Id: string,
  user2Id: string,
  matchedAt: Date,
  chatId: string            // Reference to chat
}
```

5. **`global_chat`** - Global chat messages
```typescript
{
  id: string,
  userId: string,
  alias: string,            // Anonymous display name
  message: string,
  timestamp: Date
}
```

6. **`match_chats`** - Personal chats for matches
```typescript
{
  id: string,
  matchId: string,
  messages: [{
    senderId: string,
    message: string,
    timestamp: Date
  }]
}
```

7. **`daily_leaderboard`** - Daily swipe counts
```typescript
{
  id: string,              // Format: YYYY-MM-DD
  date: Date,
  users: [{
    userId: string,
    rightSwipesReceived: number,
    gender: string
  }]
}
```

---

## **🎨 Frontend Changes Needed**

### **1. Connect Authentication** ⚠️ **HIGH PRIORITY**
- Replace `handleFakeAuth()` with real backend calls
- Use `AuthController.initiateAuth()`
- Use `SignupController` for signup flow
- Use `LoginController` for login
- Store user session (Firebase Auth)

### **2. Build Dating/Swipe UI** ❌ **NEW**
- Create swipeable profile cards
- Left/Right swipe gestures
- Show profile photos, name, age, bio
- Match animation
- "It's a Match!" modal

### **3. Update Leaderboard** 🔄 **REBUILD**
- Remove current "brainrot" voting
- Show top 3 most swiped users
- Display profile pictures
- Show swipe count
- Daily reset indicator

### **4. Connect Global Chat** 🔄 **UPDATE**
- Connect to Firestore real-time
- Use user's alias
- Persist messages
- Real-time sync between users

### **5. Add Match Chat** ❌ **NEW**
- New tab or section for matches
- List of matched users
- Personal chat for each match

---

## **✅ Recommendation: Step-by-Step Plan**

### **Phase 1: Connect Authentication** (1-2 hours)
1. Install Firebase in frontend
2. Connect login/signup to backend
3. Store user session
4. Test complete auth flow

### **Phase 2: Update User Profiles** (1 hour)
1. Add missing fields to `userService.ts`
2. Save profile to Firestore
3. Load profile on login
4. Test profile updates

### **Phase 3: Build Dating Backend** (3-4 hours)
1. Create `swipeService.ts`
2. Create `matchService.ts`
3. Create `profileService.ts`
4. Test swipe logic

### **Phase 4: Build Dating Frontend** (4-5 hours)
1. Create swipeable card component
2. Implement swipe gestures
3. Connect to backend
4. Add match detection
5. Test complete flow

### **Phase 5: Build Leaderboard** (2-3 hours)
1. Create `leaderboardService.ts`
2. Track daily swipes
3. Update frontend UI
4. Test daily reset

### **Phase 6: Connect Chat** (2-3 hours)
1. Create `chatService.ts`
2. Connect global chat to Firestore
3. Add real-time listeners
4. Test multi-user chat

### **Phase 7: Add Match Chat** (2-3 hours)
1. Create match chat service
2. Build match list UI
3. Build personal chat UI
4. Test match chat

---

## **🚀 Next Immediate Steps**

**Should we:**

1. **Start with Phase 1** - Connect authentication (most critical)
2. **Start with Phase 3** - Build dating backend first
3. **Something else?**

**My recommendation:** Start with **Phase 1** (authentication) because everything else depends on having real users logged in.

What do you think?
