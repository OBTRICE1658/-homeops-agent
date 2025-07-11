// Memory optimization settings
process.env.NODE_OPTIONS = '--max-old-space-size=512 --expose-gc';
process.setMaxListeners(20);

// Increase memory limits for better performance
if (global.gc) {
  // Force initial garbage collection
  global.gc();
}

process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err);
  // Log memory usage before potential crash
  const memUsage = process.memoryUsage();
  console.error('Memory usage before crash:', {
    rss: Math.round(memUsage.rss / 1024 / 1024) + 'MB',
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB',
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
    external: Math.round(memUsage.external / 1024 / 1024) + 'MB'
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Log memory usage before potential crash
  const memUsage = process.memoryUsage();
  console.error('Memory usage before rejection:', {
    rss: Math.round(memUsage.rss / 1024 / 1024) + 'MB',
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB',
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
    external: Math.round(memUsage.external / 1024 / 1024) + 'MB'
  });
});

// Add lightweight development mode for local testing
const isDevelopment = process.env.NODE_ENV === 'development' || process.env.DEV_MODE === 'true';

// Add more aggressive memory monitoring and process protection
setInterval(() => {
  const memUsage = process.memoryUsage();
  const rssMB = Math.round(memUsage.rss / 1024 / 1024);
  const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
  
  // Only log memory usage in development mode to reduce noise
  if (isDevelopment) {
    console.log('🔍 Memory Usage:', {
      rss: rssMB + 'MB',
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB',
      heapUsed: heapUsedMB + 'MB',
      external: Math.round(memUsage.external / 1024 / 1024) + 'MB'
    });
  }
  
  // Optimized garbage collection for Render environment
  const gcThreshold = 150; // Higher threshold for Render (512MB limit)
  if (heapUsedMB > gcThreshold) {
    console.log(`🧹 High memory usage detected (${heapUsedMB}MB), forcing garbage collection...`);
    if (global.gc) {
      global.gc();
    }
  }
  
  // Log warning if memory usage is very high (but Render can handle more)
  const warningThreshold = 300; // Higher warning threshold for Render
  if (rssMB > warningThreshold) {
    console.warn(`⚠️ Very high memory usage detected: ${rssMB}MB`);
  }
  
  // Critical memory warning (approaching Render's limit)
  const criticalThreshold = 450; // Close to 512MB limit
  if (rssMB > criticalThreshold) {
    console.error(`🚨 CRITICAL: Memory usage very high: ${rssMB}MB - approaching Render limit`);
    if (global.gc) {
      global.gc();
    }
  }
}, 30000); // Check every 30 seconds to reduce noise

// Add process monitoring to prevent kills
let lastActivity = Date.now();
setInterval(() => {
  const now = Date.now();
  const timeSinceLastActivity = now - lastActivity;
  
  // If no activity for 2 minutes, log to show the process is alive
  if (timeSinceLastActivity > 120000) {
    console.log('💓 Process heartbeat - server is alive and monitoring');
    lastActivity = now;
  }
}, 120000); // Every 2 minutes

// Knowledge chunks cache to prevent memory leaks
let knowledgeChunksCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes for memory-constrained systems

async function getCachedKnowledgeChunks() {
  const now = Date.now();
  
  // Return cached chunks if they're still valid
  if (knowledgeChunksCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
    console.log('📦 Using cached knowledge chunks');
    return knowledgeChunksCache;
  }
  
  // Clear old cache to free memory
  if (knowledgeChunksCache) {
    console.log('🧹 Clearing old knowledge chunks cache');
    knowledgeChunksCache = null;
    if (global.gc) {
      global.gc();
    }
  }
  
  // Fetch fresh chunks with optimized limit for Render
  const chunkLimit = 5; // Even smaller limit for Render
  console.log(`🔄 Fetching fresh knowledge chunks (limit: ${chunkLimit})...`);
  const snapshot = await db.collection('knowledge_chunks')
    .limit(chunkLimit)
    .get();
  
  knowledgeChunksCache = snapshot.docs.map(doc => doc.data());
  cacheTimestamp = now;
  
  console.log(`✅ Cached ${knowledgeChunksCache.length} knowledge chunks`);
  
  // Force garbage collection after loading
  if (global.gc) {
    global.gc();
  }
  
  return knowledgeChunksCache;
}

console.log("🚀 DEPLOYMENT VERSION 8 - LUXON REMOVED - " + new Date().toISOString());
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
// Use a more reliable fetch approach
let fetch;
try {
  // Try to use global fetch first (Node 18+)
  if (global.fetch) {
    fetch = global.fetch;
  } else {
    // Fallback to node-fetch v2
    fetch = require("node-fetch");
  }
} catch (err) {
  console.error("❌ Failed to initialize fetch:", err.message);
  // Last resort: try dynamic import
  fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
}
const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");
// const { DateTime } = require("luxon"); // Temporarily removed for deployment
const chrono = require("chrono-node");

// Add CORS support
const cors = require("cors");

// Force deployment update - v7 - Remove luxon dependency temporarily

// Simple date function to replace luxon
function getCurrentDate() {
  const now = new Date();
  return now.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
}

// Improved Firebase initialization with proper error handling
let firebaseInitialized = false;

// Try to initialize with service account file first
try {
  const serviceAccountPath = path.join(__dirname, "homeops-sa-key.json");
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
      firebaseInitialized = true;
    console.log("✅ Firebase initialized successfully via service account file.");
    }
  } else {
    console.log("ℹ️ Service account file not found, trying environment variables...");
  }
} catch (err) {
  console.log("ℹ️ Service account file error, trying environment variables...");
}

// Fallback to environment variables if service account file failed
if (!firebaseInitialized) {
  try {
    const base64 = process.env.FIREBASE_CREDENTIALS;
    if (!base64) {
      throw new Error("FIREBASE_CREDENTIALS env var not set.");
    }
    const decoded = Buffer.from(base64, "base64").toString("utf-8");
    const firebaseCredentials = JSON.parse(decoded);

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(firebaseCredentials),
      });
      firebaseInitialized = true;
      console.log("✅ Firebase initialized successfully via environment variable.");
    }
  } catch (fallbackErr) {
    console.error("❌ Firebase initialization failed:", fallbackErr.message);
    console.error("❌ No valid credential source found. Please check your configuration.");
    process.exit(1); // Exit if no valid credential source found
  }
}

const db = admin.firestore();
const app = express();
const port = process.env.PORT || 3000;

// Add activity tracking middleware
app.use((req, res, next) => {
  lastActivity = Date.now();
  next();
});

// Enable CORS for all routes at the very top
app.use(cors({
  origin: [
    'https://homeops-web.web.app',
    'https://homeops-web.firebaseapp.com',
    'https://homeops-backend.onrender.com',
    'https://homeops-agent.onrender.com'
  ],
  credentials: true
}));

// Handle CORS preflight requests
app.options('*', cors({
  origin: [
    'https://homeops-web.web.app',
    'https://homeops-web.firebaseapp.com',
    'https://homeops-backend.onrender.com',
    'https://homeops-agent.onrender.com'
  ],
  credentials: true
}));

// Load the persona file content at startup
let tonePromptContent = "";
try {
  tonePromptContent = fs.readFileSync(path.join(__dirname, "prompts", "tone-homeops.txt"), "utf-8");
  console.log("✅ Persona file loaded successfully.");
} catch (err) {
  console.error("❌ Failed to load persona file:", err.message);
  // Continue without it, but log the error
}

// Create email-specific tone prompt that combines HomeOps voice with required JSON format
const emailTonePrompt = `You are HomeOps — a personal chief of staff for modern family life.

You work with high-performing parents in their 30s and 40s. They're running households, companies, inboxes, carpools, calendars, and partnerships — often all at once. Your job is to reduce mental load by giving shape to the chaos, naming the subtext, and providing calm, actionable clarity.

These users are sharp, emotionally fluent, and tired of performative productivity content. They don't want another voice telling them to "just breathe" or "you've got this." They want insight. Structure. Relief.

You speak like a hybrid of:
- **Mel Robbins** (direct, empowering, no fluff)
- **The Gottmans** (emotionally fluent, relationship-aware)
- **Amy Schumer** (dry, observational, honest)
- **Andrew Huberman** (calm, practical, data-backed)
- **Guy Raz** (curious, grounded, quietly smart)
- **Jerry Seinfeld** (sharp observational wit — not punchlines)
- **Esther Perel** (intimate, sharp, unafraid to name power dynamics)
- **Cheryl Strayed** (soul-level clarity, warm truth-teller)
- **Cal Newport** (deep focus, cognitive boundaries, attention architecture)
- **Samin Nosrat** (joyful, sensory-rich, grounded in care)
- **Lisa Miller / Pema Chödrön / Tara Brach** (gentle insight, emotional grounding, calm resilience)

You validate effort, then offer structure. You are warm but never coddling. Smart but never smug. Honest but never harsh. You never perform. You never explain what the user already knows. You speak like someone who's in it — not watching from the sidelines.

For the email below, analyze it with your HomeOps voice and return ONLY a JSON object with the following fields (no markdown formatting, no code blocks, just pure JSON):

{
  "summary": "1–2 sentence summary in your HomeOps voice - direct, grounded, emotionally intelligent",
  "category": "Handle Now|On the Calendar|Household Signals|Commerce Inbox",
  "priority": "High|Medium|Low", 
  "suggested_actions": ["action1", "action2", "action3"],
  "tone": "Urgent|Routine|Personal|Transactional"
}

Make the summary clear and non-redundant. Use natural, modern language that reflects the HomeOps voice. Return ONLY the JSON object, no other text.`;

app.use(bodyParser.json());
app.use("/mock", express.static("mock"));

// All API routes should be defined above the SPA catch-all
app.get("/api/firebase-config", (req, res) => {
  // Provide a basic Firebase config for the homeops-web project
  const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY || "AIzaSyBxGxGxGxGxGxGxGxGxGxGxGxGxGxGxGx",
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || "homeops-web.firebaseapp.com",
    projectId: process.env.FIREBASE_PROJECT_ID || "homeops-web",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "homeops-web.appspot.com",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "123456789",
    appId: process.env.FIREBASE_APP_ID || "1:123456789:web:abcdef123456",
    measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-XXXXXXXXXX"
  };
  
  res.json(firebaseConfig);
});

// Health check endpoint for Render
app.get("/health", (req, res) => {
  res.json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Test endpoint to check environment variables
app.get("/api/test-env", (req, res) => {
  res.json({
    hasOpenAI: !!process.env.OPENAI_API_KEY,
    hasFirebase: !!process.env.FIREBASE_CREDENTIALS,
    hasFirebaseAPI: !!process.env.FIREBASE_API_KEY,
    envVars: {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ? "SET" : "NOT SET",
      FIREBASE_CREDENTIALS: process.env.FIREBASE_CREDENTIALS ? "SET" : "NOT SET",
      FIREBASE_API_KEY: process.env.FIREBASE_API_KEY ? "SET" : "NOT SET"
    }
  });
});

// Test endpoint to check Gmail OAuth configuration
app.get("/api/gmail/test-config", (req, res) => {
  res.json({
    gmailConfig: {
      clientId: GMAIL_OAUTH_CONFIG.clientId ? "SET" : "NOT SET",
      clientSecret: GMAIL_OAUTH_CONFIG.clientSecret ? "SET" : "NOT SET",
      redirectUri: GMAIL_OAUTH_CONFIG.redirectUri
    },
    scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
    authUrl: `/auth/google`
  });
});

// Test endpoint to check token status for a user
app.get("/api/gmail/test-tokens", async (req, res) => {
  const { user_id } = req.query;
  
  if (!user_id) {
    return res.status(400).json({ error: 'user_id parameter required' });
  }
  
  try {
    const tokenDoc = await db.collection('gmail_tokens').doc(user_id).get();
    
    if (!tokenDoc.exists) {
      return res.json({
        hasTokens: false,
        message: 'No tokens found for this user'
      });
    }
    
    const tokens = tokenDoc.data();
    return res.json({
      hasTokens: true,
      tokenInfo: {
        hasAccessToken: !!tokens.access_token,
        hasRefreshToken: !!tokens.refresh_token,
        expiryDate: tokens.expiry_date,
        createdAt: tokens.created_at,
        scopes: tokens.scopes || 'unknown'
      }
    });
  } catch (error) {
    console.error('❌ Error checking tokens:', error);
    res.status(500).json({ error: 'Failed to check tokens' });
  }
});

// Debug endpoint to check Gmail tokens
app.get('/api/gmail/debug-tokens', async (req, res) => {
  const userId = req.query.user_id || 'test_user';
  
  try {
    console.log('🔍 Debug: Checking tokens for user:', userId);
    
    const tokenDoc = await db.collection('gmail_tokens').doc(userId).get();
    
    if (tokenDoc.exists) {
      const tokenData = tokenDoc.data();
      console.log('🔍 Debug: Token data found:', {
        hasAccessToken: !!tokenData.access_token,
        hasRefreshToken: !!tokenData.refresh_token,
        expiryDate: tokenData.expiry_date,
        createdAt: tokenData.created_at
      });
      
      res.json({
        exists: true,
        tokenData: {
          hasAccessToken: !!tokenData.access_token,
          hasRefreshToken: !!tokenData.refresh_token,
          expiryDate: tokenData.expiry_date,
          createdAt: tokenData.created_at,
          isExpired: tokenData.expiry_date ? Date.now() > tokenData.expiry_date : false
        }
      });
    } else {
      console.log('🔍 Debug: No tokens found for user:', userId);
      
      // List all documents in gmail_tokens collection for debugging
      const allTokens = await db.collection('gmail_tokens').get();
      console.log('🔍 Debug: Total tokens in database:', allTokens.size);
      const tokenIds = [];
      allTokens.forEach(doc => {
        tokenIds.push(doc.id);
      });
      console.log('🔍 Debug: Token doc IDs:', tokenIds);
      
      res.json({
        exists: false,
        totalTokensInDB: allTokens.size,
        tokenIds: tokenIds
      });
    }
  } catch (error) {
    console.error('❌ Debug: Error checking tokens:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- RAG Helper Functions ---
async function createEmbedding(text) {
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: text
    })
  });
  const data = await response.json();
  if (!data.data || !data.data[0] || !data.data[0].embedding) {
    throw new Error("Invalid embedding response");
  }
  return data.data[0].embedding;
}

function cosineSimilarity(a, b) {
  let dot = 0.0, normA = 0.0, normB = 0.0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function getTopKRelevantChunks(userEmbedding, k = 5) {
  // Use cached knowledge chunks to prevent memory issues
  const chunks = await getCachedKnowledgeChunks();
  
  // Compute similarity
  for (const chunk of chunks) {
    chunk.sim = cosineSimilarity(userEmbedding, chunk.embedding);
  }
  
  // Sort by similarity, descending
  chunks.sort((a, b) => b.sim - a.sim);
  
  // Return top k chunks
  return chunks.slice(0, k);
}

function anonymizeText(text) {
  return text
    .replace(/Mel Robbins/gi, "the coach")
    .replace(/Jerry Seinfeld/gi, "the comedian")
    .replace(/Andrew Huberman/gi, "the scientist")
    .replace(/Amy Schumer/gi, "the comedian")
    .replace(/Martha Beck/gi, "the author");
}
// --- END RAG Helper Functions ---

// Add rate limiting to prevent memory spikes
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30; // Max 30 requests per minute per user

function checkRateLimit(userId) {
  const now = Date.now();
  const userRequests = requestCounts.get(userId) || [];
  
  // Remove old requests outside the window
  const recentRequests = userRequests.filter(time => now - time < RATE_LIMIT_WINDOW);
  
  if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
    return false; // Rate limited
  }
  
  // Add current request
  recentRequests.push(now);
  requestCounts.set(userId, recentRequests);
  return true; // Allowed
}

// Clean up old rate limit data periodically
setInterval(() => {
  const now = Date.now();
  for (const [userId, requests] of requestCounts.entries()) {
    const recentRequests = requests.filter(time => now - time < RATE_LIMIT_WINDOW);
    if (recentRequests.length === 0) {
      requestCounts.delete(userId);
    } else {
      requestCounts.set(userId, recentRequests);
    }
  }
}, 300000); // Clean up every 5 minutes

app.post("/chat", async (req, res) => {
  const { user_id, message } = req.body;
  if (!user_id || !message) {
    return res.status(400).json({ error: "User ID and message are required" });
  }

  // Check rate limit
  if (!checkRateLimit(user_id)) {
    return res.status(429).json({ 
      error: "Rate limit exceeded. Please wait a moment before sending another message." 
    });
  }

  // --- CALENDAR COMMANDER LOGIC ---
  const calendarCmdRegex = /add (.+?) to my calendar( on| for)? (.+)/i;
  const match = message.match(calendarCmdRegex);
  if (match) {
    const eventTitle = match[1].trim();
    const eventWhen = match[3].trim();
    let parsedStart;
    try {
      parsedStart = chrono.parseDate(eventWhen, new Date(), { forwardDate: true, timezone: "America/New_York" });
    } catch (e) {
      parsedStart = null;
    }
    if (eventTitle && parsedStart) {
      const startISO = parsedStart.toISOString();
      const eventRef = db.collection("events").doc();
      const eventWithId = {
        title: eventTitle,
        start: startISO,
        id: eventRef.id,
        user_id,
        created_at: new Date(),
        allDay: false,
        description: '',
        location: ''
      };
      await eventRef.set(eventWithId);
      await db.collection("messages").add({
        user_id,
        message,
        assistant_response: JSON.stringify({ reply: `✅ Event '${eventTitle}' added to your calendar for ${parsedStart.toLocaleString()}.`, events: [eventWithId] }),
        timestamp: new Date()
      });
      return res.json({ reply: `✅ Event '${eventTitle}' added to your calendar for ${parsedStart.toLocaleString()}.`, events: [eventWithId], emailSummary: [] });
    } else {
      return res.json({ reply: "Sorry, I couldn't understand the date/time for your event. Please try: 'Add [event] to my calendar on [date/time]'", events: [], emailSummary: [] });
    }
  }

  try {
    // 1. Fetch the last 10 messages for context
    const messagesSnapshot = await db.collection("messages")
      .where("user_id", "==", user_id)
      .orderBy("timestamp", "desc")
      .limit(10)
      .get();
    const history = messagesSnapshot.docs.map(doc => doc.data()).reverse();

    // 2. Fetch the 3 most recent decoded emails for the user
    let emailSummaryArr = [];
    try {
      const decodedEmailsSnapshot = await db.collection('decoded_emails')
        .where('user_id', '==', user_id)
        .orderBy('created_at', 'desc')
        .limit(3)
        .get();
      emailSummaryArr = decodedEmailsSnapshot.docs.map(doc => {
        const d = doc.data();
        return {
          subject: d.subject || '',
          from: d.from || d.sender || '',
          summary: d.decoded_data?.summary || d.summary || '',
          date: d.date || d.timestamp || ''
        };
      });
    } catch (e) {
      console.error("Failed to fetch recent emails for chat context:", e);
      emailSummaryArr = [];
    }

    // 3. Construct the messages array for OpenAI
    const messagesForApi = [];

    // System prompt combining the persona, core instructions, events, and email summaries
    let ragContext = "";
    try {
      const userEmbedding = await createEmbedding(message);
      const topChunks = await getTopKRelevantChunks(userEmbedding, 5);
      ragContext = topChunks.map(c => anonymizeText(c.content)).join("\n---\n");
    } catch (e) {
      console.error("RAG context fetch failed:", e.message);
      ragContext = "";
    }
    
    // Fetch user's upcoming events from Firestore
    let userEvents = [];
    try {
      const eventsSnapshot = await db
        .collection("events")
        .where("user_id", "==", user_id)
        .orderBy("start")
        .get();
      const now = new Date();
      userEvents = eventsSnapshot.docs
        .map(doc => doc.data())
        .filter(ev => new Date(ev.start) > now)
        .slice(0, 5);
    } catch (e) {
      console.error("Failed to fetch user events for chat context:", e);
    }
    let eventsSummary = "";
    if (userEvents.length > 0) {
      eventsSummary = "Here are the user's next events:" + userEvents.map(ev => `\n- ${ev.title} on ${new Date(ev.start).toLocaleString()}${ev.location ? ' at ' + ev.location : ''}`).join("");
    } else {
      eventsSummary = "The user has no upcoming events.";
    }

    // Email summary for prompt
    let emailSummaryText = "";
    if (emailSummaryArr.length > 0) {
      emailSummaryText = "Recent emails (summarized):\n" + emailSummaryArr.map(e => `- From: ${e.from}\n  Subject: ${e.subject}\n  Summary: ${e.summary}\n  Date: ${e.date}`).join("\n");
    } else {
      emailSummaryText = "No recent emails found.";
    }

    // Enhanced system prompt
    const systemPrompt = `
You are HomeOps, a world-class, in-character AI assistant. Your job is to:
- Synthesize a conversational reply in the HomeOps voice, using the knowledge base and context below.
- Extract any new calendar events from the user's most recent message, returning them in a strict JSON array.
- Reference the user's recent emails if relevant.

---
Relevant context from the knowledge base:
${ragContext}
---

${eventsSummary}

${emailSummaryText}

Today's date is: ${getCurrentDate()}.

**Instructions:**
- Your reply must be a single, conversational paragraph in the HomeOps voice.
- If the user's message contains a new event, extract it as an object with fields: title, when, allDay, location, description, end (if available).
- If you reference an email, use the summaries above.
- Respond with ONLY a single, valid JSON object in this format:
{
  "reply": "Your in-character, conversational reply goes here.",
  "events": [
    { "title": "Event Title", "when": "A descriptive, natural language time like 'This coming Tuesday at 2pm' or 'August 15th at 10am'", "allDay": false, "location": "", "description": "", "end": "" }
  ],
  "emailSummary": [
    { "from": "", "subject": "", "summary": "", "date": "" }
  ]
}
- If there are no events or emails, use empty arrays for those fields.
- Do NOT include any text outside the JSON object.
- If you fail to return valid JSON, your response will be rejected.
`;

    messagesForApi.push({ role: "system", content: systemPrompt });

    // Add conversation history (limit to prevent memory issues)
    history.slice(0, 5).forEach(msg => {
      messagesForApi.push({ role: "user", content: msg.message });
      if (msg.assistant_response) {
        messagesForApi.push({ role: "assistant", content: msg.assistant_response });
      }
    });

    // Add the current user message
    messagesForApi.push({ role: "user", content: message });

    // 4. Call OpenAI API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
    const gptRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o",
        temperature: 0.7,
        top_p: 1,
        response_format: { type: "json_object" },
        messages: messagesForApi
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!gptRes.ok) {
        throw new Error(`OpenAI API error: ${gptRes.status} ${gptRes.statusText}`);
      }

    const gptData = await gptRes.json();
    console.log("OpenAI Response Body:", JSON.stringify(gptData, null, 2));
    const content = gptData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content from GPT response.");
    }

      let parsedResponse;
      try {
        parsedResponse = JSON.parse(content);
      } catch (err) {
        console.error("Failed to parse GPT response as JSON:", content);
        throw new Error("Invalid JSON from GPT");
      }
      const { reply, events = [], emailSummary = [] } = parsedResponse;

      // 5. Save new message and reply to history
    await db.collection("messages").add({
      user_id,
      message,
      assistant_response: content,
      timestamp: new Date()
    });

      // 6. Save events to Firestore
      let savedEvents = [];
      if (Array.isArray(events) && events.length > 0) {
      const batch = db.batch();
      const referenceDate = new Date();
      events.forEach(event => {
        if (event.title && event.when) {
            // Parse the natural language "when" string in America/New_York timezone
            let parsedStart;
            try {
              parsedStart = chrono.parseDate(event.when, referenceDate, { forwardDate: true, timezone: "America/New_York" });
            } catch (e) {
              parsedStart = null;
            }
          if (parsedStart) {
            const startISO = parsedStart.toISOString();
            const eventRef = db.collection("events").doc();
            const eventWithId = { 
              ...event, 
                start: startISO,
              id: eventRef.id, 
              user_id, 
              created_at: new Date() 
            };
              delete eventWithId.when;
            batch.set(eventRef, eventWithId);
            savedEvents.push(eventWithId);
          }
        }
      });
      await batch.commit();
      }
      res.json({ reply, events: savedEvents, emailSummary: emailSummaryArr });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        throw new Error('Request timeout - please try again');
      }
      throw fetchError;
    }

  } catch (err) {
    console.error("❌ /chat endpoint failed:", err.message, err.stack);
    res.status(500).json({ error: "Failed to process your request." });
  }
});

// ✅ Save event to Firestore (this can be used for manual additions if needed)
app.post("/api/events", async (req, res) => {
  const { event } = req.body;

  if (!event || !event.title || (!event.start && !event.when)) {
    return res.status(400).json({ error: "Missing event title or time." });
  }

  try {
    // If "when" is provided, parse it into ISO using chrono + luxon
    if (!event.start && event.when) {
      const parsedStart = chrono.parseDate(event.when, { timezone: "America/New_York" });
      if (!parsedStart) {
        return res.status(400).json({ error: "Could not parse 'when' into a date." });
      }
      event.start = parsedStart.toISOString();
    }

    const docRef = await db.collection("events").add({
      ...event,
      created_at: new Date(),
    });

    res.json({ success: true, id: docRef.id });
  } catch (err) {
    console.error("❌ Failed to save event:", err.message);
    res.status(500).json({ error: "Failed to save event" });
  }
});

// 🔄 Update an existing event by ID
app.put("/api/events/:id", async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  if (!id || !updatedData || typeof updatedData !== "object") {
    return res.status(400).json({ error: "Invalid request format" });
  }

  try {
    const eventRef = db.collection("events").doc(id);
    await eventRef.update({
      ...updatedData,
      updated_at: new Date(),
    });
    res.json({ success: true, message: `Event ${id} updated.` });
  } catch (err) {
    console.error(`❌ Failed to update event ${id}:`, err.message);
    res.status(500).json({ error: "Failed to update event" });
  }
});

// ✅ Fetch all saved events
app.get("/api/events", async (req, res) => {
  const { user_id = "user_123" } = req.query;
  try {
    const snapshot = await db
      .collection("events")
      .where("user_id", "==", user_id)
      .orderBy("start")
      .get();
    const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(events);
  } catch (err) {
    console.error("❌ Failed to fetch events:", err.message);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// ✅ Get events for calendar (FullCalendar format)
app.get("/api/get-events", async (req, res) => {
  const { user_id = "user_123" } = req.query;
  try {
    const snapshot = await db
      .collection("events")
      .where("user_id", "==", user_id)
      .orderBy("start")
      .get();
    
    const events = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        start: data.start,
        end: data.end || null,
        allDay: data.allDay || false,
        user_id: data.user_id,
        location: data.location || null,
        description: data.description || null,
        extendedProps: {
          location: data.location || null,
          description: data.description || null
        }
      };
    });
    
    res.json(events);
  } catch (err) {
    console.error("❌ Failed to fetch events for calendar:", err.message);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// ✅ Add event from calendar (FullCalendar dateClick)
app.post("/api/add-event", async (req, res) => {
  const { user_id, title, start, end, allDay = false, location, description } = req.body;
  
  if (!user_id || !title || !start) {
    return res.status(400).json({ error: "Missing required fields: user_id, title, or start" });
  }

  try {
    // Duplicate check: same user_id, title, and start
    const dupSnapshot = await db.collection("events")
      .where("user_id", "==", user_id)
      .where("title", "==", title)
      .where("start", "==", start)
      .limit(1)
      .get();
    if (!dupSnapshot.empty) {
      // Duplicate found
      const existingDoc = dupSnapshot.docs[0];
      return res.json({ 
        success: false, 
        duplicate: true, 
        id: existingDoc.id,
        event: existingDoc.data(),
        message: "Event already exists" 
      });
    }

    const eventData = {
      user_id,
      title,
      start,
      allDay,
      created_at: new Date()
    };

    // Add optional fields if provided
    if (end) eventData.end = end;
    if (location) eventData.location = location;
    if (description) eventData.description = description;

    const docRef = await db.collection("events").add(eventData);

    res.json({ 
      success: true, 
      id: docRef.id,
      event: { 
        id: docRef.id, 
        title, 
        start, 
        end: end || null,
        allDay, 
        user_id,
        location: location || null,
        description: description || null
      }
    });
  } catch (err) {
    console.error("❌ Failed to add event:", err.message);
    res.status(500).json({ error: "Failed to add event" });
  }
});

// ✅ Delete event
app.post("/api/delete-event", async (req, res) => {
  const { user_id, event_id } = req.body;
  
  if (!user_id || !event_id) {
    return res.status(400).json({ error: "Missing required fields: user_id or event_id" });
  }

  try {
    // Verify the event belongs to the user before deleting
    const eventDoc = await db.collection("events").doc(event_id).get();
    
    if (!eventDoc.exists) {
      return res.status(404).json({ error: "Event not found" });
    }
    
    const eventData = eventDoc.data();
    if (eventData.user_id !== user_id) {
      return res.status(403).json({ error: "Unauthorized to delete this event" });
    }
    
    await db.collection("events").doc(event_id).delete();
    
    res.json({ 
      success: true, 
      message: "Event deleted successfully" 
    });
  } catch (err) {
    console.error("❌ Failed to delete event:", err.message);
    res.status(500).json({ error: "Failed to delete event" });
  }
});

app.get("/api/dashboard", async (req, res) => {
  const { user_id = "user_123" } = req.query;

  try {
    const snapshot = await db
      .collection("messages")
      .where("user_id", "==", user_id)
      .orderBy("timestamp", "desc")
      .limit(25)
      .get();

    const messages = snapshot.docs.map(doc => doc.data());
    const themeCounts = {};
    const taskList = [];

    messages.forEach(({ message, reply }) => {
      const text = `${message} ${reply}`.toLowerCase();
      ["laundry", "school", "camp", "appointment", "groceries", "pickup"].forEach(keyword => {
        if (text.includes(keyword)) {
          themeCounts[keyword] = (themeCounts[keyword] || 0) + 1;
        }
      });
      if (/monday|tuesday|wednesday|thursday|friday/i.test(text)) {
        taskList.push(text);
      }
    });

    const topThemes = Object.entries(themeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([word, count]) => `${word} (${count}x)`);

    res.json({
      tasksThisWeek: taskList.slice(0, 3),
      topThemes,
      totalTasks: messages.length,
    });
  } catch (err) {
    console.error("❌ /api/dashboard failed:", err.message);
    res.status(500).json({ error: "Dashboard failed" });
  }
});

app.post("/api/relief-protocol", async (req, res) => {
  const { tasks = [], emotional_flags = [] } = req.body;

  const prompt = `You are HomeOps. Create a JSON Relief Protocol using wit and insight.

Input:
Tasks: ${JSON.stringify(tasks)}
Emotional Flags: ${JSON.stringify(emotional_flags)}

Output format:
{
  "summary": "...",
  "offload": { "text": "...", "coach": "Mel Robbins" },
  "reclaim": { "text": "...", "coach": "Andrew Huberman" },
  "reconnect": { "text": "...", "coach": "John Gottman" },
  "pattern_interrupt": "...",
  "reframe": { "text": "...", "coach": "Adam Grant" }
}`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o",
        temperature: 0.2,
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: "Generate protocol" }
        ]
      })
    });

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    res.json(parsed);
  } catch (err) {
    console.error("❌ Relief Protocol Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/reframe-protocol", async (req, res) => {
  const { challenge } = req.body;

  if (!challenge) {
    return res.status(400).json({ error: "No challenge provided." });
  }

  const systemPrompt = `
You are a world-class Chief of Staff, a unique blend of three personalities:
- **Mel Robbins:** You provide actionable, no-nonsense advice with a framework (like the 5-second rule). You're about high-fives and taking action.
- **Jerry Seinfeld:** You find the observational humor and absurdity in the situation, making it feel less heavy. What's the *deal* with this blocker?
- **Andrew Huberman:** You ground the advice in neuroscience and tangible protocols. How can we leverage dopamine, focus, or rest to overcome this?

The user is feeling stuck. Your task is to provide a "Re-frame" that helps them see their challenge from a new perspective.

**Format your response as a single, valid JSON object:**
{
  "title": "A witty, Seinfeld-esque observation about the problem.",
  "reframe": "The core insight. A one-sentence re-framing of the problem into an opportunity.",
  "action": {
    "header": "A Mel Robbins-style call to action (e.g., 'The 5-Minute Reset').",
    "steps": [
      "Step 1: A concrete, immediate action.",
      "Step 2: Another small, tangible step.",
      "Step 3: A third, simple action."
    ]
  },
  "science": "A Huberman-esque explanation of the neuroscience behind why the action plan works (e.g., 'This leverages neuroplasticity by...')."
}
Do not include any text outside of this JSON object.
  `.trim();

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: challenge }
        ]
      })
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("🛑 Re-frame GPT response missing content:", data);
      return res.status(500).json({ error: "Invalid GPT response format" });
    }

    const parsedResponse = JSON.parse(data.choices[0].message.content);
    res.json(parsedResponse);
  } catch (err) {
    console.error("❌ /api/reframe-protocol failed:", err.message);
    res.status(500).json({ error: "Re-frame Protocol failed" });
  }
});

app.post("/api/events/clear", async (req, res) => {
  const { user_id = "user_123" } = req.body;
  if (!user_id) {
    return res.status(400).json({ error: "User ID is required." });
  }
  try {
    const snapshot = await db.collection("events").where("user_id", "==", user_id).get();
    if (snapshot.empty) {
      return res.json({ success: true, message: "No events to clear for this user." });
    }

    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    res.json({ success: true, message: `Deleted ${snapshot.size} events.` });
  } catch (err) {
    console.error("❌ Failed to clear events:", err.message);
    res.status(500).json({ error: "Failed to clear events." });
  }
});

app.get("/events", async (req, res) => {
  const { user_id } = req.query; // Or from session, etc.
  if (!user_id) {
    return res.status(400).json({ error: "User ID is required" });
  }
  try {
    const eventsSnapshot = await db.collection("events")
      .where("user_id", "==", user_id)
      .orderBy("start", "asc")
      .get();
    const events = eventsSnapshot.docs.map(doc => doc.data());
    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// Gmail OAuth and Email Decoder Engine
const { google } = require('googleapis');

// Helper function to call OpenAI API
async function callOpenAI(prompt, model = 'gpt-4o-mini') {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: model,
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content: "You are an email analysis assistant. Analyze emails and extract structured information. Always respond with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const data = await response.json();
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Invalid OpenAI response");
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error('❌ OpenAI API call failed:', error);
    if (error.name === 'AbortError') {
      throw new Error('OpenAI API request timed out');
    }
    throw error;
  }
}

// Gmail OAuth configuration
const GMAIL_OAUTH_CONFIG = {
  clientId: process.env.GMAIL_CLIENT_ID,
  clientSecret: process.env.GMAIL_CLIENT_SECRET,
  redirectUri: process.env.GMAIL_REDIRECT_URI || 'http://localhost:3000/auth/google/callback'
};

// Debug OAuth configuration
console.log('🔍 Gmail OAuth Config Debug:');
console.log('Client ID:', GMAIL_OAUTH_CONFIG.clientId ? 'SET' : 'NOT SET');
console.log('Client Secret:', GMAIL_OAUTH_CONFIG.clientSecret ? 'SET' : 'NOT SET');
console.log('Redirect URI:', GMAIL_OAUTH_CONFIG.redirectUri);

// Gmail OAuth endpoints
app.get('/auth/google', (req, res) => {
  console.log('🔍 Starting Gmail OAuth flow...');
  
  const oauth2Client = new google.auth.OAuth2(
    GMAIL_OAUTH_CONFIG.clientId,
    GMAIL_OAUTH_CONFIG.clientSecret,
    GMAIL_OAUTH_CONFIG.redirectUri
  );

  const scopes = [
    'https://www.googleapis.com/auth/gmail.readonly'
  ];

  console.log('🔍 Using scopes:', scopes);

  // Add a unique state parameter to force re-authorization
  const state = `force_reauth_${Date.now()}`;

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
    include_granted_scopes: true,
    state: state
  });

  console.log('🔍 Generated auth URL:', authUrl);
  res.redirect(authUrl);
});

app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  const state = req.query.state || 'default_user';

  console.log('🔍 OAuth callback received');
  console.log('Code present:', !!code);
  console.log('State:', state);

  try {
    const oauth2Client = new google.auth.OAuth2(
      GMAIL_OAUTH_CONFIG.clientId,
      GMAIL_OAUTH_CONFIG.clientSecret,
      GMAIL_OAUTH_CONFIG.redirectUri
    );

    const { tokens } = await oauth2Client.getToken(code);
    console.log('🔍 Tokens received:', tokens);
    console.log('🔍 Full token object:', JSON.stringify(tokens, null, 2));

    // Extract user ID from state parameter or use fallback
    let userId = 'test_user'; // Default fallback
    if (state && state.includes('_')) {
      const stateParts = state.split('_');
      userId = stateParts[stateParts.length - 1]; // Use the last part (should be the email)
    }
    console.log('🔍 Using user ID:', userId);
    console.log('🔍 Attempting to save tokens for user:', userId);

    // Store tokens in Firestore
    await db.collection('gmail_tokens').doc(userId).set({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date,
      created_at: new Date(),
      scopes: tokens.scope || 'https://www.googleapis.com/auth/gmail.readonly'
    });
    console.log('✅ Tokens saved for user:', userId);

    // Redirect to Dashboard with processing step after successful Gmail connection
    res.redirect('/dashboard.html?gmail_connected=true&step=processing&view=dashboard');
  } catch (error) {
    console.error('❌ Error in OAuth callback:', error);
    console.error('❌ Gmail OAuth error:', error);
    console.error('❌ Error details:', error.message);
    // Check if it's an invalid_client error
    if (error.message && error.message.includes('invalid_client')) {
      console.error('❌ OAuth client configuration error - check environment variables');
      console.error('❌ Client ID:', GMAIL_OAUTH_CONFIG.clientId ? 'SET' : 'NOT SET');
      console.error('❌ Client Secret:', GMAIL_OAUTH_CONFIG.clientSecret ? 'SET' : 'NOT SET');
      console.error('❌ Redirect URI:', GMAIL_OAUTH_CONFIG.redirectUri);
    }
    res.redirect('/dashboard?gmail_error=true');
  }
});

// Endpoint to check Gmail connection status for a user
app.get('/api/gmail/status', async (req, res) => {
  const userId = req.query.user_id;
  if (!userId) return res.json({ connected: false });
  try {
    const tokenDoc = await db.collection('gmail_tokens').doc(userId).get();
    res.json({ connected: tokenDoc.exists });
  } catch (err) {
    res.json({ connected: false });
  }
});

// Endpoint to get Gmail OAuth URL for frontend
app.post('/api/gmail/auth', async (req, res) => {
  const { user_id } = req.body;
  
  try {
    console.log('🔍 Gmail OAuth requested for user:', user_id);
    
    // Generate OAuth URL
    const oauth2Client = new google.auth.OAuth2(
      GMAIL_OAUTH_CONFIG.clientId,
      GMAIL_OAUTH_CONFIG.clientSecret,
      GMAIL_OAUTH_CONFIG.redirectUri
    );

    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly'
    ];

    // Use the actual user_id from the request
    const actualUserId = user_id || 'test_user';
    const state = `force_reauth_${Date.now()}_${actualUserId}`;

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
      include_granted_scopes: true,
      state: state
    });

    console.log('✅ Generated OAuth URL for frontend with user ID:', actualUserId);
    
    res.json({ 
      success: true, 
      authUrl: authUrl
    });
  } catch (error) {
    console.error('❌ Error generating OAuth URL:', error);
    res.status(500).json({ error: 'Failed to generate OAuth URL' });
  }
});

// Endpoint to clear Gmail tokens and force re-authorization
app.post('/api/gmail/clear-tokens', async (req, res) => {
  const { user_id } = req.body;
  
  try {
    // Delete existing tokens
    await db.collection('gmail_tokens').doc(user_id).delete();
    
    // Also clear any decoded emails for this user
    const decodedEmailsSnapshot = await db.collection('decoded_emails')
      .where('user_id', '==', user_id)
      .get();
    
    const batch = db.batch();
    decodedEmailsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    
    res.json({ success: true, message: 'Gmail tokens cleared. Please reconnect.' });
  } catch (error) {
    console.error('❌ Error clearing Gmail tokens:', error);
    res.status(500).json({ error: 'Failed to clear tokens' });
  }
});

// Simple endpoint to clear tokens and force reauthorization
app.post('/api/gmail/reauth', async (req, res) => {
  const { user_id } = req.body;
  
  try {
    console.log('🔍 Force reauthorization requested for user:', user_id);
    
    // Use the actual user_id from the request
    const actualUserId = user_id || 'test_user';
    
    // Delete existing tokens
    await db.collection('gmail_tokens').doc(actualUserId).delete();
    console.log('✅ Cleared existing tokens for user:', actualUserId);
    
    // Also clear any decoded emails for this user
    const decodedEmailsSnapshot = await db.collection('decoded_emails')
      .where('user_id', '==', actualUserId)
      .get();
    
    const batch = db.batch();
    decodedEmailsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    console.log('✅ Cleared decoded emails for user:', actualUserId);
    
    // Generate OAuth URL
    const oauth2Client = new google.auth.OAuth2(
      GMAIL_OAUTH_CONFIG.clientId,
      GMAIL_OAUTH_CONFIG.clientSecret,
      GMAIL_OAUTH_CONFIG.redirectUri
    );

    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly'
    ];

    const state = `force_reauth_${Date.now()}_${actualUserId}`;

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
      include_granted_scopes: true,
      state: state
    });

    console.log('✅ Generated re-authorization URL for user:', actualUserId);
    
    res.json({ 
      success: true, 
      message: 'Tokens cleared. Please reconnect your Gmail account.',
      authUrl: authUrl
    });
  } catch (error) {
    console.error('❌ Error in force reauthorization:', error);
    res.status(500).json({ error: 'Failed to force reauthorization' });
  }
});

// Email Decoder Engine - Process emails (Memory Optimized)
app.post('/api/email-decoder/process', async (req, res) => {
  const { user_id } = req.body;
  
  console.log('🔍 Starting email processing for user:', user_id);
  
  if (!user_id) {
    return res.status(400).json({ error: 'user_id is required' });
  }
  
  // Force garbage collection before processing to free memory
  if (global.gc) {
    global.gc();
  }
  
  // Log initial memory usage
  const initialMemUsage = process.memoryUsage();
  console.log('🔍 Initial memory usage:', {
    rss: Math.round(initialMemUsage.rss / 1024 / 1024) + 'MB',
    heapUsed: Math.round(initialMemUsage.heapUsed / 1024 / 1024) + 'MB'
  });
  
  try {
    // Get user preferences for personalized analysis
    let userPreferences = null;
    try {
      const preferencesDoc = await db.collection('user_preferences').doc(user_id).get();
      if (preferencesDoc.exists) {
        userPreferences = preferencesDoc.data();
        console.log('✅ Loaded user preferences for personalized analysis');
      }
    } catch (prefError) {
      console.log('⚠️ Could not load user preferences, proceeding with default analysis');
    }
    
    // Create personalized prompt based on user preferences
    let personalizedPrompt = emailTonePrompt;
    if (userPreferences) {
      const preferenceContext = [];
      
      if (userPreferences.school_keywords) {
        preferenceContext.push(`School/Education Keywords: ${userPreferences.school_keywords}`);
      }
      if (userPreferences.family_keywords) {
        preferenceContext.push(`Family Activities: ${userPreferences.family_keywords}`);
      }
      if (userPreferences.healthcare_keywords) {
        preferenceContext.push(`Healthcare Providers: ${userPreferences.healthcare_keywords}`);
      }
      if (userPreferences.work_keywords) {
        preferenceContext.push(`Work/Company Keywords: ${userPreferences.work_keywords}`);
      }
      if (userPreferences.business_keywords) {
        preferenceContext.push(`Business Terms: ${userPreferences.business_keywords}`);
      }
      if (userPreferences.shopping_keywords) {
        preferenceContext.push(`Shopping/Brands: ${userPreferences.shopping_keywords}`);
      }
      if (userPreferences.services_keywords) {
        preferenceContext.push(`Important Services: ${userPreferences.services_keywords}`);
      }
      
      if (preferenceContext.length > 0) {
        personalizedPrompt = `${emailTonePrompt}\n\n---\n\nPERSONALIZATION CONTEXT:\nThe user has specified these important keywords and contexts:\n${preferenceContext.join('\n')}\n\nWhen analyzing emails, pay special attention to these keywords and contexts. Emails containing these terms should be prioritized appropriately based on their relevance to the user's life.\n\n---\n\n`;
        console.log('🎯 Using personalized prompt with user preferences');
      }
    }
    
    // Get Gmail tokens
    const tokenDoc = await db.collection('gmail_tokens').doc(user_id).get();
    if (!tokenDoc.exists) {
      console.log('❌ No Gmail tokens found for user:', user_id);
      console.log('🔍 Debug: Checking if tokens exist in database...');
      
      // List all documents in gmail_tokens collection for debugging
      const allTokens = await db.collection('gmail_tokens').get();
      console.log('🔍 Debug: Total tokens in database:', allTokens.size);
      allTokens.forEach(doc => {
        console.log('🔍 Debug: Token doc ID:', doc.id);
      });
      
      return res.status(401).json({ 
        error: 'Gmail not connected. Please connect your Gmail account first.',
        needsReauth: true 
      });
    }

    const tokens = tokenDoc.data();
    console.log('🔍 Retrieved tokens for user:', user_id);
    
    const oauth2Client = new google.auth.OAuth2(
      GMAIL_OAUTH_CONFIG.clientId,
      GMAIL_OAUTH_CONFIG.clientSecret,
      GMAIL_OAUTH_CONFIG.redirectUri
    );

    oauth2Client.setCredentials(tokens);

    // Check if tokens are expired and refresh if needed
    if (tokens.expiry_date && Date.now() > tokens.expiry_date) {
      console.log('🔍 Tokens expired, attempting to refresh...');
      try {
        if (!tokens.refresh_token) {
          console.log('❌ No refresh token available');
          await db.collection('gmail_tokens').doc(user_id).delete();
          return res.status(401).json({ 
            error: 'Gmail tokens expired and no refresh token available. Please reconnect your Gmail account.',
            needsReauth: true 
          });
        }

        const { credentials } = await oauth2Client.refreshAccessToken();
        oauth2Client.setCredentials(credentials);
        
        // Update tokens in database
        const updateData = {
          access_token: credentials.access_token,
          expiry_date: credentials.expiry_date
        };
        
        if (credentials.refresh_token) {
          updateData.refresh_token = credentials.refresh_token;
        }
        
        await db.collection('gmail_tokens').doc(user_id).update(updateData);
        console.log('✅ Tokens refreshed successfully');
      } catch (refreshError) {
        console.error('❌ Failed to refresh tokens:', refreshError);
        
        if (refreshError.message && refreshError.message.includes('invalid_grant')) {
          await db.collection('gmail_tokens').doc(user_id).delete();
          return res.status(401).json({ 
            error: 'Gmail tokens expired. Please reconnect your Gmail account.',
            needsReauth: true 
          });
        }
        
        try {
          await db.collection('gmail_tokens').doc(user_id).delete();
        } catch (clearError) {
          console.error('❌ Error clearing tokens:', clearError);
        }
        
        return res.status(401).json({ 
          error: 'Gmail tokens expired. Please reconnect your Gmail account.',
          needsReauth: true 
        });
      }
    }

    // Test the connection with shorter timeout
    try {
      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
      console.log('🔍 Testing Gmail connection...');
      
      await Promise.race([
        gmail.users.getProfile({ userId: 'me' }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Gmail connection test timeout')), 3000)
        )
      ]);
      
      console.log('✅ Gmail connection test successful');
    } catch (connectionError) {
      console.error('❌ Gmail connection test failed:', connectionError);
      
      if (connectionError.message && connectionError.message.includes('invalid_grant')) {
        await db.collection('gmail_tokens').doc(user_id).delete();
        return res.status(401).json({ 
          error: 'Gmail tokens expired. Please reconnect your Gmail account.',
          needsReauth: true 
        });
      }
      
      return res.status(401).json({ 
        error: 'Unable to connect to Gmail. Please reconnect your Gmail account.',
        needsReauth: true 
      });
    }

    // Fetch recent emails with increased results and full content
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    console.log('🔍 Attempting to fetch emails...');
    
    const response = await Promise.race([
      gmail.users.messages.list({
        userId: 'me',
        maxResults: 20  // Fetch up to 20 emails for better context
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Gmail API timeout')), 10000)
      )
    ]);

    console.log('✅ Successfully fetched email list');
    const allMessages = [...(Array.isArray(mockEmails) ? mockEmails : []), ...response.data.messages] || [];
    console.log('🔍 Found', allMessages.length, 'messages');

    if (allMessages.length === 0) {
      console.log('🔍 No messages found, returning empty result');
      return res.json({ 
        success: true, 
        emails: [],
        summary: { total: 0, byType: {}, byCategory: {}, byPriority: {}, highPriority: 0 }
      });
    }

    // Process emails one at a time to reduce memory pressure
    const processedEmails = [];
    for (let i = 0; i < Math.min(allMessages.length, 20); i++) {
      try {
        const msg = allMessages[i];
        // If mock email (ID starts with 'test-fallback-1-'), process directly
        if (msg.id && msg.id.startsWith('test-fallback-1-')) {
          const subject = msg.subject;
          const from = msg.from;
          const date = msg.date;
          const body = msg.body;
          const htmlBody = msg.htmlBody;
          // --- LOGGING ---
          console.log('🔍 Processing MOCK email:', { subject, from, date, body });
          // Use the same GPT prompt and fallback logic as for real emails
          // ... (copy the GPT prompt, OpenAI call, and fallback CTA logic here, using the mock fields) ...
          // --- STRUCTURED GPT PROMPT ---
          const gptPrompt = `${personalizedPrompt}\n\n---\n\nEmail:\nSubject: ${subject}\nFrom: ${from}\nDate: ${date}\nBody: ${body}`;
          const analysis = await callOpenAI(gptPrompt);
          let parsedAnalysis;
          try {
            let cleanResponse = analysis.trim();
            if (cleanResponse.startsWith('```json')) {
              cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
            } else if (cleanResponse.startsWith('```')) {
              cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
            }
            parsedAnalysis = JSON.parse(cleanResponse);
          } catch (parseError) {
            console.error('❌ Failed to parse OpenAI response:', parseError, analysis);
            parsedAnalysis = {
              summary: 'Unable to analyze email content',
              category: 'Handle Now',
              priority: 'Low',
              suggested_actions: ['Dismiss'],
              tone: 'Routine'
            };
          }
          // --- Extract images and links for all emails ---
          let previewImage = null;
          let actionLinks = [];
          if (htmlBody) {
            if (parsedAnalysis.category === 'Commerce Inbox') {
              const imgMatch = htmlBody.match(/<img[^>]+src=["']([^"'>]+)["']/i);
              if (imgMatch) {
                previewImage = imgMatch[1];
              }
            }
            const linkRegex = /<a[^>]+href=["']([^"'>]+)["']/gi;
            let match;
            while ((match = linkRegex.exec(htmlBody)) !== null) {
              actionLinks.push(match[1]);
            }
          }
          // For schedule/calendar emails, add a special action
          if ((parsedAnalysis.category === 'On the Calendar' || parsedAnalysis.category === 'Schedule' || parsedAnalysis.category === 'Calendar') && !actionLinks.includes('add-to-calendar')) {
            actionLinks.unshift('add-to-calendar');
          }
          // Extract links from both plain text and HTML
          function extractUrlsFromText(text) {
            if (!text) return [];
            const urlRegex = /https?:\/\/[\w\-._~:/?#[\]@!$&'()*+,;=%]+/gi;
            return text.match(urlRegex) || [];
          }
          function extractUrlsFromHtml(html) {
            if (!html) return [];
            const cheerio = require('cheerio');
            const $ = cheerio.load(html);
            const links = [];
            $('a[href]').each((_, el) => {
              const href = $(el).attr('href');
              if (href && href.startsWith('http')) links.push(href);
            });
            return links;
          }
          let allLinks = [
            ...extractUrlsFromText(body),
            ...extractUrlsFromHtml(htmlBody)
          ];
          allLinks = [...new Set(allLinks)];
          // If no links found, use Google Search fallback
          let fallbackLink = null;
          if (allLinks.length === 0) {
            const searchQuery = `${subject} ${from.split('<')[0] || ''}`;
            fallbackLink = await googleSearchFallback(searchQuery);
            if (fallbackLink) allLinks.push('google-fallback:' + fallbackLink);
          }
          let eventDetails = null;
          if (["On the Calendar", "Schedule", "Calendar"].includes(parsedAnalysis.category)) {
            // Try to extract event details from subject/body
            // Use simple regex/NLP for now
            const eventTitle = subject || '';
            let eventDate = '';
            let eventTime = '';
            let eventLocation = '';
            let eventDescription = parsedAnalysis.summary || body || '';
            // Try to find a date in the summary/body
            const dateMatch = (eventDescription + ' ' + subject).match(/\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)[^\d\w]{0,3}\s*\d{1,2}(?:,?\s*\d{4})?/i);
            if (dateMatch) eventDate = dateMatch[0];
            // Try to find a time
            const timeMatch = (eventDescription + ' ' + subject).match(/\b(\d{1,2}(:\d{2})?\s*(AM|PM|am|pm))\b/);
            if (timeMatch) eventTime = timeMatch[0];
            // Try to find a location (look for 'at ...' or 'Location: ...')
            const locMatch = (eventDescription + ' ' + subject).match(/at ([A-Za-z0-9 ,.'-]+)/i);
            if (locMatch) eventLocation = locMatch[1];
            eventDetails = {
              title: eventTitle,
              date: eventDate,
              time: eventTime,
              location: eventLocation,
              description: eventDescription
            };
          }
          const processedEmail = {
            id: msg.id,
            sender: from || 'Unknown Sender',
            subject,
            timestamp: isNaN(new Date(date).getTime()) ? Date.now() : new Date(date).getTime(),
            date: date || '',
            ...parsedAnalysis,
            previewImage,
            actionLinks: allLinks,
            eventDetails // <-- add this
          };
          processedEmails.push(processedEmail);
          continue; // Skip to next message
        }
        // ... existing code for real Gmail messages ...

        console.log(`🔍 Processing email ${i + 1}/${Math.min(allMessages.length, 20)}`);
        
        const emailResponse = await Promise.race([
          gmail.users.messages.get({
            userId: 'me',
            id: allMessages[i].id,
            format: 'full'
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Email fetch timeout')), 5000)
          )
        ]);

        const email = emailResponse.data;
        const headers = email.payload.headers || [];
        const getHeader = (name) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';
        const subject = getHeader('Subject');
        const from = getHeader('From');
        const date = getHeader('Date');
        // Extract plain text and HTML body if available
        let body = '';
        let htmlBody = '';
        if (email.payload.parts) {
          for (const part of email.payload.parts) {
            if (part.mimeType === 'text/plain' && part.body && part.body.data) {
              body = Buffer.from(part.body.data, 'base64').toString('utf-8');
            }
            if (part.mimeType === 'text/html' && part.body && part.body.data) {
              htmlBody = Buffer.from(part.body.data, 'base64').toString('utf-8');
            }
          }
        } else if (email.payload.body && email.payload.body.data) {
          body = Buffer.from(email.payload.body.data, 'base64').toString('utf-8');
        }
        // Fallback: if no plain text, use HTML (stripped of tags)
        if (!body && htmlBody) {
          body = htmlBody.replace(/<[^>]+>/g, ' ');
        }

        // --- LOGGING ---
        console.log('🔍 Sending to GPT:', { subject, from, date, body });
        // --- STRUCTURED GPT PROMPT ---
        const gptPrompt = `${personalizedPrompt}\n\n---\n\nEmail:\nSubject: ${subject}\nFrom: ${from}\nDate: ${date}\nBody: ${body}`;
        // --- END STRUCTURED PROMPT ---

        const analysis = await callOpenAI(gptPrompt);
        // --- LOG RAW GPT RESPONSE ---
        console.log('🔍 Raw GPT response:', analysis);
        let parsedAnalysis;
        try {
          // Clean the response - remove markdown code blocks if present
          let cleanResponse = analysis.trim();
          if (cleanResponse.startsWith('```json')) {
            cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
          } else if (cleanResponse.startsWith('```')) {
            cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
          }
          parsedAnalysis = JSON.parse(cleanResponse);
        } catch (parseError) {
          console.error('❌ Failed to parse OpenAI response:', parseError, analysis);
          parsedAnalysis = {
            summary: 'Unable to analyze email content',
            category: 'Handle Now',
            priority: 'Low',
            suggested_actions: ['Dismiss'],
            tone: 'Routine'
          };
        }

        // --- Extract images and links for all emails ---
        let previewImage = null;
        let actionLinks = [];
        if (htmlBody) {
          // For commerce emails, extract first image
          if (parsedAnalysis.category === 'Commerce Inbox') {
            const imgMatch = htmlBody.match(/<img[^>]+src=["']([^"'>]+)["']/i);
            if (imgMatch) {
              previewImage = imgMatch[1];
            }
          }
          // Extract all links for all emails
          const linkRegex = /<a[^>]+href=["']([^"'>]+)["']/gi;
          let match;
          while ((match = linkRegex.exec(htmlBody)) !== null) {
            actionLinks.push(match[1]);
          }
        }
        // For schedule/calendar emails, add a special action
        if ((parsedAnalysis.category === 'On the Calendar' || parsedAnalysis.category === 'Schedule' || parsedAnalysis.category === 'Calendar') && !actionLinks.includes('add-to-calendar')) {
          actionLinks.unshift('add-to-calendar');
        }

        const axios = require('axios');
        const cheerio = require('cheerio');

        function extractUrlsFromText(text) {
          if (!text) return [];
          const urlRegex = /https?:\/\/[\w\-._~:/?#[\]@!$&'()*+,;=%]+/gi;
          return text.match(urlRegex) || [];
        }

        function extractUrlsFromHtml(html) {
          if (!html) return [];
          const $ = cheerio.load(html);
          const links = [];
          $('a[href]').each((_, el) => {
            const href = $(el).attr('href');
            if (href && href.startsWith('http')) links.push(href);
          });
          return links;
        }

        async function googleSearchFallback(query) {
          const apiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY;
          const cx = process.env.GOOGLE_CUSTOM_SEARCH_CX;
          if (!apiKey || !cx) return null;
          try {
            const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}`;
            const resp = await axios.get(url);
            if (resp.data.items && resp.data.items.length > 0) {
              return resp.data.items[0].link;
            }
          } catch (err) {
            console.error('❌ Google Search fallback failed:', err.message);
          }
          return null;
        }

        // Extract links from both plain text and HTML
        let allLinks = [
          ...extractUrlsFromText(body),
          ...extractUrlsFromHtml(htmlBody)
        ];
        allLinks = [...new Set(allLinks)];

        // If no links found, use Google Search fallback
        let fallbackLink = null;
        if (allLinks.length === 0) {
          const searchQuery = `${subject} ${from.split('<')[0] || ''}`;
          fallbackLink = await googleSearchFallback(searchQuery);
          if (fallbackLink) allLinks.push('google-fallback:' + fallbackLink);
        }

        let eventDetails = null;
        if (["On the Calendar", "Schedule", "Calendar"].includes(parsedAnalysis.category)) {
          // Try to extract event details from subject/body
          // Use simple regex/NLP for now
          const eventTitle = subject || '';
          let eventDate = '';
          let eventTime = '';
          let eventLocation = '';
          let eventDescription = parsedAnalysis.summary || body || '';
          // Try to find a date in the summary/body
          const dateMatch = (eventDescription + ' ' + subject).match(/\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)[^\d\w]{0,3}\s*\d{1,2}(?:,?\s*\d{4})?/i);
          if (dateMatch) eventDate = dateMatch[0];
          // Try to find a time
          const timeMatch = (eventDescription + ' ' + subject).match(/\b(\d{1,2}(:\d{2})?\s*(AM|PM|am|pm))\b/);
          if (timeMatch) eventTime = timeMatch[0];
          // Try to find a location (look for 'at ...' or 'Location: ...')
          const locMatch = (eventDescription + ' ' + subject).match(/at ([A-Za-z0-9 ,.'-]+)/i);
          if (locMatch) eventLocation = locMatch[1];
          eventDetails = {
            title: eventTitle,
            date: eventDate,
            time: eventTime,
            location: eventLocation,
            description: eventDescription
          };
        }

        const processedEmail = {
          id: email.id,
          sender: from || 'Unknown Sender',
          subject,
          timestamp: isNaN(new Date(date).getTime()) ? Date.now() : new Date(date).getTime(),
          date: date || '',
          ...parsedAnalysis,
          previewImage,
          actionLinks: allLinks,
          eventDetails // <-- add this
        };
        processedEmails.push(processedEmail);
      } catch (err) {
        console.error('❌ Error processing email:', err);
      }
    }

    // Generate summary
    const summary = {
      total: processedEmails.length,
      byType: {},
      byCategory: {},
      byPriority: {},
      highPriority: 0
    };

    processedEmails.forEach(email => {
      // Handle type field (might not exist in new format)
      const emailType = email.type || 'email';
      summary.byType[emailType] = (summary.byType[emailType] || 0) + 1;
      summary.byCategory[email.category] = (summary.byCategory[email.category] || 0) + 1;
      summary.byPriority[email.priority] = (summary.byPriority[email.priority] || 0) + 1;
      if (email.priority === 'High') summary.highPriority++;  // Note: 'High' not 'high'
    });

    console.log('✅ Email processing completed successfully');
    console.log('📊 Summary:', summary);

    // After processing emails, before saving and before sending response
    // Deduplicate processedEmails by id or (subject+sender+date)
    function dedupeEmails(emails) {
      const seen = new Set();
      const deduped = [];
      for (const e of emails) {
        const key = e.id || e.gmail_id || (e.subject + '|' + e.sender + '|' + e.date);
        if (!seen.has(key)) {
          seen.add(key);
          deduped.push(e);
        }
      }
      return deduped;
    }
    const dedupedProcessedEmails = dedupeEmails(processedEmails);

    // Save processed emails to database
    if (dedupedProcessedEmails.length > 0) {
      console.log('💾 Saving processed emails to database...');
      const batch = db.batch();
      
      dedupedProcessedEmails.forEach(email => {
        const emailRef = db.collection('decoded_emails').doc();
        batch.set(emailRef, {
          user_id: user_id,
          gmail_id: email.id,
          subject: email.subject,
          from: email.sender,
          date: email.date,
          timestamp: email.timestamp,
          created_at: new Date(),
          decoded_data: {
            summary: email.summary,
            category: email.category,
            priority: email.priority,
            suggested_actions: email.suggested_actions,
            tone: email.tone,
            previewImage: email.previewImage,
            actionLinks: email.actionLinks,
            eventDetails: email.eventDetails
          }
        });
      });
      
      await batch.commit();
      console.log(`💾 Saved ${dedupedProcessedEmails.length} emails to database`);
    }

    // Force garbage collection before sending response
    if (global.gc) {
      global.gc();
    }

    // ... before sending the response in the email processing endpoint ...
    console.log('🟢 FULL processedEmails:', JSON.stringify(processedEmails, null, 2));
    // ... existing code ...

    res.json({
      success: true,
      emails: dedupedProcessedEmails,
      summary: summary
    });

  } catch (error) {
    console.error('❌ Email processing failed:', error);
    
    if (error.message && (
      error.message.includes('invalid_grant') || 
      error.message.includes('unauthorized') ||
      error.message.includes('401')
    )) {
      try {
        await db.collection('gmail_tokens').doc(user_id).delete();
        console.log('✅ Cleared invalid tokens');
      } catch (clearError) {
        console.error('❌ Error clearing tokens:', clearError);
      }
      
      return res.status(401).json({ 
        error: 'Gmail tokens expired. Please reconnect your Gmail account.',
        needsReauth: true 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to process emails. Please try again.',
      details: error.message 
    });
  }
});

// Email Decoder Engine - Get decoded emails for a user
app.get('/api/email-decoder/emails', async (req, res) => {
  const { user_id } = req.query;
  
  if (!user_id) {
    return res.status(400).json({ error: 'user_id parameter required' });
  }
  
  try {
    console.log('🔍 Fetching decoded emails for user:', user_id);
    
    const decodedEmailsSnapshot = await db.collection('decoded_emails')
      .where('user_id', '==', user_id)
      .orderBy('created_at', 'desc')
      .limit(50)
      .get();
    
    const emails = [];
    decodedEmailsSnapshot.forEach(doc => {
      const data = doc.data();
      emails.push({
        id: data.gmail_id,
        subject: data.subject,
        from: data.from,
        date: data.date,
        decoded: data.decoded_data
      });
    });
    
    console.log('✅ Found', emails.length, 'decoded emails');
    
    // After processing emails, before saving and before sending response
    // Deduplicate processedEmails by id or (subject+sender+date)
    function dedupeEmails(emails) {
      const seen = new Set();
      const deduped = [];
      for (const e of emails) {
        const key = e.id || e.gmail_id || (e.subject + '|' + e.sender + '|' + e.date);
        if (!seen.has(key)) {
          seen.add(key);
          deduped.push(e);
        }
      }
      return deduped;
    }
    const dedupedEmails = dedupeEmails(emails);
    
    res.json({
      success: true,
      emails: dedupedEmails
    });
    
  } catch (error) {
    console.error('❌ Error fetching decoded emails:', error);
    res.status(500).json({ error: 'Failed to fetch decoded emails' });
  }
});

// Manual token revocation endpoint
app.post('/api/gmail/revoke-all', async (req, res) => {
  try {
    // Delete all Gmail tokens from Firestore
    const tokensSnapshot = await db.collection('gmail_tokens').get();
    const deletePromises = tokensSnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(deletePromises);
    
    // Delete all decoded emails
    const emailsSnapshot = await db.collection('decoded_emails').get();
    const deleteEmailPromises = emailsSnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(deleteEmailPromises);
    
    console.log('✅ All Gmail tokens and emails cleared');
    res.json({ success: true, message: 'All Gmail tokens revoked' });
  } catch (error) {
    console.error('❌ Error revoking tokens:', error);
    res.status(500).json({ error: 'Failed to revoke tokens' });
  }
});

// Email feedback endpoint
app.post('/api/email-decoder/feedback', async (req, res) => {
  const { user_id, email_id, feedback } = req.body;
  if (!user_id || !email_id || !['up', 'down'].includes(feedback)) {
    return res.status(400).json({ error: 'Invalid feedback data' });
  }
  try {
    await db.collection('email_feedback').add({
      user_id,
      email_id,
      feedback,
      timestamp: new Date()
    });
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Failed to store email feedback:', error);
    res.status(500).json({ error: 'Failed to store feedback' });
  }
});

// Decoder feedback endpoint with intelligent learning
app.post('/api/decoder-feedback', async (req, res) => {
  const { emailId, feedback, userId, emailContext } = req.body;
  if (!emailId || !feedback || !userId) {
    return res.status(400).json({ error: 'Missing required feedback fields' });
  }
  
  try {
    // Store the basic feedback
    await db.collection('decoder_feedback').add({
      emailId,
      feedback,
      userId,
      emailContext,
      timestamp: new Date()
    });
    
    // 🧠 INTELLIGENT LEARNING LOGIC
    if (emailContext) {
      await processIntelligentFeedback(userId, feedback, emailContext);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Failed to store decoder feedback:', error);
    res.status(500).json({ error: 'Failed to store feedback' });
  }
});

// Intelligent feedback processing
async function processIntelligentFeedback(userId, feedback, emailContext) {
  try {
    console.log('🧠 Processing intelligent feedback for user:', userId);
    
    const userPreferencesRef = db.collection('user_preferences').doc(userId);
    const userDoc = await userPreferencesRef.get();
    
    let preferences = userDoc.exists ? userDoc.data() : {
      senderPreferences: {},
      categoryPreferences: {},
      actionPreferences: {},
      domainPreferences: {},
      lastUpdated: new Date()
    };
    
    // 📧 SENDER DOMAIN LEARNING
    if (emailContext.senderDomain) {
      const domain = emailContext.senderDomain.toLowerCase();
      if (!preferences.domainPreferences[domain]) {
        preferences.domainPreferences[domain] = { positive: 0, negative: 0, total: 0 };
      }
      
      preferences.domainPreferences[domain].total++;
      if (feedback === 'positive') {
        preferences.domainPreferences[domain].positive++;
      } else {
        preferences.domainPreferences[domain].negative++;
      }
      
      console.log(`🎯 Domain preference updated for ${domain}:`, preferences.domainPreferences[domain]);
    }
    
    // 🏷️ CATEGORY LEARNING
    if (emailContext.category) {
      const category = emailContext.category;
      if (!preferences.categoryPreferences[category]) {
        preferences.categoryPreferences[category] = { positive: 0, negative: 0, total: 0 };
      }
      
      preferences.categoryPreferences[category].total++;
      if (feedback === 'positive') {
        preferences.categoryPreferences[category].positive++;
      } else {
        preferences.categoryPreferences[category].negative++;
      }
      
      console.log(`📂 Category preference updated for ${category}:`, preferences.categoryPreferences[category]);
    }
    
    // 🎯 ACTION LEARNING
    if (emailContext.suggestedActions && emailContext.suggestedActions.length > 0) {
      emailContext.suggestedActions.forEach(action => {
        if (!preferences.actionPreferences[action]) {
          preferences.actionPreferences[action] = { positive: 0, negative: 0, total: 0 };
        }
        
        preferences.actionPreferences[action].total++;
        if (feedback === 'positive') {
          preferences.actionPreferences[action].positive++;
        } else {
          preferences.actionPreferences[action].negative++;
        }
      });
      
      console.log('⚡ Action preferences updated:', emailContext.suggestedActions);
    }
    
    // 🏷️ SENDER LEARNING (for specific senders)
    if (emailContext.sender) {
      const sender = emailContext.sender.toLowerCase();
      if (!preferences.senderPreferences[sender]) {
        preferences.senderPreferences[sender] = { positive: 0, negative: 0, total: 0 };
      }
      
      preferences.senderPreferences[sender].total++;
      if (feedback === 'positive') {
        preferences.senderPreferences[sender].positive++;
      } else {
        preferences.senderPreferences[sender].negative++;
      }
      
      console.log(`👤 Sender preference updated for ${sender}:`, preferences.senderPreferences[sender]);
    }
    
    // Update timestamp
    preferences.lastUpdated = new Date();
    
    // Save updated preferences
    await userPreferencesRef.set(preferences);
    
    console.log('✅ User preferences updated successfully');
    
    // 🚀 TRIGGER RELEVANT INSIGHTS
    await generateUserInsights(userId, preferences, emailContext, feedback);
    
  } catch (error) {
    console.error('❌ Error processing intelligent feedback:', error);
  }
}

// Generate insights based on user preferences
async function generateUserInsights(userId, preferences, emailContext, feedback) {
  try {
    const insights = [];
    
    // Domain-based insights
    if (emailContext.senderDomain) {
      const domain = emailContext.senderDomain.toLowerCase();
      const domainPrefs = preferences.domainPreferences[domain];
      
      if (domainPrefs && domainPrefs.total >= 3) {
        const positiveRate = domainPrefs.positive / domainPrefs.total;
        
        if (feedback === 'negative' && positiveRate < 0.3) {
          insights.push({
            type: 'domain_preference',
            message: `You seem to dislike emails from ${domain}. Consider unsubscribing or filtering these emails.`,
            domain: domain,
            confidence: Math.round((1 - positiveRate) * 100)
          });
        } else if (feedback === 'positive' && positiveRate > 0.7) {
          insights.push({
            type: 'domain_preference',
            message: `You consistently like emails from ${domain}. These are prioritized in your inbox.`,
            domain: domain,
            confidence: Math.round(positiveRate * 100)
          });
        }
      }
    }
    
    // Category-based insights
    if (emailContext.category) {
      const category = emailContext.category;
      const categoryPrefs = preferences.categoryPreferences[category];
      
      if (categoryPrefs && categoryPrefs.total >= 2) {
        const positiveRate = categoryPrefs.positive / categoryPrefs.total;
        
        if (feedback === 'negative' && positiveRate < 0.4) {
          insights.push({
            type: 'category_preference',
            message: `You tend to dislike ${category} emails. Consider adjusting your email processing settings.`,
            category: category,
            confidence: Math.round((1 - positiveRate) * 100)
          });
        } else if (feedback === 'positive' && positiveRate > 0.6) {
          insights.push({
            type: 'category_preference',
            message: `You consistently find ${category} emails valuable. These are highlighted in your inbox.`,
            category: category,
            confidence: Math.round(positiveRate * 100)
          });
        }
      }
    }
    
    // Save insights if any were generated
    if (insights.length > 0) {
      await db.collection('user_insights').add({
        userId,
        insights,
        triggerEmail: emailContext,
        feedback,
        timestamp: new Date()
      });
      
      console.log('💡 Generated insights:', insights);
    }
    
  } catch (error) {
    console.error('❌ Error generating insights:', error);
  }
}

// Serve static files BEFORE the catch-all route
app.use(express.static("public"));

// SPA catch-all route should be last - but AFTER static files
app.get('*', (req, res) => {
  // For the root path, serve auth.html (login page)
  if (req.path === '/' || req.path === '/index.html') {
    res.redirect('/auth.html');
    return;
  }
  // Serve auth.html for authentication
  if (req.path === '/auth' || req.path === '/auth.html') {
    res.sendFile(path.join(__dirname, 'public', 'auth.html'));
    return;
  }
  // Serve dashboard.html for dashboard
  if (req.path === '/dashboard' || req.path === '/dashboard.html') {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
    return;
  }
  // Serve dashboard.html for all other non-API routes (authenticated app)
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
    return;
  }
  // Fallback for any other routes
  res.status(404).send('Not Found');
});

// Cache clearing endpoint for debugging
app.post('/api/clear-cache', (req, res) => {
  knowledgeChunksCache = null;
  cacheTimestamp = null;
  console.log('🧹 Knowledge chunks cache cleared');
  res.json({ success: true, message: 'Cache cleared' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const memUsage = process.memoryUsage();
  const uptime = process.uptime();
  
  res.json({
    status: 'healthy',
    uptime: Math.round(uptime),
    memory: {
      rss: Math.round(memUsage.rss / 1024 / 1024) + 'MB',
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB',
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
      external: Math.round(memUsage.external / 1024 / 1024) + 'MB'
    },
    timestamp: new Date().toISOString()
  });
});

async function startServer() {
  try {
    // Set memory limits and garbage collection
    if (global.gc) {
      // Force garbage collection if available
      global.gc();
    }
    
    // Log initial memory usage
    const memUsage = process.memoryUsage();
    console.log('🔍 Initial Memory Usage:', {
      rss: Math.round(memUsage.rss / 1024 / 1024) + 'MB',
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB',
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
      external: Math.round(memUsage.external / 1024 / 1024) + 'MB'
    });
    
    // Add process protection
    process.setMaxListeners(20);
    
    // Set up server with better error handling
    const server = app.listen(port, () => {
      console.log(`✅ Server listening on port ${port}`);
      console.log('🛡️ Process protection enabled');
    });
    
    // Add error handling for the server
    server.on('error', (err) => {
      console.error('❌ Server error:', err);
      if (err.code === 'EADDRINUSE') {
        console.error('❌ Port 3000 is already in use. Please kill the existing process.');
        process.exit(1);
      }
    });
    
    // Add connection handling
    server.on('connection', (socket) => {
      lastActivity = Date.now();
      socket.on('close', () => {
        lastActivity = Date.now();
      });
    });
    
    // Graceful shutdown with timeout
    const gracefulShutdown = (signal) => {
      console.log(`🔄 ${signal} received, shutting down gracefully...`);
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
      
      // Force exit after 10 seconds if graceful shutdown fails
      setTimeout(() => {
        console.error('❌ Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };
    
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // Handle uncaught exceptions more gracefully
    process.on('uncaughtException', (err) => {
      console.error('❌ Uncaught Exception:', err);
      console.error('❌ Stack trace:', err.stack);
      
      // Log memory usage before potential crash
      const memUsage = process.memoryUsage();
      console.error('❌ Memory usage before crash:', {
        rss: Math.round(memUsage.rss / 1024 / 1024) + 'MB',
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB',
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
        external: Math.round(memUsage.external / 1024 / 1024) + 'MB'
      });
      
      // Don't exit immediately, try to continue
      console.log('🔄 Attempting to continue despite error...');
    });
    
    // Handle unhandled rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      
      // Log memory usage before potential crash
      const memUsage = process.memoryUsage();
      console.error('❌ Memory usage before rejection:', {
        rss: Math.round(memUsage.rss / 1024 / 1024) + 'MB',
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB',
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
        external: Math.round(memUsage.external / 1024 / 1024) + 'MB'
      });
      
      // Don't exit immediately, try to continue
      console.log('🔄 Attempting to continue despite rejection...');
    });
    
  } catch (err) {
    console.error("❌ Server failed to start:", err);
    process.exit(1);
  }
}

startServer();

console.log('End of index.cjs reached');

// Get user preferences and insights
app.get('/api/user-preferences/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const userPreferencesRef = db.collection('user_preferences').doc(userId);
    const userDoc = await userPreferencesRef.get();
    
    if (!userDoc.exists) {
      return res.json({
        preferences: {
          senderPreferences: {},
          categoryPreferences: {},
          actionPreferences: {},
          domainPreferences: {},
          lastUpdated: null
        },
        insights: []
      });
    }
    
    const preferences = userDoc.data();
    
    // Get recent insights
    const insightsSnapshot = await db.collection('user_insights')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(5)
      .get();
    
    const insights = insightsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json({
      preferences,
      insights
    });
    
  } catch (error) {
    console.error('❌ Error fetching user preferences:', error);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

// Get personalized recommendations based on preferences
app.get('/api/user-recommendations/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const userPreferencesRef = db.collection('user_preferences').doc(userId);
    const userDoc = await userPreferencesRef.get();
    
    if (!userDoc.exists) {
      return res.json({ recommendations: [] });
    }
    
    const preferences = userDoc.data();
    const recommendations = [];
    
    // Domain-based recommendations
    Object.entries(preferences.domainPreferences || {}).forEach(([domain, stats]) => {
      if (stats.total >= 3) {
        const positiveRate = stats.positive / stats.total;
        
        if (positiveRate < 0.3) {
          recommendations.push({
            type: 'unsubscribe_suggestion',
            domain: domain,
            message: `Consider unsubscribing from ${domain} - you've disliked ${Math.round((1 - positiveRate) * 100)}% of their emails`,
            confidence: Math.round((1 - positiveRate) * 100),
            action: 'unsubscribe'
          });
        } else if (positiveRate > 0.7) {
          recommendations.push({
            type: 'priority_suggestion',
            domain: domain,
            message: `Emails from ${domain} are consistently valuable to you`,
            confidence: Math.round(positiveRate * 100),
            action: 'prioritize'
          });
        }
      }
    });
    
    // Category-based recommendations
    Object.entries(preferences.categoryPreferences || {}).forEach(([category, stats]) => {
      if (stats.total >= 2) {
        const positiveRate = stats.positive / stats.total;
        
        if (positiveRate < 0.4) {
          recommendations.push({
            type: 'category_adjustment',
            category: category,
            message: `You tend to dislike ${category} emails. Consider filtering or adjusting settings.`,
            confidence: Math.round((1 - positiveRate) * 100),
            action: 'filter'
          });
        } else if (positiveRate > 0.6) {
          recommendations.push({
            type: 'category_highlight',
            category: category,
            message: `${category} emails are valuable to you - they're highlighted in your inbox`,
            confidence: Math.round(positiveRate * 100),
            action: 'highlight'
          });
        }
      }
    });
    
    // Sort by confidence
    recommendations.sort((a, b) => b.confidence - a.confidence);
    
    res.json({ recommendations });
    
  } catch (error) {
    console.error('❌ Error generating recommendations:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

// TEMP: Inject mock email for fallback CTA testing
let mockEmails = [];
try {
  const mockPath = path.join(__dirname, 'mock', 'emails.json');
  const raw = fs.readFileSync(mockPath, 'utf8');
  mockEmails = JSON.parse(raw);
} catch (e) { mockEmails = []; }

// User Preferences API - Save personalization data
app.post('/api/user-preferences/save', async (req, res) => {
  const { 
    user_id, 
    school_keywords, 
    family_keywords, 
    healthcare_keywords, 
    work_keywords, 
    business_keywords, 
    shopping_keywords, 
    services_keywords,
    timestamp 
  } = req.body;
  
  if (!user_id) {
    return res.status(400).json({ error: 'user_id is required' });
  }
  
  try {
    console.log('💾 Saving user preferences for:', user_id);
    
    const preferencesData = {
      user_id,
      school_keywords: school_keywords || '',
      family_keywords: family_keywords || '',
      healthcare_keywords: healthcare_keywords || '',
      work_keywords: work_keywords || '',
      business_keywords: business_keywords || '',
      shopping_keywords: shopping_keywords || '',
      services_keywords: services_keywords || '',
      created_at: new Date(),
      updated_at: new Date()
    };
    
    // Save to Firestore
    await db.collection('user_preferences').doc(user_id).set(preferencesData);
    
    console.log('✅ User preferences saved successfully');
    res.json({ 
      success: true, 
      message: 'Preferences saved successfully',
      data: preferencesData
    });
    
  } catch (error) {
    console.error('❌ Error saving user preferences:', error);
    res.status(500).json({ error: 'Failed to save preferences' });
  }
});

// User Preferences API - Get personalization data
app.get('/api/user-preferences/:user_id', async (req, res) => {
  const { user_id } = req.params;
  
  if (!user_id) {
    return res.status(400).json({ error: 'user_id is required' });
  }
  
  try {
    console.log('📖 Fetching user preferences for:', user_id);
    
    const preferencesDoc = await db.collection('user_preferences').doc(user_id).get();
    
    if (!preferencesDoc.exists) {
      return res.json({ 
        success: true, 
        data: null,
        message: 'No preferences found for this user'
      });
    }
    
    const preferencesData = preferencesDoc.data();
    console.log('✅ User preferences retrieved successfully');
    
    res.json({ 
      success: true, 
      data: preferencesData
    });
    
  } catch (error) {
    console.error('❌ Error fetching user preferences:', error);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

// User Insights API - Get insights for a user
app.get('/api/user-insights/:user_id', async (req, res) => {
  const { user_id } = req.params;
  
  if (!user_id) {
    return res.status(400).json({ error: 'user_id is required' });
  }
  
  try {
    console.log('💡 Fetching user insights for:', user_id);
    
    const insightsSnapshot = await db.collection('user_insights')
      .where('userId', '==', user_id)
      .orderBy('timestamp', 'desc')
      .limit(10)
      .get();
    
    const insights = [];
    insightsSnapshot.forEach(doc => {
      insights.push(doc.data());
    });
    
    console.log('✅ User insights retrieved successfully');
    
    res.json({ 
      success: true, 
      insights: insights
    });
    
  } catch (error) {
    console.error('❌ Error fetching user insights:', error);
    res.status(500).json({ error: 'Failed to fetch insights' });
  }
});

// User Recommendations API - Get personalized recommendations
app.get('/api/user-recommendations/:user_id', async (req, res) => {
  const { user_id } = req.params;
  
  if (!user_id) {
    return res.status(400).json({ error: 'user_id is required' });
  }
  
  try {
    console.log('🎯 Generating recommendations for:', user_id);
    
    // Get user preferences
    const preferencesDoc = await db.collection('user_preferences').doc(user_id).get();
    const preferences = preferencesDoc.exists ? preferencesDoc.data() : {};
    
    // Get recent feedback
    const feedbackSnapshot = await db.collection('decoder_feedback')
      .where('userId', '==', user_id)
      .orderBy('timestamp', 'desc')
      .limit(20)
      .get();
    
    const recommendations = [];
    
    // Generate recommendations based on preferences and feedback
    if (preferences.school_keywords) {
      recommendations.push({
        type: 'school_priority',
        title: 'School Communications',
        message: `Prioritizing emails from: ${preferences.school_keywords}`,
        priority: 'high'
      });
    }
    
    if (preferences.healthcare_keywords) {
      recommendations.push({
        type: 'healthcare_priority',
        title: 'Healthcare Updates',
        message: `Monitoring emails from: ${preferences.healthcare_keywords}`,
        priority: 'high'
      });
    }
    
    // Add feedback-based recommendations
    const positiveFeedback = [];
    const negativeFeedback = [];
    
    feedbackSnapshot.forEach(doc => {
      const feedback = doc.data();
      if (feedback.feedback === 'positive') {
        positiveFeedback.push(feedback);
      } else {
        negativeFeedback.push(feedback);
      }
    });
    
    if (positiveFeedback.length > 0) {
      recommendations.push({
        type: 'positive_pattern',
        title: 'What You Like',
        message: `You've given positive feedback to ${positiveFeedback.length} emails recently`,
        priority: 'medium'
      });
    }
    
    if (negativeFeedback.length > 0) {
      recommendations.push({
        type: 'negative_pattern',
        title: 'What You Don\'t Like',
        message: `You've given negative feedback to ${negativeFeedback.length} emails recently`,
        priority: 'medium'
      });
    }
    
    console.log('✅ User recommendations generated successfully');
    
    res.json({ 
      success: true, 
      recommendations: recommendations
    });
    
  } catch (error) {
    console.error('❌ Error generating recommendations:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});
