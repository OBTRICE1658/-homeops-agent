// services/google-calendar.js
// Helper for Google Calendar API event insert/update/delete

const { google } = require('googleapis');

async function insertGoogleCalendarEvent(oauth2Client, event) {
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  const res = await calendar.events.insert({
    calendarId: 'primary',
    resource: event,
  });
  return res.data;
}

async function updateGoogleCalendarEvent(oauth2Client, google_event_id, event) {
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  const res = await calendar.events.update({
    calendarId: 'primary',
    eventId: google_event_id,
    resource: event,
  });
  return res.data;
}

async function deleteGoogleCalendarEvent(oauth2Client, google_event_id) {
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  await calendar.events.delete({
    calendarId: 'primary',
    eventId: google_event_id,
  });
  return true;
}

module.exports = {
  insertGoogleCalendarEvent,
  updateGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
};
