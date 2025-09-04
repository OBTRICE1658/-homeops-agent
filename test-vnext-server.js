const express = require('express');
const path = require('path');
const fetch = require('node-fetch');

// Import your existing services
const admin = require('firebase-admin');
const { google } = require('googleapis');

// Try to load existing services
let serviceAccount, db, gmailSync, emailIntelligence;
try {
  serviceAccount = require('./homeops-web-firebase-adminsdk-fbsvc-0a737a8eee.json');
  console.log('✅ Firebase config loaded');
  
  // Initialize Firebase Admin if not already done
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://homeops-web.firebaseio.com"
    });
  }
  db = admin.firestore();
  
  // Load services
  const GmailSyncEngine = require('./services/gmail-sync-engine');
  const EmailIntelligenceService = require('./services/email-intelligence');
  gmailSync = new GmailSyncEngine(db);
  emailIntelligence = new EmailIntelligenceService();
  console.log('✅ HomeOps services loaded');
} catch (error) {
  console.log('⚠️ HomeOps services not available, using mock data:', error.message);
}

const app = express();
const PORT = 8081;

console.log('🧪 Starting Enhanced HomeOps vNext Server...');

// Basic middleware
app.use(express.json());

// Test route
app.get('/test', (req, res) => {
  console.log('✅ TEST ROUTE HIT!');
  res.send('<h1>Test works!</h1>');
});

// vNext route
app.get('/vnext', (req, res) => {
  console.log('🚀 VNEXT ROUTE HIT!');
  res.sendFile(path.join(__dirname, 'public', 'homeops-vnext.html'));
});

// Enhanced Chat API with real HomeOps integration
app.post('/api/chat', async (req, res) => {
  try {
    const { userId, message } = req.body;
    console.log('💬 Enhanced chat request:', { userId, message: message?.substring(0, 50) + '...' });
    
    let response = '';
    
    // Try to use real OpenAI if available
    if (process.env.OPENAI_API_KEY) {
      try {
        console.log('🤖 Using real OpenAI integration...');
        
        // Get user context if services are available
        let contextPrompt = `You are HomeOps Assistant, a personal chief of staff for busy families. You help with email management, calendar coordination, and family logistics.

Your personality combines:
- Mel Robbins' directness and action-orientation
- Andrew Huberman's evidence-based approach  
- Amy Schumer's authentic humor
- Warm but efficient communication
- Understanding of family dynamics

Be helpful, concise, and focused on actionable next steps.`;

        // Add real context if available
        if (db && gmailSync) {
          try {
            // Try to get real email context
            const emailContext = await getUserEmailContext(userId);
            if (emailContext && emailContext.length > 0) {
              contextPrompt += `\n\nUser's recent email context:\n${emailContext.slice(0, 3).map(email => 
                `- ${email.sender}: ${email.subject} (${email.category})`).join('\n')}`;
            }
          } catch (error) {
            console.log('📧 Email context unavailable:', error.message);
          }
        }

        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: contextPrompt },
              { role: 'user', content: message }
            ],
            max_tokens: 800,
            temperature: 0.8
          })
        });

        if (openaiResponse.ok) {
          const data = await openaiResponse.json();
          response = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
          console.log('🎭 Generated real AI response');
        } else {
          throw new Error(`OpenAI API error: ${openaiResponse.status}`);
        }
        
      } catch (aiError) {
        console.log('⚠️ AI unavailable, using smart fallback:', aiError.message);
        response = getSmartFallbackResponse(message);
      }
    } else {
      console.log('⚠️ OpenAI not configured, using smart fallback');
      response = getSmartFallbackResponse(message);
    }
    
    res.json({
      response,
      reply: response,
      success: true,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Chat processing failed',
      response: 'Sorry, I\'m having trouble right now. Please try again!',
      success: false
    });
  }
});

// Helper function to get user email context
async function getUserEmailContext(userId) {
  if (!db || !emailIntelligence) return [];
  
  try {
    // Try to get real email data from Firebase
    const emailSnapshot = await db.collection('email_intelligence')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(10)
      .get();
    
    if (!emailSnapshot.empty) {
      return emailSnapshot.docs.map(doc => ({
        sender: doc.data().sender || 'Unknown',
        subject: doc.data().subject || 'No subject',
        category: doc.data().category || 'general',
        urgency: doc.data().urgency || 'normal'
      }));
    }
  } catch (error) {
    console.log('📧 Could not fetch email context:', error.message);
  }
  
  return [];
}

// Enhanced fallback with smarter responses
function getSmartFallbackResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('email') || lowerMessage.includes('inbox')) {
    return '📧 I can help you manage your emails! I\'ve found several important messages that need your attention. Would you like me to show you the most urgent ones first?\n\nI can help you:\n• View categorized emails\n• Draft responses\n• Identify urgent items\n• Set up email automation';
  } 
  
  if (lowerMessage.includes('calendar') || lowerMessage.includes('schedule')) {
    return '📅 Let me check your calendar! I can help you view upcoming events, schedule new appointments, or find available time slots.\n\nWhat would you like to do:\n• View today\'s schedule\n• Add new events\n• Find free time\n• Coordinate family schedules';
  } 
  
  if (lowerMessage.includes('help') || lowerMessage.includes('what can')) {
    return '🚀 I\'m your HomeOps AI assistant! Here\'s how I can streamline your family\'s digital life:\n\n📧 **Email Intelligence**\n• Smart categorization\n• Urgent message alerts\n• Auto-draft responses\n\n📅 **Calendar Coordination**\n• Family schedule sync\n• Event planning\n• Conflict resolution\n\n✍️ **Communication**\n• Draft emails & texts\n• Follow-up reminders\n• Template responses\n\n🔍 **Smart Search**\n• Find important info\n• Track purchases\n• School updates\n\nWhat would you like to tackle first?';
  }
  
  if (lowerMessage.includes('school') || lowerMessage.includes('kid') || lowerMessage.includes('children')) {
    return '🎒 I can help with school-related tasks! I monitor emails from schools, track important dates, and help coordinate family schedules around school events.\n\nI can help you:\n• Track school communications\n• Manage permission slips\n• Coordinate pickup/dropoff\n• Stay on top of school events';
  }
  
  if (lowerMessage.includes('shopping') || lowerMessage.includes('buy') || lowerMessage.includes('order')) {
    return '🛒 I can help with shopping and household management! I track your purchase history, find deals, and help manage household supplies.\n\nI can help you:\n• Track recent purchases\n• Find the best deals\n• Manage shopping lists\n• Reorder essentials';
  }
  
  // Default intelligent response
  return `I understand you\'re asking about "${message}". As your HomeOps assistant, I\'m here to help streamline your family\'s digital operations.\n\nI specialize in:\n📧 Email management\n📅 Calendar coordination\n✍️ Communication assistance\n🔍 Information tracking\n\nTry asking me about your emails, calendar, or how I can help automate your daily tasks!`;
}

// Enhanced Email Summary API with real Gmail integration
app.get('/api/email-summary', async (req, res) => {
  try {
    console.log('📧 Enhanced email summary request');
    
    let categorizedEmails = {};
    
    // Try to use real Gmail data if available
    if (db && gmailSync) {
      try {
        console.log('📧 Attempting to fetch real Gmail data...');
        
        // Get real email data from Firebase
        const emailSnapshot = await db.collection('email_intelligence')
          .orderBy('timestamp', 'desc')
          .limit(20)
          .get();
        
        if (!emailSnapshot.empty) {
          console.log(`📧 Found ${emailSnapshot.docs.length} real emails`);
          
          const realEmails = emailSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              sender: data.sender || 'Unknown',
              subject: data.subject || 'No subject',
              date: data.timestamp || new Date().toISOString(),
              category: data.category || 'general',
              urgency: data.urgency || 'normal',
              preview: data.snippet || data.preview || 'No preview available',
              hasCalendarEvents: data.hasCalendarEvents || false
            };
          });
          
          // Categorize real emails
          categorizedEmails = categorizeEmails(realEmails);
          
          res.json({
            success: true,
            categorizedEmails,
            totalEmails: realEmails.length,
            lastUpdated: new Date().toISOString(),
            source: 'real_gmail'
          });
          return;
        }
      } catch (error) {
        console.log('⚠️ Could not fetch real Gmail data:', error.message);
      }
    }
    
    // Fallback to enhanced mock data
    console.log('📧 Using enhanced mock email data');
    categorizedEmails = getEnhancedMockEmails();
    
    res.json({
      success: true,
      categorizedEmails,
      totalEmails: Object.values(categorizedEmails).flat().length,
      lastUpdated: new Date().toISOString(),
      source: 'mock_data'
    });
    
  } catch (error) {
    console.error('Email summary error:', error);
    res.status(500).json({
      error: 'Failed to get email summary',
      details: error.message
    });
  }
});

// Helper function to categorize emails
function categorizeEmails(emails) {
  const categories = {
    urgent: [],
    school: [],
    personal: [],
    commerce: [],
    work: []
  };
  
  emails.forEach(email => {
    const category = email.category || 'general';
    const sender = email.sender.toLowerCase();
    const subject = email.subject.toLowerCase();
    
    // Smart categorization based on content
    if (email.urgency === 'high' || subject.includes('urgent') || subject.includes('asap')) {
      categories.urgent.push(email);
    } else if (sender.includes('school') || sender.includes('kisd') || sender.includes('academy') || 
               subject.includes('school') || subject.includes('teacher') || subject.includes('homework')) {
      categories.school.push(email);
    } else if (sender.includes('amazon') || sender.includes('target') || sender.includes('walmart') ||
               subject.includes('order') || subject.includes('delivered') || subject.includes('purchase')) {
      categories.commerce.push(email);
    } else if (category === 'work' || sender.includes('work') || sender.includes('@company')) {
      categories.work.push(email);
    } else {
      categories.personal.push(email);
    }
  });
  
  return categories;
}

// Enhanced mock email data with more realistic family scenarios
function getEnhancedMockEmails() {
  return {
    urgent: [
      {
        id: 'urgent_1',
        sender: 'Woods Academy <info@woodsacademy.edu>',
        subject: 'Back-to-School Night - Tomorrow 7 PM (Action Required)',
        date: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        category: 'urgent',
        urgency: 'high',
        preview: 'Reminder: Back-to-School Night is tomorrow at 7 PM in the main gymnasium. Please bring your child\'s supply list and completed emergency contact forms. We\'ll cover curriculum updates and meet your child\'s teachers.',
        hasCalendarEvents: true
      },
      {
        id: 'urgent_2',
        sender: 'Dr. Martinez Pediatrics <appointments@drmartinez.com>',
        subject: 'Appointment Confirmation - Friday 3:30 PM',
        date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        category: 'urgent',
        urgency: 'high',
        preview: 'Confirming Emma\'s annual checkup on Friday at 3:30 PM. Please arrive 15 minutes early to complete forms. Don\'t forget to bring her vaccination record and insurance card.'
      }
    ],
    school: [
      {
        id: 'school_1',
        sender: 'KISD Transportation <transport@kisd.edu>',
        subject: 'Bus Route 47 Changes - New Schedule Starting Monday',
        date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        category: 'school',
        urgency: 'normal',
        preview: 'Important update: Bus route 47 will have timing changes starting Monday, August 16th. New pickup time: 7:45 AM (15 minutes earlier). Please ensure your child is ready at the stop by 7:40 AM.'
      },
      {
        id: 'school_2',
        sender: 'Ms. Johnson <sarah.johnson@woodsacademy.edu>',
        subject: 'Weekly Newsletter - 5th Grade',
        date: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        category: 'school',
        urgency: 'normal',
        preview: 'This week we\'re starting our science unit on ecosystems! Homework reminder: Math worksheet due Wednesday, reading log due Friday. Don\'t forget soccer snacks on Thursday (it\'s your turn!).'
      }
    ],
    personal: [
      {
        id: 'personal_1',
        sender: 'Mom <susan.family@gmail.com>',
        subject: 'Sunday Family Dinner - Lasagna Night!',
        date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        category: 'personal',
        urgency: 'normal',
        preview: 'Don\'t forget Sunday dinner at 6 PM! I\'m making the kids\' favorite lasagna and garlic bread. Can you bring a salad? Looking forward to catching up and hearing about Emma\'s first week of school.'
      },
      {
        id: 'personal_2',
        sender: 'Soccer League <admin@kidsoccer.org>',
        subject: 'Practice Schedule Update & Tournament Info',
        date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        category: 'personal',
        urgency: 'normal',
        preview: 'Hi Soccer Families! Practice times are changing to 5:30 PM starting next week. Also, registration is open for the fall tournament on October 14-15. Early bird pricing ends Friday!'
      }
    ],
    commerce: [
      {
        id: 'commerce_1',
        sender: 'Amazon <auto-confirm@amazon.com>',
        subject: 'Your Back-to-School Supplies Have Been Delivered',
        date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        category: 'commerce',
        urgency: 'low',
        preview: 'Great news! Your order of pencils, notebooks, and art supplies has been delivered to your front door. Order #112-7549321-8765432. Hope Emma loves her new school supplies!'
      },
      {
        id: 'commerce_2',
        sender: 'Target <no-reply@target.com>',
        subject: '20% Off School Clothes - Limited Time!',
        date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        category: 'commerce',
        urgency: 'low',
        preview: 'Back-to-school sale! Save 20% on kids\' clothing including jeans, sweaters, and shoes. Perfect timing for growing kids. Sale ends Sunday. Use code SCHOOL20 online or show this email in-store.'
      }
    ]
  };
}

// Enhanced Email Draft API with AI integration
app.post('/api/email/draft', async (req, res) => {
  try {
    const { messageId, emailContent } = req.body;
    console.log('✍️ Enhanced draft request for:', messageId);
    
    let draft = '';
    
    // Try to use OpenAI for intelligent drafting
    if (process.env.OPENAI_API_KEY && emailContent) {
      try {
        console.log('🤖 Generating AI-powered email draft...');
        
        const draftPrompt = `You are a HomeOps email assistant helping a busy parent draft email responses. 

Email to respond to:
From: ${emailContent.sender || 'Unknown'}
Subject: ${emailContent.subject || 'No subject'}
Content: ${emailContent.preview || 'No preview'}

Write a warm, professional, and appropriately brief response. Consider this is from a busy parent who values efficiency but wants to maintain good relationships. 

Keep the tone:
- Friendly but not overly casual
- Grateful when appropriate  
- Brief and to the point
- Practical and action-oriented

End with an appropriate closing (Best regards, Thanks, See you then, etc.) but don't include a signature.`;

        const draftResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'You are a helpful email assistant. Write clear, warm, and professional email responses for busy parents.' },
              { role: 'user', content: draftPrompt }
            ],
            max_tokens: 300,
            temperature: 0.7
          })
        });

        if (draftResponse.ok) {
          const data = await draftResponse.json();
          draft = data.choices?.[0]?.message?.content || '';
          console.log('🎭 Generated AI email draft');
        } else {
          throw new Error(`OpenAI API error: ${draftResponse.status}`);
        }
        
      } catch (aiError) {
        console.log('⚠️ AI draft unavailable, using template:', aiError.message);
        draft = getTemplateDraft(messageId, emailContent);
      }
    } else {
      console.log('⚠️ Using template draft (no AI or email content)');
      draft = getTemplateDraft(messageId, emailContent);
    }
    
    res.json({ 
      draft,
      success: true,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Draft error:', error);
    res.json({ 
      draft: 'Thank you for your email. I appreciate you reaching out and will respond shortly.\n\nBest regards',
      success: false,
      error: error.message
    });
  }
});

// Helper function for template-based drafts
function getTemplateDraft(messageId, emailContent) {
  // Enhanced templates based on email content analysis
  if (emailContent) {
    const subject = (emailContent.subject || '').toLowerCase();
    const sender = (emailContent.sender || '').toLowerCase();
    const preview = (emailContent.preview || '').toLowerCase();
    
    // School-related emails
    if (sender.includes('school') || sender.includes('academy') || sender.includes('teacher') || 
        subject.includes('school') || subject.includes('homework') || subject.includes('permission')) {
      if (subject.includes('back-to-school') || preview.includes('back-to-school')) {
        return 'Thank you for the reminder about Back-to-School Night. We\'ll be there tomorrow at 7 PM with all the required forms and supply list.\n\nLooking forward to meeting the teachers!\n\nBest regards';
      }
      if (subject.includes('bus') || preview.includes('bus') || preview.includes('pickup')) {
        return 'Thank you for the bus route update. We\'ve noted the new pickup time and will make sure our child is ready accordingly.\n\nAppreciate the advance notice!\n\nBest regards';
      }
      return 'Thank you for this update. We\'ve received the information and will follow up as needed.\n\nAppreciate your communication!\n\nBest regards';
    }
    
    // Medical/appointment emails
    if (sender.includes('doctor') || sender.includes('medical') || sender.includes('pediatric') ||
        subject.includes('appointment') || preview.includes('appointment')) {
      return 'Thank you for confirming our appointment. We\'ll be there on time and will bring any required documentation.\n\nSee you then!\n\nBest regards';
    }
    
    // Family/personal emails
    if (sender.includes('mom') || sender.includes('dad') || sender.includes('family') ||
        subject.includes('dinner') || subject.includes('family')) {
      return 'Sounds great! We\'re looking forward to it. Let us know if you need us to bring anything.\n\nSee you soon!\n\nLove';
    }
    
    // Commerce/delivery emails
    if (sender.includes('amazon') || sender.includes('target') || sender.includes('delivery') ||
        subject.includes('delivered') || subject.includes('order')) {
      return 'Thank you for the delivery confirmation. We\'ve received everything and it looks great!\n\nBest regards';
    }
    
    // Sports/activities
    if (sender.includes('soccer') || sender.includes('sports') || sender.includes('league') ||
        subject.includes('practice') || subject.includes('game')) {
      return 'Thanks for the update! We\'ve noted the new schedule and will be there on time.\n\nGo team!\n\nBest regards';
    }
  }
  
  // Fallback based on messageId (for backward compatibility)
  const draftTemplates = {
    'urgent_1': 'Thank you for the reminder about Back-to-School Night. We\'ll be there tomorrow at 7 PM with all the required forms and supply list.\n\nLooking forward to meeting the teachers!\n\nBest regards',
    'urgent_2': 'Thank you for confirming our Friday appointment at 3:30 PM. We\'ll arrive at 3:15 PM as requested.\n\nSee you then!\n\nBest regards',
    'school_1': 'Thank you for the bus route update. We\'ve noted the new pickup time of 7:45 AM starting Monday.\n\nAppreciate the advance notice!\n\nBest regards',
    'personal_1': 'We\'ll definitely be there for Sunday dinner at 6 PM! The kids are excited for your famous lasagna.\n\nSee you Sunday!\n\nLove',
    'default': 'Thank you for your email. I\'ll review this and get back to you soon.\n\nBest regards'
  };
  
  return draftTemplates[messageId] || draftTemplates['default'];
}

// Gmail OAuth Integration
app.get('/api/gmail/auth', async (req, res) => {
  try {
    console.log('🔐 Gmail OAuth requested');
    
    if (!gmailSync) {
      return res.status(500).json({ 
        error: 'Gmail service not available',
        message: 'Gmail integration requires proper service configuration'
      });
    }
    
    // Generate OAuth URL
    const authUrl = await gmailSync.getAuthUrl();
    
    res.json({
      success: true,
      authUrl: authUrl,
      message: 'Redirect user to this URL for Gmail authentication'
    });
    
  } catch (error) {
    console.error('Gmail OAuth error:', error);
    res.status(500).json({
      error: 'Gmail OAuth failed',
      details: error.message
    });
  }
});

// Gmail OAuth Callback (for when you integrate with main server)
app.get('/auth/gmail/callback', async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.redirect('/vnext?error=oauth_failed');
    }
    
    if (!gmailSync) {
      return res.redirect('/vnext?error=service_unavailable');
    }
    
    // Handle OAuth callback
    await gmailSync.handleOAuthCallback(code);
    
    res.redirect('/vnext?gmail_connected=true');
    
  } catch (error) {
    console.error('Gmail OAuth callback error:', error);
    res.redirect('/vnext?error=oauth_callback_failed');
  }
});

// Email Intelligence API
app.get('/api/email-intelligence', async (req, res) => {
  try {
    const { userId, limit = 10 } = req.query;
    console.log('🧠 Email intelligence request for user:', userId);
    
    if (!db || !emailIntelligence) {
      // Return mock intelligence data
      return res.json({
        success: true,
        insights: [
          {
            category: 'urgent',
            count: 2,
            examples: ['Back-to-School Night reminder', 'Doctor appointment confirmation']
          },
          {
            category: 'school',
            count: 3,
            examples: ['Bus route changes', 'Weekly newsletter', 'Permission slip needed']
          },
          {
            category: 'commerce',
            count: 5,
            examples: ['Amazon delivery', 'Target sale', 'Grocery pickup ready']
          }
        ],
        lastAnalyzed: new Date().toISOString(),
        source: 'mock_data'
      });
    }
    
    // Try to get real email intelligence
    const intelligence = await emailIntelligence.getInsights(userId, parseInt(limit));
    
    res.json({
      success: true,
      insights: intelligence,
      lastAnalyzed: new Date().toISOString(),
      source: 'real_data'
    });
    
  } catch (error) {
    console.error('Email intelligence error:', error);
    res.status(500).json({
      error: 'Failed to get email intelligence',
      details: error.message
    });
  }
});

// User context API (for personalized responses)
app.get('/api/user/context', async (req, res) => {
  try {
    const { userId } = req.query;
    console.log('👤 User context request for:', userId);
    
    const context = {
      userId: userId,
      timestamp: new Date().toISOString(),
      hasGmailConnected: db ? true : false,
      hasEmailIntelligence: emailIntelligence ? true : false,
      recentActivity: {
        emailsProcessed: db ? 'unknown' : 0,
        lastEmailSync: db ? 'unknown' : null,
        calendarEventsToday: 3
      }
    };
    
    res.json({
      success: true,
      context: context
    });
    
  } catch (error) {
    console.error('User context error:', error);
    res.status(500).json({
      error: 'Failed to get user context',
      details: error.message
    });
  }
});

// Calendar Events API
app.get('/api/calendar-events/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`📅 Getting calendar events for user: ${userId}`);
    
    // Generate sample calendar events with emotional metadata
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const sampleEvents = [
      {
        id: 'cal-1',
        title: 'Morning Workout',
        start: new Date(today.getTime() + 7 * 60 * 60 * 1000).toISOString(), // 7 AM today
        end: new Date(today.getTime() + 8 * 60 * 60 * 1000).toISOString(), // 8 AM today
        location: 'Home Gym',
        context: 'health',
        stress: 2,
        notes: 'Weekly strength training session'
      },
      {
        id: 'cal-2',
        title: 'Team Standup',
        start: new Date(today.getTime() + 9 * 60 * 60 * 1000).toISOString(), // 9 AM today
        end: new Date(today.getTime() + 9.5 * 60 * 60 * 1000).toISOString(), // 9:30 AM today
        location: 'Zoom',
        context: 'work',
        stress: 3,
        notes: 'Daily team sync and project updates'
      },
      {
        id: 'cal-3',
        title: 'Lunch with Sarah',
        start: new Date(today.getTime() + 12 * 60 * 60 * 1000).toISOString(), // 12 PM today
        end: new Date(today.getTime() + 13 * 60 * 60 * 1000).toISOString(), // 1 PM today
        location: 'Café Luna',
        context: 'personal',
        stress: 1,
        notes: 'Catch up over salads'
      },
      {
        id: 'cal-4',
        title: 'Soccer Practice',
        start: new Date(today.getTime() + 16 * 60 * 60 * 1000).toISOString(), // 4 PM today
        end: new Date(today.getTime() + 17.5 * 60 * 60 * 1000).toISOString(), // 5:30 PM today
        location: 'City Sports Complex',
        context: 'family',
        stress: 2,
        notes: "Kids' weekly soccer practice"
      },
      {
        id: 'cal-5',
        title: 'Parent-Teacher Conference',
        start: new Date(today.getTime() + 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000).toISOString(), // 2 PM tomorrow
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000).toISOString(), // 3 PM tomorrow
        location: 'Roosevelt Elementary',
        context: 'family',
        stress: 4,
        notes: 'Quarterly progress meeting'
      },
      {
        id: 'cal-6',
        title: 'Project Deadline',
        start: new Date(today.getTime() + 48 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000).toISOString(), // 10 AM day after tomorrow
        end: new Date(today.getTime() + 48 * 60 * 60 * 1000 + 17 * 60 * 60 * 1000).toISOString(), // 5 PM day after tomorrow
        location: 'Office',
        context: 'work',
        stress: 8,
        notes: 'Final submission for Q4 proposal'
      },
      {
        id: 'cal-7',
        title: 'Date Night',
        start: new Date(today.getTime() + 144 * 60 * 60 * 1000 + 19 * 60 * 60 * 1000).toISOString(), // 7 PM this Saturday
        end: new Date(today.getTime() + 144 * 60 * 60 * 1000 + 22 * 60 * 60 * 1000).toISOString(), // 10 PM this Saturday
        location: 'Downtown',
        context: 'personal',
        stress: 1,
        notes: 'Dinner and movie night'
      }
    ];
    
    res.json(sampleEvents);
    
  } catch (error) {
    console.error('Calendar events error:', error);
    res.status(500).json({
      error: 'Failed to get calendar events',
      details: error.message
    });
  }
});

// Static files
app.use(express.static('public'));

app.listen(PORT, () => {
  console.log(`🚀 HomeOps vNext Server running on port ${PORT}`);
  console.log(`✨ vNext Interface: http://localhost:${PORT}/vnext`);
  console.log(`🧪 Test Route: http://localhost:${PORT}/test`);
  console.log('');
  console.log('🎯 API Endpoints:');
  console.log(`   💬 Chat: POST /api/chat`);
  console.log(`   📧 Email Summary: GET /api/email-summary`);
  console.log(`   ✍️ Email Draft: POST /api/email/draft`);
  console.log(`   📅 Calendar Events: GET /api/calendar-events/:userId`);
});
