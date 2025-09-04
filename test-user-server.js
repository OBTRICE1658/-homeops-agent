#!/usr/bin/env node

/**
 * HomeOps User Management Test Server
 * 
 * A minimal server for testing user management functionality
 * without complex dependencies.
 */

const express = require('express');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory user storage for testing
const userProfiles = new Map();

// User utility functions
function generateUserId(email) {
  return Buffer.from(email.toLowerCase()).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
}

function createNewUserProfile(userId, userData) {
  return {
    id: userId,
    name: userData.name || 'User',
    email: userData.email,
    preferences: {
      primaryFocus: 'family',
      emailBatching: true,
      notifications: {
        urgent: true,
        daily: true,
        weekly: false
      },
      insights: {
        aiGenerated: true,
        contextual: true,
        predictive: false
      }
    },
    mentalLoad: {
      currentScore: 65,
      trend: 'stable',
      history: []
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  };
}

function getUserProfile(userId) {
  return userProfiles.get(userId);
}

// Routes
app.get('/', (req, res) => {
  res.send(`
    <h1>HomeOps User Management Test Server</h1>
    <p>Available endpoints:</p>
    <ul>
      <li><a href="/admin">Admin Interface</a> - Web-based user management</li>
      <li><a href="/api/users">List Users (JSON)</a></li>
      <li>POST /api/user/login - Create/login user</li>
      <li>POST /api/user/preferences - Update preferences</li>
    </ul>
  `);
});

// Admin interface
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin-users.html'));
});

// User login/creation
app.post('/api/user/login', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }
    
    const userId = generateUserId(email);
    let profile = getUserProfile(userId);
    
    if (!profile) {
      profile = createNewUserProfile(userId, { email, name });
      userProfiles.set(userId, profile);
      console.log(`✅ Created new user: ${email} (${userId})`);
    } else {
      profile.lastLogin = new Date().toISOString();
      userProfiles.set(userId, profile);
      console.log(`🔄 User logged in: ${email} (${userId})`);
    }
    
    res.json({ 
      success: true, 
      userId, 
      profile: {
        name: profile.name,
        email: profile.email,
        preferences: profile.preferences,
        lastLogin: profile.lastLogin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update user preferences
app.post('/api/user/preferences', async (req, res) => {
  try {
    const { userId, preferences } = req.body;
    
    if (!userId || !preferences) {
      return res.status(400).json({ success: false, error: 'Missing userId or preferences' });
    }
    
    const profile = getUserProfile(userId);
    if (!profile) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    profile.preferences = { ...profile.preferences, ...preferences };
    profile.updatedAt = new Date().toISOString();
    userProfiles.set(userId, profile);
    
    res.json({ success: true, preferences: profile.preferences });
  } catch (error) {
    console.error('Preferences update error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// List all users (for admin interface)
app.get('/api/users', (req, res) => {
  try {
    const users = Array.from(userProfiles.values()).map(profile => ({
      id: profile.id,
      name: profile.name,
      email: profile.email,
      createdAt: profile.createdAt,
      lastLogin: profile.lastLogin,
      primaryFocus: profile.preferences.primaryFocus
    }));
    
    res.json({ success: true, users, count: users.length });
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Dashboard summary (simplified)
app.get('/api/dashboard-summary', (req, res) => {
  const userId = req.query.userId || 'default';
  const profile = getUserProfile(userId);
  
  res.json({
    success: true,
    summary: {
      urgent: 3,
      events: 2,
      commerce: 1,
      insights: 5
    },
    userId,
    userExists: !!profile
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 HomeOps User Management Test Server running on http://localhost:${PORT}`);
  console.log(`📊 Admin interface: http://localhost:${PORT}/admin`);
  console.log(`📝 API documentation: http://localhost:${PORT}/`);
});

module.exports = app;