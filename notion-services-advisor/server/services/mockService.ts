import type { Plan, AdvisorRequest } from '../types/plan'

export const mockPlan: Plan = {
  version: "2.0",
  industry: "saas",
  context: {
    team_size: 15,
    tools: ["Slack", "Google Workspace", "Salesforce", "Zendesk"],
    kpis: ["Customer satisfaction", "Monthly recurring revenue", "Time to resolution", "User adoption"],
    constraints: ["Budget under $50k", "Must integrate with existing tools"]
  },
  fit_score: {
    data_readiness: 8,
    governance_complexity: 6,
    workflow_repeatability: 9,
    connector_availability: 8,
    change_appetite: 7,
    industry_factor: 1.4,
    rationale: {
      data_readiness: "Strong data infrastructure with multiple SaaS tools generating structured data",
      governance_complexity: "Moderate complexity with clear team roles and SaaS-standard security requirements",
      workflow_repeatability: "Highly repeatable customer support and sales workflows typical in SaaS",
      connector_availability: "Excellent API connectivity with major SaaS platforms and tools",
      change_appetite: "Good willingness to adopt new tools for scaling operations"
    },
    overall: 8.7
  },
  roi: {
    team_size: 15,
    avg_hourly_rate: 75,
    hours_saved_per_week: 22,
    implementation_cost: 12000,
    monthly_stack_savings: 0,
    annual_stack_savings: 0,
    annual_savings: 85800,
    payback_months: 1.7,
    efficiency_gain_pct: 14
  },
  databases: [
    {
      key: "customers",
      title: "Customer Database",
      description: "Centralized customer profiles with subscription and usage data",
      properties: [
        { name: "Account Name", type: "title" },
        { name: "Contact Email", type: "rich_text" },
        { name: "Plan Type", type: "select", options: ["Free", "Starter", "Professional", "Enterprise"] },
        { name: "MRR", type: "number" },
        { name: "Health Score", type: "number" },
        { name: "Renewal Date", type: "date" },
        { name: "Account Manager", type: "people" }
      ],
      default_views: [
        { name: "All Accounts" },
        { name: "High Value", filter: { "MRR": { "number": { "greater_than": 1000 } } } },
        { name: "Renewal This Month" }
      ]
    },
    {
      key: "support_tickets",
      title: "Support Tickets",
      description: "Customer support request tracking and resolution",
      properties: [
        { name: "Ticket Title", type: "title" },
        { name: "Customer", type: "relation", relation: { database: "customers", synced: true } },
        { name: "Priority", type: "select", options: ["Low", "Medium", "High", "Critical"] },
        { name: "Status", type: "select", options: ["Open", "In Progress", "Waiting", "Resolved"] },
        { name: "Assigned To", type: "people" },
        { name: "Created Date", type: "date" },
        { name: "Resolution Time", type: "number" }
      ],
      default_views: [
        { name: "Open Tickets" },
        { name: "High Priority", filter: { "Priority": "High" } },
        { name: "My Tickets" }
      ]
    },
    {
      key: "feature_requests",
      title: "Feature Requests",
      description: "Product feature requests and development pipeline",
      properties: [
        { name: "Feature Title", type: "title" },
        { name: "Description", type: "rich_text" },
        { name: "Priority", type: "select", options: ["Low", "Medium", "High", "Critical"] },
        { name: "Status", type: "select", options: ["Requested", "Planning", "Development", "Testing", "Released"] },
        { name: "Votes", type: "number" },
        { name: "Requesting Customers", type: "relation", relation: { database: "customers", synced: true } }
      ],
      default_views: [
        { name: "All Features" },
        { name: "High Priority", filter: { "Priority": "High" } },
        { name: "In Development", filter: { "Status": "Development" } }
      ]
    }
  ],
  workflows: [
    { name: "Customer Onboarding", steps: ["Welcome email", "Account setup", "Demo scheduled", "Initial training", "Success check-in"] },
    { name: "Support Ticket Resolution", steps: ["Ticket received", "Priority assessment", "Assignment", "Investigation", "Resolution", "Customer feedback"] },
    { name: "Feature Request Process", steps: ["Request submission", "Feasibility analysis", "Prioritization", "Development planning", "Implementation", "Release"] }
  ],
  governance: {
    roles: ["Admin", "Account Manager", "Support Agent", "Product Manager", "Developer"],
    rules: ["Customer data access on need-to-know basis", "Weekly team sync meetings", "Monthly metrics review", "Quarterly goal setting"]
  },
  portals: [
    { name: "Customer Success Dashboard", audience: "internal" },
    { name: "Product Roadmap", audience: "client" },
    { name: "Support Knowledge Base", audience: "public" }
  ],
  risks: [
    { risk: "Data migration complexity from existing CRM", mitigation: "Phased migration with parallel running period and thorough testing" },
    { risk: "User adoption resistance", mitigation: "Comprehensive training program and change management with champions in each team" },
    { risk: "Integration challenges with existing tools", mitigation: "API testing phase and fallback manual processes during transition" }
  ],
  exports: {
    sow_markdown: "",
    pilot_scorecard_markdown: "",
    notion_template_json: {}
  }
}

export function generateMockPlan(request: AdvisorRequest): Plan {
  // Customize the mock plan based on the request
  const customizedPlan: Plan = {
    ...mockPlan,
    industry: request.industry,
    context: {
      team_size: request.team_size,
      tools: request.tools,
      kpis: request.kpis,
      constraints: request.constraints || []
    },
    roi: {
      ...mockPlan.roi,
      team_size: request.team_size,
      hours_saved_per_week: Math.max(2, Math.min(40, request.team_size * 1.5)),
      annual_savings: Math.round(request.team_size * 75 * 2.5 * 52), // team_size * hourly_rate * hours_saved * weeks
      payback_months: Math.round((12000 / (request.team_size * 75 * 2.5 * 52 / 12)) * 10) / 10
    }
  }

  return customizedPlan
}
