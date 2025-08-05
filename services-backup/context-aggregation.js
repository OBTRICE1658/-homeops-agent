const { generateRealCommerceIntelligence } = require('./real-commerce-intelligence');

class ContextAggregationEngine {
  constructor() {
    // We'll inject the main server functions during initialization
    this.serverFunctions = null;
    this.db = null; // Will be injected from main server
  }

  // Method to inject server functions and db (will be called from quick-server.js)
  setServerFunctions(functions, database) {
    this.serverFunctions = functions;
    this.db = database;
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
    try {
      if (!this.serverFunctions) {
        console.log('⚠️ Server functions not injected, using basic email context');
        return this.getBasicEmailContext(userId);
      }

      // Use the existing email intelligence function
      const emailIntelligence = await this.serverFunctions.getEmailIntelligenceForChat(userId, '');
      
      if (emailIntelligence.success && emailIntelligence.insights) {
        const insights = emailIntelligence.insights;
        return {
          recent: insights,
          urgentCount: insights.filter(e => e.urgency === 'high').length,
          categories: this.groupEmailsByCategory(insights),
          shoppingSignals: insights.filter(e => e.category === 'deals' || e.dealSignals)
        };
      }

      return this.getBasicEmailContext(userId);
    } catch (error) {
      console.error('Email context error:', error);
      return this.getBasicEmailContext(userId);
    }
  }

  getBasicEmailContext(userId) {
    return {
      recent: [],
      urgentCount: 0,
      categories: {},
      shoppingSignals: []
    };
  }

  async getCommerceContext(userId) {
    try {
      console.log('🛍️ Getting REAL email-based commerce context for user:', userId);
      
      // Use our real email-based commerce intelligence instead of fake system
      const personalContext = { userId: userId };
      const commerceQuery = 'deals sale purchase order shipping discount'; // General commerce terms
      
      // Pass the getUserProfile function if available
      const getUserProfileFn = this.serverFunctions?.getUserProfile || null;
      
      const realCommerceData = await generateRealCommerceIntelligence(commerceQuery, personalContext, getUserProfileFn);
      
      console.log('✅ Real commerce data retrieved:', realCommerceData.length, 'items');
      
      return {
        activeDeals: realCommerceData,
        dtcBrands: realCommerceData.filter(deal => deal.brand && deal.source === 'email-scan'),
        totalSavings: realCommerceData.reduce((sum, deal) => sum + (parseFloat(deal.discount) || 0), 0),
        expiringDeals: realCommerceData.filter(deal => deal.status === 'expiring')
      };
    } catch (error) {
      console.error('❌ Real commerce context error:', error.message);
      return this.getBasicCommerceContext();
    }
  }

  getBasicCommerceContext() {
    return {
      activeDeals: [],
      dtcBrands: [],
      totalSavings: 0,
      expiringDeals: []
    };
  }

  async getMentalLoadContext(userId) {
    try {
      if (!this.serverFunctions) {
        console.log('⚠️ Server functions not injected, using basic mental load context');
        return this.getBasicMentalLoadContext();
      }

      // Use existing mental load calculation (we'll need to create this aggregate function)
      const mentalLoadData = await this.calculateAggregatedMentalLoad(userId);
      
      return {
        score: mentalLoadData.totalScore,
        factors: mentalLoadData.factors,
        recommendations: mentalLoadData.recommendations,
        stressLevel: this.categorizeMentalLoad(mentalLoadData.totalScore)
      };
    } catch (error) {
      console.error('Mental load context error:', error);
      return this.getBasicMentalLoadContext();
    }
  }

  getBasicMentalLoadContext() {
    return {
      score: 50,
      factors: {},
      recommendations: [],
      stressLevel: 'normal'
    };
  }

  async calculateAggregatedMentalLoad(userId) {
    // This aggregates mental load from various sources
    try {
      const emailContext = await this.getEmailContext(userId);
      const commerceContext = await this.getCommerceContext(userId);
      
      // Calculate composite mental load score
      let totalScore = 30; // Base score
      let factors = {};

      // Email load factor
      if (emailContext.urgentCount > 0) {
        const emailLoad = Math.min(emailContext.urgentCount * 10, 30);
        totalScore += emailLoad;
        factors.email = { score: emailLoad, reason: `${emailContext.urgentCount} urgent emails` };
      }

      // Commerce decision fatigue
      if (commerceContext.expiringDeals.length > 0) {
        const commerceLoad = Math.min(commerceContext.expiringDeals.length * 5, 20);
        totalScore += commerceLoad;
        factors.commerce = { score: commerceLoad, reason: `${commerceContext.expiringDeals.length} expiring deals` };
      }

      // Time of day factor
      const hour = new Date().getHours();
      if (hour >= 22 || hour <= 6) {
        totalScore += 15;
        factors.time = { score: 15, reason: 'Late night/early morning stress' };
      }

      return {
        totalScore: Math.min(totalScore, 100),
        factors,
        recommendations: this.generateMentalLoadRecommendations(totalScore, factors)
      };
    } catch (error) {
      console.error('Mental load calculation error:', error);
      return { totalScore: 50, factors: {}, recommendations: [] };
    }
  }

  generateMentalLoadRecommendations(score, factors) {
    const recommendations = [];
    
    if (score > 70) {
      recommendations.push("Consider postponing non-urgent decisions");
      if (factors.email) recommendations.push("Batch process urgent emails to reduce cognitive load");
      if (factors.commerce) recommendations.push("Set deal alerts instead of active monitoring");
    } else if (score > 50) {
      recommendations.push("Good time for medium-priority tasks");
      if (factors.commerce) recommendations.push("Review expiring deals when you have mental bandwidth");
    } else {
      recommendations.push("Great mental space for complex decisions");
      recommendations.push("Consider tackling challenging tasks now");
    }

    return recommendations;
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
    try {
      if (!this.db) {
        console.log('⚠️ Database not available, returning empty interactions');
        return [];
      }

      // Get recent chat history and interactions
      const recentChats = await this.db.collection('chat_history')
        .where('userId', '==', userId)
        .orderBy('timestamp', 'desc')
        .limit(5)
        .get();

      return recentChats.docs.map(doc => doc.data());
    } catch (error) {
      console.error('Recent interactions error:', error);
      return [];
    }
  }

  groupEmailsByCategory(emails) {
    return emails.reduce((acc, email) => {
      const category = email.category || 'other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(email);
      return acc;
    }, {});
  }

  categorizeMentalLoad(score) {
    if (score < 30) return 'low';
    if (score < 60) return 'normal';
    if (score < 80) return 'high';
    return 'critical';
  }

  isExpiringSoon(expiryDate) {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const hoursUntilExpiry = (expiry - now) / (1000 * 60 * 60);
    return hoursUntilExpiry <= 24 && hoursUntilExpiry > 0;
  }
}

module.exports = { ContextAggregationEngine };
