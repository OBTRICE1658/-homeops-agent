import type { ProblemSolution, Cancellation, AgentPlay, NotionFeature } from '../../shared/reco'

export interface RecommendationInput {
  industry: string
  tools: string[]
  kpis: string[]
  summary: string
}

export interface RecommendationOutput {
  problems_to_solutions: ProblemSolution[]
  cancellations: Cancellation[]
}

// Tool name mapping to stack cancellations
const TOOL_MAPPINGS: Record<string, { stackKey: string; per_user_month: number; replaced_by: NotionFeature[] }> = {
  // Support & Ticketing
  'zendesk': { 
    stackKey: 'pm_tool', 
    per_user_month: 24, 
    replaced_by: ['Projects (PM)', 'Forms', 'AI Agents'] 
  },
  'freshdesk': { 
    stackKey: 'pm_tool', 
    per_user_month: 15, 
    replaced_by: ['Projects (PM)', 'Forms', 'AI Agents'] 
  },
  'servicedesk': { 
    stackKey: 'pm_tool', 
    per_user_month: 20, 
    replaced_by: ['Projects (PM)', 'Forms', 'AI Agents'] 
  },

  // Knowledge & Wiki
  'confluence': { 
    stackKey: 'wiki', 
    per_user_month: 10, 
    replaced_by: ['Team Wiki', 'AI Search'] 
  },
  'notion': { 
    stackKey: 'wiki', 
    per_user_month: 8, 
    replaced_by: ['Team Wiki', 'AI Search', 'Canvas DB'] 
  },
  'obsidian': { 
    stackKey: 'wiki', 
    per_user_month: 0, 
    replaced_by: ['Team Wiki', 'AI Search'] 
  },

  // Scheduling & Calendar
  'calendly': { 
    stackKey: 'calendar', 
    per_user_month: 15, 
    replaced_by: ['Calendar Scheduling'] 
  },
  'acuity': { 
    stackKey: 'calendar', 
    per_user_month: 18, 
    replaced_by: ['Calendar Scheduling'] 
  },
  'cal.com': { 
    stackKey: 'calendar', 
    per_user_month: 12, 
    replaced_by: ['Calendar Scheduling'] 
  },

  // Chat & Support
  'intercom': { 
    stackKey: 'chatbot', 
    per_user_month: 20, 
    replaced_by: ['AI Agents', 'Forms'] 
  },
  'drift': { 
    stackKey: 'chatbot', 
    per_user_month: 20, 
    replaced_by: ['AI Agents', 'Forms'] 
  },
  'zendesk chat': { 
    stackKey: 'chatbot', 
    per_user_month: 14, 
    replaced_by: ['AI Agents', 'Forms'] 
  },

  // Forms & Data Collection
  'typeform': { 
    stackKey: 'forms', 
    per_user_month: 15, 
    replaced_by: ['Forms', 'Canvas DB'] 
  },
  'jotform': { 
    stackKey: 'forms', 
    per_user_month: 12, 
    replaced_by: ['Forms', 'Canvas DB'] 
  },
  'gravity forms': { 
    stackKey: 'forms', 
    per_user_month: 8, 
    replaced_by: ['Forms', 'Canvas DB'] 
  },

  // CRM & Sales
  'hubspot': { 
    stackKey: 'crm_basic', 
    per_user_month: 20, 
    replaced_by: ['Basic CRM', 'Relations/Rollups', 'AI Agents'] 
  },
  'pipedrive': { 
    stackKey: 'crm_basic', 
    per_user_month: 15, 
    replaced_by: ['Basic CRM', 'Relations/Rollups'] 
  },
  'salesforce': { 
    stackKey: 'crm_basic', 
    per_user_month: 25, 
    replaced_by: ['Basic CRM', 'Relations/Rollups', 'API & Automations'] 
  },

  // Website & Landing Pages
  'webflow': { 
    stackKey: 'site_builder', 
    per_user_month: 20, 
    replaced_by: ['Canvas DB', 'API & Automations'] 
  },
  'squarespace': { 
    stackKey: 'site_builder', 
    per_user_month: 18, 
    replaced_by: ['Canvas DB', 'Forms'] 
  },

  // AI & Writing
  'copy.ai': { 
    stackKey: 'ai_writing', 
    per_user_month: 20, 
    replaced_by: ['AI Writing'] 
  },
  'jasper': { 
    stackKey: 'ai_writing', 
    per_user_month: 24, 
    replaced_by: ['AI Writing'] 
  },
  'writesonic': { 
    stackKey: 'ai_writing', 
    per_user_month: 16, 
    replaced_by: ['AI Writing'] 
  },

  // Search & Research
  'perplexity': { 
    stackKey: 'ai_search', 
    per_user_month: 35, 
    replaced_by: ['AI Search'] 
  },
  'algolia': { 
    stackKey: 'ai_search', 
    per_user_month: 30, 
    replaced_by: ['AI Search', 'API & Automations'] 
  },

  // Meetings & Notes
  'otter.ai': { 
    stackKey: 'meeting_notes', 
    per_user_month: 18, 
    replaced_by: ['AI Meeting Notes'] 
  },
  'grain': { 
    stackKey: 'meeting_notes', 
    per_user_month: 15, 
    replaced_by: ['AI Meeting Notes'] 
  },
  'rev.com': { 
    stackKey: 'meeting_notes', 
    per_user_month: 22, 
    replaced_by: ['AI Meeting Notes'] 
  },

  // Email
  'mailchimp': { 
    stackKey: 'email_app', 
    per_user_month: 30, 
    replaced_by: ['AI Email App', 'API & Automations'] 
  },
  'constant contact': { 
    stackKey: 'email_app', 
    per_user_month: 25, 
    replaced_by: ['AI Email App'] 
  }
}

// Industry-specific problem patterns
const INDUSTRY_PROBLEMS: Record<string, ProblemSolution[]> = {
  'ecommerce': [
    {
      problem: 'Customer support tickets scattered across channels',
      solution_title: 'Unified ticket management with AI triage',
      features: ['Projects (PM)', 'Forms', 'AI Agents'],
      how_it_works: [
        'Centralize tickets in Projects database',
        'Auto-categorize with AI Agents',
        'Route to appropriate team member',
        'Track resolution time and satisfaction'
      ],
      expected_outcome: 'Reduce average resolution time by 40%'
    },
    {
      problem: 'Product documentation spread across multiple tools',
      solution_title: 'Centralized product knowledge base',
      features: ['Team Wiki', 'AI Search', 'Relations/Rollups'],
      how_it_works: [
        'Migrate all docs to Team Wiki',
        'Link products to documentation via Relations',
        'Enable instant AI-powered search',
        'Auto-suggest relevant docs during support'
      ],
      expected_outcome: 'Cut new team member onboarding time by 60%'
    },
    {
      problem: 'Manual order processing and tracking',
      solution_title: 'Automated order management system',
      features: ['Canvas DB', 'API & Automations', 'Views & Filters'],
      how_it_works: [
        'Connect e-commerce platform via API',
        'Auto-create order records in Canvas DB',
        'Set up filtered views by status',
        'Trigger notifications for exceptions'
      ],
      expected_outcome: 'Process 90% of orders without human intervention'
    }
  ],
  'saas': [
    {
      problem: 'Feature requests lost in various channels',
      solution_title: 'Centralized feature request pipeline',
      features: ['Forms', 'Projects (PM)', 'Relations/Rollups'],
      how_it_works: [
        'Create public Forms for feature requests',
        'Auto-generate Projects tickets',
        'Link to customer accounts via Relations',
        'Prioritize using Rollup scoring'
      ],
      expected_outcome: 'Capture 100% of feature requests with customer context'
    },
    {
      problem: 'Customer onboarding scattered across tools',
      solution_title: 'Unified onboarding workflow',
      features: ['Projects (PM)', 'AI Agents', 'Calendar Scheduling'],
      how_it_works: [
        'Create standardized onboarding Projects',
        'Auto-schedule check-ins via Calendar',
        'AI Agents monitor progress and intervene',
        'Track completion metrics'
      ],
      expected_outcome: 'Improve onboarding completion rate by 50%'
    },
    {
      problem: 'Support knowledge scattered and hard to find',
      solution_title: 'AI-powered support knowledge system',
      features: ['Team Wiki', 'AI Search', 'AI Writing'],
      how_it_works: [
        'Consolidate all support docs in Wiki',
        'AI Writing generates missing articles',
        'AI Search provides instant answers',
        'Track which articles solve tickets'
      ],
      expected_outcome: 'Reduce time to find answers by 70%'
    }
  ],
  'legal': [
    {
      problem: 'Case documents scattered across systems',
      solution_title: 'Centralized case management',
      features: ['Canvas DB', 'Relations/Rollups', 'API & Automations'],
      how_it_works: [
        'Create Canvas DB for all case files',
        'Link clients to cases via Relations',
        'Auto-calculate billing via Rollups',
        'Integrate with legal software APIs'
      ],
      expected_outcome: 'Reduce case prep time by 50%'
    },
    {
      problem: 'Client communication tracking inefficient',
      solution_title: 'Automated client communication log',
      features: ['AI Email App', 'Projects (PM)', 'AI Meeting Notes'],
      how_it_works: [
        'Auto-log emails via AI Email App',
        'Link communications to case Projects',
        'Generate meeting summaries automatically',
        'Track billable communication time'
      ],
      expected_outcome: 'Capture 100% of billable client interactions'
    },
    {
      problem: 'Legal research takes too long',
      solution_title: 'AI-powered legal research system',
      features: ['AI Search', 'Team Wiki', 'AI Writing'],
      how_it_works: [
        'Build searchable precedent database',
        'AI Search finds relevant cases instantly',
        'AI Writing drafts initial research memos',
        'Track research time savings'
      ],
      expected_outcome: 'Cut legal research time by 60%'
    }
  ],
  'consulting': [
    {
      problem: 'Client project knowledge silos',
      solution_title: 'Unified client project workspace',
      features: ['Projects (PM)', 'Team Wiki', 'Relations/Rollups'],
      how_it_works: [
        'Create Projects for each client engagement',
        'Link to Wiki knowledge base',
        'Rollup project metrics across clients',
        'Track deliverable completion'
      ],
      expected_outcome: 'Improve project delivery consistency by 40%'
    },
    {
      problem: 'Proposal generation takes too long',
      solution_title: 'AI-powered proposal system',
      features: ['AI Writing', 'Canvas DB', 'Synced Blocks'],
      how_it_works: [
        'Store proposal templates in Canvas DB',
        'AI Writing customizes for each client',
        'Synced Blocks maintain standard sections',
        'Track proposal win rates'
      ],
      expected_outcome: 'Cut proposal creation time by 70%'
    },
    {
      problem: 'Client check-ins are inconsistent',
      solution_title: 'Automated client relationship management',
      features: ['Calendar Scheduling', 'AI Agents', 'Basic CRM'],
      how_it_works: [
        'Auto-schedule regular client check-ins',
        'AI Agents prepare meeting agendas',
        'Track client satisfaction in CRM',
        'Alert on at-risk relationships'
      ],
      expected_outcome: 'Increase client retention by 25%'
    }
  ],
  'marketing': [
    {
      problem: 'Campaign assets scattered across tools',
      solution_title: 'Centralized campaign asset management',
      features: ['Canvas DB', 'Relations/Rollups', 'Views & Filters'],
      how_it_works: [
        'Store all assets in Canvas DB',
        'Link campaigns to assets via Relations',
        'Track performance with Rollups',
        'Filter by campaign status'
      ],
      expected_outcome: 'Reduce asset search time by 80%'
    },
    {
      problem: 'Content creation workflow inefficient',
      solution_title: 'AI-powered content pipeline',
      features: ['AI Writing', 'Projects (PM)', 'Forms'],
      how_it_works: [
        'Brief intake via Forms',
        'AI Writing generates first drafts',
        'Track content through Projects pipeline',
        'Auto-schedule publication dates'
      ],
      expected_outcome: 'Double content output with same team'
    },
    {
      problem: 'Lead qualification process manual',
      solution_title: 'Automated lead scoring system',
      features: ['Forms', 'AI Agents', 'Basic CRM'],
      how_it_works: [
        'Capture leads via smart Forms',
        'AI Agents score leads automatically',
        'Route qualified leads to sales',
        'Track conversion rates'
      ],
      expected_outcome: 'Improve lead qualification accuracy by 60%'
    }
  ],
  'technology': [
    {
      problem: 'Technical documentation outdated and fragmented',
      solution_title: 'Living technical documentation system',
      features: ['Team Wiki', 'API & Automations', 'AI Writing'],
      how_it_works: [
        'Connect code repos via API',
        'Auto-update docs when code changes',
        'AI Writing fills documentation gaps',
        'Version control for all docs'
      ],
      expected_outcome: 'Keep 95% of documentation current automatically'
    },
    {
      problem: 'Bug tracking across multiple systems',
      solution_title: 'Unified bug management dashboard',
      features: ['Projects (PM)', 'API & Automations', 'Views & Filters'],
      how_it_works: [
        'Integrate all bug tracking tools',
        'Centralize in Projects database',
        'Auto-prioritize by severity',
        'Track resolution metrics'
      ],
      expected_outcome: 'Reduce bug resolution time by 45%'
    },
    {
      problem: 'Customer feedback scattered and unactionable',
      solution_title: 'AI-powered feedback analysis system',
      features: ['Forms', 'AI Agents', 'Relations/Rollups'],
      how_it_works: [
        'Collect feedback via Forms',
        'AI Agents categorize and prioritize',
        'Link to product features via Relations',
        'Track sentiment trends with Rollups'
      ],
      expected_outcome: 'Turn 80% of feedback into actionable insights'
    }
  ]
}

// Agent play templates by industry
const AGENT_PLAY_TEMPLATES: Record<string, AgentPlay[]> = {
  'ecommerce': [
    {
      name: 'Order Alert Agent',
      trigger: 'High-value order placed',
      actions: ['Create VIP customer record', 'Notify account manager', 'Schedule follow-up'],
      kpi_impact: 'Increase repeat purchase rate by 30%'
    },
    {
      name: 'Support Triage Agent',
      trigger: 'New support ticket created',
      actions: ['Categorize issue type', 'Check order history', 'Route to specialist', 'Set SLA timer'],
      kpi_impact: 'Reduce first response time by 60%'
    },
    {
      name: 'Inventory Alert Agent',
      trigger: 'Product stock below threshold',
      actions: ['Create reorder task', 'Notify purchasing team', 'Update product status'],
      kpi_impact: 'Prevent 95% of stockouts'
    },
    {
      name: 'Review Response Agent',
      trigger: 'New negative review received',
      actions: ['Create response task', 'Gather order details', 'Draft empathetic reply', 'Escalate if needed'],
      kpi_impact: 'Improve review response rate to 100%'
    }
  ],
  'saas': [
    {
      name: 'Churn Risk Agent',
      trigger: 'Low usage pattern detected',
      actions: ['Create intervention task', 'Schedule health check call', 'Prepare usage report'],
      kpi_impact: 'Reduce churn rate by 25%'
    },
    {
      name: 'Feature Request Agent',
      trigger: 'New feature request submitted',
      actions: ['Categorize request', 'Check existing roadmap', 'Notify product team', 'Update requester'],
      kpi_impact: 'Capture 100% of feature requests with context'
    },
    {
      name: 'Onboarding Monitor Agent',
      trigger: 'User signup completed',
      actions: ['Create onboarding checklist', 'Schedule check-in calls', 'Track progress milestones'],
      kpi_impact: 'Improve activation rate by 40%'
    },
    {
      name: 'Support Escalation Agent',
      trigger: 'Ticket unresolved for 24 hours',
      actions: ['Escalate to senior support', 'Notify customer of status', 'Create improvement task'],
      kpi_impact: 'Meet SLA targets 98% of the time'
    }
  ],
  'legal': [
    {
      name: 'Case Deadline Agent',
      trigger: 'Court date in 7 days',
      actions: ['Prepare case file checklist', 'Notify legal team', 'Schedule prep meeting'],
      kpi_impact: 'Never miss a deadline'
    },
    {
      name: 'Client Communication Agent',
      trigger: 'Email from client received',
      actions: ['Log in case file', 'Check for urgency markers', 'Route to case attorney', 'Start billing timer'],
      kpi_impact: 'Capture 100% of billable communications'
    },
    {
      name: 'Document Review Agent',
      trigger: 'New document uploaded to case',
      actions: ['Extract key information', 'Tag document type', 'Check for sensitive data', 'Notify team'],
      kpi_impact: 'Reduce document review time by 50%'
    },
    {
      name: 'Billing Automation Agent',
      trigger: 'End of billing period',
      actions: ['Compile time entries', 'Generate invoice draft', 'Check for unbilled items', 'Send for approval'],
      kpi_impact: 'Reduce billing preparation time by 70%'
    }
  ],
  'consulting': [
    {
      name: 'Project Health Agent',
      trigger: 'Weekly project review',
      actions: ['Check milestone progress', 'Calculate budget burn rate', 'Flag at-risk projects', 'Notify PM'],
      kpi_impact: 'Deliver projects on time and budget 90% of the time'
    },
    {
      name: 'Client Satisfaction Agent',
      trigger: 'Project milestone completed',
      actions: ['Send satisfaction survey', 'Schedule feedback call', 'Log client sentiment', 'Create improvement tasks'],
      kpi_impact: 'Maintain client satisfaction above 4.5/5'
    },
    {
      name: 'Proposal Follow-up Agent',
      trigger: 'Proposal sent to client',
      actions: ['Schedule follow-up reminders', 'Track proposal opens', 'Prepare FAQ responses', 'Alert sales team'],
      kpi_impact: 'Increase proposal response rate by 35%'
    },
    {
      name: 'Knowledge Capture Agent',
      trigger: 'Project completion',
      actions: ['Extract lessons learned', 'Update methodology templates', 'Create case study draft', 'Share with team'],
      kpi_impact: 'Build institutional knowledge consistently'
    }
  ],
  'marketing': [
    {
      name: 'Lead Scoring Agent',
      trigger: 'New lead form submission',
      actions: ['Score lead quality', 'Enrich with company data', 'Route to sales rep', 'Start nurture sequence'],
      kpi_impact: 'Improve lead qualification by 60%'
    },
    {
      name: 'Content Performance Agent',
      trigger: 'Content published',
      actions: ['Track engagement metrics', 'Identify top performers', 'Create optimization tasks', 'Schedule updates'],
      kpi_impact: 'Increase content ROI by 45%'
    },
    {
      name: 'Campaign Monitor Agent',
      trigger: 'Campaign performance data available',
      actions: ['Analyze key metrics', 'Compare to benchmarks', 'Flag underperformers', 'Generate insights report'],
      kpi_impact: 'Optimize campaigns 3x faster'
    },
    {
      name: 'Social Mention Agent',
      trigger: 'Brand mentioned on social media',
      actions: ['Categorize sentiment', 'Create response task if needed', 'Track influence metrics', 'Alert team'],
      kpi_impact: 'Respond to brand mentions within 2 hours'
    }
  ],
  'technology': [
    {
      name: 'Bug Triage Agent',
      trigger: 'New bug report submitted',
      actions: ['Categorize severity', 'Check for duplicates', 'Assign to developer', 'Set priority level'],
      kpi_impact: 'Reduce bug triage time by 75%'
    },
    {
      name: 'Code Review Agent',
      trigger: 'Pull request opened',
      actions: ['Run automated checks', 'Identify reviewers', 'Schedule review reminders', 'Track review time'],
      kpi_impact: 'Maintain code quality while shipping 2x faster'
    },
    {
      name: 'Performance Monitor Agent',
      trigger: 'System metrics exceed threshold',
      actions: ['Create incident ticket', 'Notify on-call team', 'Gather diagnostic data', 'Start resolution timer'],
      kpi_impact: 'Reduce mean time to resolution by 50%'
    },
    {
      name: 'Customer Feedback Agent',
      trigger: 'Support ticket reveals product issue',
      actions: ['Extract product feedback', 'Link to feature requests', 'Notify product team', 'Track frequency'],
      kpi_impact: 'Turn 80% of support issues into product insights'
    }
  ]
}

export function buildRecommendations(input: RecommendationInput): RecommendationOutput {
  const { industry, tools, kpis } = input
  
  // Get industry-specific problems
  const industryProblems = INDUSTRY_PROBLEMS[industry] || INDUSTRY_PROBLEMS['technology']
  
  // Filter and adapt problems based on tools and KPIs
  let problems_to_solutions = industryProblems.slice(0, 6) // Start with first 6 industry problems
  
  // Add tool-specific problems based on current stack
  const toolProblems = generateToolSpecificProblems(tools, kpis)
  problems_to_solutions = [...problems_to_solutions, ...toolProblems].slice(0, 8) // Max 8 total
  
  // Generate cancellations based on tools
  const cancellations = generateCancellations(tools)
  
  return {
    problems_to_solutions,
    cancellations
  }
}

function generateToolSpecificProblems(tools: string[], _kpis: string[]): ProblemSolution[] {
  const problems: ProblemSolution[] = []
  
  // Check for common tool patterns
  const toolsLower = tools.map(t => t.toLowerCase())
  
  if (toolsLower.some(t => ['slack', 'teams', 'discord'].includes(t))) {
    problems.push({
      problem: 'Important decisions buried in chat channels',
      solution_title: 'Decision tracking with AI Meeting Notes',
      features: ['AI Meeting Notes', 'Team Wiki', 'AI Search'],
      how_it_works: [
        'AI automatically extracts decisions from meetings',
        'Store decisions in searchable Wiki',
        'Link to relevant projects and stakeholders',
        'Send decision summaries to affected teams'
      ],
      expected_outcome: 'Never lose track of important decisions'
    })
  }
  
  if (toolsLower.some(t => ['google drive', 'dropbox', 'onedrive'].includes(t))) {
    problems.push({
      problem: 'Files scattered across cloud storage',
      solution_title: 'Centralized file organization system',
      features: ['Canvas DB', 'Relations/Rollups', 'AI Search'],
      how_it_works: [
        'Index all files in Canvas DB',
        'Link files to projects via Relations',
        'AI Search finds files by content',
        'Track file usage and access patterns'
      ],
      expected_outcome: 'Find any file in under 10 seconds'
    })
  }
  
  return problems
}

function generateCancellations(tools: string[]): Cancellation[] {
  const cancellations: Cancellation[] = []
  const toolsLower = tools.map(t => t.toLowerCase())
  
  for (const tool of toolsLower) {
    // Check exact matches first
    if (TOOL_MAPPINGS[tool]) {
      const mapping = TOOL_MAPPINGS[tool]
      cancellations.push({
        tool: tools.find(t => t.toLowerCase() === tool) || tool,
        replaced_by: mapping.replaced_by,
        per_user_month: mapping.per_user_month
      })
      continue
    }
    
    // Check partial matches
    for (const [mappedTool, mapping] of Object.entries(TOOL_MAPPINGS)) {
      if (tool.includes(mappedTool) || mappedTool.includes(tool)) {
        cancellations.push({
          tool: tools.find(t => t.toLowerCase() === tool) || tool,
          replaced_by: mapping.replaced_by,
          per_user_month: mapping.per_user_month
        })
        break
      }
    }
  }
  
  return cancellations
}

export function buildAgentPlays(input: RecommendationInput): AgentPlay[] {
  const { industry, tools, kpis } = input
  
  // Get industry-specific agent plays
  const industryPlays = AGENT_PLAY_TEMPLATES[industry] || AGENT_PLAY_TEMPLATES['technology']
  
  // Select 3-5 most relevant plays
  let selectedPlays = industryPlays.slice(0, 4)
  
  // Add KPI-specific plays
  const kpiPlays = generateKPISpecificPlays(kpis, tools)
  selectedPlays = [...selectedPlays, ...kpiPlays].slice(0, 5) // Max 5 total
  
  return selectedPlays
}

function generateKPISpecificPlays(kpis: string[], _tools: string[]): AgentPlay[] {
  const plays: AgentPlay[] = []
  const kpisLower = kpis.map(k => k.toLowerCase())
  
  if (kpisLower.some(k => k.includes('revenue') || k.includes('sales'))) {
    plays.push({
      name: 'Revenue Alert Agent',
      trigger: 'High-value opportunity identified',
      actions: ['Create opportunity record', 'Notify sales team', 'Schedule follow-up', 'Track progress'],
      kpi_impact: 'Increase revenue pipeline visibility by 100%'
    })
  }
  
  if (kpisLower.some(k => k.includes('retention') || k.includes('churn'))) {
    plays.push({
      name: 'Retention Risk Agent',
      trigger: 'Customer shows disengagement signals',
      actions: ['Calculate risk score', 'Create intervention plan', 'Alert account manager', 'Schedule health check'],
      kpi_impact: 'Reduce churn by identifying at-risk customers early'
    })
  }
  
  return plays
}

// Map cancellations to ROI service stack keys
export function mapCancellationsToStackKeys(cancellations: Cancellation[]): string[] {
  const stackKeys: string[] = []
  
  for (const cancellation of cancellations) {
    const toolLower = cancellation.tool.toLowerCase()
    
    // Find the corresponding stack key from tool mappings
    for (const [mappedTool, mapping] of Object.entries(TOOL_MAPPINGS)) {
      if (toolLower.includes(mappedTool) || mappedTool.includes(toolLower)) {
        if (!stackKeys.includes(mapping.stackKey)) {
          stackKeys.push(mapping.stackKey)
        }
        break
      }
    }
  }
  
  return stackKeys
}
