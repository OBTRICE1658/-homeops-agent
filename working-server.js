console.log('🚀 Starting HomeOps server...');

require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log('✅ Setting up routes...');

// MODERN 4-STEP ONBOARDING ROUTES
app.get('/signup', (req, res) => {
  console.log('🔐 Step 1: Signup route');
  res.sendFile(path.join(__dirname, 'public', 'step1-auth.html'));
});

app.get('/step1-auth', (req, res) => {
  console.log('🔐 Step 1: Google Auth');
  res.sendFile(path.join(__dirname, 'public', 'step1-auth.html'));
});

app.get('/step2-questionnaire', (req, res) => {
  console.log('📋 Step 2: Questionnaire');
  res.sendFile(path.join(__dirname, 'public', 'step2-questionnaire.html'));
});

app.get('/step3-calibration', (req, res) => {
  console.log('🎯 Step 3: Calibration');
  res.sendFile(path.join(__dirname, 'public', 'step3-calibration.html'));
});

app.get('/step4-profile-reveal', (req, res) => {
  console.log('🎉 Step 4: Profile Reveal');
  res.sendFile(path.join(__dirname, 'public', 'step4-profile-reveal.html'));
});

// ROOT ROUTE - MAIN APP WITH CHAT/SMART INBOX
app.get('/', (req, res) => {
  console.log('🏠 Serving main 4-module app with Smart Inbox');
  res.sendFile(path.join(__dirname, 'public', 'index-with-command.html'));
});

// APP ROUTE - SAME AS ROOT
app.get('/app', (req, res) => {
  console.log('📱 Serving 4-module app');
  res.sendFile(path.join(__dirname, 'public', 'index-with-command.html'));
});

// TEST ROUTE
app.get('/test', (req, res) => {
  res.send('<h1>✅ Server Working!</h1><p>All routes configured</p>');
});

// Serve static files
app.use(express.static('public'));

// Enhanced Personal Context Chat Endpoint with Sophisticated Tone
app.post('/api/chat', async (req, res) => {
  const { userId, message } = req.body;
  
  if (!userId || !message) {
    console.log('❌ Missing chat parameters:', { userId, message });
    return res.status(400).json({ error: "User ID and message are required" });
  }

  console.log('✅ Chat request received:', { userId, message: message.substring(0, 50) + '...' });

  try {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    // Enhanced chat response using OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are HomeOps Assistant, an intelligent family life management AI. You help busy families organize their mental load, prioritize tasks, and manage household responsibilities with warmth and practical intelligence.

Your personality combines:
- Warm but efficient communication
- Evidence-based suggestions
- Understanding of family dynamics
- Practical solutions over theory
- Light humor when appropriate

Always be helpful, concise, and focused on actionable next steps.`
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 800,
        temperature: 0.8
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';

    console.log('🎭 Generated response using OpenAI');

    // Return enhanced response
    const finalResponse = {
      reply: reply,
      timestamp: new Date().toISOString()
    };
    
    res.json(finalResponse);

  } catch (error) {
    console.error('❌ Chat error:', error);
    res.status(500).json({ 
      error: 'Chat processing failed',
      details: error.message 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 HomeOps Mental Load Operating System running on port ${PORT}`);
  console.log('📧 Modern 4-Step Onboarding Flow:');
  console.log(`   🔐 Step 1: http://localhost:${PORT}/signup (Google Auth)`);
  console.log(`   📋 Step 2: http://localhost:${PORT}/step2-questionnaire`);
  console.log(`   🎯 Step 3: http://localhost:${PORT}/step3-calibration`);
  console.log(`   🎉 Step 4: http://localhost:${PORT}/step4-profile-reveal`);
  console.log('');
  console.log('🎯 Main App:');
  console.log(`   🏠 Root: http://localhost:${PORT}/ (4-module app with Smart Inbox)`);
  console.log(`   📱 App: http://localhost:${PORT}/app`);
  console.log(`   🧪 Test: http://localhost:${PORT}/test`);
});
