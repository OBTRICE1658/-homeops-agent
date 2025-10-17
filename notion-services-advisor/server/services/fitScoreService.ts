import type { Industry, Context, FitScore } from '../types/plan'

class FitScoreService {
  private readonly weights = {
    data_readiness: 0.25,
    governance_complexity: 0.20,
    workflow_repeatability: 0.30,
    connector_availability: 0.15,
    change_appetite: 0.10
  }

  private readonly industryFactors: Record<Industry, number> = {
    'ecommerce': 1.2,
    'saas': 1.4,
    'legal': 0.8,
    'consulting': 1.0,
    'marketing': 1.1,
    'technology': 1.3
  }

  computeFitScore(industry: Industry, context: Context): FitScore {
    // Score each dimension based on industry and context
    const scores = this.scoreDimensions(industry, context)
    
    // Calculate weighted average
    const weightedSum = Object.entries(scores.dimensions).reduce((sum, [key, value]) => {
      const weight = this.weights[key as keyof typeof this.weights]
      return sum + (value * weight)
    }, 0)

    // Apply industry factor
    const industryFactor = this.industryFactors[industry]
    const overall = Math.min(10, Math.max(0, weightedSum * industryFactor))

    return {
      ...scores.dimensions,
      industry_factor: industryFactor,
      rationale: scores.rationale,
      overall: Math.round(overall * 10) / 10 // Round to 1 decimal
    }
  }

  private scoreDimensions(industry: Industry, context: Context) {
    const teamSize = context.team_size
    const tools = context.tools.length
    const kpis = context.kpis.length

    // Data readiness scoring
    const dataReadiness = Math.min(10, Math.max(1, 
      5 + (tools * 0.5) + (kpis * 0.3) + (teamSize > 10 ? 1 : 0)
    ))

    // Governance complexity (lower is simpler, higher score)
    const governanceComplexity = Math.min(10, Math.max(1,
      industry === 'legal' ? 4 : 
      industry === 'ecommerce' ? 6 :
      teamSize < 10 ? 8 : teamSize < 50 ? 6 : 4
    ))

    // Workflow repeatability
    const workflowRepeatability = Math.min(10, Math.max(1,
      industry === 'saas' ? 9 :
      industry === 'ecommerce' ? 8 :
      industry === 'consulting' ? 5 :
      7
    ))

    // Connector availability
    const connectorAvailability = Math.min(10, Math.max(1,
      industry === 'technology' ? 9 :
      industry === 'saas' ? 8 :
      industry === 'ecommerce' ? 8 :
      6
    ))

    // Change appetite (based on team size and industry)
    const changeAppetite = Math.min(10, Math.max(1,
      industry === 'technology' ? 8 :
      industry === 'saas' ? 7 :
      teamSize < 20 ? 7 : 6
    ))

    return {
      dimensions: {
        data_readiness: Math.round(dataReadiness),
        governance_complexity: Math.round(governanceComplexity),
        workflow_repeatability: Math.round(workflowRepeatability),
        connector_availability: Math.round(connectorAvailability),
        change_appetite: Math.round(changeAppetite)
      },
      rationale: {
        data_readiness: `${tools} tools and ${kpis} KPIs indicate ${dataReadiness >= 7 ? 'strong' : dataReadiness >= 5 ? 'moderate' : 'limited'} data infrastructure`,
        governance_complexity: `${industry} industry with ${teamSize} team members suggests ${governanceComplexity >= 7 ? 'manageable' : governanceComplexity >= 5 ? 'moderate' : 'complex'} governance needs`,
        workflow_repeatability: `${industry} workflows are ${workflowRepeatability >= 7 ? 'highly' : workflowRepeatability >= 5 ? 'moderately' : 'minimally'} repeatable`,
        connector_availability: `${industry} industry has ${connectorAvailability >= 7 ? 'excellent' : connectorAvailability >= 5 ? 'good' : 'limited'} integration options`,
        change_appetite: `Team size ${teamSize} in ${industry} suggests ${changeAppetite >= 7 ? 'high' : changeAppetite >= 5 ? 'moderate' : 'low'} change readiness`
      }
    }
  }
}

export const fitScoreService = new FitScoreService()
