// PRODUCTION EMAIL SCANNING EXAMPLE
// This shows how the email scanning will work with real Gmail data

async function findRelatedEmailsProduction(event, personalContext, userId) {
  try {
    const oauth2Client = await getOAuth2Client(userId);
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    
    // Build smart search query based on event content
    const eventTitle = event.title.toLowerCase();
    const keywords = event.relatedKeywords || [];
    
    let searchQuery = '';
    
    if (eventTitle.includes('visa')) {
      searchQuery = 'visa OR embassy OR consulate OR "visa application" OR "visa documents" OR "passport" OR "immigration"';
    } else if (eventTitle.includes('appointment')) {
      const doctorMatch = eventTitle.match(/(ent|dentist|doctor|medical|physician)/);
      if (doctorMatch) {
        searchQuery = `${doctorMatch[1]} OR appointment OR "medical forms" OR "patient intake" OR confirmation`;
      }
    } else if (eventTitle.includes('meeting')) {
      searchQuery = 'meeting OR agenda OR "project review" OR conference OR call';
    } else if (eventTitle.includes('school')) {
      searchQuery = 'school OR teacher OR "parent conference" OR education OR academy';
    } else {
      // Use the related keywords for search
      searchQuery = keywords.join(' OR ');
    }
    
    // Search recent emails (last 30 days)
    const emailList = await gmail.users.messages.list({
      userId: 'me',
      q: `newer_than:30d (${searchQuery})`,
      maxResults: 20
    });
    
    if (!emailList.data.messages) {
      return [];
    }
    
    const relevantEmails = [];
    
    // Analyze each email for relevance
    for (const message of emailList.data.messages.slice(0, 5)) {
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
      }
      
      // Use AI to determine relevance and extract insights
      const relevanceScore = await analyzeEmailRelevance(eventTitle, subject, from, body);
      
      if (relevanceScore > 0.7) { // Only include highly relevant emails
        const insights = await extractEmailInsights(subject, from, body, eventTitle);
        
        relevantEmails.push({
          from: from,
          subject: subject,
          date: date,
          snippet: body.substring(0, 200),
          insight: insights.summary,
          actionRequired: insights.actionRequired,
          category: insights.category,
          priority: insights.priority,
          emailId: message.id
        });
      }
    }
    
    return relevantEmails;
    
  } catch (error) {
    console.log('❌ Error scanning emails:', error.message);
    return [];
  }
}

// AI-powered email relevance analysis
async function analyzeEmailRelevance(eventTitle, subject, from, body) {
  try {
    const prompt = `
      Analyze if this email is relevant to the calendar event: "${eventTitle}"
      
      Email Details:
      Subject: ${subject}
      From: ${from}
      Body: ${body.substring(0, 500)}...
      
      Return ONLY a number from 0.0 to 1.0 where:
      - 1.0 = Highly relevant (directly related to the event)
      - 0.5 = Somewhat relevant (might be useful)
      - 0.0 = Not relevant
      
      Consider:
      - Subject line keywords
      - Sender authority/relevance
      - Content mentions of related topics
      - Action items or deadlines
    `;
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 10,
        temperature: 0.1
      })
    });

    if (response.ok) {
      const data = await response.json();
      const score = parseFloat(data.choices[0].message.content.trim());
      return isNaN(score) ? 0.0 : Math.max(0.0, Math.min(1.0, score));
    }
    
    return 0.0;
  } catch (error) {
    console.log('❌ Error analyzing email relevance:', error.message);
    return 0.0;
  }
}

// Extract insights from relevant emails
async function extractEmailInsights(subject, from, body, eventTitle) {
  try {
    const prompt = `
      Extract key insights from this email related to: "${eventTitle}"
      
      Email:
      Subject: ${subject}
      From: ${from}
      Body: ${body.substring(0, 800)}
      
      Extract and return JSON:
      {
        "summary": "Main point of the email in 1-2 sentences",
        "actionRequired": "What the user needs to do, or null if no action",
        "category": "medical|work|family|personal|travel|finance|shopping|other",
        "priority": "high|medium|low"
      }
    `;
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200,
        temperature: 0.3
      })
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.choices[0].message.content.trim();
      
      // Clean and parse JSON
      const cleanContent = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      return JSON.parse(cleanContent);
    }
    
    return {
      summary: "Email content available",
      actionRequired: null,
      category: "other",
      priority: "medium"
    };
  } catch (error) {
    console.log('❌ Error extracting email insights:', error.message);
    return {
      summary: "Email content available",
      actionRequired: null,
      category: "other",
      priority: "medium"
    };
  }
}

// EXAMPLE RESULTS:
// For "Remind me about Evan-dre's visa documents"
// 
// Might find:
// - Email from US Embassy: "Visa Application Status Update"
// - Email from Immigration Lawyer: "Required Documents Checklist"
// - Email from Travel Agency: "Visa Appointment Confirmation"
// 
// And extract insights like:
// - "Passport photos still needed"
// - "Appointment scheduled for next week"
// - "Form I-20 expires in 30 days"
