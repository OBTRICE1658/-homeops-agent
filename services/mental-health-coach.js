const fs = require('fs');
const path = require('path');

class MentalHealthCoach {
  constructor() {
    this.mentalHealthKeywords = [
      'overwhelmed', 'stressed', 'anxious', 'tired', 'exhausted', 
      'burned out', 'feeling', 'mental load', 'pressure', 'worry', 
      'difficult', 'struggling', 'help me', 'support', 'cope'
    ];
    
    this.shortPromptResponses = [
      "Tell me what's going on?",
      "What's weighing on you right now?", 
      "Walk me through what happened.",
      "What's the load you're carrying today?",
      "What's pulling at you?",
      "What's making this feel heavy?"
    ];
  }

  isMentalHealthQuery(message) {
    const lowerMessage = message.toLowerCase();
    return this.mentalHealthKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  isShortPrompt(message) {
    return message.trim().split(' ').length <= 3;
  }

  getFollowUpQuestion() {
    return this.shortPromptResponses[Math.floor(Math.random() * this.shortPromptResponses.length)];
  }

  loadTonePrompt() {
    try {
      const tonePrompt = fs.readFileSync(path.join(__dirname, '..', 'prompts', 'tone-homeops.txt'), 'utf8');
      console.log('✅ Loaded sophisticated tone prompt (263 lines)');
      return tonePrompt;
    } catch (error) {
      console.error('❌ Error loading tone prompt:', error);
      return this.getFallbackPrompt();
    }
  }

  getFallbackPrompt() {
    return `You are HomeOps, a personal chief of staff for modern family life. 
You work with high-performing parents who are managing households, companies, and partnerships.
Be direct, empowering, and emotionally intelligent. Validate their load, then provide structure.
Use the tone of Mel Robbins, the Gottmans, and Andrew Huberman - no fluff, just clarity.`;
  }

  buildContextualizedPrompt(tonePrompt, personalContext, userId, emailContext) {
    return `${tonePrompt}

CURRENT USER CONTEXT:
- Time: ${personalContext.today.timeOfDay} on ${personalContext.today.dayOfWeek}, ${personalContext.today.dateString}
- User ID: ${userId}
${personalContext.preferences.hasData ? `- Brand Preferences: ${personalContext.preferences.brands.customizationText}` : ''}
${personalContext.emails.hasData ? `- Recent Email Activity: ${personalContext.emails.recent.length} emails processed` : ''}
${emailContext}

QUERY TYPE ANALYSIS:
- MENTAL HEALTH/EMOTIONAL SUPPORT QUERY DETECTED: Use life coach tone (Mel Robbins, Gottmans, Huberman, etc.). Be direct, empowering, emotionally intelligent. Validate load, then provide structure. No fluff.

RESPONSE GUIDELINES:
- Focus on emotional support and practical structure
- Validate the user's experience once, then move to actionable advice
- Use the sophisticated tone from the prompt above
- Be direct and helpful, not performative`;
  }
}

module.exports = MentalHealthCoach;
