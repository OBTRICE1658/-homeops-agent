import express from 'express'
import type { OnePager } from '../../shared/reco'
import { OnePager as OnePagerSchema } from '../../shared/reco'
import { buildRecommendations, buildAgentPlays, mapCancellationsToStackKeys } from '../services/featureCatalog'
import { roiService } from '../services/roiService'

const router = express.Router()

router.post('/onepager', async (req, res) => {
  try {
    const { 
      industry, 
      team_size, 
      tools = [], 
      kpis = [], 
      constraints = [], 
      summary = "" 
    } = req.body || {}

    // Validate required fields
    if (!industry || !team_size || team_size <= 0) {
      return res.status(400).json({ 
        error: 'Missing required fields: industry and team_size' 
      })
    }

    // 1) Build rule-based problem/solution + cancellations
    const { problems_to_solutions, cancellations } = buildRecommendations({ 
      industry, 
      tools, 
      kpis, 
      summary 
    })

    // 2) ROI: stack savings from cancellations + time savings
    const enabledKeys = mapCancellationsToStackKeys(cancellations)
    const context = { team_size, tools, kpis, constraints }
    const roi = roiService.buildROI(context, { enabledKeys })

    // 3) Agent plays (rule-based templates per industry/tools)
    const agent_plays = buildAgentPlays({ industry, tools, kpis, summary })

    // 4) Quick plan phases
    const quick_plan = [
      { 
        phase: "Week 1 Pilot", 
        activities: [
          "Create Projects + Forms templates",
          "Migrate 25 sample records",
          "Enable AI Search for team",
          "Set up basic automation workflows"
        ] 
      },
      { 
        phase: "Weeks 2–3 Rollout", 
        activities: [
          "Configure Relations/Rollups between databases",
          "Build Team Wiki + migrate SOPs",
          "Train stakeholders on new workflows",
          "Set up Views & Filters for each team"
        ] 
      },
      { 
        phase: "Week 4 Agents", 
        activities: [
          "Deploy AI Meeting Notes for stand-ups",
          "Set up AI triage agent for tickets",
          "Configure inbox routing automation",
          "Monitor and optimize agent performance"
        ] 
      }
    ]

    // Build and validate the one-pager
    const onepager: OnePager = {
      version: "1.0",
      client: { 
        industry, 
        team_size, 
        tools, 
        kpis, 
        constraints, 
        summary 
      },
      problems_to_solutions,
      cancellations,
      roi,
      agent_plays,
      quick_plan
    }

    // Validate against schema
    const validatedOnePager = OnePagerSchema.parse(onepager)
    
    res.json(validatedOnePager)

  } catch (error) {
    console.error('Error generating one-pager:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({ 
        error: 'Invalid data structure', 
        details: error.message 
      })
    }
    
    res.status(500).json({ 
      error: 'Failed to generate one-pager' 
    })
  }
})

export default router
