# Calendar Integration Backup - Chat UI Functionality

## Files to Preserve:
- `services/calendar.js` - Calendar service with keyword detection and mock events
- `services/mental-health-coach.js` - Mental health coaching functionality  
- `utils/query-classifier.js` - Query classification for calendar/mental health
- `routes/chat-routes.js` - Enhanced chat routes with calendar integration

## Key Features:
1. **Calendar Event Detection**: Recognizes calendar-related keywords in chat messages
2. **Mock Calendar Events**: Returns realistic calendar events for testing
3. **Mental Health Support**: Sophisticated tone and emotional intelligence
4. **Query Classification**: Intelligently routes different types of queries

## Integration Points:
- Chat endpoint `/api/chat` enhanced with calendar awareness
- Calendar events returned in JSON response under `events` field
- Mental health queries get specialized handling
- Calendar URLs generated for Google Calendar integration

## Status: 
✅ Functionality working correctly
⚠️ Needs to be integrated into restored app
📅 Calendar events properly returned in chat responses
