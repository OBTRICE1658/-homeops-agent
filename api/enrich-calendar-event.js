// api/enrich-calendar-event.js
// Enriches a calendar event via GPT, stores in Firestore, and syncs to Google Calendar if possible

const { getFirestore, doc, setDoc } = require('firebase-admin/firestore');
const { getGoogleOAuthClient } = require('../services/google-oauth');
const { insertGoogleCalendarEvent } = require('../services/google-calendar');
const { getGPTEnrichment } = require('../services/gpt-enrichment');

module.exports = async function enrichCalendarEvent(req, res) {
  try {
    const { userId, eventId, title, datetime, tags } = req.body;
    if (!userId || !eventId || !title || !datetime) return res.status(400).json({ error: 'Missing fields' });

    // 1. Enrich via GPT
    const enrichment = await getGPTEnrichment({ title, datetime, tags });
    const eventData = {
      title,
      datetime,
      tags: tags || [],
      ...enrichment,
      created_at: new Date().toISOString()
    };

    // 2. Store in Firestore
    const db = getFirestore();
    const eventRef = doc(db, `calendar_events/${userId}/events/${eventId}`);
    await setDoc(eventRef, eventData, { merge: true });

    // 3. Try Google Calendar sync
    let google_event_id = null;
    try {
      const oauth2Client = await getGoogleOAuthClient(userId);
      if (oauth2Client) {
        const gcalEvent = {
          summary: eventData.title,
          description: `Checklist: ${(eventData.checklist || []).join(', ')}${eventData.summary ? '\n' + eventData.summary : ''}`,
          start: { dateTime: eventData.datetime },
          end: { dateTime: new Date(new Date(eventData.datetime).getTime() + 60*60*1000).toISOString() },
          reminders: { useDefault: true }
        };
        const gRes = await insertGoogleCalendarEvent(oauth2Client, gcalEvent);
        if (gRes && gRes.id) {
          google_event_id = gRes.id;
          await setDoc(eventRef, { google_event_id }, { merge: true });
        }
      }
    } catch (err) {
      // Google sync failed, but enrichment succeeded
      console.error('Google Calendar sync error:', err);
    }

    res.json({ ...eventData, google_event_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
