const express = require('express');
const cors = require('cors');
const path = require('path');

// Import services and routes
const ChatRoutes = require('./routes/chat-routes');

// Import existing services (these would be in your services folder)
// const ContextEngine = require('./services/context-aggregation');
// const ResponseGenerator = require('./services/intelligent-response-generator');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));

// Global variables (these would normally be better managed)
let db = null; // Firebase DB
let contextEngine = null;
let responseGenerator = null;

// Initialize Firebase (your existing code)
console.log('✅ Firebase Admin initialized successfully');

// Initialize services (your existing code would go here)
// contextEngine = new ContextEngine();
// responseGenerator = new ResponseGenerator();

// Setup routes
const chatRoutes = new ChatRoutes(app, contextEngine, responseGenerator, db);

// Serve static files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/app', (req, res) => {
  console.log('🎯 Serving /app route -> index-with-command.html');
  res.sendFile(path.join(__dirname, 'public', 'index-with-command.html'));
});

app.get('/onboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'onboard.html'));
});

app.get('/calibrate', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'calibrate.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 HomeOps Server running on port', PORT);
  console.log('📊 Dashboard: http://localhost:3000/app');
  console.log('🎯 Onboarding: http://localhost:3000/onboard');
  console.log('⚙️ Calibration: http://localhost:3000/calibrate');
  console.log('📧 Environment:', process.env.NODE_ENV || 'development');
  console.log('💬 Enhanced Chat: /api/chat-enhanced');
});

// Export for testing
module.exports = app;
