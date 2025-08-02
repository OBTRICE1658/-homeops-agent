/**
 * 🛍️ Enhanced Smart Shopping Intelligence with DTC Brand Detection
 * Purpose: Detect DTC brands from Gmail, score email engagement, and surface smart commerce cards
 */

const admin = require('firebase-admin');

class EnhancedCommerceIntelligence {
  constructor(db) {
    this.db = db;
    
    // DTC Brand Index - Known DTC brands for matching
    this.dtcBrandIndex = new Set([
      // Fashion & Apparel
      'everlane.com', 'allbirds.com', 'warbyparker.com', 'glossier.com', 'away.com',
      'casper.com', 'bombas.com', 'patagonia.com', 'reformation.com', 'fenty.com',
      
      // Food & Beverage
      'blueapron.com', 'hellofresh.com', 'bulletproof.com', 'ritual.com', 'organifi.com',
      
      // Health & Beauty
      'curology.com', 'theordinary.com', 'drunk-elephant.com', 'kiehl.com', 'sephora.com',
      
      // Tech & Gadgets
      'apple.com', 'tesla.com', 'oneplus.com', 'nothing.tech', 'framework.com',
      
      // Home & Lifestyle
      'brooklinen.com', 'tuftandneedle.com', 'purple.com', 'westelm.com', 'cb2.com',
      
      // Men's & Accessories
      'buckmason.com', 'fellowproducts.com', 'ridge.com', 'huckberry.com', 'olivercompany.com',
      
      // Outdoor & Sports
      'rei.com', 'backcountry.com', 'evo.com', 'moosejaw.com', 'mountainhardwear.com',
      
      // Additional Popular DTC
      'nike.com', 'adidas.com', 'lululemon.com', 'athleta.com', 'onnit.com',
      'dollar-shave-club.com', 'harrys.com', 'manscaped.com', 'keeps.com'
    ]);
  }

  /**
   * STEP 1: Detect if brand is DTC based on domain matching
   */
  isDTCBrand(domain) {
    if (!domain) return false;
    
    // Check exact match first
    if (this.dtcBrandIndex.has(domain.toLowerCase())) {
      return true;
    }
    
    // Check for subdomain matches (e.g., shop.nike.com -> nike.com)
    const mainDomain = domain.split('.').slice(-2).join('.');
    return this.dtcBrandIndex.has(mainDomain.toLowerCase());
  }

  /**
   * STEP 2: Extract email signals for scoring
   */
  extractEmailSignals(emailData) {
    const subject = emailData.subject || '';
    const snippet = emailData.snippet || '';
    const from = emailData.from || '';
    const combinedText = `${subject} ${snippet}`.toLowerCase();
    
    const signals = {
      // Discount detection
      discount: this.extractDiscount(combinedText),
      
      // Urgency detection
      hasUrgency: this.detectUrgency(combinedText),
      
      // Personalization detection
      isPersonalized: this.detectPersonalization(subject, snippet),
      
      // Brand name extraction
      brandName: this.extractBrandName(from),
      domain: this.extractDomain(from),
      
      // Email metadata
      subject,
      snippet: snippet.substring(0, 200), // Limit snippet length
      timestamp: emailData.date || new Date().toISOString()
    };
    
    return signals;
  }

  /**
   * Extract discount percentage or dollar amount
   */
  extractDiscount(text) {
    // Look for percentage discounts
    const percentMatch = text.match(/(\d{1,2})%\s*off/i);
    if (percentMatch) {
      return {
        type: 'percentage',
        value: parseInt(percentMatch[1]),
        display: `${percentMatch[1]}% OFF`
      };
    }
    
    // Look for dollar savings
    const dollarMatch = text.match(/save\s*\$(\d+)/i) || text.match(/\$(\d+)\s*off/i);
    if (dollarMatch) {
      return {
        type: 'dollars',
        value: parseInt(dollarMatch[1]),
        display: `Save $${dollarMatch[1]}`
      };
    }
    
    return null;
  }

  /**
   * Detect urgency keywords
   */
  detectUrgency(text) {
    const urgencyKeywords = [
      'expires', 'ends soon', 'limited time', 'last chance', 'hurry',
      'final hours', 'ending tonight', 'while supplies last', 'act now',
      'don\'t miss', 'flash sale', 'today only', 'weekend only'
    ];
    
    return urgencyKeywords.some(keyword => text.includes(keyword));
  }

  /**
   * Detect personalization in subject/content
   */
  detectPersonalization(subject, snippet) {
    const personalKeywords = ['you', 'your', 'just for you', 'personalized', 'custom'];
    const text = `${subject} ${snippet}`.toLowerCase();
    
    // Look for first name usage (basic heuristic)
    const hasPersonalPronouns = personalKeywords.some(keyword => text.includes(keyword));
    
    // Look for direct addressing patterns
    const hasDirectAddress = /^(hi|hey|hello)\s+\w+/i.test(subject);
    
    return hasPersonalPronouns || hasDirectAddress;
  }

  /**
   * Extract brand name from email sender
   */
  extractBrandName(from) {
    if (!from) return 'Unknown';
    
    // Extract brand name before @ or from display name
    const match = from.match(/^([^<@]+)/) || from.match(/<([^@]+)@/);
    if (match) {
      return match[1].trim().replace(/"/g, '');
    }
    
    return from.split('@')[0] || 'Unknown';
  }

  /**
   * Extract domain from email address
   */
  extractDomain(from) {
    if (!from) return null;
    
    const emailMatch = from.match(/[@]([^>]+)/);
    return emailMatch ? emailMatch[1].trim() : null;
  }

  /**
   * STEP 2: Calculate email quality and offer scores
   */
  calculateEmailScores(signals, emailFrequency = 1) {
    let emailQualityScore = 0.0;
    let offerScore = 0.0;
    
    // Email Quality Score (0-1)
    if (signals.isPersonalized) emailQualityScore += 0.25;
    if (emailFrequency <= 3) emailQualityScore += 0.30; // Not too frequent
    if (emailFrequency === 1) emailQualityScore += 0.15; // Rare emails are premium
    if (signals.snippet && signals.snippet.length > 50) emailQualityScore += 0.15; // Good content
    if (!this.hasSpamIndicators(signals.subject)) emailQualityScore += 0.15; // Not spammy
    
    // Offer Score (0-1)
    if (signals.discount) {
      if (signals.discount.type === 'percentage') {
        if (signals.discount.value >= 30) offerScore += 0.40;
        else if (signals.discount.value >= 20) offerScore += 0.30;
        else if (signals.discount.value >= 10) offerScore += 0.20;
      } else if (signals.discount.type === 'dollars') {
        if (signals.discount.value >= 50) offerScore += 0.40;
        else if (signals.discount.value >= 25) offerScore += 0.30;
        else if (signals.discount.value >= 10) offerScore += 0.20;
      }
    }
    
    if (signals.hasUrgency) offerScore += 0.25;
    if (signals.isPersonalized) offerScore += 0.20;
    if (this.isDTCBrand(signals.domain)) offerScore += 0.15; // DTC brands often have better offers
    
    // Cap scores at 1.0
    emailQualityScore = Math.min(emailQualityScore, 1.0);
    offerScore = Math.min(offerScore, 1.0);
    
    return { emailQualityScore, offerScore };
  }

  /**
   * Check for spam indicators
   */
  hasSpamIndicators(subject) {
    const spamKeywords = ['free money', 'click here', 'act now!!!!', 'limited time!!!!!'];
    const text = subject.toLowerCase();
    
    // Check for excessive caps or punctuation
    const hasExcessiveCaps = (subject.match(/[A-Z]/g) || []).length > subject.length * 0.5;
    const hasExcessivePunctuation = (subject.match(/[!]{3,}/g) || []).length > 0;
    
    return spamKeywords.some(keyword => text.includes(keyword)) || 
           hasExcessiveCaps || hasExcessivePunctuation;
  }

  /**
   * STEP 3: Store brand signals in Firestore
   */
  async storeBrandSignals(userId, brandName, signals, scores, emailFrequency) {
    try {
      const brandData = {
        isDTC: this.isDTCBrand(signals.domain),
        domain: signals.domain,
        emailFrequency,
        lastSeen: new Date().toISOString(),
        emailQualityScore: scores.emailQualityScore,
        offerScore: scores.offerScore,
        compositeScore: (scores.emailQualityScore * 0.5) + (scores.offerScore * 0.5),
        recentOffers: signals.discount ? [signals.discount] : [],
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      await this.db.collection('email_signals')
        .doc(userId)
        .collection('brands')
        .doc(brandName.replace(/[^a-zA-Z0-9]/g, '_'))
        .set(brandData, { merge: true });
        
      console.log(`✅ Stored brand signals for ${brandName} (DTC: ${brandData.isDTC})`);
      return brandData;
    } catch (error) {
      console.error('❌ Error storing brand signals:', error);
      return null;
    }
  }

  /**
   * STEP 4: Generate enhanced commerce cards with DTC prioritization
   */
  async generateEnhancedCommerceCards(userId, emailAnalysis, limit = 5) {
    try {
      // Process emails and extract commerce signals
      const brandSignals = new Map();
      
      for (const email of emailAnalysis) {
        const signals = this.extractEmailSignals(email);
        if (signals.brandName && signals.domain) {
          const brandKey = signals.brandName;
          
          if (!brandSignals.has(brandKey)) {
            brandSignals.set(brandKey, {
              signals,
              emails: [],
              frequency: 0
            });
          }
          
          const brandData = brandSignals.get(brandKey);
          brandData.emails.push(email);
          brandData.frequency++;
        }
      }
      
      // Generate cards with scoring
      const commerceCards = [];
      
      for (const [brandName, data] of brandSignals) {
        const scores = this.calculateEmailScores(data.signals, data.frequency);
        
        // Store in Firebase
        await this.storeBrandSignals(userId, brandName, data.signals, scores, data.frequency);
        
        // Create commerce card
        const card = {
          id: `deal_${brandName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`,
          brand: brandName,
          isDTC: this.isDTCBrand(data.signals.domain),
          discount: data.signals.discount?.display || null,
          expires: this.extractExpiry(data.emails[0]?.snippet || ''),
          emailFrequency: data.frequency,
          offerScore: Math.round(scores.offerScore * 100) / 100,
          emailQualityScore: Math.round(scores.emailQualityScore * 100) / 100,
          compositeScore: Math.round(((scores.emailQualityScore * 0.5) + (scores.offerScore * 0.5)) * 100) / 100,
          title: data.signals.subject,
          description: data.signals.snippet,
          badge: this.isDTCBrand(data.signals.domain) ? 'DTC' : null,
          url: this.extractURL(data.emails[0]?.snippet || ''),
          actions: ['View', 'Find Deal', 'Save', 'Share'],
          timestamp: data.signals.timestamp
        };
        
        commerceCards.push(card);
      }
      
      // Sort by composite score (DTC brands get bonus)
      commerceCards.sort((a, b) => {
        let scoreA = a.compositeScore;
        let scoreB = b.compositeScore;
        
        // Boost DTC brands
        if (a.isDTC) scoreA += 0.1;
        if (b.isDTC) scoreB += 0.1;
        
        return scoreB - scoreA;
      });
      
      console.log(`✅ Generated ${commerceCards.length} enhanced commerce cards`);
      return commerceCards.slice(0, limit);
      
    } catch (error) {
      console.error('❌ Error generating enhanced commerce cards:', error);
      return [];
    }
  }

  /**
   * Extract expiry date from email content
   */
  extractExpiry(text) {
    const expiryPatterns = [
      /expires?\s+([a-z]+ \d{1,2})/i,
      /ends?\s+([a-z]+ \d{1,2})/i,
      /until\s+([a-z]+ \d{1,2})/i
    ];
    
    for (const pattern of expiryPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    return null;
  }

  /**
   * Extract URL from email content (basic implementation)
   */
  extractURL(text) {
    const urlMatch = text.match(/https?:\/\/[^\s]+/);
    return urlMatch ? urlMatch[0] : null;
  }

  /**
   * Get stored brand data for user
   */
  async getUserBrandData(userId) {
    try {
      const snapshot = await this.db.collection('email_signals')
        .doc(userId)
        .collection('brands')
        .get();
        
      const brandData = {};
      snapshot.forEach(doc => {
        brandData[doc.id] = doc.data();
      });
      
      return brandData;
    } catch (error) {
      console.error('❌ Error fetching user brand data:', error);
      return {};
    }
  }
}

module.exports = EnhancedCommerceIntelligence;
