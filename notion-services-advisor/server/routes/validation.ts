import { Router } from 'express'
import { validationService } from '../services/validationService'

const router = Router()

router.post('/plan', async (req, res) => {
  try {
    // Validate the plan against schema
    const plan = validationService.validatePlan(req.body)
    
    res.json({ 
      valid: true, 
      plan 
    })
  } catch (error) {
    console.error('Plan validation error:', error)
    
    res.status(400).json({ 
      valid: false, 
      error: error instanceof Error ? error.message : 'Validation failed' 
    })
  }
})

export default router
