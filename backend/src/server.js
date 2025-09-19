import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import path from 'path'
import { fileURLToPath } from 'url'

import fileRoutes from './routes/files.js'
import lintRoutes from './routes/lint.js'
import yangRoutes from './routes/yang.js'
import { specs, swaggerUi } from './config/swagger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000
const NODE_ENV = process.env.NODE_ENV || 'development'

// Debug logging
console.log('🐛 Environment variables:', {
  NODE_ENV: process.env.NODE_ENV,
  COMPUTED_NODE_ENV: NODE_ENV,
  PORT: PORT
})

// Security middleware
app.use(helmet({
  contentSecurityPolicy: NODE_ENV === 'production' ? undefined : false
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
})
app.use('/api/', limiter)

// CORS configuration
app.use(cors({
  origin: NODE_ENV === 'production'
    ? false // Disable CORS in production since we serve frontend from same server
    : ['http://localhost:5173', 'http://127.0.0.1:5173'], // Allow Vite dev server
  credentials: true
}))

// Compression middleware
app.use(compression())

// Body parsing middleware
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Static file serving for frontend in production
if (NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../../frontend/dist')
  app.use(express.static(frontendPath))
}

// Swagger API documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Mermaid & YANG API Documentation'
}))

// API routes
app.use('/api/files', fileRoutes)
app.use('/api/lint', lintRoutes)
app.use('/api/yang', yangRoutes)

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    uptime: process.uptime()
  })
})

// Serve frontend for all non-API routes in production
if (NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'))
  })
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error occurred:', err.stack)
  res.status(500).json({
    error: NODE_ENV === 'production' ? 'Internal server error' : err.message,
    stack: NODE_ENV === 'development' ? err.stack : undefined
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' })
})

/**
 * @swagger
 * /api/health:
 *   get:
 *     tags: [Health]
 *     summary: Health check endpoint
 *     description: Returns the current status of the API server
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 environment:
 *                   type: string
 *                   example: development
 *                 uptime:
 *                   type: number
 *                   description: Server uptime in seconds
 */

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT} in ${NODE_ENV} mode`)
  console.log(`📝 API Documentation: http://localhost:${PORT}/api/docs`)
  console.log(`🩺 Health Check: http://localhost:${PORT}/api/health`)

  if (NODE_ENV === 'development') {
    console.log(`🎨 Frontend dev server: http://localhost:5173`)
  } else {
    console.log(`🌐 Application: http://localhost:${PORT}`)
  }
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully')
  process.exit(0)
})

export default app