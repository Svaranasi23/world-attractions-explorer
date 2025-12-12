# Deployment Guide for World Attractions App

This guide covers how to deploy your React/Vite application to various hosting platforms.

## Prerequisites

1. Build the app locally first to ensure it works:
   ```bash
   npm run build
   ```
   This creates a `dist` folder with the production build.

2. Make sure your code is committed to GitHub (recommended for most platforms).

---

## Option 1: Vercel (Recommended - Easiest)

### Method A: Using Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```
   Follow the prompts. For production deployment:
   ```bash
   vercel --prod
   ```

### Method B: Using Vercel Dashboard (Easier)

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Vite settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click "Deploy"
6. Your app will be live in ~2 minutes!

**Pros:**
- ✅ Zero configuration needed
- ✅ Automatic HTTPS
- ✅ Free custom domain
- ✅ Automatic deployments on git push
- ✅ Fast global CDN

---

## Option 2: Netlify

### Method A: Using Netlify CLI

1. Install Netlify CLI:
   ```bash
   npm i -g netlify-cli
   ```

2. Login:
   ```bash
   netlify login
   ```

3. Build and deploy:
   ```bash
   npm run build
   netlify deploy --prod --dir=dist
   ```

### Method B: Using Netlify Dashboard

1. Go to [netlify.com](https://netlify.com) and sign up
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Click "Deploy site"

**Pros:**
- ✅ Free tier with generous limits
- ✅ Easy drag-and-drop deployment
- ✅ Automatic HTTPS
- ✅ Form handling and serverless functions available

---

## Option 3: GitHub Pages

### Setup Steps:

1. Install gh-pages:
   ```bash
   npm install --save-dev gh-pages
   ```

2. Update `vite.config.js` to add base path:
   ```js
   export default defineConfig({
     plugins: [react()],
     base: '/world-attractions-app/', // Replace with your repo name
     // ... rest of config
   })
   ```

3. Add deploy script to `package.json`:
   ```json
   "scripts": {
     "deploy": "npm run build && gh-pages -d dist"
   }
   ```

4. Deploy:
   ```bash
   npm run deploy
   ```

5. Enable GitHub Pages in your repo settings:
   - Go to Settings → Pages
   - Source: `gh-pages` branch
   - Your site will be at: `https://[username].github.io/world-attractions-app/`

**Pros:**
- ✅ Completely free
- ✅ Integrated with GitHub
- ✅ Good for open source projects

**Cons:**
- ⚠️ Requires updating base path in vite.config.js
- ⚠️ Slightly more setup

---

## Option 4: Cloudflare Pages

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Navigate to Pages → Create a project
3. Connect your GitHub repository
4. Configure:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Click "Save and Deploy"

**Pros:**
- ✅ Very fast CDN
- ✅ Free tier
- ✅ Easy setup
- ✅ Automatic HTTPS

---

## Option 5: Firebase Hosting

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login:
   ```bash
   firebase login
   ```

3. Initialize:
   ```bash
   firebase init hosting
   ```
   - Select your Firebase project
   - Public directory: `dist`
   - Single-page app: Yes
   - Overwrite index.html: No

4. Deploy:
   ```bash
   npm run build
   firebase deploy
   ```

**Pros:**
- ✅ Google's infrastructure
- ✅ Free tier
- ✅ Good integration with other Firebase services

---

## Quick Comparison

| Platform | Ease | Free Tier | Custom Domain | Auto Deploy |
|----------|------|-----------|---------------|-------------|
| **Vercel** | ⭐⭐⭐⭐⭐ | ✅ | ✅ | ✅ |
| **Netlify** | ⭐⭐⭐⭐⭐ | ✅ | ✅ | ✅ |
| **GitHub Pages** | ⭐⭐⭐ | ✅ | ✅ | ⚠️ Manual |
| **Cloudflare Pages** | ⭐⭐⭐⭐ | ✅ | ✅ | ✅ |
| **Firebase** | ⭐⭐⭐ | ✅ | ✅ | ⚠️ Manual |

---

## Recommended: Vercel

For this project, **Vercel** is the easiest and best option because:
- Zero configuration needed
- Automatically detects Vite settings
- Fastest deployment process
- Best developer experience
- Free custom domain included

### Quick Start with Vercel:

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your repository
5. Click "Deploy"
6. Done! 🎉

Your app will be live at: `https://world-attractions-explorer.vercel.app` (or your custom domain)

---

## Post-Deployment Checklist

- [ ] Test the deployed app
- [ ] Verify all CSV data files load correctly
- [ ] Check map markers display properly
- [ ] Test filtering functionality
- [ ] Verify responsive design on mobile
- [ ] Set up custom domain (optional)
- [ ] Enable automatic deployments from GitHub

---

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Ensure `npm run build` works locally first
- Check build logs on the platform

### Map Not Loading
- Verify Leaflet CSS is included
- Check browser console for errors
- Ensure all data files are in `public/data/`

### Routes Not Working
- For GitHub Pages, ensure base path is set in `vite.config.js`
- For SPA routing, configure redirect rules (most platforms do this automatically)

---

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Netlify Docs: https://docs.netlify.com
- GitHub Pages Docs: https://docs.github.com/pages


