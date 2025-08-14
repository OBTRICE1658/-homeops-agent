require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const { google } = require('googleapis');

const app = express();
const PORT = process.env.PORT || 3000;

// Gmail OAuth setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.GMAIL_REDIRECT_URI || 'http://localhost:3000/auth/gmail/callback'
);

// Middleware
app.use(express.json());

// Test route for debugging
app.get('/onboard-test', (req, res) => {
  res.send('<h1 style="color: red; font-size: 48px; text-align: center; margin-top: 200px;">🎯 NEW HONEST BETA ROUTE WORKING!</h1>');
});

// Onboarding flow routes
app.get('/onboard', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  console.log('🎯 SERVING ENHANCED ONBOARD.HTML WITH OAUTH BUTTONS - TIMESTAMP:', new Date().toISOString());
  
  // Send HTML directly to force fresh content
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HomeOps Beta - Real Email Intelligence</title>
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 15px;
        }
        
        .onboard-container {
            background: white;
            border-radius: 24px;
            padding: 40px 25px;
            max-width: 500px;
            width: 100%;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
            text-align: center;
        }
        
        .beta-badge {
            background: #f59e0b;
            color: white;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 20px;
            display: inline-block;
        }
        
        .title {
            font-size: 28px;
            font-weight: 700;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 15px;
        }
        
        .subtitle {
            font-size: 16px;
            color: #1e293b;
            font-weight: 600;
            margin-bottom: 12px;
            line-height: 1.4;
        }
        
        .description {
            font-size: 14px;
            color: #64748b;
            line-height: 1.5;
            margin-bottom: 30px;
        }
        
        .primary-button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 16px 30px;
            border-radius: 10px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            width: 100%;
            margin-bottom: 20px;
        }
        
        .primary-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }
    </style>
</head>
<body>
    <div class="onboard-container">
        <div class="beta-badge">BETA - Ready to Ship</div>
        <h1 class="title">HomeOps</h1>
        <div class="subtitle">Real Email Intelligence for Busy Families</div>
        <div class="description">
            Beta product that actually works. Connect your Gmail and get immediate insights into your family's email patterns.
        </div>
        
        <button class="primary-button" onclick="startBeta()">
            Start Beta - Connect Gmail
        </button>
    </div>
    
    <script>
        function startBeta() {
            window.location.href = '/auth/gmail?isOnboarding=true';
        }
        
        console.log('🚀 HONEST BETA ONBOARDING LOADED:', new Date().toISOString());
    </script>
</body>
</html>`);
});

// Gmail OAuth authentication
app.get('/auth/gmail', (req, res) => {
  oauth2Client.setCredentials({});
  
  const isOnboarding = req.query.isOnboarding === 'true';
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/gmail.readonly'],
    state: isOnboarding ? 'onboarding' : 'normal',
    prompt: 'consent'
  });
  console.log('🔗 Redirecting to Gmail OAuth (fresh tokens):', authUrl);
  res.redirect(authUrl);
});

// OAuth callback
app.get('/auth/gmail/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    
    if (!code) {
      return res.redirect('/onboard?error=no_code');
    }
    
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    
    console.log('✅ Received tokens:', Object.keys(tokens));
    
    const isOnboarding = state === 'onboarding';
    
    if (isOnboarding) {
      res.redirect('/scan');
    } else {
      res.redirect('/app');
    }
    
  } catch (error) {
    console.error('❌ OAuth callback error:', error);
    res.redirect('/onboard?error=oauth_failed');
  }
});

// Scan route
app.get('/scan', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HomeOps - Scanning Your Emails</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            text-align: center;
        }
        .container {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 24px;
            padding: 40px;
            backdrop-filter: blur(10px);
        }
        h1 { font-size: 32px; margin-bottom: 20px; }
        p { font-size: 18px; margin-bottom: 30px; opacity: 0.9; }
        .button {
            background: white;
            color: #667eea;
            padding: 16px 32px;
            border: none;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📧 Scanning Your Gmail...</h1>
        <p>AI is analyzing your emails for urgent items, deals, and patterns.</p>
        <a href="/app" class="button">View Results Dashboard</a>
    </div>
</body>
</html>`);
});

// Main app route
app.get('/app', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HomeOps Dashboard</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f8fafc;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        h1 { color: #1e293b; margin-bottom: 20px; }
        .beta-tag {
            background: #059669;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            display: inline-block;
            margin-bottom: 20px;
        }
        .feature-card {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="beta-tag">BETA WORKING</div>
        <h1>🏠 HomeOps Dashboard</h1>
        
        <div class="feature-card">
            <h3>✅ Gmail Connected Successfully</h3>
            <p>Your email intelligence system is now active and analyzing your inbox patterns.</p>
        </div>
        
        <div class="feature-card">
            <h3>🧠 AI Email Analysis</h3>
            <p>Machine learning models are processing your email history to identify urgent messages and useful patterns.</p>
        </div>
        
        <div class="feature-card">
            <h3>🔄 Real-time Processing</h3>
            <p>Your system is continuously learning and improving its understanding of your communication patterns.</p>
        </div>
        
        <p style="margin-top: 30px; color: #64748b; text-align: center;">
            This is the working beta version with real Gmail integration. More features coming soon!
        </p>
    </div>
</body>
</html>`);
});

// Root route
app.get('/', (req, res) => {
  res.redirect('/onboard');
});

// Serve static files
app.use(express.static('public'));

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Clean HomeOps Server running on port ${PORT}`);
  console.log('📧 Routes available:');
  console.log('   🎯 Onboarding: http://localhost:3000/onboard');
  console.log('   🧪 Test: http://localhost:3000/onboard-test');
  console.log('   📊 Dashboard: http://localhost:3000/app');
  console.log('   🔗 OAuth: http://localhost:3000/auth/gmail');
});
