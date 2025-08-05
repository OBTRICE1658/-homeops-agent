class QueryClassifier {
  constructor() {
    this.calendarKeywords = [
      'calendar', 'schedule', 'appointment', 'meeting', 'event', 'due', 
      'deadline', 'conference', 'trip', 'going on', 'this week', 'next week', 
      'today', 'tomorrow', 'happening', 'busy', 'free time', 'plans'
    ];
    
    this.mentalHealthKeywords = [
      'overwhelmed', 'stressed', 'anxious', 'tired', 'exhausted', 
      'burned out', 'feeling', 'mental load', 'pressure', 'worry', 
      'difficult', 'struggling', 'help me', 'support', 'cope'
    ];
    
    this.emailKeywords = [
      'email', 'mail', 'message', 'inbox', 'deal', 'purchase', 'order'
    ];
  }

  classifyQuery(message) {
    const lowerMessage = message.toLowerCase();
    
    return {
      isCalendarQuery: this.calendarKeywords.some(keyword => lowerMessage.includes(keyword)),
      isMentalHealthQuery: this.mentalHealthKeywords.some(keyword => lowerMessage.includes(keyword)),
      isEmailQuery: this.emailKeywords.some(keyword => lowerMessage.includes(keyword)),
      isShortPrompt: message.trim().split(' ').length <= 3,
      message: lowerMessage
    };
  }

  shouldSkipCommerce(classification, hasEmailInsights) {
    return hasEmailInsights || 
           classification.isCalendarQuery || 
           classification.isMentalHealthQuery;
  }

  getResponseMode(classification, hasEmailInsights, hasCalendarEvents, hasCommerceRecommendations) {
    if (hasEmailInsights) {
      return { mode: 'email', description: `Email-focused with ${hasEmailInsights} insights` };
    }
    
    if (classification.isMentalHealthQuery) {
      const subMode = classification.isShortPrompt ? 'short prompt - encouraging elaboration' : 'detailed response';
      return { mode: 'mental-health', description: `Mental health/emotional support (${subMode})` };
    }
    
    if (classification.isCalendarQuery && hasCalendarEvents) {
      return { mode: 'calendar', description: `Calendar-focused with ${hasCalendarEvents} events` };
    }
    
    if (hasCommerceRecommendations) {
      return { mode: 'commerce', description: 'Commerce-focused' };
    }
    
    return { mode: 'chat', description: 'Chat-focused' };
  }
}

module.exports = QueryClassifier;
