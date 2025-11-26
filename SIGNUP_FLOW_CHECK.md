# 🔍 Signup Flow Check

## **Expected Flow:**

### **Step 1: Email & Name**
- Enter name
- Enter @csuchico.edu email
- Click "Send verification code"
- → Goes to Step 2

### **Step 2: Verify Code**
- See message: "We sent a 6-digit code to [email]"
- Enter 6-digit code
- Click "Verify code"
- → Goes to Step 3 ✅

### **Step 3: Set Password** ← Should show this!
- See message: "✓ Email verified! Now set your password."
- Enter password (min 6 characters)
- Click "Create account"
- → Account created, logged in

---

## **Current Code Analysis:**

### **File:** `frontend/src/components/AuthModalImproved.tsx`

### **Step Tracking:**
```typescript
const [signupStep, setSignupStep] = useState<'email' | 'verify' | 'password'>('email');
```

### **After Verification (Line 115-117):**
```typescript
setCodeVerified(true);
setSignupStep('password');  // ← Should show password screen
setError('');
```

### **Password Screen Render (Line 304-332):**
```typescript
{signupStep === 'password' && (
  <>
    <div className="text-xs text-green-600 mb-3 p-2 bg-green-50 rounded-lg">
      ✓ Email verified! Now set your password.
    </div>

    <div>
      <label>Password</label>
      <input type="password" ... />
    </div>

    <button type="submit">
      Create account
    </button>
  </>
)}
```

---

## **✅ The Code Looks Correct!**

The signup flow in the code is already properly implemented with 3 steps:
1. Email/Name → `signupStep === 'email'`
2. Verify Code → `signupStep === 'verify'`
3. Set Password → `signupStep === 'password'`

---

## **🧪 How to Test:**

### **Test the Signup Flow:**

1. **Click "Sign up"**
2. **Step 1:** Enter name and email
3. **Click "Send verification code"**
4. **Step 2:** Enter the 6-digit code
5. **Click "Verify code"**
6. **Step 3:** Should see "✓ Email verified! Now set your password."
7. **Enter password**
8. **Click "Create account"**
9. **Account created!**

---

## **🔍 If Password Screen Doesn't Show:**

### **Possible Issues:**

1. **State not updating:**
   - Check browser console for errors
   - Verify `setSignupStep('password')` is being called

2. **Component re-rendering:**
   - Modal might be closing/reopening
   - State might be resetting

3. **Conditional rendering issue:**
   - Check if `signupStep === 'password'` condition is true

---

## **🐛 Debug Steps:**

### **Add Console Logs:**

In `handleVerifyCode` function (line 93):
```typescript
const handleVerifyCode = async () => {
  console.log('🔍 Starting verification...');
  // ... verification code ...
  
  console.log('✅ Code verified! Setting step to password');
  setCodeVerified(true);
  setSignupStep('password');
  console.log('📍 Current step:', signupStep); // Should be 'password'
};
```

### **Check in Browser Console:**

1. Open browser DevTools (F12)
2. Go to Console tab
3. Click "Sign up"
4. Follow signup flow
5. Watch for console logs
6. Check if step changes to 'password'

---

## **✅ Expected Behavior:**

After clicking "Verify code":
1. ✅ API call to verify code
2. ✅ Code verified successfully
3. ✅ `setSignupStep('password')` called
4. ✅ Password screen renders
5. ✅ User enters password
6. ✅ User clicks "Create account"
7. ✅ Account created

---

## **🎯 Summary:**

The code is **already correct** and implements the 3-step flow:
- ✅ Email/Name
- ✅ Verify Code
- ✅ Set Password

**If the password screen isn't showing, it's likely a runtime issue, not a code issue.**

**Test the signup flow now and check the browser console for any errors!**
