import { Router } from 'express'
import { AdvisorRequestSchema } from '../types/plan'
import { advisorService } from '../services/advisorService'

const router = Router()

router.post('/plan', async (req, res) => {
  try {
    // Validate request body
    const request = AdvisorRequestSchema.parse(req.body)
    
    // Generate plan
    const plan = await advisorService.generatePlan(request)
    
    res.json(plan)
  } catch (error) {
    console.error('Advisor plan generation error:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('validation')) {
        return res.status(400).json({ error: 'Invalid request data', details: error.message })
      }
    }
    
    res.status(500).json({ error: 'Failed to generate plan' })
  }
})

export default router
