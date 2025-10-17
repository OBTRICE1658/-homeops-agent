import { z } from 'zod'
import { ROISchema } from './schemas'

export const NotionFeature = z.enum([
  "AI Search",
  "AI Writing", 
  "AI Agents",
  "AI Email App",
  "AI Meeting Notes",
  "Projects (PM)",
  "Forms",
  "Calendar Scheduling",
  "Basic CRM",
  "Team Wiki",
  "Canvas DB",
  "Synced Blocks",
  "Relations/Rollups",
  "Views & Filters",
  "API & Automations"
])
export type NotionFeature = z.infer<typeof NotionFeature>

export const ProblemSolution = z.object({
  problem: z.string(),                        // e.g., "Support tickets scattered across tools"
  solution_title: z.string(),                 // e.g., "Unify tickets in Projects + AI triage"
  features: z.array(NotionFeature).min(1),    // exact Notion 3.0 features
  how_it_works: z.array(z.string()).min(2),   // 2-5 bullet steps
  expected_outcome: z.string()                // concise, measurable outcome
})
export type ProblemSolution = z.infer<typeof ProblemSolution>

export const Cancellation = z.object({
  tool: z.string(),             // "Zendesk"
  replaced_by: z.array(NotionFeature),
  per_user_month: z.number()    // USD
})
export type Cancellation = z.infer<typeof Cancellation>

export const AgentPlay = z.object({
  name: z.string(),             // "Churn Rescue Agent"
  trigger: z.string(),          // "New low-CSAT form submission"
  actions: z.array(z.string()), // "summarize thread", "open project task", "notify owner"
  kpi_impact: z.string()        // "reduce time-to-first-response by 40%"
})
export type AgentPlay = z.infer<typeof AgentPlay>

export const OnePager = z.object({
  version: z.literal("1.0"),
  client: z.object({
    industry: z.string(),
    team_size: z.number().int().positive(),
    tools: z.array(z.string()),
    kpis: z.array(z.string()),
    constraints: z.array(z.string()).default([]),
    summary: z.string()
  }),
  problems_to_solutions: z.array(ProblemSolution).min(3).max(8),
  cancellations: z.array(Cancellation).default([]),
  roi: ROISchema,                             // reuse ROI from schemas.ts
  agent_plays: z.array(AgentPlay).min(3).max(5),
  quick_plan: z.array(z.object({ 
    phase: z.string(), 
    activities: z.array(z.string()) 
  })).length(3)
})
export type OnePager = z.infer<typeof OnePager>
