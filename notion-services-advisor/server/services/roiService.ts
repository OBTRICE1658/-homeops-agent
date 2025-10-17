import type { ROI, Context } from '../types/plan'

// Default stack pricing (monthly per user in USD) - Step 7 pricing parity
export const DEFAULT_STACK = {
  ai_search: 35,
  ai_writing: 20,
  calendar: 15,
  crm_basic: 20,
  chatbot: 20,
  email_app: 30,
  wiki: 10,
  site_builder: 20,
  meeting_notes: 18,
  research: 40,
  pm_tool: 24,
  forms: 15
} as const

export type StackKey = keyof typeof DEFAULT_STACK

interface StackSavingsParams {
  team_size: number
  enabledKeys?: string[]
  catalog?: Record<string, number>
}

interface TimeSavingsParams {
  team_size: number
  avg_hourly_rate?: number
  hours_saved_per_week?: number
  implementation_cost?: number
}

interface ROIParams extends TimeSavingsParams {
  enabledKeys?: string[]
  catalog?: Record<string, number>
}

class ROIService {
  computeStackSavings({ team_size, enabledKeys = [], catalog = DEFAULT_STACK }: StackSavingsParams) {
    const enabledPrices = enabledKeys
      .filter(key => key in catalog)
      .map(key => catalog[key])
    
    const perUserMonthly = enabledPrices.reduce((sum, price) => sum + price, 0)
    const monthly_stack_savings = perUserMonthly * team_size
    const annual_stack_savings = monthly_stack_savings * 12

    return {
      perUserMonthly,
      monthly_stack_savings,
      annual_stack_savings
    }
  }

  computeTimeSavings({ 
    team_size, 
    avg_hourly_rate = 75, 
    hours_saved_per_week = 2.5, 
    implementation_cost = 12000 
  }: TimeSavingsParams) {
    const annual_time_savings = team_size * hours_saved_per_week * 52 * avg_hourly_rate
    const efficiency_gain_pct = Math.round((hours_saved_per_week / 40) * 100) // Assuming 40h work week

    return {
      annual_time_savings,
      efficiency_gain_pct,
      avg_hourly_rate,
      hours_saved_per_week,
      implementation_cost
    }
  }

  buildROI(context: Context, params: Partial<ROIParams> = {}): ROI {
    const {
      avg_hourly_rate = 75,
      hours_saved_per_week = 2.5,
      implementation_cost = 12000,
      enabledKeys = [],
      catalog = DEFAULT_STACK
    } = params

    // Calculate stack savings
    const stackSavings = this.computeStackSavings({
      team_size: context.team_size,
      enabledKeys,
      catalog
    })

    // Calculate time savings
    const timeSavings = this.computeTimeSavings({
      team_size: context.team_size,
      avg_hourly_rate,
      hours_saved_per_week,
      implementation_cost
    })

    // Combine savings
    const annual_savings = timeSavings.annual_time_savings + stackSavings.annual_stack_savings
    const payback_months = annual_savings > 0 ? 
      Math.round((implementation_cost / (annual_savings / 12)) * 10) / 10 : 
      999

    return {
      team_size: context.team_size,
      avg_hourly_rate,
      hours_saved_per_week,
      implementation_cost,
      monthly_stack_savings: stackSavings.monthly_stack_savings,
      annual_stack_savings: stackSavings.annual_stack_savings,
      annual_savings,
      payback_months,
      efficiency_gain_pct: timeSavings.efficiency_gain_pct
    }
  }

  recomputeROI(params: ROIParams): ROI {
    const context = { team_size: params.team_size, tools: [], kpis: [], constraints: [] }
    return this.buildROI(context, params)
  }
}

export const roiService = new ROIService()
