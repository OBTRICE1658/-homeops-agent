const OpenAI = require('openai');

class EmailIntelligenceService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async analyzeEmails(emails, userContext = {}) {
    try {
      console.log(`🧠 Analyzing ${emails.length} emails for intelligence...`);
      
      const analysis = {
        school: { count: 0, examples: [] },
        commerce: { count: 0, examples: [] },
        events: { count: 0, examples: [] },
        summary: ''
      };

      // Categorize emails with enhanced detection
      for (const email of emails) {
        const category = this.categorizeEmail(email);
        
        if (category === 'school' && analysis.school.examples.length < 3) {
          analysis.school.count++;
          analysis.school.examples.push({
            subject: email.subject,
            from: email.from?.split('@')[1]?.split('.')[0] || 'school',
            date: email.date
          });
        } else if (category === 'commerce' && analysis.commerce.examples.length < 3) {
          analysis.commerce.count++;
          analysis.commerce.examples.push({
            subject: email.subject,
            from: email.from?.split('@')[1]?.split('.')[0] || 'store',
            date: email.date
          });
        } else if (category === 'event' && analysis.events.examples.length < 3) {
          analysis.events.count++;
          analysis.events.examples.push({
            subject: email.subject,
            from: email.from?.split('@')[1]?.split('.')[0] || 'event',
            date: email.date
          });
        } else {
          // Still count them even if we don't show examples
          if (category === 'school') analysis.school.count++;
          else if (category === 'commerce') analysis.commerce.count++;
          else if (category === 'event') analysis.events.count++;
        }
      }

      // Generate AI summary
      analysis.summary = await this.generateSummary(analysis, userContext);

      console.log('✅ Email intelligence analysis complete');
      return analysis;

    } catch (error) {
      console.error('❌ Email intelligence analysis failed:', error);
      throw error;
    }
  }

  categorizeEmail(email) {
    const subject = email.subject?.toLowerCase() || '';
    const from = email.from?.toLowerCase() || '';

    // School detection - enhanced keywords
    if (subject.includes('school') || subject.includes('teacher') || subject.includes('parent') ||
        subject.includes('classroom') || subject.includes('homework') || subject.includes('grade') ||
        subject.includes('field trip') || subject.includes('class') || subject.includes('student') ||
        subject.includes('principal') || subject.includes('pta') || subject.includes('volunteer') ||
        from.includes('school') || from.includes('.edu') || from.includes('district') ||
        from.includes('teacher') || from.includes('class-parent') || from.includes('coach')) {
      return 'school';
    }

    // Commerce detection - enhanced patterns
    if (subject.includes('order') || subject.includes('receipt') || subject.includes('shipped') ||
        subject.includes('purchase') || subject.includes('payment') || subject.includes('invoice') ||
        subject.includes('confirmation') || subject.includes('delivered') || subject.includes('tracking') ||
        from.includes('noreply') || from.includes('no-reply') || from.includes('receipt') ||
        from.includes('amazon') || from.includes('target') || from.includes('walmart') ||
        from.includes('shop') || from.includes('store')) {
      return 'commerce';
    }

    // Event detection - enhanced patterns for invitations, meetings, etc.
    if (subject.includes('invitation') || subject.includes('rsvp') || subject.includes('meeting') ||
        subject.includes('calendar') || subject.includes('event') || subject.includes('party') ||
        subject.includes('birthday') || subject.includes('game') || subject.includes('appointment') ||
        subject.includes('reminder') || subject.includes('due') ||
        from.includes('evite') || from.includes('invitation') || from.includes('rsvp') ||
        from.includes('calendar') || from.includes('event')) {
      return 'event';
    }

    return 'other';
  }

  async generateSummary(analysis, userContext) {
    try {
      const prompt = `Generate a brief, personal summary for a user's email patterns. Use a tone that combines Mel Robbins (direct, motivational, "here's the thing") and Ivan Zhao (thoughtful, systems-thinking, elegant).

User context:
- Name: ${userContext.firstName || 'there'}
- Role: ${userContext.primaryRole || 'busy person'}
- Priorities: ${userContext.priorities?.join(', ') || 'general productivity'}

Email analysis:
- School emails: ${analysis.school.count}
- Commerce emails: ${analysis.commerce.count}  
- Event emails: ${analysis.events.count}

Write in this style: "Hi [Name] — this week I spotted X school items, Y events, and Z purchase confirmations. You're balancing a lot as a [role] — here's how I'll keep you ahead: [specific promise about filtering noise and surfacing important things]."

Keep it 2-3 sentences, personal, and forward-looking.`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 120,
        temperature: 0.7
      });

      return response.choices[0].message.content.trim();

    } catch (error) {
      console.error('❌ Failed to generate AI summary:', error);
      // Enhanced fallback summary
      const totalItems = (analysis.school?.count || 0) + (analysis.commerce?.count || 0) + (analysis.events?.count || 0);
      const firstName = userContext.firstName || 'there';
      
      if (totalItems === 0) {
        return `Hi ${firstName} — your inbox looks pretty clean right now. That's actually perfect for building healthy patterns. I'll help you stay on top of what matters most.`;
      } else {
        const findings = [];
        if (analysis.school?.count > 0) findings.push(`${analysis.school.count} school items`);
        if (analysis.events?.count > 0) findings.push(`${analysis.events.count} events`);
        if (analysis.commerce?.count > 0) findings.push(`${analysis.commerce.count} purchase confirmations`);
        
        return `Hi ${firstName} — this week I spotted ${findings.join(', ')}. You're balancing a lot — here's how I'll keep you ahead: I'll surface the important stuff before it becomes urgent and filter out the noise.`;
      }
    }
  }

  async summarizeEmailsForDecoder(emails, limit = 10) {
    try {
      const summaries = [];
      
      for (const email of emails.slice(0, limit)) {
        const category = this.categorizeEmail(email);
        const priority = this.calculatePriority(email, category);
        
        summaries.push({
          id: email.id,
          subject: email.subject,
          from: email.from,
          category,
          priority,
          summary: this.generateQuickSummary(email),
          gmailUrl: email.gmailUrl
        });
      }

      return summaries.sort((a, b) => b.priority - a.priority);

    } catch (error) {
      console.error('❌ Failed to summarize emails for decoder:', error);
      throw error;
    }
  }

  calculatePriority(email, category) {
    let priority = 1;
    
    // Higher priority for certain categories
    if (category === 'school') priority += 3;
    if (category === 'event') priority += 2;
    if (category === 'commerce') priority += 1;
    
    // Higher priority for time-sensitive keywords
    const subject = email.subject?.toLowerCase() || '';
    if (subject.includes('urgent') || subject.includes('reminder') || 
        subject.includes('due') || subject.includes('deadline')) {
      priority += 2;
    }
    
    return priority;
  }

  generateQuickSummary(email) {
    const subject = email.subject || 'No subject';
    const category = this.categorizeEmail(email);
    
    switch (category) {
      case 'school':
        return `School communication: ${subject}`;
      case 'commerce':
        return `Purchase/order update: ${subject}`;
      case 'event':
        return `Event/appointment: ${subject}`;
      default:
        return subject;
    }
  }
}

module.exports = EmailIntelligenceService;