// Updated HomeOps Onboarding with Enhanced OAuth Integration
const express = require('express');
const path = require('path');
const fs = require('fs');
const { google } = require('googleapis');
const CalendarSyncService = require('./services/calendar-sync');

const app = express();
const PORT = 3001; // Use different port to avoid conflicts

// Enhanced OAuth setup with Calendar + Gmail scopes (same as enhanced server)
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID || 'your-client-id',
  process.env.GOOGLE_CLIENT_SECRET || 'your-client-secret', 
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/auth/google/callback'
);

// Enhanced scopes for full Google integration
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email'
];

let currentCalendarSync = null;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Helper function to get category icon
function getCategoryIcon(category) {
  const iconMap = {
    'School': '🎓',
    'Medical': '🏥', 
    'Work': '💼',
    'Family': '👨‍👩‍👧‍👦',
    'Shopping': '🛍️',
    'Social': '👥',
    'Newsletter': '📰',
    'Finance': '💰',
    'Travel': '✈️',
    'Other': '📧'
  };
  return iconMap[category] || '📧';
}

// ===== ENHANCED ONBOARDING FLOW ROUTES =====

// 1. Landing page (start of flow)
app.get('/landing.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'landing.html'));
});

// 2. Enhanced Google OAuth (Gmail + Calendar)
app.get('/auth/google', (req, res) => {
  console.log('🔗 Enhanced Google OAuth requested');
  console.log('📧🗓️ Scopes: Gmail + Calendar Integration');
  
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });
  
  console.log('🌐 Redirecting to Google OAuth...');
  res.redirect(authUrl);
});

// 3. OAuth callback with enhanced setup
app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  
  try {
    console.log('✅ OAuth callback received');
    const { tokens } = await oauth2Client.getAccessToken(code);
    oauth2Client.setCredentials(tokens);
    
    // Save tokens securely (in production, use proper storage)
    fs.writeFileSync('google-tokens.json', JSON.stringify(tokens, null, 2));
    console.log('💾 Tokens saved successfully');
    
    // Initialize calendar sync service
    currentCalendarSync = new CalendarSyncService(oauth2Client);
    console.log('🔄 Calendar sync service initialized');
    
    // Get user info
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    console.log('👤 User authenticated:', userInfo.data.email);
    
    // Perform initial calendar sync
    try {
      console.log('🔄 Performing initial calendar sync...');
      await currentCalendarSync.fullBidirectionalSync();
      console.log('✅ Initial sync completed');
    } catch (syncError) {
      console.log('⚠️ Initial sync failed, but continuing with onboarding:', syncError.message);
    }
    
    // Redirect to scan with enhanced OAuth status
    res.redirect('/scan?google_connected=true&gmail=true&calendar=true&email=' + encodeURIComponent(userInfo.data.email));
    
  } catch (error) {
    console.error('❌ OAuth error:', error);
    res.redirect('/auth/error?message=' + encodeURIComponent(error.message));
  }
});

// 4. Scan page (Gmail analysis)
app.get('/scan', (req, res) => {
  const { google_connected, gmail, calendar, email } = req.query;
  
  if (!google_connected) {
    return res.redirect('/landing.html?error=oauth_required');
  }
  
  console.log('📊 Scan page accessed');
  console.log('✅ Gmail connected:', gmail === 'true');
  console.log('✅ Calendar connected:', calendar === 'true');
  console.log('👤 User email:', email);
  
  res.sendFile(path.join(__dirname, 'public', 'scan.html'));
});

// 5. Calibrate page (final step)
app.get('/calibrate', (req, res) => {
  console.log('🎯 Calibrate page accessed');
  res.sendFile(path.join(__dirname, 'public', 'calibrate.html'));
});

// 6. Main app redirect (after onboarding complete)
app.get('/app', (req, res) => {
  console.log('🚀 Redirecting to main HomeOps app');
  res.redirect('http://localhost:3000/app'); // Redirect to main server
});

// ===== ENHANCED API ENDPOINTS =====

// Check authentication status
app.get('/api/auth/status', (req, res) => {
  const hasTokens = oauth2Client.credentials && oauth2Client.credentials.access_token;
  res.json({
    authenticated: hasTokens,
    hasGmail: hasTokens,
    hasCalendar: hasTokens,
    syncServiceReady: !!currentCalendarSync,
    scopes: hasTokens ? SCOPES : []
  });
});

// Gmail API endpoints (for scan functionality)
app.get('/api/gmail/labels', async (req, res) => {
  try {
    if (!oauth2Client.credentials) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const labelsResponse = await gmail.users.labels.list({ userId: 'me' });
    
    res.json(labelsResponse.data.labels);
  } catch (error) {
    console.error('Gmail labels error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/gmail/messages', async (req, res) => {
  try {
    if (!oauth2Client.credentials) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { maxResults = 50, q = '' } = req.query;
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    
    const messagesResponse = await gmail.users.messages.list({
      userId: 'me',
      maxResults: parseInt(maxResults),
      q: q
    });

    res.json(messagesResponse.data);
  } catch (error) {
    console.error('Gmail messages error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Calendar sync endpoints (integrated with main functionality)
app.post('/api/calendar/sync', async (req, res) => {
  try {
    if (!currentCalendarSync) {
      currentCalendarSync = new CalendarSyncService(oauth2Client);
    }

    const result = await currentCalendarSync.fullBidirectionalSync();
    res.json(result);
  } catch (error) {
    console.error('Calendar sync error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/calendar/events', async (req, res) => {
  try {
    if (!currentCalendarSync) {
      currentCalendarSync = new CalendarSyncService(oauth2Client);
    }

    const events = await currentCalendarSync.getEvents();
    res.json(events);
  } catch (error) {
    console.error('Calendar events error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Enhanced calibration with AI insights
app.post('/api/calibrate/analyze', async (req, res) => {
  try {
    console.log('🧠 Starting enhanced calibration analysis...');
    
    // Get Gmail data
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const messagesResponse = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 100
    });

    // Get Calendar data
    let calendarEvents = [];
    if (currentCalendarSync) {
      calendarEvents = await currentCalendarSync.getEvents();
    }

    // Enhanced analysis combining Gmail + Calendar
    const analysis = {
      emailCount: messagesResponse.data.messages?.length || 0,
      calendarEvents: calendarEvents.length,
      integration: {
        gmail: true,
        calendar: true,
        bidirectionalSync: !!currentCalendarSync
      },
      insights: {
        productivity: calculateProductivityScore(messagesResponse.data.messages, calendarEvents),
        timeManagement: analyzeTimePatterns(calendarEvents),
        communication: analyzeEmailPatterns(messagesResponse.data.messages)
      },
      recommendations: generateRecommendations(messagesResponse.data.messages, calendarEvents)
    };

    console.log('✅ Enhanced calibration complete');
    res.json(analysis);
  } catch (error) {
    console.error('Calibration error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper functions for enhanced analysis
function calculateProductivityScore(emails, events) {
  // Simple productivity score based on email/calendar activity
  const emailScore = Math.min((emails?.length || 0) / 10, 10);
  const calendarScore = Math.min(events.length / 5, 10);
  return Math.round((emailScore + calendarScore) / 2);
}

function analyzeTimePatterns(events) {
  if (!events || events.length === 0) return { pattern: 'insufficient_data' };
  
  const hours = events.map(event => {
    if (event.startTime) {
      return new Date(event.startTime).getHours();
    }
    return null;
  }).filter(h => h !== null);
  
  const averageHour = hours.reduce((sum, h) => sum + h, 0) / hours.length;
  
  if (averageHour < 10) return { pattern: 'early_bird', score: 8 };
  if (averageHour > 15) return { pattern: 'afternoon_focused', score: 7 };
  return { pattern: 'balanced', score: 9 };
}

function analyzeEmailPatterns(emails) {
  return {
    volume: emails?.length || 0,
    pattern: emails?.length > 50 ? 'high_volume' : 'moderate_volume',
    score: Math.min((emails?.length || 0) / 10, 10)
  };
}

function generateRecommendations(emails, events) {
  const recommendations = [];
  
  if ((emails?.length || 0) > 100) {
    recommendations.push('Consider using email filters to manage high volume');
  }
  
  if (events.length > 10) {
    recommendations.push('Your calendar is well-organized! Keep up the good time management.');
  } else if (events.length < 3) {
    recommendations.push('Try adding more structure to your schedule with calendar events');
  }
  
  recommendations.push('HomeOps will help optimize your email-calendar workflow');
  
  return recommendations;
}

// Error page
app.get('/auth/error', (req, res) => {
  const { message } = req.query;
  res.send(`
    <html>
      <head><title>OAuth Error</title></head>
      <body style="font-family: sans-serif; padding: 50px; text-align: center;">
        <h1>🚨 Authentication Error</h1>
        <p>There was an error during the OAuth process:</p>
        <p><strong>${message || 'Unknown error'}</strong></p>
        <p><a href="/landing.html">← Back to Landing</a></p>
      </body>
    </html>
  `);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Enhanced HomeOps Onboarding Server running on http://localhost:${PORT}`);
  console.log(`📧🗓️ Google Services: Gmail + Calendar Integration`);
  console.log(`🎯 Enhanced Onboarding Flow:`);
  console.log(`   1. Landing: http://localhost:${PORT}/landing.html`);
  console.log(`   2. Google OAuth: http://localhost:${PORT}/auth/google`);
  console.log(`   3. Scan: http://localhost:${PORT}/scan`);
  console.log(`   4. Calibrate: http://localhost:${PORT}/calibrate`);
  console.log(`   5. Main App: http://localhost:${PORT}/app`);
  console.log(`🔗 API Endpoints:`);
  console.log(`   GET  /api/auth/status - Check authentication`);
  console.log(`   GET  /api/gmail/* - Gmail API endpoints`);
  console.log(`   POST /api/calendar/sync - Calendar sync`);
  console.log(`   POST /api/calibrate/analyze - Enhanced analysis`);
});
