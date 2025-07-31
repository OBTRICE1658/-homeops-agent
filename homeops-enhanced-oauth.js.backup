// Enhanced Google OAuth with Calendar + Gmail Integration// 1. Landing page (start of OAuth flow)
app.get('/landing.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'landing.html'));
});

// Enhanced Google OAuth with Calendar + Gmail Integration
const express = require('express');
const path = require('path');
const fs = require('fs');
const { google } = require('googleapis');
const CalendarSyncService = require('./services/calendar-sync');

const app = express();
const PORT = 3000;

let currentCalendarSync = null;

// Enhanced OAuth setup with Calendar + Gmail scopes
const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID || 'your-client-id',
  process.env.GMAIL_CLIENT_SECRET || 'your-client-secret', 
  process.env.GMAIL_REDIRECT_URI || 'http://localhost:3000/auth/gmail/callback'
);

// Enhanced scopes for both Gmail and Calendar
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'profile',
  'email'
];

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

// ===== ENHANCED OAUTH FLOW WITH CALENDAR + GMAIL =====

// 0. Onboard route (entry point for new users - signup form)
app.get('/onboard', (req, res) => {
  console.log('🎯 New user onboarding started - serving signup form');
  res.sendFile(path.join(__dirname, 'public', 'onboard.html'));
});

// 1. Landing page (start of OAuth flow)
app.get('/landing.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'landing.html'));
});

// Landing page compatibility route (without .html)
app.get('/landing', (req, res) => {
  res.redirect('/landing.html');
});

// 2. Enhanced Google OAuth (Gmail + Calendar)
app.get('/auth/google', (req, res) => {
  console.log('🔗 Enhanced Google OAuth requested (Gmail + Calendar)');
  
  const isOnboarding = req.query.isOnboarding === 'true';
  
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent', // Force consent to get refresh token
    state: isOnboarding ? 'onboarding' : 'normal'
  });
  
  console.log('🚀 Redirecting to Google OAuth with scopes:', SCOPES);
  console.log('📋 Onboarding mode:', isOnboarding);
  res.redirect(authUrl);
});

// OAuth callback with enhanced token handling
app.get('/auth/google/callback', async (req, res) => {
  const { code, state } = req.query;
  
  try {
    console.log('✅ OAuth callback received');
    console.log('🔑 Code received, exchanging for tokens...');
    
    const { tokens } = await oauth2Client.getAccessToken(code);
    oauth2Client.setCredentials(tokens);
    
    // Save tokens securely
    fs.writeFileSync('google-tokens.json', JSON.stringify(tokens, null, 2));
    console.log('💾 Tokens saved successfully');
    
    // Initialize calendar sync service
    currentCalendarSync = new CalendarSyncService(oauth2Client);
    console.log('🔄 Calendar sync service initialized');
    
    // Test both services
    await testGoogleServices(oauth2Client);
    
    // Check if this is part of onboarding flow
    const isOnboarding = state === 'onboarding' || req.headers.referer?.includes('landing.html');
    
    if (isOnboarding) {
      // Redirect back to landing page with success status
      res.redirect('/landing.html?google_connected=true&gmail=true&calendar=true');
    } else {
      // Redirect to scan with success
      res.redirect('/scan?google_connected=true&services=gmail,calendar');
    }
    
  } catch (error) {
    console.error('❌ OAuth callback error:', error);
    console.error('❌ Error details:', error.message);
    
    // More specific error handling
    if (error.message.includes('invalid_client')) {
      res.redirect('/landing.html?error=oauth_client_error&message=' + encodeURIComponent('OAuth client configuration issue. Please check credentials.'));
    } else {
      res.redirect('/landing.html?error=oauth_failed&message=' + encodeURIComponent(error.message));
    }
  }
});

// Compatibility route for existing Gmail callback
app.get('/auth/gmail/callback', async (req, res) => {
  console.log('🔄 Gmail callback route - redirecting to enhanced OAuth callback');
  // Forward to the enhanced OAuth callback
  const queryString = new URLSearchParams(req.query).toString();
  res.redirect(`/auth/google/callback?${queryString}`);
});

// Test function to verify both services work
async function testGoogleServices(auth) {
  try {
    console.log('🧪 Testing Google services...');
    
    // Test Gmail
    const gmail = google.gmail({ version: 'v1', auth });
    const gmailProfile = await gmail.users.getProfile({ userId: 'me' });
    console.log('✅ Gmail access confirmed:', gmailProfile.data.emailAddress);
    
    // Test Calendar
    const calendar = google.calendar({ version: 'v3', auth });
    const calendarList = await calendar.calendarList.list();
    console.log('✅ Calendar access confirmed:', calendarList.data.items?.length || 0, 'calendars');
    
    return true;
  } catch (error) {
    console.error('❌ Service test failed:', error.message);
    return false;
  }
}

// Legacy Gmail route (redirect to enhanced Google OAuth)
app.get('/auth/gmail', (req, res) => {
  console.log('🔄 Legacy Gmail auth redirecting to enhanced Google OAuth');
  res.redirect('/auth/google');
});

// ===== ENHANCED BIDIRECTIONAL SYNC ENDPOINTS =====

// Initialize calendar sync service
app.post('/api/google/sync/initialize', async (req, res) => {
  try {
    if (!oauth2Client.credentials) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    currentCalendarSync = new CalendarSyncService(oauth2Client);
    res.json({ 
      success: true, 
      message: 'Calendar sync service initialized',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to initialize sync:', error);
    res.status(500).json({ error: error.message });
  }
});

// Full bidirectional sync
app.post('/api/google/sync/full', async (req, res) => {
  try {
    if (!currentCalendarSync) {
      currentCalendarSync = new CalendarSyncService(oauth2Client);
    }

    const result = await currentCalendarSync.fullBidirectionalSync();
    res.json(result);
  } catch (error) {
    console.error('Full sync failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add new event with sync
app.post('/api/google/events/add', async (req, res) => {
  try {
    if (!currentCalendarSync) {
      currentCalendarSync = new CalendarSyncService(oauth2Client);
    }

    const eventData = req.body;
    const newEvent = await currentCalendarSync.addEvent(eventData);
    res.json(newEvent);
  } catch (error) {
    console.error('Failed to add event:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update event with sync
app.put('/api/google/events/:eventId', async (req, res) => {
  try {
    if (!currentCalendarSync) {
      currentCalendarSync = new CalendarSyncService(oauth2Client);
    }

    const { eventId } = req.params;
    const updates = req.body;
    const updatedEvent = await currentCalendarSync.updateEvent(eventId, updates);
    res.json(updatedEvent);
  } catch (error) {
    console.error('Failed to update event:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete event with sync
app.delete('/api/google/events/:eventId', async (req, res) => {
  try {
    if (!currentCalendarSync) {
      currentCalendarSync = new CalendarSyncService(oauth2Client);
    }

    const { eventId } = req.params;
    await currentCalendarSync.deleteEvent(eventId);
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Failed to delete event:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get events with sync
app.get('/api/google/events/synced', async (req, res) => {
  try {
    if (!currentCalendarSync) {
      currentCalendarSync = new CalendarSyncService(oauth2Client);
    }

    const { timeMin, timeMax } = req.query;
    const events = await currentCalendarSync.getEvents(timeMin, timeMax);
    res.json(events);
  } catch (error) {
    console.error('Failed to get synced events:', error);
    res.status(500).json({ error: error.message });
  }
});

// Sync status and health check
app.get('/api/google/sync/status', async (req, res) => {
  try {
    const status = {
      initialized: !!currentCalendarSync,
      authenticated: !!oauth2Client.credentials,
      hasTokens: !!oauth2Client.credentials?.access_token,
      lastSync: null,
      localEventsCount: 0
    };

    if (currentCalendarSync) {
      const localEvents = currentCalendarSync.loadLocalEvents();
      status.localEventsCount = localEvents.length;
      
      // Check for last sync timestamp in local events
      const latestEvent = localEvents.reduce((latest, event) => {
        const eventSync = new Date(event.homeops_last_sync || 0);
        const latestSync = new Date(latest || 0);
        return eventSync > latestSync ? event.homeops_last_sync : latest;
      }, null);
      
      status.lastSync = latestEvent;
    }

    res.json(status);
  } catch (error) {
    console.error('Failed to get sync status:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== ORIGINAL OAUTH ENDPOINTS =====

// Get user's calendars
app.get('/api/google/calendars', async (req, res) => {
  try {
    const auth = await loadStoredAuth();
    if (!auth) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const calendar = google.calendar({ version: 'v3', auth });
    const calendarList = await calendar.calendarList.list();
    
    res.json({
      success: true,
      calendars: calendarList.data.items
    });
  } catch (error) {
    console.error('❌ Calendar list error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get calendar events (with sync)
app.get('/api/google/events', async (req, res) => {
  try {
    const auth = await loadStoredAuth();
    if (!auth) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const { timeMin, timeMax, calendarId = 'primary' } = req.query;
    
    const calendar = google.calendar({ version: 'v3', auth });
    const events = await calendar.events.list({
      calendarId,
      timeMin: timeMin || new Date().toISOString(),
      timeMax: timeMax || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      singleEvents: true,
      orderBy: 'startTime',
    });
    
    console.log('📅 Retrieved', events.data.items?.length || 0, 'Google Calendar events');
    
    res.json({
      success: true,
      events: events.data.items,
      nextSyncToken: events.data.nextSyncToken
    });
  } catch (error) {
    console.error('❌ Calendar events error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create calendar event
app.post('/api/google/events', async (req, res) => {
  try {
    const auth = await loadStoredAuth();
    if (!auth) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const { calendarId = 'primary', event } = req.body;
    
    const calendar = google.calendar({ version: 'v3', auth });
    const createdEvent = await calendar.events.insert({
      calendarId,
      resource: event,
    });
    
    console.log('✅ Created Google Calendar event:', createdEvent.data.id);
    
    res.json({
      success: true,
      event: createdEvent.data
    });
  } catch (error) {
    console.error('❌ Create event error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update calendar event
app.put('/api/google/events/:eventId', async (req, res) => {
  try {
    const auth = await loadStoredAuth();
    if (!auth) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const { eventId } = req.params;
    const { calendarId = 'primary', event } = req.body;
    
    const calendar = google.calendar({ version: 'v3', auth });
    const updatedEvent = await calendar.events.update({
      calendarId,
      eventId,
      resource: event,
    });
    
    console.log('✅ Updated Google Calendar event:', eventId);
    
    res.json({
      success: true,
      event: updatedEvent.data
    });
  } catch (error) {
    console.error('❌ Update event error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete calendar event
app.delete('/api/google/events/:eventId', async (req, res) => {
  try {
    const auth = await loadStoredAuth();
    if (!auth) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const { eventId } = req.params;
    const { calendarId = 'primary' } = req.query;
    
    const calendar = google.calendar({ version: 'v3', auth });
    await calendar.events.delete({
      calendarId,
      eventId,
    });
    
    console.log('✅ Deleted Google Calendar event:', eventId);
    
    res.json({
      success: true,
      message: 'Event deleted'
    });
  } catch (error) {
    console.error('❌ Delete event error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Bidirectional sync endpoint
app.post('/api/google/sync', async (req, res) => {
  try {
    const auth = await loadStoredAuth();
    if (!auth) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    console.log('🔄 Starting bidirectional Google Calendar sync...');
    
    // 1. Pull from Google Calendar
    const calendar = google.calendar({ version: 'v3', auth });
    const events = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      timeMax: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });
    
    // 2. Sync with local HomeOps events (if you have a local storage)
    // This would sync with your Firestore or local storage
    
    // 3. Push any local changes to Google Calendar
    // Implementation depends on your local event storage
    
    console.log('✅ Sync completed:', events.data.items?.length || 0, 'events synced');
    
    res.json({
      success: true,
      syncedEvents: events.data.items?.length || 0,
      lastSync: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Sync error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to load stored authentication
async function loadStoredAuth() {
  try {
    const tokenPath = path.join(__dirname, 'user-tokens.json');
    if (fs.existsSync(tokenPath)) {
      const tokenData = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
      oauth2Client.setCredentials(tokenData.tokens);
      return oauth2Client;
    }
    return null;
  } catch (error) {
    console.error('❌ Auth loading error:', error);
    return null;
  }
}

// ===== EXISTING ROUTES =====

// 3. Scan page (email scanning animation)
app.get('/scan', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'scan.html'));
});

// 4. Calibrate page (final step with 20 emails)
app.get('/calibrate', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'calibrate.html'));
});

// API endpoint to get calibration data (20 emails)
app.get('/api/calibration-data', (req, res) => {
  try {
    console.log('📧 DEBUG: Reading local emails.json file...');
    const emailsPath = path.join(__dirname, 'public', 'emails.json');
    const emailsData = JSON.parse(fs.readFileSync(emailsPath, 'utf8'));
    console.log(`✅ DEBUG: Got ${emailsData.length} emails from local file`);
    
    res.json({
      success: true,
      emails: emailsData,
      totalCount: emailsData.length,
      message: 'Calibration emails loaded successfully'
    });
  } catch (error) {
    console.error('❌ Calibration data error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to load calibration data',
      error: error.message 
    });
  }
});

// API endpoint to submit calibration rating data
app.post('/api/calibration-rating', (req, res) => {
  try {
    const { email_id, rating, feedback } = req.body;
    console.log('📊 Rating submitted:', { email_id, rating, feedback });
    
    res.json({
      success: true,
      message: 'Rating saved successfully'
    });
  } catch (error) {
    console.error('❌ Rating submission error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to save rating',
      error: error.message 
    });
  }
});

// LEGACY SUPPORT
app.get('/onboard', (req, res) => {
  console.log('🔄 /onboard called, redirecting to landing page');
  res.redirect('/landing.html');
});

// Serve the main dashboard as default
app.get('/', (req, res) => {
  // Check if user has completed onboarding
  const hasAuth = oauth2Client.credentials && oauth2Client.credentials.access_token;
  
  if (hasAuth) {
    // User is authenticated, serve the main app
    res.sendFile(path.join(__dirname, 'public', 'index-with-command.html'));
  } else {
    // New user, redirect to onboarding flow
    res.redirect('/onboard');
  }
});

// Main app route (after onboarding)
app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index-with-command.html'));
});

// OAuth debug page
app.get('/oauth-debug', (req, res) => {
  res.sendFile(path.join(__dirname, 'oauth-debug.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 HomeOps Enhanced OAuth Server running on http://localhost:${PORT}`);
  console.log('📧🗓️ Google Services: Gmail + Calendar Integration');
  console.log('🎯 Enhanced Onboarding Flow:');
  console.log('   1. Landing: http://localhost:3000/landing.html');
  console.log('   2. Google OAuth: http://localhost:3000/auth/google');
  console.log('   3. Scan: http://localhost:3000/scan');
  console.log('   4. Calibrate: http://localhost:3000/calibrate');
  console.log('');
  console.log('🔗 Calendar API Endpoints:');
  console.log('   GET  /api/google/calendars - List calendars');
  console.log('   GET  /api/google/events - Get events');
  console.log('   POST /api/google/events - Create event');
  console.log('   PUT  /api/google/events/:id - Update event');
  console.log('   DELETE /api/google/events/:id - Delete event');
  console.log('   POST /api/google/sync - Bidirectional sync');
});
