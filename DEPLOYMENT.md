# 🚀 Deployment Guide - DeChico Dating App

## **Vercel Deployment**

### **⚠️ Important: Environment Variables Required**

The `.env` file is **not** pushed to GitHub (for security). You must manually add environment variables in Vercel.

---

## **Step-by-Step Vercel Setup:**

### **1. Connect GitHub to Vercel**
- ✅ Go to https://vercel.com
- ✅ Click "New Project"
- ✅ Import your GitHub repository: `AmolBhalerao8/dechico`

### **2. Configure Build Settings**

**Framework Preset:** Vite
**Root Directory:** `frontend`
**Build Command:** `npm run build`
**Output Directory:** `dist`
**Install Command:** `npm install`

### **3. Add Environment Variables** ⚠️

Go to: **Project Settings → Environment Variables**

Add these **8 variables** (one by one):

```
VITE_API_BASE_URL=https://dechico-backend-772774227494.us-central1.run.app
VITE_FIREBASE_API_KEY=AIzaSyCPAUFQncvY2I5tKsZG4rRsj8tOR1O22gE
VITE_FIREBASE_AUTH_DOMAIN=dechico-7b466.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=dechico-7b466
VITE_FIREBASE_STORAGE_BUCKET=dechico-7b466.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=155328150736
VITE_FIREBASE_APP_ID=1:155328150736:web:03b76b693b5f012d5932d5
VITE_FIREBASE_MEASUREMENT_ID=G-SMTLDDZNWD
```

**For each variable:**
- ✅ Check **Production**
- ✅ Check **Preview**
- ✅ Check **Development**

### **4. Deploy**

After adding all environment variables:
1. Click **Deploy** or **Redeploy**
2. Wait for build to complete (2-3 minutes)
3. Your app will be live!

---

## **Troubleshooting:**

### **Build Fails:**
- Check that Root Directory is set to `frontend`
- Verify all environment variables are added
- Check build logs for specific errors

### **App Loads but Firebase Errors:**
- Verify all `VITE_FIREBASE_*` variables are correct
- Check Firebase console for any restrictions
- Ensure domain is whitelisted in Firebase Auth

### **Blank Page:**
- Open browser console (F12)
- Check for JavaScript errors
- Verify environment variables are loaded

### **Video Not Loading:**
- Check if `landingpage.mp4` is in GitHub repo
- File might be too large (check .gitignore)
- Consider using external hosting for large videos

---

## **Environment Variables Explained:**

| Variable | Purpose |
|----------|---------|
| `VITE_API_BASE_URL` | Backend API endpoint (Cloud Run) |
| `VITE_FIREBASE_API_KEY` | Firebase project API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase authentication domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project identifier |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging ID |
| `VITE_FIREBASE_APP_ID` | Firebase app identifier |
| `VITE_FIREBASE_MEASUREMENT_ID` | Google Analytics ID |

---

## **After Deployment:**

### **Test These Features:**
- ✅ Landing page loads
- ✅ Sign up flow works
- ✅ Login works
- ✅ Firebase authentication
- ✅ Profile creation
- ✅ Chat functionality

### **Update Domain (Optional):**
- Go to Project Settings → Domains
- Add custom domain if needed
- Update Firebase authorized domains

---

## **Continuous Deployment:**

Once set up, Vercel automatically:
- ✅ Deploys on every push to `main` branch
- ✅ Creates preview deployments for PRs
- ✅ Runs build checks
- ✅ Updates production site

---

## **Quick Checklist:**

Before deploying:
- [ ] All environment variables added in Vercel
- [ ] Root directory set to `frontend`
- [ ] Build command is `npm run build`
- [ ] Output directory is `dist`
- [ ] All 8 environment variables configured
- [ ] Variables enabled for Production, Preview, Development

After deploying:
- [ ] Site loads without errors
- [ ] Firebase authentication works
- [ ] Backend API connects properly
- [ ] All features functional

---

## **Need Help?**

Common issues:
1. **Missing env vars** → Add all 8 variables in Vercel
2. **Build fails** → Check root directory is `frontend`
3. **Firebase errors** → Verify all VITE_FIREBASE_* variables
4. **Blank page** → Check browser console for errors

---

**Your app should now be live on Vercel!** 🎉
