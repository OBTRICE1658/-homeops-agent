// Quick test server for calendar endpoint
const express = require('express');
const path = require('path');
const app = express();
const PORT = 3001;

app.use(express.json());
app.use(express.static('public'));

// Calendar Events API for FullCalendar
app.get('/api/calendar-events/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`📅 Getting calendar events for user: ${userId}`);
    
    // Generate sample calendar events with emotional metadata
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const sampleEvents = [
      {
        id: 'cal-1',
        title: 'Morning Workout',
        start: new Date(today.getTime() + 7 * 60 * 60 * 1000).toISOString(),
        end: new Date(today.getTime() + 8 * 60 * 60 * 1000).toISOString(),
        location: 'Home Gym',
        context: 'health',
        stress: 2,
        notes: 'Weekly strength training session'
      },
      {
        id: 'cal-2',
        title: 'Team Standup',
        start: new Date(today.getTime() + 9 * 60 * 60 * 1000).toISOString(),
        end: new Date(today.getTime() + 9.5 * 60 * 60 * 1000).toISOString(),
        location: 'Zoom',
        context: 'work',
        stress: 3,
        notes: 'Daily team sync and project updates'
      },
      {
        id: 'cal-3',
        title: 'Lunch with Sarah',
        start: new Date(today.getTime() + 12 * 60 * 60 * 1000).toISOString(),
        end: new Date(today.getTime() + 13 * 60 * 60 * 1000).toISOString(),
        location: 'Café Luna',
        context: 'personal',
        stress: 1,
        notes: 'Catch up over salads'
      }
    ];
    
    res.json(sampleEvents);
    
  } catch (error) {
    console.error('Calendar events error:', error);
    res.status(500).json({
      error: 'Failed to get calendar events',
      details: error.message
    });
  }
});

// vNext route
app.get('/vnext', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'homeops-vnext.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Calendar Test Server running on port ${PORT}`);
  console.log(`📅 Calendar API: http://localhost:${PORT}/api/calendar-events/vnext-user`);
  console.log(`✨ vNext Interface: http://localhost:${PORT}/vnext`);
});
