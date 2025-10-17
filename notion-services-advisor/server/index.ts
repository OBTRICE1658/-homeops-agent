import express from 'express'
import cors from 'cors'
import { config } from 'dotenv'
import advisorRoutes from './routes/advisor'
import validationRoutes from './routes/validation'
import exportRoutes from './routes/exports'
import roiRoutes from './routes/roi'
import notionRoutes from './routes/notion'
import recoRoutes from './routes/reco'

// Load environment variables
config()

const app = express()
const PORT = process.env.PORT || 8080
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173']

// Middleware
app.use(express.json({ limit: '2mb' }))
app.use(cors({
  origin: ALLOWED_ORIGINS,
  credentials: true
}))

// Security headers for Notion iframe embedding
app.use((_req, res, next) => {
  res.setHeader('X-Frame-Options', 'ALLOW-FROM https://www.notion.so')
  res.setHeader('Content-Security-Policy', "frame-ancestors 'self' https://www.notion.so")
  next()
})

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Routes
app.use('/api/advisor', advisorRoutes)
app.use('/api/validation', validationRoutes)
app.use('/api/exports', exportRoutes)
app.use('/api/roi', roiRoutes)
app.use('/api/notion', notionRoutes)
app.use('/api/reco', recoRoutes)

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Server error:', err)
  res.status(500).json({ 
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  })
})

// 404 handler
app.use('*', (_req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📋 Allowed origins: ${ALLOWED_ORIGINS.join(', ')}`)
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`)
})
