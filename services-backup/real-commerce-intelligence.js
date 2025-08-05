// REAL EMAIL-BASED COMMERCE INTELLIGENCE
// This replaces the fake AI recommendation system with actual email scanning

const { google } = require('googleapis');

// Real Email-Based Commerce Intelligence (replaces fake AI recommendations)
async function generateRealCommerceIntelligence(message, personalContext, getUserProfileFn = null) {
  const lowerMessage = message.toLowerCase();
  
  console.log('🛍️ Scanning emails for real commerce intelligence:', message.substring(0, 50) + '...');
  
  try {
    // Check if user wants commerce-related information
    const commerceKeywords = ['deal', 'sale', 'buy', 'purchase', 'order', 'shipping', 'discount', 'coupon', 'price', 'store', 'shop', 'amazon', 'target', 'walmart'];
    const isCommerceQuery = commerceKeywords.some(keyword => lowerMessage.includes(keyword));
    
    if (!isCommerceQuery) {
      console.log('📭 Not a commerce query, skipping email scan');
      return [];
    }
    
    // Scan emails for real commerce data
    const commerceInsights = await scanEmailsForCommerce(personalContext.userId, message, getUserProfileFn);
    
    if (commerceInsights.length === 0) {
      console.log('📭 No relevant commerce emails found');
      return [];
    }
    
    console.log(`✅ Found ${commerceInsights.length} real commerce insights from emails`);
    return commerceInsights;
    
  } catch (error) {
    console.log('❌ Error scanning emails for commerce:', error.message);
    return [];
  }
}

// Scan user's actual emails for commerce intelligence
async function scanEmailsForCommerce(userId, query, getUserProfileFn = null) {
  try {
    // Use provided getUserProfile function or create a fallback
    if (!getUserProfileFn) {
      console.log('⚠️ No getUserProfile function provided, using fallback');
      return [];
    }
    
    const profile = getUserProfileFn(userId);
    if (!profile.accessToken) {
      console.log('⚠️ No access token available for email scanning');
      return [];
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: profile.accessToken,
      refresh_token: profile.refreshToken
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    
    // Build smart commerce search query
    let searchQuery = '';
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('deal') || lowerQuery.includes('sale')) {
      searchQuery = 'newer_than:7d (deal OR sale OR discount OR "% off" OR clearance OR promo)';
    } else if (lowerQuery.includes('order') || lowerQuery.includes('shipping')) {
      searchQuery = 'newer_than:30d (order OR shipped OR delivery OR tracking OR "order confirmation")';
    } else if (lowerQuery.includes('amazon')) {
      searchQuery = 'from:amazon.com OR from:amazon';
    } else if (lowerQuery.includes('target')) {
      searchQuery = 'from:target.com OR from:target';
    } else {
      // General commerce search
      searchQuery = 'newer_than:14d (order OR deal OR sale OR shipped OR discount OR purchase OR receipt)';
    }

    console.log(`🔍 Searching emails with query: ${searchQuery}`);

    const emailList = await gmail.users.messages.list({
      userId: 'me',
      q: searchQuery,
      maxResults: 15
    });

    if (!emailList.data.messages) {
      return [];
    }

    const commerceInsights = [];

    // Analyze each email for commerce data
    for (const message of emailList.data.messages.slice(0, 8)) {
      try {
        const email = await gmail.users.messages.get({
          userId: 'me',
          id: message.id,
          format: 'full'
        });

        const headers = email.data.payload.headers;
        const subject = headers.find(h => h.name === 'Subject')?.value || '';
        const from = headers.find(h => h.name === 'From')?.value || '';
        const date = headers.find(h => h.name === 'Date')?.value || '';

        // Extract email body
        let body = '';
        if (email.data.payload.body?.data) {
          body = Buffer.from(email.data.payload.body.data, 'base64').toString();
        } else if (email.data.payload.parts) {
          for (const part of email.data.payload.parts) {
            if (part.mimeType === 'text/plain' && part.body?.data) {
              body += Buffer.from(part.body.data, 'base64').toString();
              break;
            }
          }
        }

        // Extract commerce insights using AI
        const commerceData = await extractCommerceInsights(subject, from, body, date);
        
        if (commerceData) {
          commerceInsights.push({
            id: `commerce-${message.id}`,
            title: commerceData.title,
            description: commerceData.description,
            price: commerceData.price,
            originalPrice: commerceData.originalPrice,
            discount: commerceData.discount,
            brand: commerceData.brand,
            category: commerceData.category,
            url: commerceData.url || generateSearchUrl(commerceData.title, commerceData.brand),
            source: 'email-scan',
            emailId: message.id,
            emailFrom: from,
            emailSubject: subject,
            emailDate: date,
            actionRequired: commerceData.actionRequired,
            status: commerceData.status, // 'deal', 'shipped', 'delivered', 'expiring'
            icon: getCategoryIcon(commerceData.category)
          });
        }

      } catch (emailError) {
        console.log(`⚠️ Error processing email ${message.id}:`, emailError.message);
      }
    }

    return commerceInsights;

  } catch (error) {
    console.log('❌ Error scanning emails for commerce:', error.message);
    return [];
  }
}

// AI-powered commerce insight extraction from emails
async function extractCommerceInsights(subject, from, body, date) {
  try {
    const prompt = `Extract commerce information from this email:

Subject: ${subject}
From: ${from}
Date: ${date}
Body: ${body.substring(0, 1000)}...

Extract and return JSON with:
{
  "title": "Product/deal name",
  "description": "Brief description",
  "price": "Current price (number only, no $)",
  "originalPrice": "Original price if discounted",
  "discount": "Discount percentage or amount",
  "brand": "Brand/store name", 
  "category": "Product category",
  "url": "Product/deal URL if found",
  "actionRequired": "What user should do (order, claim deal, track package, etc.)",
  "status": "deal|shipped|delivered|expiring|order-confirmation"
}

Return null if this email doesn't contain commerce information.
Focus on: orders, deals, sales, discounts, shipping updates, price drops.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
        temperature: 0.3
      })
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.choices[0].message.content.trim();
      
      if (content === 'null' || content.toLowerCase().includes('null')) {
        return null;
      }
      
      // Clean and parse JSON
      const cleanContent = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      return JSON.parse(cleanContent);
    }

    return null;
  } catch (error) {
    console.log('❌ Error extracting commerce insights:', error.message);
    return null;
  }
}

// Generate search URLs for products
function generateSearchUrl(title, brand) {
  const searchTerm = encodeURIComponent(title);
  
  const brandUrls = {
    'amazon': `https://www.amazon.com/s?k=${searchTerm}`,
    'target': `https://www.target.com/s?searchTerm=${searchTerm}`,
    'walmart': `https://www.walmart.com/search?q=${searchTerm}`,
    'best buy': `https://www.bestbuy.com/site/searchpage.jsp?st=${searchTerm}`,
    'home depot': `https://www.homedepot.com/s/${searchTerm}`,
    'costco': `https://www.costco.com/CatalogSearch?keyword=${searchTerm}`
  };
  
  const lowerBrand = brand.toLowerCase();
  return brandUrls[lowerBrand] || `https://www.google.com/search?q=${searchTerm}+${encodeURIComponent(brand)}`;
}

// Get category icons
function getCategoryIcon(category) {
  const icons = {
    'electronics': '📱',
    'clothing': '👕',
    'home': '🏠',
    'kitchen': '🍳',
    'books': '📚',
    'toys': '🧸',
    'beauty': '💄',
    'sports': '⚽',
    'automotive': '🚗',
    'grocery': '🛒'
  };
  
  return icons[category.toLowerCase()] || '🛍️';
}

module.exports = {
  generateRealCommerceIntelligence,
  scanEmailsForCommerce,
  extractCommerceInsights
};
