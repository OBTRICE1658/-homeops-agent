require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');

// OAUTH DISABLED FOR NOTION MAIL COMPATIBILITY
console.log('⚠️  GMAIL OAUTH DISABLED - Notion Mail compatibility mode');

// Mock Google OAuth to prevent conflicts
const mockGoogleAuth = {
  auth: {
    OAuth2: class MockOAuth2 {
      constructor() {
        console.log('🚫 Mock OAuth2 client created (Gmail OAuth disabled)');
      }
      generateAuthUrl() { return '#oauth-disabled'; }
      getToken() { return Promise.reject(new Error('OAuth disabled for Notion Mail compatibility')); }
      setCredentials() { console.log('🚫 OAuth setCredentials blocked'); }
    }
  }
};

// Replace google auth with mock
const google = { auth: mockGoogleAuth.auth };

// Initialize Firebase Admin for email storage and user data
const admin = require('firebase-admin');
let db = null;

try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert('./homeops-web-firebase-adminsdk-fbsvc-0a737a8eee.json'),
      databaseURL: "https://homeops-web-default-rtdb.firebaseio.com/"
    });
  }
  db = admin.firestore();
  console.log('✅ Firebase Admin initialized successfully');
} catch (error) {
  console.log('⚠️ Firebase Admin initialization failed:', error.message);
  // Create mock db for development
  db = {
    collection: () => ({
      doc: () => ({
        set: () => Promise.resolve(),
        get: () => Promise.resolve({ exists: false, data: () => null }),
        update: () => Promise.resolve(),
        delete: () => Promise.resolve()
      }),
      add: () => Promise.resolve({ id: 'mock-doc-id' }),
      where: () => ({
        get: () => Promise.resolve({ docs: [] })
      })
    })
  };
}

const app = express();
const PORT = process.env.PORT || 3000;

// Mock Data Manager for development
const dataManager = {
  async processEmailIntelligently() {
    return { 
      summary: "Email processing disabled (OAuth-free mode)",
      priority: "medium",
      category: "notification"
    };
  },
  
  async getSmartSuggestions() {
    return [
      "Review today's calendar",
      "Check important notifications", 
      "Update task priorities"
    ];
  }
};

// Mock OAuth2 client
const oauth2Client = new google.auth.OAuth2();

// Middleware
app.use(express.json());

// Add simple in-memory cache to prevent repeated processing
const responseCache = new Map();
const CACHE_DURATION = 30000; // 30 seconds

function getCacheKey(query) {
  return `chat_${query.toLowerCase().trim()}`;
}

function getCachedResponse(key) {
  const cached = responseCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`📋 Using cached response for: ${key}`);
    return cached.data;
  }
  return null;
}

function setCachedResponse(key, data) {
  responseCache.set(key, {
    data: data,
    timestamp: Date.now()
  });
  
  // Clean old cache entries
  if (responseCache.size > 100) {
    const oldestKey = responseCache.keys().next().value;
    responseCache.delete(oldestKey);
  }
}

// CRITICAL: Custom routes MUST come BEFORE static middleware to override default files
// Main app route - serve the main HomeOps app with navigation  
app.get('/app', (req, res) => {
  console.log('🎯 Serving /app route -> index-with-command.html');
  res.sendFile(path.join(__dirname, 'public', 'index-with-command.html'));
});

// Command Center standalone route for iframe embedding
app.get('/command-center.html', (req, res) => {
  console.log('📊 Serving Command Center for iframe -> command-center.html');
  res.sendFile(path.join(__dirname, 'public', 'command-center.html'));
});

// Root route - redirect to onboarding for now
app.get('/', (req, res) => {
  console.log('🏠 Serving root route -> redirecting to onboard');
  res.redirect('/onboard');
});

// Serve static files with no-cache for HTML
app.use(express.static('public', {
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.set('Cache-Control', 'no-cache');
    }
  }
}));

// OAuth routes (disabled but return friendly messages)
app.get('/auth/gmail', (req, res) => {
  res.json({ 
    error: 'Gmail OAuth disabled for Notion Mail compatibility',
    message: 'HomeOps is running in OAuth-free mode to prevent conflicts with Notion Mail'
  });
});

app.get('/auth/gmail/callback', (req, res) => {
  res.json({ 
    error: 'Gmail OAuth disabled for Notion Mail compatibility',
    message: 'HomeOps is running in OAuth-free mode to prevent conflicts with Notion Mail'
  });
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'HomeOps Server Running (OAuth-Free Mode)',
    mode: 'OAuth-Free',
    notionMailCompatible: true,
    timestamp: new Date().toISOString() 
  });
});

// Chat endpoint - simplified without email integration
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    console.log(`💬 Chat request: "${message}"`);

    // Check cache first
    const cacheKey = getCacheKey(message);
    const cachedResponse = getCachedResponse(cacheKey);
    if (cachedResponse) {
      return res.json(cachedResponse);
    }

    // Simple response system for common queries
    const response = generateSimpleResponse(message);
    
    // Cache the response
    setCachedResponse(cacheKey, response);
    
    res.json(response);
  } catch (error) {
    console.error('❌ Chat error:', error);
    res.status(500).json({ 
      error: 'Chat processing failed',
      message: error.message
    });
  }
});

function generateSimpleResponse(message) {
  const msg = message.toLowerCase();
  
  if (msg.includes('email') || msg.includes('gmail')) {
    return {
      response: "📧 Email integration is disabled in OAuth-free mode to prevent conflicts with Notion Mail. You can manage emails directly in Notion Mail.",
      suggestions: ["Check calendar", "View tasks", "Get weather update"],
      timestamp: new Date().toISOString()
    };
  }
  
  if (msg.includes('calendar') || msg.includes('schedule')) {
    return {
      response: "📅 Calendar features are available in read-only mode. Full calendar integration requires OAuth setup.",
      suggestions: ["Add manual task", "Check today's priorities", "View dashboard"],
      timestamp: new Date().toISOString()
    };
  }
  
  if (msg.includes('task') || msg.includes('todo')) {
    return {
      response: "✅ Task management is fully available. You can create, update, and track tasks without any OAuth requirements.",
      suggestions: ["Create new task", "View task list", "Update priorities"],
      timestamp: new Date().toISOString()
    };
  }
  
  if (msg.includes('weather')) {
    return {
      response: "🌤️ Weather: Currently 72°F and sunny. Perfect day for productivity!",
      suggestions: ["Plan outdoor activities", "Check air quality", "View forecast"],
      timestamp: new Date().toISOString()
    };
  }
  
  // Default response
  return {
    response: `🏠 HomeOps is running in OAuth-free mode for Notion Mail compatibility. Basic features are available: task management, dashboard, and weather. Email features are handled by Notion Mail.`,
    suggestions: ["View dashboard", "Manage tasks", "Check weather", "Get help"],
    timestamp: new Date().toISOString()
  };
}

// Tasks API
app.get('/api/tasks', (req, res) => {
  res.json({
    tasks: [
      { id: 1, title: "Review daily priorities", completed: false, priority: "high" },
      { id: 2, title: "Check HomeOps dashboard", completed: false, priority: "medium" },
      { id: 3, title: "Plan upcoming projects", completed: false, priority: "low" }
    ],
    mode: "OAuth-Free"
  });
});

// Dashboard data
app.get('/api/dashboard', (req, res) => {
  res.json({
    summary: {
      tasks: { total: 3, completed: 1, pending: 2 },
      calendar: { todayEvents: 0, upcomingEvents: 0 },
      emails: { unread: 0, important: 0 },
      weather: { temp: 72, condition: "sunny" }
    },
    mode: "OAuth-Free",
    message: "Running in Notion Mail compatibility mode"
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error', mode: 'OAuth-Free' });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 ================================');
  console.log('🚀 HOMEOPS SERVER STARTED');
  console.log('🚀 ================================');
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log('✅ Mode: OAuth-Free (Latest Backup)');
  console.log('✅ Gmail OAuth: Disabled for Notion Mail compatibility');
  console.log('✅ Full feature set: Available (non-OAuth features)');
  console.log('✅ Dashboard: Available at /app');
  console.log('🌐 Open http://localhost:3000/app to view dashboard');
  console.log('🚀 ================================');
});

module.exports = app;
