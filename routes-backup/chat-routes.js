const MentalHealthCoach = require('../services/mental-health-coach');
const QueryClassifier = require('../utils/query-classifier');
const CalendarService = require('../services/calendar');

class ChatRoutes {
  constructor(app, contextEngine, responseGenerator, db) {
    this.app = app;
    this.contextEngine = contextEngine;
    this.responseGenerator = responseGenerator;
    this.db = db;
    
    this.mentalHealthCoach = new MentalHealthCoach();
    this.queryClassifier = new QueryClassifier();
    this.calendarService = new CalendarService();
    
    this.setupRoutes();
  }

  setupRoutes() {
    // Enhanced Context-Aware Chat Endpoint (New Architecture)
    this.app.post('/api/chat-enhanced', async (req, res) => {
      try {
        const { message, userId = 'default', conversationId } = req.body;

        console.log(`💬 Enhanced chat request from ${userId}: ${message.substring(0, 50)}...`);

        // 1. Gather comprehensive user context
        const userContext = await this.contextEngine.gatherUserContext(userId);

        // 2. Generate intelligent response
        const response = await this.responseGenerator.generate(message, userContext);

        // 3. Store conversation with metadata
        if (conversationId && this.db) {
          try {
            await this.db.collection('chat_history').add({
              conversationId,
              userId,
              message,
              response: response.content,
              context: userContext,
              timestamp: new Date().toISOString()
            });
          } catch (dbError) {
            console.log('⚠️ Failed to store chat history:', dbError.message);
          }
        }

        res.json({
          success: true,
          response: response.content,
          suggestions: response.suggestions,
          contextSummary: {
            mentalLoadScore: userContext.mentalLoad?.score,
            activeDeals: userContext.commerce?.activeDeals?.length,
            urgentEmails: userContext.email?.urgentCount
          }
        });

      } catch (error) {
        console.error('Enhanced chat error:', error);
        res.status(500).json({
          success: false,
          error: 'Chat service unavailable',
          fallback: "I'm having technical difficulties. Please try again."
        });
      }
    });

    // Original chat endpoint with sophisticated tone
    this.app.post('/api/chat', async (req, res) => {
      try {
        const { message, userId = 'oliverhbaron@gmail.com' } = req.body;
        
        console.log(`✅ Chat request received:`, { userId, message: message.substring(0, 50) + '...' });

        // Get personal context
        const personalContext = await this.buildPersonalContext(userId);
        console.log(`🧠 Building personal context for user: ${userId}`);
        console.log(`📊 Personal context built:`, {
          hasEmails: personalContext.emails.hasData,
          hasPreferences: personalContext.preferences.hasData,
          hasCommerce: personalContext.commerce.hasData,
          timeOfDay: personalContext.today.timeOfDay
        });

        // Classify the query
        const classification = this.queryClassifier.classifyQuery(message);
        
        // Get email intelligence if relevant
        const emailInsights = await this.getEmailIntelligenceForChat(userId, message);
        
        // Load tone prompt
        const tonePrompt = this.mentalHealthCoach.loadTonePrompt();
        
        // Build contextualized prompt
        let emailContext = '';
        if (emailInsights.length > 0) {
          emailContext = `\nRELEVANT EMAIL INSIGHTS:
${emailInsights.map((insight, i) => 
  `${i + 1}. ${insight.summary} (${insight.urgency} priority - ${insight.action})`
).join('\n')}`;
        }

        const contextualizedPrompt = this.mentalHealthCoach.buildContextualizedPrompt(
          tonePrompt, personalContext, userId, emailContext
        );

        // Generate AI response
        const response = await this.generateAIResponse(contextualizedPrompt, message);
        
        // Get calendar events
        const calendarEvents = await this.calendarService.getRelevantCalendarEvents(message, personalContext);
        
        // Generate commerce recommendations if needed
        let commerceRecommendations = [];
        if (!this.queryClassifier.shouldSkipCommerce(classification, emailInsights.length > 0)) {
          commerceRecommendations = await this.generateCommerceRecommendations(message, personalContext);
          console.log('🛍️ Commerce recommendations generated:', commerceRecommendations.length, 'items');
        } else {
          this.logSkipReason(classification, emailInsights.length > 0);
        }

        // Determine response mode and final reply
        const responseMode = this.queryClassifier.getResponseMode(
          classification, 
          emailInsights.length, 
          calendarEvents.length, 
          commerceRecommendations.length
        );

        const finalReply = this.buildFinalReply(
          response, classification, responseMode, commerceRecommendations
        );

        console.log(`💬 Final reply mode: ${responseMode.description}`);

        // Build final response
        const finalResponse = this.buildFinalResponse(
          finalReply, personalContext, calendarEvents, commerceRecommendations, emailInsights
        );

        // Debug logging for calendar events
        console.log(`📅 DEBUG: Calendar events being returned:`, JSON.stringify(calendarEvents, null, 2));
        console.log(`📅 DEBUG: Final response events field:`, JSON.stringify(finalResponse.events, null, 2));
        
        res.json(finalResponse);

      } catch (error) {
        console.error('❌ Chat error:', error);
        res.status(500).json({ 
          error: 'Chat processing failed',
          details: error.message 
        });
      }
    });
  }

  async buildPersonalContext(userId) {
    // This would normally call your context building logic
    // For now, return a mock structure
    return {
      today: {
        timeOfDay: this.getTimeOfDay(),
        dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
        dateString: new Date().toLocaleDateString()
      },
      emails: { hasData: false, recent: [] },
      preferences: { hasData: false },
      commerce: { hasData: false }
    };
  }

  getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
  }

  async getEmailIntelligenceForChat(userId, message) {
    // This would call your email intelligence logic
    // Return empty array for now
    return [];
  }

  async generateAIResponse(contextualizedPrompt, message) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            { role: 'system', content: contextualizedPrompt },
            { role: 'user', content: message }
          ],
          max_tokens: 800,
          temperature: 0.8
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
    } catch (error) {
      console.error('AI response generation error:', error);
      return "I'm having trouble processing that right now. Could you try again?";
    }
  }

  async generateCommerceRecommendations(message, personalContext) {
    // This would call your commerce recommendation logic
    // Return empty array for now
    return [];
  }

  logSkipReason(classification, hasEmailInsights) {
    if (hasEmailInsights) {
      console.log('📧 Skipping commerce recommendations - specific email insights take priority');
    } else if (classification.isCalendarQuery) {
      console.log('📅 Skipping commerce recommendations - calendar query detected');
    } else if (classification.isMentalHealthQuery) {
      console.log('🧠 Skipping commerce recommendations - mental health/emotional support query detected');
    }
  }

  buildFinalReply(aiResponse, classification, responseMode, commerceRecommendations) {
    if (responseMode.mode === 'mental-health') {
      if (classification.isShortPrompt) {
        const followUp = this.mentalHealthCoach.getFollowUpQuestion();
        return `${aiResponse}\n\n${followUp}`;
      }
      return aiResponse;
    }
    
    if (responseMode.mode === 'commerce' && commerceRecommendations.length > 0) {
      return "Here are some thoughtful gift recommendations for you:";
    }
    
    return aiResponse;
  }

  buildFinalResponse(finalReply, personalContext, calendarEvents, commerceRecommendations, emailInsights) {
    return {
      reply: finalReply,
      personalContext: {
        timestamp: new Date().toISOString(),
        timeOfDay: personalContext.today.timeOfDay,
        dayOfWeek: personalContext.today.dayOfWeek,
        hasEmails: personalContext.emails.hasData,
        hasPreferences: personalContext.preferences.hasData,
        emailCount: personalContext.emails.recent.length,
        dealsCount: 0
      },
      events: calendarEvents,
      commerceRecommendations: commerceRecommendations,
      emailInsights: emailInsights.length > 0 ? emailInsights.map(insight => ({
        ...insight,
        hasCalendarEvents: insight.calendarEvents && insight.calendarEvents.length > 0,
        calendarEvents: insight.calendarEvents || [],
        calendarUrls: insight.calendarUrls || [],
        hasGmailLink: insight.emailId ? true : false,
        gmailUrl: insight.emailId ? `https://mail.google.com/mail/u/0/#inbox/${insight.emailId}` : null
      })) : null,
      emailSummary: []
    };
  }
}

module.exports = ChatRoutes;
