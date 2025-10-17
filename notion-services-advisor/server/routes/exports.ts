import { Router } from 'express'
import { PlanSchema } from '../types/plan'
import { exportService } from '../services/exportService'

const router = Router()

router.post('/all', async (req, res) => {
  try {
    // Validate the plan
    const plan = PlanSchema.parse(req.body)
    
    // Generate exports
    const exports = exportService.generateExports(plan)
    
    res.json(exports)
  } catch (error) {
    console.error('Export generation error:', error)
    
    res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Failed to generate exports' 
    })
  }
})

export default router
