# Firebase Domain Authorization Fix

## Error: "Domain not allowlisted by project (auth/unauthorized-continue-uri)"

This error occurs when the domain used in the password reset email is not authorized in Firebase.

## Quick Fix

### Step 1: Find Your Exact Vercel Domain

1. Open your deployed app on Vercel
2. Look at the URL in your browser's address bar
3. Copy the domain (e.g., `world-attractions-explorer.vercel.app` or `your-custom-domain.com`)
4. **Important:** Copy only the domain part, without `https://` or trailing slashes

**Or check the browser console:**
- Open DevTools (F12)
- Look for the error message - it will show the exact domain that needs to be added

### Step 2: Add Your Domain to Firebase Authorized Domains

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **world-attractions-explorer**
3. Go to **Authentication** → **Settings** tab
4. Scroll down to **Authorized domains** section
5. Click **Add domain**
6. Enter your domain (without `https://` or trailing slashes):
   - Example: `world-attractions-explorer.vercel.app`
   - Example: `your-custom-domain.com`
7. Click **Add**

**For Preview Deployments:**
- Vercel preview URLs change with each deployment
- You have two options:
  - **Option A:** Add each preview URL individually as you use them
  - **Option B:** Use Firebase's default domain (less ideal for UX)

### Step 2: Verify Domain Format

Make sure you're adding:
- ✅ `localhost` (for local development)
- ✅ `your-app.vercel.app` (without `https://` or trailing slashes)
- ✅ `your-custom-domain.com` (without `https://` or trailing slashes)

### Step 3: Test Password Reset

1. Try requesting a password reset again
2. The error should be resolved

## Alternative: Use Default Firebase Domain

If you continue to have issues, you can modify the code to use Firebase's default domain instead of your custom domain. However, this is not recommended as it provides a better user experience to use your own domain.

## Troubleshooting

### Still Getting the Error?

1. **Check the exact domain**: 
   - Open browser console and check what `window.location.origin` shows
   - Make sure that exact domain (without protocol) is in authorized domains

2. **Wait a few minutes**: 
   - Domain changes can take a few minutes to propagate

3. **Check for typos**: 
   - Make sure the domain in Firebase matches exactly (case-sensitive for some parts)

4. **Clear browser cache**: 
   - Sometimes cached configurations can cause issues

## Current Configuration

The password reset uses `window.location.origin` as the redirect URL. This means:
- On `localhost:3000` → uses `http://localhost:3000` ✅ (already authorized)
- On `your-app.vercel.app` → uses `https://your-app.vercel.app` ⚠️ (needs to be added)

**The error message in the console will show you the exact domain that needs to be added.**

## Common Vercel Domain Formats

Your Vercel domain might be one of these formats:
- `your-project-name.vercel.app` (production)
- `your-project-name-git-main-your-username.vercel.app` (preview)
- `your-custom-domain.com` (if you set up a custom domain)

**All of these need to be added to Firebase authorized domains if you want password reset to work on them.**

## Security Note

Authorized domains control where Firebase Authentication can redirect users. This is a security feature to prevent phishing attacks. Only add domains you own and trust.

