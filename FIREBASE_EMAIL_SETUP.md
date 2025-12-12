# Firebase Password Reset Email Setup

If you're not receiving password reset emails, follow these steps:

## Step 1: Configure Email Templates in Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **world-attractions-explorer**
3. Go to **Authentication** → **Templates** tab
4. Click on **Password reset** template
5. Configure the email template:
   - **Subject**: "Reset your password"
   - **Action URL**: Your app URL (e.g., `https://your-app.vercel.app` or `http://localhost:5173`)
   - Customize the email body if needed
6. Click **Save**

## Step 2: Verify Email Domain Authorization

1. In Firebase Console, go to **Authentication** → **Settings** → **Authorized domains**
2. Make sure your domain is listed:
   - `localhost` (for development)
   - Your production domain (e.g., `your-app.vercel.app`)
3. If not listed, click **Add domain** and add it

## Step 3: Check Email Provider Settings

1. Go to **Authentication** → **Settings** → **Users**
2. Make sure **Email/Password** sign-in method is enabled
3. Check that **Email link (passwordless sign-in)** is configured if needed

## Step 4: Test the Reset Flow

1. Try requesting a password reset
2. Check the browser console for any errors
3. Check your email inbox AND spam/junk folder
4. Wait a few minutes - emails can sometimes be delayed

## Troubleshooting

- **Email not received**: Check spam folder, wait a few minutes, verify email address
- **"User not found" error**: Make sure you've signed up with that email first
- **"Too many requests"**: Wait a few minutes before trying again
- **Email in spam**: Mark Firebase emails as "Not Spam" to improve delivery

## Firebase Email Limits

- Free tier: Limited emails per day
- If you hit the limit, wait 24 hours or upgrade your Firebase plan

