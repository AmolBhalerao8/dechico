# 🗄️ DeChico Database Structure

## **Firestore Collections**

### **1. `users` Collection**
Stores user profile information.

```typescript
users/
  └── {userId}
      ├── uid: string                    // Firebase Auth UID
      ├── email: string                  // @csuchico.edu email
      ├── firstName: string              // User's first name
      ├── lastName: string               // User's last name
      ├── alias: string                  // Display name for chat
      ├── bio: string                    // User bio
      ├── age: string                    // User age
      ├── ethnicity: string              // User ethnicity
      ├── interests: string              // User interests
      ├── gender: string                 // User gender (for dating)
      ├── avatarUrl: string              // Profile picture URL
      ├── photos: string[]               // Gallery photos
      ├── profileComplete: boolean       // Profile completion status
      ├── createdAt: Timestamp           // Account creation date
      └── updatedAt: Timestamp           // Last profile update
```

**Purpose:** Store all user profile data for authentication, chat, and dating features.

---

### **2. `email_verifications` Collection**
Stores email verification codes for signup.

```typescript
email_verifications/
  └── {email}
      ├── email: string                  // User's email
      ├── code: string                   // 6-digit verification code
      ├── createdAt: Timestamp           // When code was created
      └── expiresAt: Timestamp           // When code expires (15 min)
```

**Purpose:** Verify @csuchico.edu emails during signup process.

---

### **3. `global_chat` Collection** ✅ NEW
Stores global chat messages for all users.

```typescript
global_chat/
  └── {messageId}
      ├── userId: string                 // Sender's Firebase UID
      ├── email: string                  // Sender's email (for moderation)
      ├── alias: string                  // Sender's display name
      ├── message: string                // Message content (max 500 chars)
      ├── timestamp: Timestamp           // When message was sent
      └── createdAt: string              // ISO string for backup
```

**Purpose:** 
- Anonymous-ish global chat for all Chico State students
- Email stored for moderation and accountability
- Alias shown publicly for privacy
- Real-time sync across all users

**Security:**
- Email is stored but NOT displayed in UI
- Only alias is shown to other users
- Admins can track sender by email if needed

---

### **4. `swipes` Collection** (Coming in Phase 3)
Stores dating swipe history.

```typescript
swipes/
  └── {swipeId}
      ├── swiperId: string               // Who swiped
      ├── swiperEmail: string            // Swiper's email
      ├── swipedId: string               // Who was swiped
      ├── swipedEmail: string            // Swiped user's email
      ├── direction: 'left' | 'right'    // Swipe direction
      ├── timestamp: Timestamp           // When swipe happened
      └── cooldownUntil: Timestamp       // Re-show after 10 days
```

**Purpose:** Track swipes and implement 10-day cooldown logic.

---

### **5. `matches` Collection** (Coming in Phase 3)
Stores matched users (both right swiped).

```typescript
matches/
  └── {matchId}
      ├── user1Id: string                // First user UID
      ├── user1Email: string             // First user email
      ├── user2Id: string                // Second user UID
      ├── user2Email: string             // Second user email
      ├── matchedAt: Timestamp           // When match occurred
      └── chatId: string                 // Reference to match_chats
```

**Purpose:** Store matched pairs for dating feature.

---

### **6. `match_chats` Collection** (Coming in Phase 5)
Stores private chats between matched users.

```typescript
match_chats/
  └── {chatId}
      ├── matchId: string                // Reference to match
      ├── participants: string[]         // [userId1, userId2]
      ├── participantEmails: string[]    // [email1, email2]
      ├── createdAt: Timestamp           // When chat started
      └── messages: [{
          senderId: string,
          senderEmail: string,
          message: string,
          timestamp: Timestamp,
          read: boolean
      }]
```

**Purpose:** Private messaging for matched users.

---

### **7. `daily_leaderboard` Collection** (Coming in Phase 4)
Stores daily leaderboard data.

```typescript
daily_leaderboard/
  └── {date}                             // Format: YYYY-MM-DD
      ├── date: Timestamp                // Date of leaderboard
      └── users: [{
          userId: string,
          email: string,
          name: string,
          alias: string,
          photoUrl: string,
          rightSwipesReceived: number,
          gender: string
      }]
```

**Purpose:** Track top 3 most right-swiped users daily.

---

## **Why Store Email in Every Collection?**

### **Benefits:**
1. **Moderation:** Admins can identify users who violate rules
2. **Accountability:** Users know their actions are traceable
3. **Support:** Help users with account issues
4. **Analytics:** Track user behavior patterns
5. **Security:** Prevent abuse and spam

### **Privacy:**
- ✅ Email is stored in database
- ✅ Email is NOT shown in UI
- ✅ Only alias/name is displayed publicly
- ✅ Email only visible to admins

### **Example:**
```
Database:
  userId: "abc123"
  email: "john@csuchico.edu"
  alias: "wildcat_01"
  message: "Anyone going to the game?"

UI Shows:
  wildcat_01: "Anyone going to the game?"

Admin Panel Shows:
  wildcat_01 (john@csuchico.edu): "Anyone going to the game?"
```

---

## **Firestore Security Rules** (To Implement)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users can read their own profile
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Anyone authenticated can read global chat
    match /global_chat/{messageId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null 
        && request.resource.data.userId == request.auth.uid
        && request.resource.data.email == request.auth.token.email;
      allow update, delete: if false; // Messages can't be edited/deleted
    }
    
    // Email verifications are private
    match /email_verifications/{email} {
      allow read, write: if false; // Only backend can access
    }
  }
}
```

---

## **Database Size Estimates**

### **Current (Phase 2):**
- Users: ~100-500 documents
- Email Verifications: ~50 documents (expire after 15 min)
- Global Chat: ~1,000-5,000 messages/month

### **Future (All Phases):**
- Users: ~1,000-5,000 students
- Global Chat: ~10,000-50,000 messages/month
- Swipes: ~100,000-500,000 swipes/month
- Matches: ~1,000-5,000 matches/month
- Match Chats: ~5,000-25,000 messages/month
- Daily Leaderboard: ~365 documents/year

**Total Estimated:** ~1-2 GB/year (well within Firebase free tier)

---

## **Next Steps:**

1. ✅ **Phase 2 Complete:** Global chat with email tracking
2. ⏳ **Phase 3:** Add swipes collection
3. ⏳ **Phase 4:** Add leaderboard collection
4. ⏳ **Phase 5:** Add match chats collection
5. ⏳ **Security:** Implement Firestore security rules
6. ⏳ **Admin Panel:** Build admin interface to view emails

---

**Updated:** November 25, 2025
**Status:** Phase 2 Complete - Email tracking added to global chat
