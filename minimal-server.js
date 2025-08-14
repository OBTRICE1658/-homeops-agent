// Minimal server for simple onboarding flow
const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Add middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ROOT - Redirect to signup
app.get('/', (req, res) => {
  console.log('✅ ROOT ACCESSED - REDIRECTING TO SIGNUP');
  res.redirect('/signup');
});

// ONBOARDING FLOW ROUTES
app.get('/signup', (req, res) => {
  console.log('✅ SIGNUP ROUTE ACCESSED!');
  res.sendFile(path.join(__dirname, 'public', 'simple-signup.html'));
});

app.get('/questionnaire', (req, res) => {
  console.log('✅ QUESTIONNAIRE ROUTE ACCESSED!');
  res.sendFile(path.join(__dirname, 'public', 'questionnaire.html'));
});

// GMAIL AUTH SIMULATION
app.get('/auth/gmail', (req, res) => {
  console.log('✅ GMAIL AUTH ROUTE ACCESSED!');
  // Simulate OAuth process
  res.send(`
    <html>
      <head>
        <title>Gmail Auth</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            text-align: center;
          }
          .container {
            background: rgba(255,255,255,0.1);
            padding: 40px;
            border-radius: 20px;
            backdrop-filter: blur(20px);
          }
          h1 { margin-bottom: 20px; }
          .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(255,255,255,0.3);
            border-top: 3px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 20px auto;
          }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Connecting to Gmail...</h1>
          <div class="spinner"></div>
          <p>Analyzing your email patterns</p>
        </div>
        <script>
          // Simulate OAuth process
          setTimeout(() => {
            sessionStorage.setItem('gmail_connected', 'true');
            window.location.href = '/profile-preview';
          }, 3000);
        </script>
      </body>
    </html>
  `);
});

app.get('/profile-preview', (req, res) => {
  console.log('✅ PROFILE PREVIEW ROUTE ACCESSED!');
  res.sendFile(path.join(__dirname, 'public', 'profile-preview.html'));
});

app.get('/calibrate', (req, res) => {
  console.log('✅ CALIBRATE ROUTE ACCESSED!');
  res.sendFile(path.join(__dirname, 'public', 'calibrate.html'));
});

app.get('/app', (req, res) => {
  console.log('✅ APP ROUTE ACCESSED!');
  res.sendFile(path.join(__dirname, 'public', 'index-with-command.html'));
});

// TEST ROUTE
app.get('/test', (req, res) => {
  console.log('✅ TEST ROUTE ACCESSED!');
  res.send(`
    <h1 style="color: green; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">✅ ONBOARDING FLOW WORKING</h1>
    <h2 style="font-family: -apple-system, BlinkMacSystemFont, sans-serif;">Test the Complete Flow:</h2>
    <ol style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; line-height: 2;">
      <li><a href="/signup" style="color: #667eea;">1. Signup</a></li>
      <li><a href="/questionnaire" style="color: #667eea;">2. Questionnaire</a></li>
      <li><a href="/auth/gmail" style="color: #667eea;">3. Gmail Auth</a></li>
      <li><a href="/profile-preview" style="color: #667eea;">4. Profile Preview</a></li>
      <li><a href="/calibrate" style="color: #667eea;">5. Calibrate</a></li>
      <li><a href="/app" style="color: #667eea;">6. App</a></li>
    </ol>
  `);
});

// STATIC FILES
app.use(express.static('public'));

// START SERVER
app.listen(PORT, () => {
  console.log(`🚀 HomeOps Onboarding Server running on port ${PORT}`);
  console.log(`✅ SIMPLIFIED ONBOARDING FLOW:`);
  console.log(`   1. Signup: http://localhost:${PORT}/signup`);
  console.log(`   2. Questionnaire: http://localhost:${PORT}/questionnaire`);
  console.log(`   3. Gmail Auth: http://localhost:${PORT}/auth/gmail`);
  console.log(`   4. Profile Preview: http://localhost:${PORT}/profile-preview`);
  console.log(`   5. Calibrate: http://localhost:${PORT}/calibrate`);
  console.log(`   6. App: http://localhost:${PORT}/app`);
  console.log(`✅ Test complete flow: http://localhost:${PORT}/test`);
});
