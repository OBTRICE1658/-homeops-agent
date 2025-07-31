const express = require('express');
const path = require('path');
const fs = require('fs');
const { google } = require('googleapis');

// Load environment variables
require('dotenv').config();

const app = express();
const PORT = 3000;

// Debug: Log OAuth configuration
console.log('🔧 OAuth Configuration:');
console.log('   Client ID:', process.env.GMAIL_CLIENT_ID ? process.env.GMAIL_CLIENT_ID.substring(0, 20) + '...' : 'NOT SET');
console.log('   Client Secret:', process.env.GMAIL_CLIENT_SECRET ? 'SET (' + process.env.GMAIL_CLIENT_SECRET.substring(0, 10) + '...)' : 'NOT SET');
console.log('   Redirect URI:', process.env.GMAIL_REDIRECT_URI || 'NOT SET');

// Gmail OAuth setup (using real environment variables)
const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET, 
  process.env.GMAIL_REDIRECT_URI
);

// Load existing tokens if they exist
try {
  if (fs.existsSync('google-tokens.json')) {
    const tokens = JSON.parse(fs.readFileSync('google-tokens.json', 'utf8'));
    oauth2Client.setCredentials(tokens);
    console.log('🔑 Loaded existing Google OAuth tokens');
  }
} catch (error) {
  console.log('ℹ️ No existing tokens found, will need fresh OAuth');
}

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

// Helper function to get lucide icon name for categories
function getLucideIcon(category) {
  const iconMap = {
    'School': 'graduation-cap',
    'Medical': 'heart-pulse', 
    'Work': 'briefcase',
    'Family': 'users',
    'Commerce': 'shopping-bag',
    'Shopping': 'shopping-bag', // fallback for old category
    'Social': 'users-2',
    'Newsletter': 'newspaper',
    'Finance': 'dollar-sign',
    'Travel': 'plane',
    'Other': 'mail'
  };
  return iconMap[category] || 'mail';
}

// ORIGINAL ONBOARDING FLOW ROUTES

// 0. Onboard route (entry point for new users - signup form)
app.get('/onboard', (req, res) => {
  console.log('🎯 New user onboarding started - serving signup form');
  res.sendFile(path.join(__dirname, 'public', 'onboard.html'));
});

// 1. Landing page (start of flow)
app.get('/landing.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'landing.html'));
});

// Landing page compatibility route (without .html)
app.get('/landing', (req, res) => {
  res.redirect('/landing.html');
});

// 2. Real Gmail OAuth (from landing page)
app.get('/auth/gmail', (req, res) => {
  console.log('🔗 Real Gmail + Calendar OAuth requested');
  
  // Debug: Check if client is properly configured
  console.log('🔧 OAuth Client Config Check:');
  console.log('   Client ID set:', !!oauth2Client._clientId);
  console.log('   Client Secret set:', !!oauth2Client._clientSecret);
  console.log('   Redirect URI set:', !!oauth2Client._clientId);
  console.log('   Full Client ID:', oauth2Client._clientId);
  
  const scopes = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
  ];
  
  try {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
    
    console.log('🚀 Generated OAuth URL:', authUrl);
    console.log('🚀 Redirecting to Google OAuth (Gmail + Calendar)...');
    res.redirect(authUrl);
  } catch (error) {
    console.error('❌ Error generating OAuth URL:', error);
    res.status(500).send('OAuth configuration error: ' + error.message);
  }
});

// Enhanced Google OAuth route (compatibility with landing page)
app.get('/auth/google', (req, res) => {
  console.log('🔗 Enhanced Google OAuth requested');
  console.log('🔄 Redirecting to Gmail OAuth');
  // Redirect to the Gmail OAuth route
  res.redirect('/auth/gmail');
});

app.get('/auth/gmail/callback', async (req, res) => {
  const { code } = req.query;
  
  try {
    console.log('✅ Real Gmail OAuth callback received');
    console.log('🔑 Code received, exchanging for tokens...');
    
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    
    // Save tokens securely
    fs.writeFileSync('google-tokens.json', JSON.stringify(tokens, null, 2));
    console.log('💾 Tokens saved successfully');
    
    // Get user info
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    console.log('👤 User authenticated:', userInfo.data.email);
    
    // Redirect to scan with real OAuth success
    res.redirect('/scan?gmail_connected=true&real_oauth=true&email=' + encodeURIComponent(userInfo.data.email));
    
  } catch (error) {
    console.error('❌ OAuth callback error:', error);
    res.redirect('/landing.html?error=oauth_failed&message=' + encodeURIComponent(error.message));
  }
});

// 3. Scan page (email scanning animation)
app.get('/scan', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'scan.html'));
});

// 4. Calibrate page (final step with 20 emails) - MAIN ENHANCED VERSION
app.get('/calibrate', (req, res) => {
  console.log('🎯 Serving MAIN calibrate.html with AI summaries and mental load features');
  res.sendFile(path.join(__dirname, 'public', 'calibrate.html'));
});

// 4b. Fresh calibrate page (cache-busting version)
app.get('/calibrate-fresh', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'calibrate.html'));
});

// 4c. Enhanced calibrate page (v3 - completely fresh)
app.get('/calibrate-v3', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'calibrate-v3.html'));
});

// 4d. NEW calibrate page (completely fresh new file)
app.get('/calibrate-new', (req, res) => {
  console.log('🚀 Serving BRAND NEW calibrate-new.html page');
  res.sendFile(path.join(__dirname, 'public', 'calibrate-new.html'));
});

// API endpoint to get calibration data (real Gmail emails or fallback to dummy)
app.get('/api/calibration-data', async (req, res) => {
  try {
    console.log('📧 Getting calibration data...');
    
    // Check if we have real OAuth tokens
    if (oauth2Client.credentials && oauth2Client.credentials.access_token) {
      console.log('🔑 Using real Gmail OAuth to fetch emails');
      
      try {
        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
        
        // Get list of messages (last 20)
        const messagesResponse = await gmail.users.messages.list({
          userId: 'me',
          maxResults: 20,
          q: 'in:inbox'
        });
        
        if (messagesResponse.data.messages) {
          const emails = [];
          
          // Fetch details for each message
          for (let i = 0; i < Math.min(messagesResponse.data.messages.length, 20); i++) {
            const messageId = messagesResponse.data.messages[i].id;
            const messageResponse = await gmail.users.messages.get({
              userId: 'me',
              id: messageId
            });
            
            const message = messageResponse.data;
            const headers = message.payload.headers;
            
            // Extract email details
            const fromHeader = headers.find(h => h.name === 'From');
            const subjectHeader = headers.find(h => h.name === 'Subject');
            const dateHeader = headers.find(h => h.name === 'Date');
            
            // Generate AI summary and categorization
            const emailContent = `${subjectHeader?.value || 'No Subject'} ${message.snippet || ''}`;
            const aiSummary = generateAISummary(emailContent);
            const category = categorizeEmail(emailContent, fromHeader?.value || '');
            const mentalLoadScore = calculateMentalLoadScore(emailContent, category);
            
            // Debug AI summary generation
            console.log(`🤖 Email content for AI processing: "${emailContent}"`);
            console.log(`🧠 Generated AI summary: "${aiSummary}"`);
            console.log(`📂 Category: "${category}"`);
            console.log(`⚖️ Mental load score: ${mentalLoadScore}`);
            
            // Parse and format date
            let formattedDate = 'Unknown Date';
            if (dateHeader?.value) {
              try {
                const emailDate = new Date(dateHeader.value);
                formattedDate = emailDate.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short', 
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit'
                });
              } catch (error) {
                formattedDate = dateHeader.value;
              }
            }
            
            // Debug logging for each email
            console.log(`📧 Processing email ${i + 1}:`, {
              subject: subjectHeader ? subjectHeader.value : 'No Subject',
              category: category,
              lucideIcon: getLucideIcon(category),
              mentalLoadScore: mentalLoadScore
            });

            emails.push({
              id: messageId,
              from: fromHeader ? fromHeader.value : 'Unknown Sender',
              subject: subjectHeader ? subjectHeader.value : 'No Subject',
              date: dateHeader ? dateHeader.value : new Date().toISOString(),
              formattedDate: formattedDate,
              snippet: message.snippet || '',
              category: category,
              categoryIcon: getCategoryIcon(category),
              lucideIcon: getLucideIcon(category),
              aiSummary: aiSummary, // Changed to camelCase
              score: mentalLoadScore, // Changed to match frontend expectation
              insight: `Mental Load Analysis: ${aiSummary}`, // Added insight field
              mental_load_score: mentalLoadScore // Keep both for compatibility
            });
          }
          
          console.log(`✅ Got ${emails.length} real Gmail emails with AI processing`);
          return res.json({
            success: true,
            emails: emails,
            totalCount: emails.length,
            message: 'Real Gmail emails with AI summaries loaded successfully',
            source: 'gmail'
          });
        }
      } catch (gmailError) {
        console.error('❌ Gmail API error:', gmailError);
        console.log('⚠️ Falling back to dummy data');
      }
    }
    
    // Fallback to dummy data
    console.log('📧 Using dummy data from emails.json');
    const emailsPath = path.join(__dirname, 'public', 'emails.json');
    const emailsData = JSON.parse(fs.readFileSync(emailsPath, 'utf8'));
    console.log(`✅ Got ${emailsData.length} emails from local file`);
    
    res.json({
      success: true,
      emails: emailsData,
      totalCount: emailsData.length,
      message: 'Dummy calibration emails loaded',
      source: 'dummy'
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

// Helper function to generate AI summary
function generateAISummary(emailContent) {
  // Enhanced AI summary generation with explanations
  const content = emailContent.toLowerCase();
  
  if (content.includes('meeting') || content.includes('call') || content.includes('zoom')) {
    return 'SURFACED: Meeting/call detected - requires calendar coordination and mental bandwidth for scheduling preparation and attendance';
  } else if (content.includes('payment') || content.includes('invoice') || content.includes('bill')) {
    return 'SURFACED: Financial obligation detected - requires immediate attention for budget planning and payment processing to avoid late fees';
  } else if (content.includes('reservation') || content.includes('booking') || content.includes('appointment')) {
    return 'SURFACED: Appointment/reservation confirmation - requires calendar entry and travel/preparation planning';
  } else if (content.includes('deadline') || content.includes('urgent') || content.includes('asap')) {
    return 'SURFACED: Time-sensitive request detected - flagged for immediate action due to urgency indicators';
  } else if (content.includes('document') || content.includes('file') || content.includes('attachment')) {
    return 'SURFACED: Document sharing detected - requires review time and potential action or response';
  } else if (content.includes('newsletter') || content.includes('update') || content.includes('announcement')) {
    return 'SURFACED: Informational content - calibrating your preference for news/update emails vs. actionable items';
  } else if (content.includes('order') || content.includes('delivery') || content.includes('shipped')) {
    return 'SURFACED: Order/delivery update - tracking family logistics and package management needs';
  } else if (content.includes('school') || content.includes('teacher') || content.includes('class')) {
    return 'SURFACED: School communication - critical for family coordination and child\'s academic support';
  } else if (content.includes('health') || content.includes('doctor') || content.includes('medical')) {
    return 'SURFACED: Healthcare-related - important for family health management and medical coordination';
  } else if (content.includes('closed') || content.includes('closure') || content.includes('cancel')) {
    return 'SURFACED: Service closure/cancellation - affects your planned activities and requires schedule adjustment';
  } else if (content.includes('golf') || content.includes('course') || content.includes('practice')) {
    return 'SURFACED: Recreational facility update - impacts leisure time planning and family activities';
  } else if (content.includes('member') || content.includes('club') || content.includes('bcc')) {
    return 'SURFACED: Membership communication - may contain important policy updates or facility changes';
  } else {
    return 'SURFACED: General communication requiring review - testing your threshold for routine vs. priority emails';
  }
}

// Helper function to categorize emails
function categorizeEmail(emailContent, fromEmail) {
  const content = emailContent.toLowerCase();
  const from = fromEmail.toLowerCase();
  
  // Commerce/Shopping brands
  const commerceBrands = [
    'fender', 'gibson', 'martin', 'taylor', 'yamaha', 'roland', 'boss', 'behringer',
    'amazon', 'ebay', 'etsy', 'target', 'walmart', 'costco', 'bestbuy', 'nike', 'adidas',
    'apple', 'samsung', 'google', 'microsoft', 'adobe', 'spotify', 'netflix', 'hulu',
    'wayfair', 'ikea', 'pottery', 'williams', 'crate', 'west elm', 'restoration',
    'macys', 'nordstrom', 'zara', 'h&m', 'gap', 'levi', 'uniqlo', 'patagonia',
    'rei', 'backcountry', 'outdoorgearlab', 'mountainhardwear', 'thenorthface',
    'sweetwater', 'guitarcenter', 'musician', 'reverb', 'thomann'
  ];
  
  // Check for commerce brands first
  for (const brand of commerceBrands) {
    if (from.includes(brand) || content.includes(brand)) {
      return 'Commerce';
    }
  }
  
  if (content.includes('school') || content.includes('university') || content.includes('education')) {
    return 'School';
  } else if (content.includes('doctor') || content.includes('medical') || content.includes('health') || content.includes('appointment')) {
    return 'Medical';
  } else if (from.includes('work') || from.includes('office') || content.includes('meeting') || content.includes('project')) {
    return 'Work';
  } else if (content.includes('family') || content.includes('mom') || content.includes('dad') || content.includes('sister') || content.includes('brother')) {
    return 'Family';
  } else if (content.includes('order') || content.includes('purchase') || content.includes('shopping') || content.includes('delivery') || content.includes('cart') || content.includes('checkout') || content.includes('sale') || content.includes('deal') || content.includes('promo')) {
    return 'Commerce';
  } else if (content.includes('newsletter') || content.includes('unsubscribe') || from.includes('no-reply')) {
    return 'Newsletter';
  } else if (content.includes('payment') || content.includes('bank') || content.includes('financial') || content.includes('invoice')) {
    return 'Finance';
  } else if (content.includes('travel') || content.includes('flight') || content.includes('hotel') || content.includes('trip')) {
    return 'Travel';
  } else if (content.includes('social') || content.includes('party') || content.includes('event') || content.includes('invitation')) {
    return 'Social';
  } else {
    return 'Other';
  }
}

// Helper function to calculate mental load score
function calculateMentalLoadScore(emailContent, category) {
  const content = emailContent.toLowerCase();
  let score = 30; // Default neutral score (30/100)
  
  // High mental load indicators
  if (content.includes('urgent') || content.includes('asap') || content.includes('deadline')) {
    score = 90;
  } else if (content.includes('meeting') || content.includes('appointment') || content.includes('schedule')) {
    score = 75;
  } else if (content.includes('payment') || content.includes('bill') || content.includes('invoice')) {
    score = 80;
  } else if (category === 'Newsletter' || content.includes('newsletter') || content.includes('unsubscribe')) {
    score = 10;
  } else if (content.includes('confirmation') || content.includes('receipt')) {
    score = 20;
  } else if (content.includes('school') || content.includes('teacher')) {
    score = 85;
  } else if (content.includes('doctor') || content.includes('medical') || content.includes('health')) {
    score = 70;
  } else if (content.includes('order') || content.includes('delivery') || content.includes('shipped')) {
    score = 35;
  } else if (content.includes('promotion') || content.includes('sale') || content.includes('deal')) {
    score = 15;
  }
  
  return score;
}

// API endpoint to submit calibration rating data
app.post('/api/calibration-rating', (req, res) => {
  try {
    const { email_id, rating, feedback, email } = req.body;
    console.log('📊 Rating submitted:', { email_id, rating, feedback });
    
    // Enhanced machine learning data storage
    const userPreference = {
      timestamp: new Date().toISOString(),
      emailId: email_id,
      rating: rating,
      feedback: feedback,
      emailData: email, // Store email context for learning
      userAgent: req.headers['user-agent'],
      sessionId: req.sessionID || 'anonymous'
    };
    
    // Store in JSON file for machine learning (in production, use a proper database)
    const preferencesPath = path.join(__dirname, 'user-preferences.json');
    let preferences = [];
    
    try {
      if (fs.existsSync(preferencesPath)) {
        preferences = JSON.parse(fs.readFileSync(preferencesPath, 'utf8'));
      }
    } catch (error) {
      console.log('🆕 Creating new preferences file');
      preferences = [];
    }
    
    preferences.push(userPreference);
    
    // Keep only last 1000 preferences to prevent file bloat
    if (preferences.length > 1000) {
      preferences = preferences.slice(-1000);
    }
    
    fs.writeFileSync(preferencesPath, JSON.stringify(preferences, null, 2));
    console.log('💾 User preference stored for machine learning');
    
    // Log learning insights
    if (email && email.category) {
      console.log(`🧠 Learning: User ${rating} emails from category "${email.category}"`);
      if (email.aiSummary) {
        console.log(`🧠 AI Summary was: "${email.aiSummary}"`);
      }
    }
    
    res.json({
      success: true,
      message: 'Rating saved successfully',
      learningEnabled: true
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

// API endpoint to get calendar events (Google Calendar integration)
app.get('/api/calendar-events', async (req, res) => {
  try {
    console.log('📅 Getting calendar events...');
    
    // Check if we have real OAuth tokens
    if (oauth2Client.credentials && oauth2Client.credentials.access_token) {
      console.log('🔑 Using real Google OAuth to fetch calendar events');
      
      try {
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
        
        // Get events from the next 30 days
        const timeMin = new Date().toISOString();
        const timeMax = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        
        const eventsResponse = await calendar.events.list({
          calendarId: 'primary',
          timeMin: timeMin,
          timeMax: timeMax,
          maxResults: 50,
          singleEvents: true,
          orderBy: 'startTime'
        });
        
        const events = eventsResponse.data.items || [];
        
        console.log(`✅ Got ${events.length} calendar events`);
        return res.json({
          success: true,
          events: events,
          totalCount: events.length,
          message: 'Calendar events loaded successfully',
          source: 'google-calendar'
        });
        
      } catch (calendarError) {
        console.error('❌ Calendar API error:', calendarError);
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch calendar events',
          error: calendarError.message
        });
      }
    } else {
      return res.status(401).json({
        success: false,
        message: 'No OAuth tokens available. Please authenticate first.',
        needsAuth: true
      });
    }
  } catch (error) {
    console.error('❌ Calendar endpoint error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to load calendar events',
      error: error.message 
    });
  }
});

// API endpoint to create calendar event
app.post('/api/calendar-events', async (req, res) => {
  try {
    const { summary, description, startTime, endTime, location } = req.body;
    console.log('📅 Creating calendar event:', { summary, startTime, endTime });
    
    if (oauth2Client.credentials && oauth2Client.credentials.access_token) {
      try {
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
        
        const event = {
          summary: summary,
          description: description,
          location: location,
          start: {
            dateTime: startTime,
            timeZone: 'America/Los_Angeles',
          },
          end: {
            dateTime: endTime,
            timeZone: 'America/Los_Angeles',
          },
        };
        
        const createdEvent = await calendar.events.insert({
          calendarId: 'primary',
          resource: event,
        });
        
        console.log('✅ Calendar event created:', createdEvent.data.id);
        return res.json({
          success: true,
          event: createdEvent.data,
          message: 'Calendar event created successfully'
        });
        
      } catch (calendarError) {
        console.error('❌ Calendar create error:', calendarError);
        return res.status(500).json({
          success: false,
          message: 'Failed to create calendar event',
          error: calendarError.message
        });
      }
    } else {
      return res.status(401).json({
        success: false,
        message: 'No OAuth tokens available. Please authenticate first.',
        needsAuth: true
      });
    }
  } catch (error) {
    console.error('❌ Calendar create endpoint error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create calendar event',
      error: error.message 
    });
  }
});

// LEGACY SUPPORT

// Support /onboard route (redirect to proper landing page)
app.get('/onboard', (req, res) => {
  console.log('🔄 /onboard called, redirecting to landing page');
  res.redirect('/landing.html');
});

// Main app route (after onboarding)
app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index-with-command.html'));
});

// Serve the main dashboard as default
app.get('/', (req, res) => {
  res.redirect('/onboard');
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 HomeOps Onboarding Server running on http://localhost:${PORT}`);
  console.log('📧 Using local emails.json for calibration data');
  console.log('🎯 Proper Onboarding Flow:');
  console.log('   1. Landing: http://localhost:3000/landing.html');
  console.log('   2. Gmail Connect: http://localhost:3000/auth/gmail');
  console.log('   3. Scan: http://localhost:3000/scan');
  console.log('   4. Calibrate: http://localhost:3000/calibrate');
});
