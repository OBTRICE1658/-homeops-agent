#!/usr/bin/env node

// Enhanced Chat Overlay System v2 (Aug 5, 2025) - OAuth-Free Wrapper
console.log('🚀 Starting Enhanced Chat Overlay System v2 (Aug 5, 2025) - OAuth-Free Mode');
console.log('⚠️  Gmail OAuth disabled for Notion Mail compatibility');

// Mock environment variables to disable OAuth
process.env.DISABLE_OAUTH = 'true';
process.env.GMAIL_CLIENT_ID = '';
process.env.GMAIL_CLIENT_SECRET = '';
process.env.GMAIL_REDIRECT_URI = '';

// Override console methods to filter OAuth messages
const originalLog = console.log;
console.log = function(...args) {
  const message = args.join(' ');
  if (!message.includes('OAuth') && !message.includes('Gmail') && !message.includes('google')) {
    originalLog.apply(console, args);
  }
};

// Mock Google APIs module before requiring the main server
const Module = require('module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function(id) {
  if (id === 'googleapis') {
    // Return mock googleapis
    return {
      auth: {
        OAuth2: class MockOAuth2 {
          constructor() {}
          generateAuthUrl() { return '#oauth-disabled'; }
          getToken() { return Promise.reject(new Error('OAuth disabled')); }
          setCredentials() {}
        }
      },
      gmail: () => ({
        users: {
          getProfile: () => Promise.resolve({ data: { emailAddress: 'mock@example.com' } })
        }
      })
    };
  }
  
  if (id === './services/data-manager') {
    // Return mock data manager
    return class MockDataManager {
      async processEmailIntelligently() {
        return { 
          summary: "Email processing disabled (OAuth-free mode)",
          priority: "medium",
          category: "notification"
        };
      }
      
      async getSmartSuggestions() {
        return [
          "Review today's calendar",
          "Check important notifications", 
          "Update task priorities"
        ];
      }
    };
  }
  
  return originalRequire.apply(this, arguments);
};

// Now require the main server
require('./quick-server.js');
