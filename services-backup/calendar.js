class CalendarService {
  constructor() {
    this.calendarKeywords = [
      'calendar', 'schedule', 'appointment', 'meeting', 'event', 'due', 
      'deadline', 'conference', 'trip', 'going on', 'this week', 'next week', 
      'today', 'tomorrow', 'happening', 'busy', 'free time', 'plans'
    ];
  }

  async getRelevantCalendarEvents(message, personalContext) {
    console.log(`📅 Getting relevant calendar events for message context`);
    
    const lowerMessage = message.toLowerCase();
    const isCalendarQuery = this.calendarKeywords.some(keyword => lowerMessage.includes(keyword));
    
    if (isCalendarQuery) {
      // Return calendar events (in production, this would call Google Calendar API)
      const events = [
        {
          title: "Team meeting",
          start: "2025-08-06T10:00:00",  // This week
          day: "Wed",
          time: "10:00 AM",
          allDay: false
        },
        {
          title: "Dentist appointment", 
          start: "2025-08-07T14:00:00",  // This week
          day: "Thu", 
          time: "2:00 PM",
          allDay: false
        },
        {
          title: "Parent-teacher conference",
          start: "2025-08-08T17:00:00",  // This week
          day: "Fri",
          time: "5:00 PM", 
          allDay: false
        },
        {
          title: "Submit project report",
          start: "2025-08-09T17:00:00",  // This week
          day: "Sat",
          time: "5:00 PM",
          allDay: false
        }
      ];
      
      console.log(`✅ Found ${events.length} relevant calendar events`);
      return events;
    }
    
    console.log(`✅ Found 0 relevant calendar events - not a calendar query`);
    return [];
  }

  generateCalendarUrl(event) {
    const startDate = new Date(event.start);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour later
    
    const formatDate = (date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };
    
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
      details: event.description || ''
    });
    
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }
}

module.exports = CalendarService;
