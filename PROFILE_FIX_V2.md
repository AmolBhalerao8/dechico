# ✅ Profile Save Issue - FIXED (v2)!

## **🐛 The Real Problem:**

The issue was in the **ProfileView** component. When you click "Save changes", it calls `updateUserProfile()` which was using Firestore's `updateDoc()` function.

**The problem:** `updateDoc()` FAILS if the document doesn't exist!

Since your user document was never created during signup, `updateDoc()` couldn't update a non-existent document.

## **✅ The Fix:**

Changed `updateUserProfile()` to use `setDoc()` with `merge: true` instead of `updateDoc()`.

### **Before:**
```typescript
export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>) => {
  await updateDoc(userRef, updates);  // ❌ Fails if document doesn't exist
}
```

### **After:**
```typescript
export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>) => {
  await setDoc(userRef, updates, { merge: true });  // ✅ Creates if doesn't exist, updates if it does
}
```

## **📝 What Changed:**

### **File: `frontend/src/services/userService.ts`**

1. **Changed `updateUserProfile` function:**
   - Replaced `updateDoc()` with `setDoc(..., { merge: true })`
   - Now creates the document if it doesn't exist
   - Updates it if it does exist

2. **Removed unused import:**
   - Removed `updateDoc` from imports

## **🎯 Why This Works:**

### **`updateDoc()` vs `setDoc()` with merge:**

| Function | Document Doesn't Exist | Document Exists |
|----------|----------------------|-----------------|
| `updateDoc()` | ❌ **FAILS** | ✅ Updates |
| `setDoc(..., {merge: true})` | ✅ **Creates** | ✅ Updates |

**Result:** `setDoc` with merge is safer and handles both cases!

## **🧪 Test Now:**

### **1. Refresh the page:**
Press `F5` or `Ctrl+R` (Windows) / `Cmd+R` (Mac)

### **2. Go to Profile tab:**
Click "View profile" in the sidebar

### **3. Fill in your details:**
- First name
- Last name
- Alias
- Age
- Bio
- Interests
- Ethnicity

### **4. Add a photo (optional but recommended):**
Click "Update picture" and upload an image

### **5. Click "Save changes":**
**Expected:** ✅ "Profile saved successfully!" message

### **6. Verify in Firestore:**
https://console.firebase.google.com/project/dechico-7b466/firestore

**Check `users` collection:**
- ✅ Your document should now exist
- ✅ All fields should be populated

## **📊 What Happens Now:**

### **First Save (Document Doesn't Exist):**
```
setDoc(userRef, {
  firstName: "John",
  lastName: "Doe",
  alias: "wildcat_john",
  ...
}, { merge: true })
```
→ ✅ **Creates new document** with all your data

### **Subsequent Saves (Document Exists):**
```
setDoc(userRef, {
  bio: "Updated bio",
  ...
}, { merge: true })
```
→ ✅ **Updates existing document**, keeps other fields intact

## **✨ Benefits:**

1. ✅ **No more "Failed to save profile" errors**
2. ✅ **Works whether document exists or not**
3. ✅ **Safer and more robust**
4. ✅ **Handles edge cases automatically**

## **🎉 Ready to Test!**

**Steps:**
1. Refresh the page (F5)
2. Login
3. Go to Profile tab
4. Fill in your details
5. Click "Save changes"
6. **Expected:** Success message! ✅

**Then check:**
- Firestore console - your document should be there
- Dating tab - you should be able to swipe
- Your profile should show in the test profiles list

---

## **🔍 Troubleshooting:**

### **Still getting errors?**
1. Open browser console (F12)
2. Look for error messages
3. Share the error with me

### **Profile not showing in Firestore?**
1. Make sure you're logged in
2. Check the browser console for errors
3. Verify Firebase connection

### **Can't swipe on dating profiles?**
1. Make sure you added at least one photo
2. Check that `profileComplete: true` in Firestore
3. Refresh the page

---

**The fix is live! Try saving your profile now!** 🚀
