# Guide to Rename Project to "world-attractions-explorer"

This guide will help you rename your project from "world-attractions-app" to "world-attractions-explorer" on both GitHub and Vercel.

## Step 1: Rename GitHub Repository

1. Go to your GitHub repository: `https://github.com/Svaranasi23/world-attractions-app`
2. Click on **Settings** (top right of the repository page)
3. Scroll down to the **Repository name** section
4. Change the name from `world-attractions-app` to `world-attractions-explorer`
5. Click **Rename**
6. GitHub will automatically redirect the old URL to the new one

**Note:** After renaming, update your local git remote:
```bash
git remote set-url origin https://github.com/Svaranasi23/world-attractions-explorer.git
```

## Step 2: Rename Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Find your project: **World attractions app** (or current name)
3. Click on the project to open it
4. Go to **Settings** tab
5. Scroll to **General** section
6. Find **Project Name** field
7. Change it to: `world-attractions-explorer`
8. Click **Save**

**Note:** 
- The Vercel domain will change from `world-attractions-app.vercel.app` to `world-attractions-explorer.vercel.app`
- You'll need to update the domain in Firebase Authorized Domains (see Step 3)

## Step 3: Update Firebase Authorized Domains

After renaming on Vercel, the domain will change. You need to:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **world-attractions-explorer**
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Remove the old domain: `world-attractions-app.vercel.app` (if it exists)
5. Add the new domain: `world-attractions-explorer.vercel.app`
6. Click **Add**

**Important:** Wait 2-3 minutes after adding the domain before testing password reset.

## Step 4: Update Local Git Remote (After GitHub Rename)

After renaming on GitHub, update your local repository:

```bash
# Check current remote
git remote -v

# Update to new URL
git remote set-url origin https://github.com/Svaranasi23/world-attractions-explorer.git

# Verify
git remote -v
```

## Step 5: Update Environment Variables in Vercel (If Needed)

If you have any environment variables that reference the old project name, update them:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Review all variables
3. Update any that reference the old name

## Verification Checklist

After completing all steps:

- [ ] GitHub repository renamed to `world-attractions-explorer`
- [ ] Local git remote updated
- [ ] Vercel project renamed to `world-attractions-explorer`
- [ ] New Vercel domain works: `https://world-attractions-explorer.vercel.app`
- [ ] Firebase authorized domains updated with new Vercel domain
- [ ] Password reset works on new domain
- [ ] All deployments working correctly

## Important Notes

1. **GitHub redirects**: The old repository URL will automatically redirect to the new one, but it's best to update all references.

2. **Vercel domain change**: The domain will change from `world-attractions-app.vercel.app` to `world-attractions-explorer.vercel.app`. Update any bookmarks or links.

3. **Firebase domain**: You must add the new Vercel domain to Firebase authorized domains for authentication to work.

4. **Custom domain**: If you have a custom domain set up, it will continue to work after the rename.

5. **Deployments**: All existing deployments will continue to work, but new deployments will use the new name.

## Troubleshooting

### Git remote not working after rename?
```bash
# Remove old remote
git remote remove origin

# Add new remote
git remote add origin https://github.com/Svaranasi23/world-attractions-explorer.git

# Verify
git remote -v
```

### Vercel deployment failing?
- Check that the GitHub repository name matches
- Verify environment variables are still set
- Check deployment logs in Vercel dashboard

### Firebase authentication not working?
- Verify the new Vercel domain is in authorized domains
- Wait 2-3 minutes after adding domain
- Check browser console for specific error messages

