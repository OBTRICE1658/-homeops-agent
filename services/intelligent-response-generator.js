const OpenAI = require('openai');

class IntelligentResponseGenerator {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async generate(message, context) {
    const systemPrompt = this.buildSystemPrompt(context);
    const enhancedMessage = this.enrichMessageWithContext(message, context);
    
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: enhancedMessage }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      return {
        content: response.choices[0].message.content,
        contextUsed: this.summarizeContextUsage(context),
        suggestions: this.generateFollowUpSuggestions(message, context)
      };
    } catch (error) {
      console.error('Response generation error:', error);
      return {
        content: "I'm having trouble processing that right now. Could you try again?",
        error: error.message
      };
    }
  }

  buildSystemPrompt(context) {
    return `You are HomeOps, an intelligent personal assistant with deep knowledge of the user's digital life.

CURRENT CONTEXT:
- Email: ${context.email?.recent?.length || 0} recent emails, ${context.email?.urgentCount || 0} urgent
- Mental Load: ${context.mentalLoad?.score || 'unknown'}/100 (${context.mentalLoad?.stressLevel || 'normal'})
- Commerce: ${context.commerce?.activeDeals?.length || 0} active deals, ${context.commerce?.dtcBrands?.length || 0} DTC brands
- Shopping: $${context.commerce?.totalSavings || 0} potential savings

CAPABILITIES:
- Email analysis and prioritization
- DTC brand detection and commerce intelligence
- Mental load assessment and stress management
- Shopping deal optimization and recommendations
- Calendar management and scheduling

PERSONALITY:
- Professional yet friendly, like a chief of staff
- Proactive in offering relevant suggestions
- Data-driven but empathetic
- Focus on reducing mental load and optimizing daily life

IMPORTANT RESPONSE RULES:
1. For deal/shopping queries: Focus on actual commerce data from context
2. For calendar queries: Provide scheduling help and time management
3. For email queries: Prioritize urgent items and actionable insights
4. For general questions: Use context to provide personalized responses
5. Always be direct and actionable, not generic

Always consider the user's current mental load and provide contextually relevant assistance.`;
  }

  enrichMessageWithContext(message, context) {
    let enrichedMessage = message;

    // Analyze query type
    const lowerMessage = message.toLowerCase();
    const isDealsQuery = lowerMessage.includes('deal') || lowerMessage.includes('sale') || lowerMessage.includes('discount') || lowerMessage.includes('shopping');
    const isCalendarQuery = lowerMessage.includes('calendar') || lowerMessage.includes('schedule') || lowerMessage.includes('meeting') || lowerMessage.includes('appointment') || lowerMessage.includes('going on') || lowerMessage.includes('this week') || lowerMessage.includes('next week') || lowerMessage.includes('today') || lowerMessage.includes('tomorrow') || lowerMessage.includes('happening') || lowerMessage.includes('busy') || lowerMessage.includes('free time') || lowerMessage.includes('plans');
    const isEmailQuery = lowerMessage.includes('email') || lowerMessage.includes('mail') || lowerMessage.includes('message');

    // Add specific context based on query type
    if (isDealsQuery && context.commerce?.activeDeals?.length > 0) {
      enrichedMessage += `\n\n[Context: User has ${context.commerce.activeDeals.length} active deals available]`;
      enrichedMessage += `\n[Commerce Data: ${JSON.stringify(context.commerce.activeDeals.slice(0, 3))}]`;
    }

    if (isCalendarQuery) {
      enrichedMessage += `\n\n[Context: User asking about calendar/schedule - provide time management assistance]`;
    }

    if (isEmailQuery && context.email?.urgentCount > 0) {
      enrichedMessage += `\n\n[Context: ${context.email.urgentCount} urgent emails need attention]`;
    }

    // Add general context hints
    if (context.mentalLoad?.score > 70) {
      enrichedMessage += `\n\n[Context: User appears to have high mental load (${context.mentalLoad.score}/100)]`;
    }

    if (context.commerce?.expiringDeals?.length > 0 && !isDealsQuery) {
      enrichedMessage += `\n\n[Context: ${context.commerce.expiringDeals.length} deals expiring soon - mention if relevant]`;
    }

    return enrichedMessage;
  }

  summarizeContextUsage(context) {
    return {
      emailsAnalyzed: context.email?.recent?.length || 0,
      mentalLoadScore: context.mentalLoad?.score || 0,
      commerceDeals: context.commerce?.activeDeals?.length || 0,
      urgentItems: context.email?.urgentCount || 0
    };
  }

  generateFollowUpSuggestions(message, context) {
    const suggestions = [];
    const lowerMessage = message.toLowerCase();

    // Context-based suggestions based on the current query
    if (lowerMessage.includes('deal') || lowerMessage.includes('sale')) {
      if (context.commerce?.expiringDeals?.length > 0) {
        suggestions.push("What deals are expiring soon?");
      }
      if (context.commerce?.dtcBrands?.length > 0) {
        suggestions.push("Show me DTC brand deals");
      }
      suggestions.push("Help me prioritize purchases");
    } else if (lowerMessage.includes('calendar') || lowerMessage.includes('schedule')) {
      suggestions.push("What's my schedule tomorrow?");
      suggestions.push("Find time for a meeting");
      suggestions.push("Show me this week's appointments");
    } else if (lowerMessage.includes('email') || lowerMessage.includes('mail')) {
      if (context.email?.urgentCount > 0) {
        suggestions.push("Show urgent emails first");
      }
      suggestions.push("Categorize my recent emails");
      suggestions.push("What emails need responses?");
    } else {
      // General helpful suggestions based on context
      if (context.commerce?.dtcBrands?.length > 0) {
        suggestions.push("Show me my DTC brand deals");
      }
      if (context.mentalLoad?.score > 60) {
        suggestions.push("Help me reduce my mental load");
      }
      if (context.email?.urgentCount > 0) {
        suggestions.push("What emails need attention?");
      }
      
      // Default suggestions if nothing else applies
      if (suggestions.length === 0) {
        suggestions.push("What's on my schedule today?", "Show me recent deals", "Check my mental load");
      }
    }

    return suggestions.slice(0, 3); // Limit to 3 suggestions
  }
}

module.exports = { IntelligentResponseGenerator };
