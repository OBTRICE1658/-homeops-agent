# HomeOps Chat Backend Rebuild - Complete Architecture Guide

## 🏗️ Current HomeOps Architecture Overview

### Core Data Sources
- **Gmail Integration**: OAuth tokens, promotional emails, email categorization, mental load scoring
- **Calendar Data**: Events, scheduling patterns, time-based insights
- **Commerce Intelligence**: DTC brand detection, email-based deal scoring, purchase tracking
- **Firebase Backend**: Firestore for data persistence, real-time updates
- **Mental Load Analytics**: 6-factor comprehensive scoring system

### Key Services Architecture
```
┌─ Enhanced Commerce Intelligence ────────────────┐
│  • DTC Brand Index (50+ brands)                │
│  • Email Signal Extraction                     │
│  • Composite Scoring Algorithms                │
│  • Firebase Storage Integration                │
└─────────────────────────────────────────────────┘

┌─ Mental Load Analysis Engine ──────────────────┐
│  • Email/Calendar/Commerce Load Calculation    │
│  • Contextual Insights Generation              │
│  • Time-based Pattern Recognition              │
│  • Priority & Urgency Scoring                  │
└─────────────────────────────────────────────────┘

┌─ Data Layer (Firebase) ─────────────────────────┐
│  • gmail_tokens collection                     │
│  • email_signals collection                    │
│  • user_profiles collection                    │
│  • brand_data collection                       │
└─────────────────────────────────────────────────┘
```

### Current API Endpoints Architecture
- `/api/commerce-intelligence` - Enhanced DTC brand detection and scoring
- `/api/mental-load` - Comprehensive 6-factor analysis
- `/api/calibration-data` - Email categorization and insights
- `/api/dashboard-summary` - Unified dashboard data

## 🎯 Chat Backend Rebuild Strategy

### 1. Context-Aware Chat Architecture
```javascript
// New Chat Service Structure
class HomeOpsChatService {
  constructor() {
    this.contextEngine = new ContextAggregationEngine();
    this.responseGenerator = new IntelligentResponseGenerator();
    this.dataIntegration = new UnifiedDataLayer();
  }
}

// Context sources to integrate:
- Real-time email insights
- Calendar context and scheduling
- Commerce deals and shopping patterns
- Mental load state and priorities
- Recent user interactions
```

### 2. Unified Context Engine
The chat should have access to:
- **Email Context**: Recent emails, categories, urgent items, shopping signals
- **Calendar Context**: Upcoming events, scheduling conflicts, availability
- **Commerce Context**: Active deals, DTC brand preferences, spending patterns  
- **Mental Load Context**: Current stress factors, priority areas, recommendations

### 3. Chat Endpoint Enhancement Plan
```javascript
// Enhanced chat endpoint structure
app.post('/api/chat-enhanced', async (req, res) => {
  const { message, userId, conversationId } = req.body;
  
  // 1. Aggregate real-time context
  const userContext = await contextEngine.gatherUserContext(userId);
  
  // 2. Generate contextually aware response
  const response = await responseGenerator.generate(message, userContext);
  
  // 3. Store conversation with context metadata
  await conversationStore.save(conversationId, { message, response, context });
});
```

## 📋 Implementation Instructions

### Phase 1: Context Aggregation Service
Create: `services/context-aggregation.js`

```javascript
const { db } = require('../firebase-config');
const { EnhancedCommerceIntelligence } = require('./enhanced-commerce-intelligence');

class ContextAggregationEngine {
  constructor() {
    this.commerceIntelligence = new EnhancedCommerceIntelligence();
  }

  async gatherUserContext(userId) {
    const context = {
      timestamp: new Date().toISOString(),
      userId: userId
    };

    try {
      // Parallel context gathering for performance
      const [emailContext, commerceContext, mentalLoadContext, calendarContext] = await Promise.all([
        this.getEmailContext(userId),
        this.getCommerceContext(userId),
        this.getMentalLoadContext(userId),
        this.getCalendarContext(userId)
      ]);

      return {
        ...context,
        email: emailContext,
        commerce: commerceContext,
        mentalLoad: mentalLoadContext,
        calendar: calendarContext,
        recent: await this.getRecentInteractions(userId)
      };
    } catch (error) {
      console.error('Context aggregation error:', error);
      return { ...context, error: error.message };
    }
  }

  async getEmailContext(userId) {
    // Leverage existing email analysis functions
    const recentEmails = await this.fetchRecentEmails(userId, 10);
    const categorizedEmails = recentEmails.map(email => ({
      ...email,
      category: this.categorizeEmail(email.subject, email.snippet, email.from)
    }));

    return {
      recent: categorizedEmails,
      urgentCount: categorizedEmails.filter(e => e.urgent).length,
      categories: this.groupEmailsByCategory(categorizedEmails),
      shoppingSignals: this.extractShoppingSignals(categorizedEmails)
    };
  }

  async getCommerceContext(userId) {
    // Use existing commerce intelligence
    const commerceData = await this.commerceIntelligence.generateEnhancedCommerceCards(userId, [], 5);
    
    return {
      activeDeals: commerceData,
      dtcBrands: commerceData.filter(deal => deal.isDTC),
      totalSavings: commerceData.reduce((sum, deal) => sum + (deal.savings || 0), 0),
      expiringDeals: commerceData.filter(deal => this.isExpiringSoon(deal.expires))
    };
  }

  async getMentalLoadContext(userId) {
    // Leverage existing mental load functions
    const mentalLoadData = await this.calculateMentalLoad(userId);
    
    return {
      score: mentalLoadData.totalScore,
      factors: mentalLoadData.factors,
      recommendations: mentalLoadData.recommendations,
      stressLevel: this.categorizeMentalLoad(mentalLoadData.totalScore)
    };
  }

  async getCalendarContext(userId) {
    // Calendar integration (to be implemented)
    return {
      upcomingEvents: [],
      busyPeriods: [],
      freeTime: [],
      conflicts: []
    };
  }

  async getRecentInteractions(userId) {
    // Get recent chat history and interactions
    const recentChats = await db.collection('chat_history')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(5)
      .get();

    return recentChats.docs.map(doc => doc.data());
  }
}

module.exports = { ContextAggregationEngine };
```

### Phase 2: Intelligent Response Generator
Create: `services/intelligent-response-generator.js`

```javascript
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

Always consider the user's current mental load and provide contextually relevant assistance.`;
  }

  enrichMessageWithContext(message, context) {
    let enrichedMessage = message;

    // Add relevant context hints
    if (context.mentalLoad?.score > 70) {
      enrichedMessage += `\n\n[Context: User appears to have high mental load (${context.mentalLoad.score}/100)]`;
    }

    if (context.commerce?.expiringDeals?.length > 0) {
      enrichedMessage += `\n\n[Context: ${context.commerce.expiringDeals.length} deals expiring soon]`;
    }

    if (context.email?.urgentCount > 0) {
      enrichedMessage += `\n\n[Context: ${context.email.urgentCount} urgent emails need attention]`;
    }

    return enrichedMessage;
  }

  generateFollowUpSuggestions(message, context) {
    const suggestions = [];

    // Context-based suggestions
    if (context.commerce?.dtcBrands?.length > 0) {
      suggestions.push("Show me my DTC brand deals");
    }

    if (context.mentalLoad?.score > 60) {
      suggestions.push("Help me prioritize my tasks");
    }

    if (context.email?.urgentCount > 0) {
      suggestions.push("What emails need my attention?");
    }

    return suggestions;
  }
}

module.exports = { IntelligentResponseGenerator };
```

### Phase 3: Enhanced Chat Endpoint
Add to `quick-server.js`:

```javascript
const { ContextAggregationEngine } = require('./services/context-aggregation');
const { IntelligentResponseGenerator } = require('./services/intelligent-response-generator');

// Initialize chat services
const contextEngine = new ContextAggregationEngine();
const responseGenerator = new IntelligentResponseGenerator();

// Enhanced chat endpoint
app.post('/api/chat-enhanced', async (req, res) => {
  try {
    const { message, userId = 'default', conversationId } = req.body;

    console.log(`💬 Enhanced chat request from ${userId}: ${message.substring(0, 50)}...`);

    // 1. Gather comprehensive user context
    const userContext = await contextEngine.gatherUserContext(userId);

    // 2. Generate intelligent response
    const response = await responseGenerator.generate(message, userContext);

    // 3. Store conversation with metadata
    if (conversationId) {
      await db.collection('chat_history').add({
        conversationId,
        userId,
        message,
        response: response.content,
        context: userContext,
        timestamp: new Date().toISOString()
      });
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
```

## 🎨 Chat Enhancement Vision

### Smart Contextual Responses Examples
- "I see you have 3 DTC deals expiring tomorrow and a busy calendar - want me to prioritize the Allbirds sale?"
- "Your mental load score is high this week (85/100). Should I help reschedule some non-urgent items?"
- "Based on your recent Everlane emails, there's a sustainable fashion sale that matches your preferences."

### Proactive Assistance Capabilities
- Commerce deal alerts based on email patterns
- Calendar conflict resolution suggestions
- Mental load reduction recommendations
- Email priority triage assistance

### Data-Driven Insights
- Shopping pattern analysis
- Email engagement optimization
- Calendar efficiency suggestions
- Stress factor identification

## 🚀 Key Files to Reference

1. **`services/enhanced-commerce-intelligence.js`** - DTC brand logic, email signal extraction
2. **`quick-server.js`** - Mental load functions, email analysis, existing API patterns
3. **Firebase collections** - Data persistence patterns for gmail_tokens, email_signals
4. **Existing API endpoints** - `/api/commerce-intelligence`, `/api/mental-load` for integration patterns

## 💡 Strategic Implementation Notes

### Build Order
1. **Context Aggregation Service** - Core foundation
2. **Response Generator** - AI integration layer  
3. **Enhanced Chat Endpoint** - API integration
4. **Frontend Integration** - UI updates for new features
5. **Real-time Features** - WebSocket integration for live updates

### Integration Patterns
- **Reuse existing data sources** - Don't rebuild, overlay and integrate
- **Leverage current scoring algorithms** - Mental load, commerce intelligence, email categorization
- **Real-time context injection** - Pull live data for each interaction
- **Progressive enhancement** - Start basic, expand contextual awareness

### Performance Considerations
- **Parallel context gathering** - Use Promise.all for multiple data sources
- **Context caching** - Cache user context for 5-10 minutes
- **Fallback responses** - Graceful degradation when services unavailable
- **Rate limiting** - Prevent API abuse and manage costs

This architecture creates a truly intelligent chat assistant that understands the complete context of your digital life - email patterns, shopping preferences, calendar constraints, and mental load state!
