# Firebase API Key Restriction Guide

## Services Used in This App

Based on the codebase, your app uses the following Firebase services:

1. **Firebase Authentication** (Email/Password, Google Sign-In, Password Reset)
2. **Cloud Firestore** (Database for storing visited places)

## Required API Restrictions

To secure your API key, you need to allow these specific APIs:

### Required APIs:
1. **Identity Toolkit API** - Required for Firebase Authentication
2. **Cloud Firestore API** - Required for Firestore database operations

## How to Restrict Your API Key

### Step 1: Go to Google Cloud Console

1. Open [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project: **world-attractions-explorer**

### Step 2: Navigate to API Credentials

1. Go to **APIs & Services** → **Credentials**
2. Find your API key: `YOUR_FIREBASE_API_KEY_HERE`
3. Click on the API key to edit it

### Step 3: Set Application Restrictions

**Option A: HTTP Referrer Restrictions (Recommended for Web Apps)**

1. Under **Application restrictions**, select **HTTP referrers (web sites)**
2. Add your website URLs (one per line, use exact format):
   - `https://world-attractions-explorer.vercel.app/*` (or your production domain)
   - `http://localhost/*` (for local development - note: no wildcard after port)
   - `http://localhost:5173/*` (if using Vite default port)
   - `http://localhost:3000/*` (if using port 3000)
   - `http://127.0.0.1/*` (alternative localhost)
   - `http://127.0.0.1:5173/*` (with specific port)
   - `https://*.vercel.app/*` (if using Vercel preview deployments)

**Important:** Google Cloud Console doesn't accept `http://localhost:*` with wildcard port. You need to:
- Either add specific ports: `http://localhost:5173/*`, `http://localhost:3000/*`, etc.
- Or use `http://localhost/*` (but this may not work for all ports)
- Or temporarily use "None" restriction for local development (less secure)

**Option B: IP Address Restrictions (Not Recommended for Web Apps)**
- Only use if you have static IP addresses
- Not suitable for dynamic deployments like Vercel

### Step 4: Set API Restrictions

1. Under **API restrictions**, select **Restrict key**
2. Check the following APIs:
   - ✅ **Identity Toolkit API** (for Firebase Authentication)
   - ✅ **Cloud Firestore API** (for Firestore database)
3. Click **Save**

### Step 5: Verify APIs are Enabled

Make sure these APIs are enabled in your project:

1. Go to **APIs & Services** → **Enabled APIs**
2. Verify these APIs are enabled:
   - Identity Toolkit API
   - Cloud Firestore API

If not enabled, click **+ ENABLE APIS AND SERVICES** and enable them.

## Important Notes

⚠️ **After restricting the API key:**
- The key will only work for the specified APIs and domains
- Test your app thoroughly after applying restrictions
- If you add new domains (e.g., custom domain), update the restrictions

⚠️ **For Local Development:**
- Google Cloud Console doesn't accept `http://localhost:*` with wildcard port
- Add specific ports: `http://localhost:5173/*`, `http://localhost:3000/*`, etc.
- Or use `http://localhost/*` (may not work for all ports)
- Alternative: Use `http://127.0.0.1:5173/*` with your specific port
- **Temporary workaround**: Set restriction to "None" for testing, then add proper restrictions

⚠️ **For Production:**
- Add your production domain (e.g., `https://yourdomain.com/*`)
- Add Vercel preview URLs if you use preview deployments

## Testing After Restrictions

1. Test authentication (sign up, sign in, Google sign-in)
2. Test password reset functionality
3. Test visited places sync (Firestore operations)
4. Test on both local development and production

## Troubleshooting

If you get errors after restricting:

1. **"API key not valid"** - Check that the correct APIs are enabled
2. **"Referer not allowed"** - Add your domain to HTTP referrer restrictions
3. **"API not enabled"** - Enable the required APIs in Google Cloud Console

## Security Best Practices

✅ **DO:**
- Restrict API keys to specific APIs
- Use HTTP referrer restrictions for web apps
- Rotate keys if they're exposed
- Use environment variables (already done)

❌ **DON'T:**
- Leave API keys unrestricted
- Commit API keys to git (already fixed)
- Share API keys publicly
- Use the same key for multiple projects

