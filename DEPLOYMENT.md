# HomeOps Deployment Guide

## Backend Deployment (Render)

Your frontend is already deployed to Firebase Hosting at: https://homeops-web.web.app

Now you need to deploy the backend to Render:

### Step 1: Create Render Account
1. Go to https://render.com
2. Sign up with your GitHub account
3. Connect your GitHub repository

### Step 2: Deploy Backend Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository: `oliverbaron/homeops-agent`
3. Configure the service:
   - **Name**: `homeops-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.cjs`
   - **Plan**: Free

### Step 3: Add Environment Variables
Add these environment variables in Render:
- `OPENAI_API_KEY`: Your OpenAI API key
- `FIREBASE_CREDENTIALS`: The base64 encoded Firebase service account (already in your .env file)

### Step 4: Deploy
Click "Create Web Service" and wait for deployment.

### Step 5: Update Frontend Configuration
Once deployed, Render will give you a URL like: `https://homeops-backend.onrender.com`

Update `public/config.js` with the correct backend URL.

### Step 6: Redeploy Frontend
Run `firebase deploy` to update the frontend with the correct backend URL.

## Current Status
- ✅ Frontend: Deployed to Firebase Hosting
- ❌ Backend: Needs deployment to Render
- ❌ API Calls: Currently failing because backend is not deployed

## Testing
After deployment, visit: https://homeops-web.web.app 

## Step-by-Step Debug Process

1. **Start your local server** (if it's not already running):
   ```bash
   npm start
   ```

2. **Open the debug tool** in your browser:
   ```
   http://localhost:3000/debug-calendar.html
   ```

3. **Follow these steps in order**:

   **Step 1: Check Authentication**
   - Click "Check Auth Status"
   - Make sure you're logged in and see your User ID

   **Step 2: Test Save Event**
   - Click "Save Test Event"
   - This will create a test event and show you if it saves successfully

   **Step 3: Test Get Events**
   - Click "Get Events"
   - This will fetch events for your user and show you what's returned

   **Step 4: Manual API Test** (if needed)
   - If the above doesn't work, manually enter your User ID and test

## What This Will Tell Us

- **If Step 1 fails**: Authentication problem
- **If Step 2 fails**: Event saving problem
- **If Step 3 fails**: Event fetching problem
- **If Step 2 works but Step 3 returns empty**: User ID mismatch

## Expected Results

- **Step 1**: Should show ✅ User authenticated with your User ID
- **Step 2**: Should show ✅ Event saved successfully with event details
- **Step 3**: Should show ✅ Events retrieved with your saved events

Please run through this debug tool and let me know:
1. What each step shows
2. Any error messages
3. The User ID that's displayed
4. Whether events are being saved and retrieved

This will help me pinpoint exactly where the issue is and fix it quickly! 