const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Parse JSON bodies
app.use(express.json());

// Root route - smart redirect based on user state
app.get('/', (req, res) => {
  // Could check for user tokens/state here, but for now redirect to onboarding
  // In production, would check if user has completed onboarding and redirect to /app
  res.redirect('/step1-auth');
});

// Step 1: Google Auth/Sign In
app.get('/step1-auth', (req, res) => {
  console.log('✅ STEP 1: AUTH PAGE ACCESSED!');
  res.sendFile(path.join(__dirname, 'public', 'step1-auth.html'));
});

// Step 2: Micro Questionnaire  
app.get('/step2-questionnaire', (req, res) => {
  console.log('✅ STEP 2: QUESTIONNAIRE PAGE ACCESSED!');
  res.sendFile(path.join(__dirname, 'public', 'step2-questionnaire.html'));
});

// Step 3: Live Gmail Calibration
app.get('/step3-calibration', (req, res) => {
  console.log('✅ STEP 3: CALIBRATION PAGE ACCESSED!');
  res.sendFile(path.join(__dirname, 'public', 'step3-calibration.html'));
});

// Step 4: AI Profile Reveal
app.get('/step4-profile-reveal', (req, res) => {
  console.log('✅ STEP 4: PROFILE REVEAL PAGE ACCESSED!');
  res.sendFile(path.join(__dirname, 'public', 'step4-profile-reveal.html'));
});

// Direct access to HomeOps Agent (for demo/testing)
app.get('/agent', (req, res) => {
  console.log('🤖 DIRECT AGENT ACCESS!');
  res.sendFile(path.join(__dirname, 'public', 'homeops-agent-app.html'));
});

// Main app after onboarding - NEW AGENT INTERFACE
app.get('/app', (req, res) => {
  console.log('✅ HOMEOPS AGENT APP ACCESSED!');
  res.sendFile(path.join(__dirname, 'public', 'homeops-agent-app.html'));
});

// Legacy modules app (for reference/fallback)
app.get('/modules', (req, res) => {
  console.log('✅ LEGACY MODULES APP ACCESSED!');
  res.sendFile(path.join(__dirname, 'public', 'index-with-command.html'));
});

// Legacy route redirects for backwards compatibility
app.get('/signup', (req, res) => {
  console.log('🔄 Legacy signup route - redirecting to step1');
  res.redirect('/step1-auth');
});

app.get('/questionnaire', (req, res) => {
  console.log('🔄 Legacy questionnaire route - redirecting to step2');
  res.redirect('/step2-questionnaire');
});

app.get('/auth/gmail', (req, res) => {
  console.log('🔄 Legacy oauth route - redirecting to step3');
  res.redirect('/step3-calibration');
});

app.get('/oauth', (req, res) => {
  console.log('🔄 Legacy oauth route - redirecting to step3');
  res.redirect('/step3-calibration');
});

app.get('/profile-preview', (req, res) => {
  console.log('🔄 Legacy profile-preview route - redirecting to step4');
  res.redirect('/step4-profile-reveal');
});

app.get('/calibrate', (req, res) => {
  console.log('🔄 Legacy calibrate route - redirecting to step3');
  res.redirect('/step3-calibration');
});

// Test route to see the complete new flow
app.get('/test', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>HomeOps - New 4-Step Flow</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            padding: 40px; 
            background: #f7fafc;
          }
          .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 16px; }
          h1 { color: #2d3748; margin-bottom: 30px; }
          .flow-step { 
            background: #f7fafc; 
            padding: 20px; 
            border-radius: 12px; 
            margin-bottom: 20px;
            border-left: 4px solid #667eea;
          }
          .flow-step h3 { color: #2d3748; margin-bottom: 10px; }
          .flow-step p { color: #4a5568; margin-bottom: 10px; }
          a { 
            background: #667eea; 
            color: white; 
            padding: 8px 16px; 
            border-radius: 6px; 
            text-decoration: none;
            display: inline-block;
            margin-top: 10px;
          }
          a:hover { background: #5a67d8; }
          .start-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 16px 32px;
            border: none;
            border-radius: 12px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚀 HomeOps - New 4-Step Onboarding Flow</h1>
          
          <div class="flow-step">
            <h3>Step 1: Google Sign-In</h3>
            <p><strong>Goal:</strong> Immediate trust, remove barriers, get Gmail access</p>
            <p>• Single "Sign in with Google" CTA with Gmail read-only scope</p>
            <p>• Clear privacy promise: "We never send emails. We only read to help you focus."</p>
            <a href="/step1-auth" target="_blank">View Step 1</a>
          </div>

          <div class="flow-step">
            <h3>Step 2: Micro Questionnaire</h3>
            <p><strong>Goal:</strong> Collect context for AI model priming (≤3 minutes)</p>
            <p>• First Name, Role in Household, Top Priorities (chip select 2-3)</p>
            <p>• Data used for priority weights and calibration ordering</p>
            <a href="/step2-questionnaire" target="_blank">View Step 2</a>
          </div>

          <div class="flow-step">
            <h3>Step 3: Live Gmail Calibration</h3>
            <p><strong>Goal:</strong> Teach the model exactly what's important</p>
            <p>• Pull 20 recent emails, AI-summarize each in Mel Robbins + Ivan Zhao tone</p>
            <p>• 👍/👎 rating system to train relevance scoring</p>
            <a href="/step3-calibration" target="_blank">View Step 3</a>
          </div>

          <div class="flow-step">
            <h3>Step 4: AI Profile Reveal</h3>
            <p><strong>Goal:</strong> "We Know You" moment with emotional impact</p>
            <p>• Scanning animation, reveal insights: "You juggle X school events, Y social invites..."</p>
            <p>• AI promise: "Here's how I'll help lighten your mental load"</p>
            <a href="/step4-profile-reveal" target="_blank">View Step 4</a>
          </div>

          <div style="text-align: center; margin-top: 40px;">
            <p><strong>Start the complete flow:</strong></p>
            <a href="/step1-auth" class="start-btn">Begin New Onboarding Flow</a>
          </div>
        </div>
      </body>
    </html>
  `);
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 HomeOps Server Running!`);
  console.log(`📱 New 4-Step Onboarding Flow:`);
  console.log(`   1. Auth: http://localhost:${PORT}/step1-auth`);
  console.log(`   2. Questionnaire: http://localhost:${PORT}/step2-questionnaire`);
  console.log(`   3. Calibration: http://localhost:${PORT}/step3-calibration`);
  console.log(`   4. Profile Reveal: http://localhost:${PORT}/step4-profile-reveal`);
  console.log(`   5. Main App: http://localhost:${PORT}/app`);
  console.log(`✅ Test complete flow: http://localhost:${PORT}/test`);
});
