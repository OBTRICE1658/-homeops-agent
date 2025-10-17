import { openai, OPENAI_MODEL, OPENAI_TEMPERATURE } from '../lib/openai'
import { PlanSchema, type Plan, type AdvisorRequest } from '../types/plan'
import { validationService } from './validationService'
import { fitScoreService } from './fitScoreService'
import { roiService } from './roiService'
import { dbGenService } from './dbGenService'
import { exportService } from './exportService'
import { generateMockPlan } from './mockService'

class AdvisorService {
  async generatePlan(request: AdvisorRequest): Promise<Plan> {
    try {
      // Check if OpenAI is configured
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-placeholder-key-for-demo') {
        console.log('Using mock data for demo purposes...')
        const mockPlan = generateMockPlan(request)
        return await this.augmentPlan(mockPlan, request)
      }

      // Step 1: Generate initial plan via OpenAI
      const llmPlan = await this.generateLLMPlan(request)
      
      // Step 2: Auto-repair to match schema
      const repairedPlan = await validationService.autoRepair(llmPlan)
      
      // Step 3: Deterministic augmentation
      const augmentedPlan = await this.augmentPlan(repairedPlan, request)
      
      return augmentedPlan
    } catch (error) {
      console.error('AdvisorService.generatePlan error:', error)
      console.log('Falling back to mock data...')
      const mockPlan = generateMockPlan(request)
      return await this.augmentPlan(mockPlan, request)
    }
  }

  private async generateLLMPlan(request: AdvisorRequest): Promise<any> {
    const systemPrompt = `You are an expert Notion consultant. Generate a comprehensive Notion implementation plan.

OUTPUT ONLY JSON matching this exact schema structure:
{
  "version": "2.0",
  "industry": "${request.industry}",
  "context": {
    "team_size": ${request.team_size},
    "tools": ${JSON.stringify(request.tools)},
    "kpis": ${JSON.stringify(request.kpis)},
    "constraints": ${JSON.stringify(request.constraints || [])}
  },
  "fit_score": {
    "data_readiness": 0-10,
    "governance_complexity": 0-10,
    "workflow_repeatability": 0-10,
    "connector_availability": 0-10,
    "change_appetite": 0-10,
    "industry_factor": 0.5-1.5,
    "rationale": {"dimension": "reason"},
    "overall": computed_score
  },
  "roi": {
    "team_size": number,
    "avg_hourly_rate": 75,
    "hours_saved_per_week": estimated,
    "implementation_cost": estimated,
    "monthly_stack_savings": 0,
    "annual_stack_savings": 0,
    "annual_savings": computed,
    "payback_months": computed,
    "efficiency_gain_pct": estimated
  },
  "databases": [database_specs],
  "workflows": [workflow_specs],
  "governance": {"roles": [], "rules": []},
  "portals": [portal_specs],
  "risks": [risk_specs],
  "exports": {"sow_markdown": "", "pilot_scorecard_markdown": "", "notion_template_json": {}}
}

Base your recommendations on the ${request.industry} industry, team size of ${request.team_size}, and their tools: ${request.tools.join(', ')}.
Focus on KPIs: ${request.kpis.join(', ')}.
${request.constraints?.length ? `Consider constraints: ${request.constraints.join(', ')}.` : ''}

Return ONLY the JSON, no other text.`

    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      temperature: OPENAI_TEMPERATURE,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate plan for ${request.industry} company` }
      ],
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    try {
      return JSON.parse(content)
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content)
      throw new Error('Invalid JSON response from OpenAI')
    }
  }

  private async augmentPlan(basePlan: any, request: AdvisorRequest): Promise<Plan> {
    // Recompute fit score deterministically
    const fitScore = fitScoreService.computeFitScore(request.industry, basePlan.context)
    
    // Recompute ROI deterministically
    const roi = roiService.buildROI(basePlan.context, {
      avg_hourly_rate: basePlan.roi?.avg_hourly_rate || 75,
      hours_saved_per_week: basePlan.roi?.hours_saved_per_week || 2.5,
      implementation_cost: basePlan.roi?.implementation_cost || 12000
    })
    
    // Generate industry-specific databases
    const databases = dbGenService.generateDatabases(request.industry, basePlan.context)
    
    // Generate exports
    const exports = exportService.generateExports({
      ...basePlan,
      fit_score: fitScore,
      roi,
      databases
    })

    const finalPlan = {
      ...basePlan,
      fit_score: fitScore,
      roi,
      databases,
      exports
    }

    // Validate final plan
    return PlanSchema.parse(finalPlan)
  }
}

export const advisorService = new AdvisorService()
