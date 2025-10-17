import { openai, OPENAI_MODEL } from '../lib/openai'
import { PlanSchema, type Plan } from '../types/plan'

class ValidationService {
  validatePlan(plan: any): Plan {
    try {
      return PlanSchema.parse(plan)
    } catch (error) {
      throw new Error(`Plan validation failed: ${error}`)
    }
  }

  async autoRepair(brokenPlan: any): Promise<any> {
    try {
      // First try direct validation
      return this.validatePlan(brokenPlan)
    } catch (validationError) {
      console.log('Plan validation failed, attempting auto-repair via LLM...')
      
      // Use LLM to repair the plan
      return await this.repairWithLLM(brokenPlan, validationError)
    }
  }

  private async repairWithLLM(brokenPlan: any, validationError: any): Promise<any> {
    const systemPrompt = `You are a JSON repair specialist. Fix the provided JSON to match the Plan v2.0 schema.

Schema requirements:
- version: must be "2.0"
- industry: one of "ecommerce", "saas", "legal", "consulting", "marketing", "technology"
- context: {team_size: number, tools: string[], kpis: string[], constraints?: string[]}
- fit_score: {data_readiness: 0-10, governance_complexity: 0-10, workflow_repeatability: 0-10, connector_availability: 0-10, change_appetite: 0-10, industry_factor: 0.5-1.5, rationale: Record<string,string>, overall: number}
- roi: {team_size, avg_hourly_rate, hours_saved_per_week, implementation_cost, monthly_stack_savings, annual_stack_savings, annual_savings, payback_months, efficiency_gain_pct}
- databases: array of DatabaseSpec objects
- workflows: array of {name, steps}
- governance: {roles: string[], rules: string[]}
- portals: array of {name, audience}
- risks: array of {risk, mitigation}
- exports: {sow_markdown, pilot_scorecard_markdown, notion_template_json}

Fix the JSON and return ONLY the corrected JSON, no other text.`

    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      temperature: 0.1,
      messages: [
        { role: 'system', content: systemPrompt },
        { 
          role: 'user', 
          content: `Fix this JSON:\n\n${JSON.stringify(brokenPlan, null, 2)}\n\nValidation error: ${validationError}` 
        }
      ],
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI for repair')
    }

    try {
      const repairedPlan = JSON.parse(content)
      // Validate the repaired plan
      return this.validatePlan(repairedPlan)
    } catch (error) {
      console.error('Auto-repair failed:', error)
      throw new Error('Unable to repair plan structure')
    }
  }
}

export const validationService = new ValidationService()
