import { Router } from 'express'
import { ROIRequestSchema } from '../types/plan'
import { roiService } from '../services/roiService'

const router = Router()

router.post('/recompute', async (req, res) => {
  try {
    // Validate request
    const request = ROIRequestSchema.parse(req.body)
    
    // Recompute ROI
    const roi = roiService.recomputeROI(request)
    
    res.json(roi)
  } catch (error) {
    console.error('ROI recompute error:', error)
    
    res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Failed to recompute ROI' 
    })
  }
})

export default router
