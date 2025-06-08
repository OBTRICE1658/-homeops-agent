const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const admin = require("firebase-admin");
const path = require("path");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static("public"));

const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

// ✅ Chat route
app.post("/chat", async (req, res) => {
  const { user_id = "user_123", message } = req.body;

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `
You are HomeOps: an emotionally intelligent household assistant. 
Respond with empathy, humor, and insight. Always suggest scripts to help reduce mental load.
            `,
          },
          {
            role: "user",
            content: message,
          },
        ],
      }),
    });

    const data = await openaiRes.json();
    const reply = data.choices?.[0]?.message?.content || "Sorry, I had a brain freeze.";
    const tags = ["mental load", "resentment"]; // Placeholder

    await db.collection("messages").add({
      user_id,
      message,
      reply,
      tags,
      timestamp: new Date(),
    });

    res.json({ reply });
  } catch (err) {
    console.error("❌ Error in /chat route:", err.message, err.stack);
    res.status(500).json({ error: "Something went wrong." });
  }
});

// ✅ Messages fetch route with better logging
app.get("/api/messages", async (req, res) => {
  const { user_id } = req.query;

  try {
    const snapshot = await db
      .collection("messages")
      .where("user_id", "==", user_id)
      .orderBy("timestamp", "desc")
      .limit(25)
      .get();

    const data = snapshot.docs.map(doc => doc.data());
    res.json(data);
  } catch (error) {
    console.error("🔥 Failed to fetch messages:", error.message, error.stack);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

app.listen(port, () => {
  console.log(`✅ Server listening on port ${port}`);
});
