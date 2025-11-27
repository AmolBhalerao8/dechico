# DeChico Testing Guide

## ✅ Phase 1: Authentication Testing

### **What's Been Implemented:**
- ✅ Firebase authentication connected
- ✅ Email verification with @csuchico.edu domain validation
- ✅ Signup flow with verification code
- ✅ Login flow
- ✅ Profile creation and saving to Firestore
- ✅ Profile loading on login

---

## **🧪 How to Test:**

### **1. Start the Frontend**
The dev server should already be running at: http://localhost:5173

If not, run:
```bash
cd frontend
npm run dev
```

### **2. Test Signup Flow**

#### **Step 1: Landing Page**
- ✅ Should see landing page with video
- ✅ Click "Sign up" button

#### **Step 2: Signup Form**
- ✅ Enter name: "Test User"
- ✅ Enter email: `yourname@csuchico.edu` (must be @csuchico.edu)
- ✅ Click "Send code" button
- ✅ Check console for verification code (it's logged there)
- ✅ Enter the 6-digit code
- ✅ Enter password (min 6 characters)
- ✅ Click "Create account"

#### **Step 3: Onboarding**
- ✅ Should see onboarding modal
- ✅ Upload at least one photo
- ✅ Click "Continue"
- ✅ Should see congratulations modal
- ✅ Click "Enter the app"

#### **Step 4: Main App**
- ✅ Should see the main app interface
- ✅ Your name/alias should appear in sidebar
- ✅ Navigate to "Profile" tab
- ✅ Fill in profile details (name, age, bio, etc.)
- ✅ Click "Save changes"
- ✅ Should see "Profile saved successfully!" alert

### **3. Test Login Flow**

#### **Step 1: Logout**
- Currently no logout button (we'll add one)
- For now, open browser console and run:
  ```javascript
  localStorage.clear()
  location.reload()
  ```

#### **Step 2: Login**
- ✅ Click "Log in" button on landing page
- ✅ Enter your email
- ✅ Enter your password
- ✅ Click "Log in"
- ✅ Should be logged in
- ✅ Profile should load automatically

### **4. Check Firestore Database**

Go to Firebase Console: https://console.firebase.google.com/project/dechico-7b466/firestore

#### **Collections to Check:**
1. **`users`** - Should have your user document with:
   - uid
   - email
   - name
   - profile fields (firstName, lastName, alias, bio, age, etc.)
   - photos array
   - profileComplete: true

2. **`email_verifications`** - Should have verification records

---

## **🐛 Known Issues / Limitations:**

### **Current Limitations:**
1. ❌ **No logout button** - Need to add logout functionality
2. ❌ **Email not actually sent** - Verification code is only logged to console (need to connect to backend email service)
3. ❌ **Photos stored as base64** - Should use Firebase Storage in production
4. ❌ **No error handling for network issues** - Need better error messages

### **What Still Needs Testing:**
- [ ] Multiple user signups
- [ ] Duplicate email handling
- [ ] Password reset (not implemented yet)
- [ ] Session persistence across page refreshes
- [ ] Mobile responsiveness

---

## **📝 Test Checklist:**

### **Signup Flow:**
- [ ] Can access landing page
- [ ] Can open signup modal
- [ ] Email validation works (@csuchico.edu only)
- [ ] Verification code is generated
- [ ] Can verify code
- [ ] Account is created in Firebase Auth
- [ ] User document is created in Firestore
- [ ] Onboarding modal appears
- [ ] Can upload photos
- [ ] Profile is saved to Firestore

### **Login Flow:**
- [ ] Can open login modal
- [ ] Can login with correct credentials
- [ ] Profile loads automatically
- [ ] Can navigate between tabs
- [ ] Can update profile
- [ ] Profile updates save to Firestore

### **Error Handling:**
- [ ] Invalid email shows error
- [ ] Wrong password shows error
- [ ] Expired verification code shows error
- [ ] Duplicate email shows error

---

## **🚀 Next Steps After Testing:**

Once authentication is working:
1. Add logout button
2. Connect email sending to backend
3. Build dating swipe feature
4. Build leaderboard
5. Connect real-time chat

---

## **📞 If Something Doesn't Work:**

### **Check Browser Console:**
- Open DevTools (F12)
- Look for errors in Console tab
- Check Network tab for failed requests

### **Check Firebase Console:**
- Authentication tab - Are users being created?
- Firestore tab - Are documents being saved?

### **Common Issues:**
1. **"Firebase not initialized"** - Refresh the page
2. **"Email already exists"** - Use a different email or delete the user in Firebase Console
3. **"Verification failed"** - Make sure you're entering the correct code from console

---

## **🎯 Success Criteria:**

✅ **Authentication is working if:**
1. Can signup with @csuchico.edu email
2. User is created in Firebase Auth
3. Profile is saved to Firestore
4. Can login with credentials
5. Profile loads on login
6. Can update and save profile

**Ready to test!** 🚀

Open the app at: http://localhost:5173
