# 🚀 HomeOps Render Deployment Instructions

## Step 1: Create New Render Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account if not already connected
4. Select repository: **`OBTRICE1658/-homeops-agent`**
5. Select branch: **`calendar-rebuild-safe`**

## Step 2: Configure Service Settings

**Basic Settings:**
- **Name**: `homeops-backend` (or any name you prefer)
- **Region**: Choose closest to you
- **Branch**: `calendar-rebuild-safe`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `node quick-server.js`

**Advanced Settings:**
- **Auto-Deploy**: `Yes` (so future pushes auto-deploy)
- **Health Check Path**: `/api/test`

## Step 3: Set Environment Variables

In the Render dashboard, go to **Environment** tab and add these variables:

### Required Variables:
```
OPENAI_API_KEY=your_openai_api_key_here
GMAIL_CLIENT_ID=your_gmail_client_id_here
GMAIL_CLIENT_SECRET=your_gmail_client_secret_here
GOOGLE_CLIENT_ID=your_gmail_client_id_here
GOOGLE_CLIENT_SECRET=your_gmail_client_secret_here
FIREBASE_PRIVATE_KEY=your_firebase_private_key_here
FIREBASE_CLIENT_EMAIL=your_firebase_client_email_here
```

### Pre-configured Variables (already in render.yaml):
```
FIREBASE_PROJECT_ID=homeops-web
GMAIL_REDIRECT_URI=https://your-service-name.onrender.com/auth/google/callback
```

**⚠️ Important**: Replace `your-service-name` in `GMAIL_REDIRECT_URI` with your actual Render service URL.

## Step 4: Deploy

1. Click **"Create Web Service"**
2. Wait for initial deployment (2-3 minutes)
3. Your app will be live at: `https://your-service-name.onrender.com`

## Step 5: Test URLs for Friends

Once deployed, share these URLs with friends:

### 🎯 **Onboarding Flow** (Start Here):
```
https://your-service-name.onrender.com/
```

### 📱 **Main App** (After OAuth):
```
https://your-service-name.onrender.com/app
```

### 🔗 **OAuth Callback** (automatic):
```
https://your-service-name.onrender.com/auth/google/callback
```

## Step 6: Update OAuth Settings

After deployment, update your Google OAuth configuration:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services** → **Credentials**
3. Edit your OAuth 2.0 client
4. Add your new Render URL to **Authorized redirect URIs**:
   ```
   https://your-service-name.onrender.com/auth/google/callback
   ```

## 🧪 Testing Flow with Friends

**Step-by-step test process:**

1. **Send friends the onboarding URL**: `https://your-service-name.onrender.com/`
2. **They should see**: Welcome page with "Connect Gmail" button
3. **OAuth Flow**: Redirects to Google for Gmail + Calendar permissions
4. **After OAuth**: Redirects to main app at `/app`
5. **Main App Features**:
   - Dashboard with real email insights
   - Email Decoder with category filtering
   - Calendar with working month navigation
   - Real Gmail integration

## 🐛 Troubleshooting

**If deployment fails:**
- Check build logs in Render dashboard
- Verify all environment variables are set
- Ensure branch `calendar-rebuild-safe` is selected

**If OAuth fails:**
- Verify redirect URI matches exactly
- Check Google Cloud Console OAuth settings
- Ensure Gmail/Calendar APIs are enabled

**If app shows fallback data:**
- Check environment variables are set correctly
- Verify Firebase credentials are valid
- Check server logs in Render dashboard

## 📊 Monitoring

- **Deployment Logs**: Render Dashboard → Your Service → Logs
- **Health Check**: `https://your-service-name.onrender.com/api/test`
- **Direct API Test**: `https://your-service-name.onrender.com/api/test`

---

## 🎉 What's Deployed

✅ **Complete OAuth Integration** - Gmail + Google Calendar onboarding  
✅ **Real Email Intelligence** - AI-powered email analysis and insights  
✅ **Working Calendar Navigation** - Fixed month switching (July → August)  
✅ **Personalized Dashboard** - Real Gmail data instead of fallback  
✅ **Email Detail Views** - Full email analysis with proper URLs  
✅ **Category Filtering** - Working email categorization  
✅ **Gmail Integration** - "View in Gmail" buttons with real URLs  

Ready to test! 🚀
</content>
</invoke>
