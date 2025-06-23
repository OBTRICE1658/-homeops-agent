console.log("🚀 DEPLOYMENT VERSION 10 - CLEANED UP BACKEND - " + new Date().toISOString());

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");
const chrono = require("chrono-node");
const { OpenAI } = require("openai");
const cors = require("cors");

// Initialize Firebase from environment variables
try {
  const base64 = process.env.FIREBASE_CREDENTIALS;
  if (!base64) {
    throw new Error("FIREBASE_CREDENTIALS environment variable is not set.");
  }
  const decoded = Buffer.from(base64, "base64").toString("utf-8");
  const firebaseCredentials = JSON.parse(decoded);

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(firebaseCredentials),
    });
    console.log("✅ Firebase initialized successfully via environment variable.");
  }
} catch (err) {
  console.error("❌ Firebase initialization failed:", err.message);
  console.error("Please ensure your .env file is correctly configured with a base64-encoded FIREBASE_CREDENTIALS value.");
  process.exit(1);
}

const db = admin.firestore();
const app = express();
const port = process.env.PORT || 3000;

// Load the persona file content at startup
let tonePromptContent = "";
try {
  tonePromptContent = fs.readFileSync(path.join(__dirname, "prompts", "tone-homeops.txt"), "utf-8");
  console.log("✅ Persona file loaded successfully.");
} catch (err) {
  console.error("❌ Failed to load persona file:", err.message);
}

app.use(bodyParser.json());
app.use(express.static("public"));

// Enable CORS for all routes
app.use(cors({
  origin: [
    'https://homeops-web.web.app',
    'https://homeops-web.firebaseapp.com',
    'http://localhost:3000',
    'http://localhost:5000'
  ],
  credentials: true
}));

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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
  const snapshot = await db.collection('knowledge_chunks').get();
  const chunks = snapshot.docs.map(doc => doc.data());
  for (const chunk of chunks) {
    chunk.sim = cosineSimilarity(userEmbedding, chunk.embedding);
  }
  chunks.sort((a, b) => b.sim - a.sim);
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

// --- Calendar Event Management ---
async function saveEventToFirestore(event, userId) {
  try {
    const eventRef = db.collection("events").doc();
    const eventWithId = {
      ...event,
      id: eventRef.id,
      user_id: userId,
      created_at: new Date()
    };
    
    await eventRef.set(eventWithId);
    console.log("✅ Event saved to Firestore:", eventWithId.id);
    return eventWithId;
  } catch (error) {
    console.error("❌ Error saving event to Firestore:", error);
    throw error;
  }
}

// --- API Endpoints ---

// Health check endpoint
app.get("/health", (req, res) => {
  console.log("🏥 Health check requested");
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    firebase: !!db,
    openai: !!process.env.OPENAI_API_KEY
  });
});

// Chat endpoint
app.post("/chat", async (req, res) => {
  console.log("🔍 /chat endpoint called with:", { userId: req.body.userId, messageLength: req.body.message?.length });
  
  const { userId, message } = req.body; // Use userId consistently
  if (!userId || !message) {
    console.log("❌ Missing userId or message:", { userId: !!userId, message: !!message });
    return res.status(400).json({ error: "User ID and message are required" });
  }

  try {
    console.log("📚 Step 1: Fetching conversation history...");
    // Step 1: Fetch conversation history from the 'chats' collection
    const messagesSnapshot = await db.collection("chats")
      .where("userId", "==", userId)
      .limit(10)
      .get();

    const history = messagesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        user: data.user_message,
        assistant: data.assistant_response
      };
    }).reverse();
    console.log("✅ History fetched, messages count:", history.length);

    // Step 2: Get RAG context
    console.log("🔍 Step 2: Getting RAG context...");
    let ragContext = "";
    try {
      const userEmbedding = await createEmbedding(message);
      const topChunks = await getTopKRelevantChunks(userEmbedding, 5);
      ragContext = topChunks.map(c => anonymizeText(c.content)).join("\n---\n");
      console.log("✅ RAG context fetched, length:", ragContext.length);
    } catch (e) {
      console.error("⚠️ RAG context fetch failed:", e.message);
      // Not fatal, can proceed without RAG context
    }

    // Step 3: Define the system prompt for the AI
    console.log("🤖 Step 3: Preparing OpenAI request...");
    const systemPrompt = `
Your one and only job is to act as a persona synthesizer. You will be given a block of text under "Relevant context". You MUST adopt the tone, style, and personality of the author of that text to answer the user's message.
---
Relevant context from the knowledge base:
${ragContext}
---
Your task is to synthesize a response that is 100% in-character with the context provided.
It is a hard failure if you provide a generic, list-based answer.
Your response must be a conversational paragraph that captures the unique tone and style of the context.
**Final check:** Does my response sound like a generic AI assistant? If it does, you have failed. Rewrite it to be in-character.
Never mention the names of any real people, authors, or public figures.
Today's date is: ${getCurrentDate()}.
After crafting your in-character reply, extract any new calendar events found ONLY in the user's most recent message.
Respond with ONLY a single, valid JSON object in this format:
{
  "reply": "Your in-character, conversational reply synthesized from the knowledge base goes here.",
  "events": [
    { "title": "Event Title", "when": "A descriptive, natural language time like 'This coming Tuesday at 2pm' or 'August 15th at 10am'", "allDay": false }
  ]
}`.trim();

    // Step 4: Construct the message history for the API
    const messagesForApi = [
      { role: "system", content: systemPrompt },
      ...history.flatMap(msg => [
        { role: "user", content: msg.user },
        ...(msg.assistant ? [{ role: "assistant", content: msg.assistant }] : [])
      ]),
      { role: "user", content: message }
    ];
    console.log("✅ Messages prepared for API, count:", messagesForApi.length);

    // Step 5: Call the OpenAI API
    console.log("🚀 Step 4: Calling OpenAI API...");
    console.log("🔑 OpenAI API Key present:", !!process.env.OPENAI_API_KEY);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messagesForApi,
      temperature: 0.7,
      top_p: 1,
      response_format: { type: "json_object" },
    });

    const assistant_response_text = completion.choices[0].message.content;
    console.log("✅ OpenAI response received, length:", assistant_response_text.length);
    console.log("📄 OpenAI API Response Body:", assistant_response_text);
    
    let assistant_response_json;
    try {
      assistant_response_json = JSON.parse(assistant_response_text);
      console.log("✅ JSON parsed successfully");
    } catch (parseError) {
      console.error("❌ Failed to parse OpenAI response JSON:", parseError);
      // Create a fallback response if parsing fails
      assistant_response_json = { reply: assistant_response_text, events: [] };
    }

    // Ensure 'reply' field exists
    if (!assistant_response_json.reply) {
      console.log("⚠️ 'reply' field missing, using fallback");
      assistant_response_json.reply = "I'm sorry, I had trouble generating a proper response. Please try again.";
    }

    // Step 6: Save the new message to Firestore
    console.log("💾 Step 5: Saving to Firestore...");
    await db.collection('chats').add({
      userId: userId,
      user_message: message,
      assistant_response: assistant_response_json.reply,
      timestamp: new Date()
    });
    console.log("✅ Message saved to Firestore");

    // Step 7: Send the response to the client
    console.log("📤 Step 6: Sending response to client");
    res.json(assistant_response_json);

  } catch (err) {
    console.error("❌ /chat endpoint failed:", err);
    console.error("❌ Error stack:", err.stack);
    res.status(500).json({ error: "Failed to process your request." });
  }
});

// Save calendar event endpoint
app.post("/api/save-event", async (req, res) => {
  console.log("📅 /api/save-event called with:", req.body);
  const { event, user_id } = req.body;
  
  if (!event || !event.title || !event.when || !user_id) {
    console.log("❌ Missing required fields:", { hasEvent: !!event, hasTitle: !!event?.title, hasWhen: !!event?.when, hasUserId: !!user_id });
    return res.status(400).json({ error: "Missing event title, when, or user_id." });
  }

  try {
    console.log("🔄 Parsing event time:", event.when);
    // Parse the natural language "when" string
    const referenceDate = new Date();
    const parsedStart = chrono.parseDate(event.when, referenceDate, { forwardDate: true });

    if (!parsedStart) {
      console.log("❌ Could not parse event time:", event.when);
      return res.status(400).json({ error: "Could not parse the event time." });
    }

    const startISO = new Date(parsedStart).toISOString();
    console.log("✅ Parsed time:", { original: event.when, parsed: startISO });
    
    const eventToSave = {
      title: event.title,
      start: startISO,
      allDay: event.allDay || false,
      user_id: user_id
    };

    console.log("💾 Saving event to Firestore:", eventToSave);
    const savedEvent = await saveEventToFirestore(eventToSave, user_id);
    console.log("✅ Event saved successfully:", savedEvent);
    res.json({ success: true, event: savedEvent });
  } catch (err) {
    console.error("❌ Failed to save event:", err.message);
    res.status(500).json({ error: "Failed to save event" });
  }
});

// Get events endpoint
app.get("/api/get-events", async (req, res) => {
  const { user_id } = req.query;
  
  console.log("📅 /api/get-events called for user_id:", user_id);
  if (!user_id) {
    return res.status(400).json({ error: "User ID is required." });
  }

  try {
    const snapshot = await db.collection("events")
      .where("user_id", "==", user_id)
      .get();
    
    const events = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log(`📅 Found ${events.length} events for user_id ${user_id}`);
    res.json(events);
  } catch (err) {
    console.error("❌ Failed to fetch events:", err.message);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// Update event endpoint
app.put("/api/update-event/:id", async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  if (!id || !updatedData) {
    return res.status(400).json({ error: "Event ID and update data are required." });
  }

  try {
    const eventRef = db.collection("events").doc(id);
    await eventRef.update({
      ...updatedData,
      updated_at: new Date()
    });
    res.json({ success: true, message: `Event ${id} updated.` });
  } catch (err) {
    console.error(`❌ Failed to update event ${id}:`, err.message);
    res.status(500).json({ error: "Failed to update event" });
  }
});

// Delete event endpoint
app.delete("/api/delete-event/:id", async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "Event ID is required." });
  }

  try {
    await db.collection("events").doc(id).delete();
    res.json({ success: true, message: `Event ${id} deleted.` });
  } catch (err) {
    console.error(`❌ Failed to delete event ${id}:`, err.message);
    res.status(500).json({ error: "Failed to delete event" });
  }
});

// Clear all events endpoint
app.post("/api/clear-events", async (req, res) => {
  const { user_id } = req.body;
  
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

// Dashboard endpoint
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

    messages.forEach(({ message, assistant_response }) => {
      const text = `${message} ${assistant_response}`.toLowerCase();
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

// Relief protocol endpoint
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

// Reframe protocol endpoint
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

    if (!data.choices || !data.choices[0]?.message?.content) {
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

// Secure endpoint to provide Firebase config
app.get("/api/firebase-config", (req, res) => {
  const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID
  };
  
  res.json(firebaseConfig);
});

// Dashboard page route
app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// Catch-all route for SPA - only serve index.html for root path
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

function getCurrentDate() {
  return new Date().toDateString();
}

// Start server
app.listen(port, () => {
  console.log(`✅ Server listening on port ${port}`);
});

