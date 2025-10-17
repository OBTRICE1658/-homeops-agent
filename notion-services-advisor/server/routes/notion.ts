import { Router } from 'express'
import { NotionCreateRequestSchema } from '../types/plan'
import { notion } from '../lib/notion'

const router = Router()

router.post('/create-databases', async (req, res) => {
  try {
    // Validate request
    const request = NotionCreateRequestSchema.parse(req.body)
    
    if (!notion) {
      return res.status(501).json({ 
        error: 'Notion integration not configured',
        message: 'NOTION_TOKEN environment variable is required'
      })
    }

    // Stub implementation - return dry-run results
    const dryRunResults = request.plan.databases.map((db: any) => ({
      database_key: db.key,
      database_title: db.title,
      properties_count: db.properties.length,
      views_count: db.default_views.length,
      status: 'ready_to_create',
      estimated_setup_time: `${db.properties.length * 2} minutes`
    }))

    res.json({
      parent_page_id: request.parentPageId,
      databases_to_create: dryRunResults.length,
      total_properties: dryRunResults.reduce((sum: number, db: any) => sum + db.properties_count, 0),
      estimated_total_time: `${dryRunResults.reduce((sum: number, db: any) => sum + parseInt(db.estimated_setup_time), 0)} minutes`,
      dry_run: true,
      databases: dryRunResults,
      message: 'This is a dry-run. Set NOTION_TOKEN to enable actual database creation.'
    })
  } catch (error) {
    console.error('Notion database creation error:', error)
    
    res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Failed to create databases' 
    })
  }
})

export default router
