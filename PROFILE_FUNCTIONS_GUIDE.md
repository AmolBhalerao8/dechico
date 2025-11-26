# 📋 Profile Functions Guide

## **1. Delete Profile Function** 🗑️

### **Location:**
`frontend/src/services/userService.ts` - Line 192

### **Function:**
```typescript
export const deleteUserProfile = async (uid: string): Promise<void> => {
  try {
    const db = getFirebaseDb();
    const userRef = doc(db, USERS_COLLECTION, uid);
    
    // Delete the user document
    await deleteDoc(userRef);
    console.log('✅ User profile deleted:', uid);
  } catch (error) {
    console.error('❌ Error deleting user profile:', error);
    throw error;
  }
};
```

### **How to Use:**
```typescript
import { deleteUserProfile } from './services/userService';

// Delete current user's profile
await deleteUserProfile(user.uid);
```

### **What It Does:**
- ✅ Permanently deletes user profile from Firestore
- ✅ Removes all user data (photos, bio, swipe stats, etc.)
- ✅ Logs success/error to console
- ⚠️ **WARNING:** This is permanent! Cannot be undone!

### **NOT Implemented in UI Yet:**
- No "Delete Account" button in Profile tab
- You can add it if needed

---

## **2. Save Profile Function** 💾

### **Location:**
`frontend/src/App.tsx` - Lines 1004-1049

### **Code:**
```typescript
<button 
  onClick={async () => {
    if (userId) {
      try {
        console.log('Saving profile for userId:', userId)
        
        await updateUserProfile(userId, {
          firstName: profile.firstName,
          lastName: profile.lastName,
          alias: profile.alias,
          bio: profile.bio,
          age: profile.age,
          ethnicity: profile.ethnicity,
          interests: profile.interests,
          gender: profile.gender,
          genderPreference: profile.genderPreference,
          photos: profile.galleryUrls,
          avatarUrl: profile.avatarUrl,
        } as any)
        
        console.log('Profile saved successfully!')
        alert('Profile saved successfully!')
      } catch (error: any) {
        console.error('Error saving profile:', error)
        alert(`Failed to save profile: ${error.message}`)
      }
    }
  }}
>
  Save changes
</button>
```

### **What It Does:**
1. Gets current user ID
2. Collects all profile data from form
3. Calls `updateUserProfile()` function
4. Saves to Firestore `users` collection
5. Shows success/error alert

### **Data Saved:**
- ✅ firstName
- ✅ lastName
- ✅ alias
- ✅ bio
- ✅ age
- ✅ ethnicity
- ✅ interests
- ✅ gender (your gender)
- ✅ genderPreference (who you want to see)
- ✅ photos (array of image URLs)
- ✅ avatarUrl (main profile picture)

---

## **3. Backend Save Function** 🔧

### **Location:**
`frontend/src/services/userService.ts` - Lines 67-81

### **Function:**
```typescript
export const updateUserProfile = async (
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> => {
  try {
    const db = getFirebaseDb();
    const userRef = doc(db, USERS_COLLECTION, uid);
    
    // Use setDoc with merge to handle non-existent documents
    await setDoc(userRef, updates as any, { merge: true });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};
```

### **What It Does:**
- ✅ Gets Firestore database reference
- ✅ Creates document reference for user
- ✅ Uses `setDoc` with `merge: true`
- ✅ Creates document if doesn't exist
- ✅ Updates existing document if it exists
- ✅ Only updates fields provided (partial update)

---

## **4. Where Data is Stored** 💾

### **Database:**
- **Platform:** Firebase Firestore
- **Collection:** `users`
- **Document ID:** User's UID (e.g., `2LKGCJVZ1hQwpKVvxcVl2`)

### **Document Structure:**
```json
{
  "uid": "2LKGCJVZ1hQwpKVvxcVl2",
  "email": "user@csuchico.edu",
  "firstName": "John",
  "lastName": "Doe",
  "alias": "johnny",
  "bio": "CS major, love hiking",
  "age": "21",
  "ethnicity": "Asian",
  "interests": "Coding, Gaming, Music",
  "gender": "Male",
  "genderPreference": "Women",
  "photos": ["base64_image_1", "base64_image_2"],
  "avatarUrl": "base64_image_1",
  "profileComplete": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "lastLogin": "2024-01-01T00:00:00.000Z",
  "swipeStats": {
    "rightSwipesReceived": 0,
    "leftSwipesReceived": 0,
    "rightSwipesGiven": 0,
    "leftSwipesGiven": 0
  }
}
```

### **View in Firebase Console:**
https://console.firebase.google.com/project/dechico-7b466/firestore/databases/-default-/data/~2Fusers

---

## **5. Complete Save Flow** 🔄

### **Step-by-Step:**

1. **User fills profile form** (Profile tab)
   - Enters name, age, bio, etc.
   - Uploads photos
   - Selects gender and preference

2. **User clicks "Save changes"** button
   - Button onClick handler triggers (App.tsx:1004)

3. **Data collected from form**
   - All profile fields gathered
   - Converted to proper format

4. **`updateUserProfile()` called**
   - Function in userService.ts
   - Receives uid and profile data

5. **Firestore update**
   - `setDoc()` with merge: true
   - Creates or updates document

6. **Success/Error handling**
   - Success: Shows "Profile saved successfully!"
   - Error: Shows error message

7. **Profile complete check**
   - Checks if required fields filled
   - Sets `profileComplete: true/false`
   - Unlocks dating if complete

---

## **6. How to Add Delete Button** 🗑️

If you want to add a "Delete Account" button to the Profile tab:

### **Step 1: Import the function**
```typescript
import { deleteUserProfile } from './services/userService'
```

### **Step 2: Add button to ProfileView**
```typescript
<button 
  onClick={async () => {
    if (confirm('Are you sure? This will permanently delete your account!')) {
      try {
        await deleteUserProfile(userId);
        alert('Account deleted successfully');
        // Logout user
        await logoutUser();
      } catch (error) {
        alert('Failed to delete account');
      }
    }
  }}
  className="rounded-full bg-red-500 text-white px-6 py-2 text-sm font-semibold"
>
  Delete Account
</button>
```

---

## **7. Summary** 📊

### **Profile Functions Available:**

| Function | Location | Purpose |
|----------|----------|---------|
| `deleteUserProfile()` | userService.ts:192 | Delete user profile |
| `updateUserProfile()` | userService.ts:67 | Update/save profile |
| `saveProfile()` | userService.ts:86 | Complete profile save |
| `getUserProfile()` | userService.ts:47 | Get user profile |
| `addPhotoToGallery()` | userService.ts:166 | Add photo |

### **Where Profile is Saved:**

1. **UI:** Profile tab "Save changes" button (App.tsx:1004)
2. **Function:** `updateUserProfile()` (userService.ts:67)
3. **Database:** Firestore `users` collection
4. **Document:** User's UID as document ID

### **Data Flow:**
```
Profile Form (UI)
    ↓
Save Button Click
    ↓
updateUserProfile(uid, data)
    ↓
setDoc(userRef, data, {merge: true})
    ↓
Firestore Database
    ↓
Success/Error Alert
```

---

## **8. Quick Reference** 🚀

### **To Save Profile:**
- Go to Profile tab
- Fill in fields
- Click "Save changes"
- Data saved to Firestore

### **To Delete Profile:**
- Function exists: `deleteUserProfile(uid)`
- Not in UI yet
- Can add button if needed

### **To View Saved Data:**
- Firebase Console: https://console.firebase.google.com/project/dechico-7b466/firestore
- Collection: `users`
- Document: Your UID

---

**All profile functions are now documented!** 📋
