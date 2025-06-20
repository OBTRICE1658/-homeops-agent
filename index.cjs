require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");
const { DateTime } = require("luxon");
const chrono = require("chrono-node");




let firebaseCredentials;
try {
  const base64 = process.env.FIREBASE_CREDENTIALS;
  const decoded = Buffer.from(base64, "base64").toString("utf-8");
  firebaseCredentials = JSON.parse(decoded);

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(firebaseCredentials),
    });
  }
} catch (err) {
  console.error("❌ Firebase init failed:", err.message);
  process.exit(1);
}

const db = admin.firestore();
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static("public"));

async function extractCalendarEvents(message) {
 const today = new Date().toLocaleDateString("en-US", {
  timeZone: "America/New_York",
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "long"
}); // "Thursday, June 20, 2025"

const prompt = `
You are a datetime parser for HomeOps.

Today is ${today}, and you are operating in the America/New_York timezone.

When given a phrase like "tomorrow at 8am", convert it to an ISO 8601 datetime string in New York time.

⚠️ Do not return UTC time.  
⚠️ Do not include 'Z' or time zone offsets.  
✅ Only return a valid raw JSON object like this:

{ "start": "2025-06-21T08:00:00" }

No markdown, no commentary. Just the raw JSON object.
`.trim();


  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o",
        temperature: 0.2,
        response_format: "json",
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: message }
        ]
      })
    });

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content || "";
    return JSON.parse(raw); // Should be an array of { title, start, allDay }
  } catch (err) {
    console.error("❌ Failed to extract calendar events:", err);
    return [];
  }
}


  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: message }
        ]
      })
    });

    const data = await res.json();
    let raw = data.choices?.[0]?.message?.content || "[]";
    raw = raw.replace(/```json|```/g, "").trim();

    const match = raw.match(/\[\s*{[\s\S]*?}\s*\]/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      console.log("📤 Parsed events from GPT:", parsed);
      return parsed;
    } else {
      console.warn("📭 No calendar events found.");
      return [];
    }

  } catch (err) {
    console.error("❌ extractCalendarEvents failed:", err.message);
    return [];
  }
}


const todayEastern = DateTime.now().setZone("America/New_York").toISODate();

const todayEastern = DateTime.now().setZone("America/New_York").toISODate();

const todayEastern = DateTime.now().setZone("America/New_York").toISODate();

const systemPrompt = `You are HomeOps — a personal chief of staff for busy families.

Today is ${todayEastern}, and you operate in the America/New_York timezone.

You are NOT responsible for converting relative time phrases like "tomorrow" or "next Friday" into specific dates. Just extract event details as written by the user.

When a user shares a message, your job is to:
1. Write a short, emotionally intelligent reply — 1–2 lines. Be warm, brief, and clear. No filler or backticks.
2. Extract all time-based phrases *exactly as spoken* (e.g., "tomorrow at 9am", "next Friday at noon") and return them in a JSON array.

The backend will convert relative phrases to exact dates.

Respond like this:

✅ Got it. Haircut tomorrow at 10 and swim lesson Friday afternoon — both noted.

[
  {
    "title": "Haircut",
    "when": "tomorrow at 10am"
  },
  {
    "title": "Swim lesson",
    "when": "Friday afternoon"
  }
]`;


app.post("/chat", async (req, res) => {
  const { user_id = "user_123", message } = req.body;

  try {
    // 1. Generate the tone reply
    const tonePrompt = `You are HomeOps — a personal chief of staff for busy families.

Write a short, emotionally intelligent reply to this message. Be warm, validating, and clear. One or two lines only.`;

    const toneRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o",
        temperature: 0.2,
        messages: [
          { role: "system", content: tonePrompt },
          { role: "user", content: message }
        ]
      })
    });

    const toneData = await toneRes.json();
    const toneReply = toneData.choices?.[0]?.message?.content || "✅ Noted.";

    // 2. Extract time-based phrases
    const extractPrompt = `Extract all time-based events from this message and return them in JSON. Do not resolve time. Use the exact phrasing the user used.

Format:
[
  { "title": "Doctor appointment", "when": "tomorrow at 9am" },
  { "title": "Wedding", "when": "Friday at 2pm" }
]`;

    const extractRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o",
        temperature: 0.2,
        response_format: "json",
        messages: [
          { role: "system", content: extractPrompt },
          { role: "user", content: message }
        ]
      })
    });

    const extractData = await extractRes.json();
    const raw = extractData.choices?.[0]?.message?.content || "";
    const parsed = JSON.parse(raw); // parsed = array of { title, when }
    console.log("🧪 Extracted events from GPT:", parsed);


    // 3. Convert 'when' → 'start'
    const events = [];

    for (const item of parsed) {
      const { title, when } = item;

      try {
        const parseRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "gpt-4o",
            temperature: 0.2,
            response_format: "json",
            messages: [
              {
                role: "system",
                content: `
You are a datetime parser for HomeOps. Convert natural time phrases into ISO 8601 timestamps assuming the America/New_York timezone.

Only return a valid JSON object like this:
{ "start": "2025-06-21T09:00:00" }

Do not include 'Z' or any timezone offset.
Do not convert to UTC.
Assume the user is in New York and return timestamps in local time.

No markdown, no extra text.

                `.trim()
              },
              { role: "user", content: when }
            ]
          })
        });

        const parsedTime = await parseRes.json();
        const content = parsedTime.choices?.[0]?.message?.content.trim();
let parsedStart = null;

try {
try {
  const json = JSON.parse(content);
  parsedStart = json.start;

  // 🧼 Strip Z if present (prevents UTC time shift)
  if (parsedStart?.includes("Z")) {
    console.warn("⚠️ Stripping Z from parsedStart to avoid UTC offset");
    parsedStart = parsedStart.replace("Z", "");
  }

  // 🪵 Log what GPT returned and the final value being used
  console.log("📥 GPT raw content:", content);
  console.log("🕓 Converted:", when, "→", parsedStart);

} catch (err) {
  console.error("❌ Failed to parse GPT content as JSON:", content);
}



        if (parsedStart) {
          events.push({
            title: title?.trim() || "Untitled Event",
            start: parsedStart,
            allDay: false
          });
        } else {
          console.warn("⚠️ Could not parse:", when);
        }

      } catch (err) {
        console.error("❌ Date parsing failed:", err.message);
      }
    }

    // 4. Return response to frontend
    res.json({ reply: toneReply, events });
    console.log("📦 Final events being sent:", events);


  } catch (err) {
    console.error("❌ /chat route failed:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});


    // GPT call 1 — tone reply
    const toneRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: tonePrompt },
          { role: "user", content: message }
        ]
      })
    });

    const toneData = await toneRes.json();
    const gptReply = toneData.choices?.[0]?.message?.content || "Got it.";

    // GPT call 2 — extract JSON with "when"
   const extractRes = await fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "gpt-4o",
    temperature: 0.2,
    response_format: "json", // 🧠 forces GPT to return pure JSON
    messages: [
      {
        role: "system",
        content: `
You are HomeOps — a structured household assistant.
When the user shares calendar-related messages, respond only with a valid JSON object in this format:

{
  "reply": "✅ I’ve added your events to the calendar.",
  "events": [
    {
      "title": "Doctor Appointment",
      "start": "2025-06-21T14:00:00",
      "allDay": false
    },
    {
      "title": "Golf",
      "start": "2025-06-22T12:00:00",
      "allDay": false
    }
  ]
}

⚠️ Do not include markdown, code blocks, or natural language outside the 'reply'. Always return only valid JSON.
        `.trim()
      },
      {
        role: "user",
        content: message
      }
    ]
  })
});


  const result = await extractRes.json();

let events = [];
let reply = "✅ I’ve added your events.";

try {
  if (result.choices?.[0]?.message?.content) {
    const parsed = JSON.parse(result.choices[0].message.content);
    events = parsed.events || [];
    reply = parsed.reply || reply;
  }
} catch (err) {
  console.error("❌ GPT JSON parsing failed:", err.message);
}


    // Convert "when" → "start"
    const events = parsed.map((event) => {
      const parsedDate = chrono.parseDate(event.when, {
        timezone: "America/New_York"
      });

      return {
        title: event.title,
        start: DateTime.fromJSDate(parsedDate).setZone("America/New_York").toISO(),
        allDay: false
      };
    });

 console.log("✅ Final parsed events:", events);

// Optional: log GPT's full response for debugging
console.log("🧪 Full GPT reply content:", gptReply);

// Save message + reply for audit/logging
await db.collection("messages").add({
  user_id,
  message,
  reply: gptReply,
  timestamp: new Date()
});

// Respond to frontend
res.json({ reply: gptReply, events });



// ✅ Save event to Firestore
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
      event.start = DateTime.fromJSDate(parsedStart).setZone("America/New_York").toISO();
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
  try {
    const snapshot = await db.collection("events").orderBy("start").get();
    const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(events);
  } catch (err) {
    console.error("❌ Failed to fetch events:", err.message);
    res.status(500).json({ error: "Failed to fetch events" });
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

app.post("/api/this-week", async (req, res) => {
  const { messages } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "No messages provided." });
  }

  const todayEastern = DateTime.now().setZone("America/New_York").toISODate();

  const systemPrompt = `You are HomeOps — a smart, emotionally fluent household assistant.

Today is ${todayEastern}, and you operate in the America/New_York timezone.

Your job is to extract all upcoming appointments or time-sensitive obligations from the user's messages for the current week.
Group them by day, format with emoji and clarity, and then reply with a 2–3 sentence commentary using wit and validation.

Format:

🛂 Tuesday @ 11 AM — Passport appointment  
🎾 Wednesday — Lucy’s tennis match  

Commentary here.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: messages.map(m => `• ${m}`).join("\n") }
        ]
      })
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0]?.message?.content) {
      console.error("🛑 GPT response missing content:", data);
      return res.status(500).json({ error: "Invalid GPT response format" });
    }

    const text = data.choices[0].message.content;
    res.json({ summary: text });
  } catch (err) {
    console.error("❌ /api/this-week failed:", err.message);
    res.status(500).json({ error: "Weekly summary failed" });
  }
});


  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || "Couldn’t summarize this week.";
  res.json({ summary: text });
} catch (err) {
  console.error("❌ /api/this-week failed:", err.message);
  res.status(500).json({ error: "Weekly summary failed" });
}


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

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
  console.log(`✅ Server listening on port ${port}`);
});
