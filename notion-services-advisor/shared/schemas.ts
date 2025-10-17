import { z } from 'zod'

// Industry types
export const IndustrySchema = z.enum([
  'ecommerce',
  'saas',
  'legal',
  'consulting',
  'marketing',
  'technology'
])
export type Industry = z.infer<typeof IndustrySchema>

// Context schema
export const ContextSchema = z.object({
  team_size: z.number().min(1),
  tools: z.array(z.string()),
  kpis: z.array(z.string()),
  constraints: z.array(z.string()).optional().default([])
})
export type Context = z.infer<typeof ContextSchema>

// Fit score schema
export const FitScoreSchema = z.object({
  data_readiness: z.number().min(0).max(10),
  governance_complexity: z.number().min(0).max(10),
  workflow_repeatability: z.number().min(0).max(10),
  connector_availability: z.number().min(0).max(10),
  change_appetite: z.number().min(0).max(10),
  industry_factor: z.number().min(0.5).max(1.5),
  rationale: z.record(z.string()),
  overall: z.number().min(0).max(10)
})
export type FitScore = z.infer<typeof FitScoreSchema>

// ROI schema
export const ROISchema = z.object({
  team_size: z.number(),
  avg_hourly_rate: z.number(),
  hours_saved_per_week: z.number(),
  implementation_cost: z.number(),
  monthly_stack_savings: z.number(),
  annual_stack_savings: z.number(),
  annual_savings: z.number(),
  payback_months: z.number(),
  efficiency_gain_pct: z.number()
})
export type ROI = z.infer<typeof ROISchema>

// Property types for databases
export const PropertyTypeSchema = z.enum([
  'title',
  'rich_text',
  'select',
  'multi_select',
  'relation',
  'rollup',
  'date',
  'people',
  'checkbox',
  'formula',
  'number'
])
export type PropertyType = z.infer<typeof PropertyTypeSchema>

// Database property schema
export const DatabasePropertySchema = z.object({
  name: z.string(),
  type: PropertyTypeSchema,
  options: z.array(z.string()).optional(),
  relation: z.object({
    database: z.string(),
    synced: z.boolean()
  }).optional(),
  formula: z.string().optional()
})
export type DatabaseProperty = z.infer<typeof DatabasePropertySchema>

// Database view schema
export const DatabaseViewSchema = z.object({
  name: z.string(),
  filter: z.record(z.any()).optional()
})
export type DatabaseView = z.infer<typeof DatabaseViewSchema>

// Database spec schema
export const DatabaseSpecSchema = z.object({
  key: z.string(),
  title: z.string(),
  description: z.string(),
  properties: z.array(DatabasePropertySchema),
  default_views: z.array(DatabaseViewSchema)
})
export type DatabaseSpec = z.infer<typeof DatabaseSpecSchema>

// Workflow schema
export const WorkflowSchema = z.object({
  name: z.string(),
  steps: z.array(z.string())
})
export type Workflow = z.infer<typeof WorkflowSchema>

// Governance schema
export const GovernanceSchema = z.object({
  roles: z.array(z.string()),
  rules: z.array(z.string())
})
export type Governance = z.infer<typeof GovernanceSchema>

// Portal schema
export const PortalSchema = z.object({
  name: z.string(),
  audience: z.enum(['client', 'internal', 'public'])
})
export type Portal = z.infer<typeof PortalSchema>

// Risk schema
export const RiskSchema = z.object({
  risk: z.string(),
  mitigation: z.string()
})
export type Risk = z.infer<typeof RiskSchema>

// Exports schema
export const ExportsSchema = z.object({
  sow_markdown: z.string(),
  pilot_scorecard_markdown: z.string(),
  notion_template_json: z.record(z.any())
})
export type Exports = z.infer<typeof ExportsSchema>

// Main Plan schema v2.0
export const PlanSchema = z.object({
  version: z.literal('2.0'),
  industry: IndustrySchema,
  context: ContextSchema,
  fit_score: FitScoreSchema,
  roi: ROISchema,
  databases: z.array(DatabaseSpecSchema),
  workflows: z.array(WorkflowSchema),
  governance: GovernanceSchema,
  portals: z.array(PortalSchema),
  risks: z.array(RiskSchema),
  exports: ExportsSchema
})
export type Plan = z.infer<typeof PlanSchema>

// API request schemas
export const AdvisorRequestSchema = z.object({
  industry: IndustrySchema,
  team_size: z.number().min(1),
  tools: z.array(z.string()),
  kpis: z.array(z.string()),
  constraints: z.array(z.string()).optional().default([])
})
export type AdvisorRequest = z.infer<typeof AdvisorRequestSchema>

export const ROIRequestSchema = z.object({
  team_size: z.number().min(1),
  enabledKeys: z.array(z.string()).optional(),
  avg_hourly_rate: z.number().optional(),
  hours_saved_per_week: z.number().optional(),
  implementation_cost: z.number().optional()
})
export type ROIRequest = z.infer<typeof ROIRequestSchema>

export const NotionCreateRequestSchema = z.object({
  parentPageId: z.string(),
  plan: PlanSchema
})
export type NotionCreateRequest = z.infer<typeof NotionCreateRequestSchema>
