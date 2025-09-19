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
  contentSecurityPolicy: NODE_ENV === 'production' ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Swagger UI needs unsafe-eval
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: []
    }
  } : false,
  crossOriginEmbedderPolicy: false // Disable for Safari compatibility
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

// Safari compatibility middleware - serve compatibility page before React app loads
app.use((req, res, next) => {
  const userAgent = req.get('User-Agent') || ''

  // Detect Safari (but not Chrome-based browsers)
  const isSafariRegex = /^((?!chrome|android).)*safari/i.test(userAgent)
  const isMobileSafari = /iphone|ipad|ipod/.test(userAgent.toLowerCase()) &&
                        /safari/.test(userAgent.toLowerCase()) &&
                        !/chrome/.test(userAgent.toLowerCase())

  if ((isSafariRegex || isMobileSafari) && req.path === '/') {
    // Serve Safari compatibility page directly
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Browser Not Supported - Mermaid & YANG Visualizer</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f9fafb; }
        .container { max-width: 600px; margin: 50px auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center; }
        .warning-icon { width: 80px; height: 80px; background: #f59e0b; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; }
        .warning-icon svg { width: 40px; height: 40px; color: white; }
        h1 { color: #111827; margin-bottom: 16px; }
        p { color: #6b7280; line-height: 1.6; margin-bottom: 24px; }
        .browsers { display: grid; gap: 16px; margin: 32px 0; }
        .browser { display: flex; align-items: center; padding: 16px; background: #f9fafb; border-radius: 8px; text-decoration: none; color: inherit; border: 1px solid #e5e7eb; }
        .browser:hover { background: #f3f4f6; }
        .browser-icon { width: 40px; height: 40px; margin-right: 12px; background: #3b82f6; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: white; }
        .browser-name { font-weight: 500; color: #111827; }
        .browser-desc { font-size: 14px; color: #6b7280; }
    </style>
</head>
<body>
    <div class="container">
        <div class="warning-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                <path d="M12 9v4"/>
                <path d="M12 17h.01"/>
            </svg>
        </div>

        <h1>Browser Not Supported</h1>
        <p>This application requires features that are not compatible with Safari. Please use one of the recommended browsers below for the best experience.</p>

        <div class="browsers">
            <a href="https://www.google.com/chrome/" target="_blank" class="browser">
                <div class="browser-icon">C</div>
                <div>
                    <div class="browser-name">Google Chrome</div>
                    <div class="browser-desc">Recommended</div>
                </div>
            </a>

            <a href="https://www.mozilla.org/firefox/" target="_blank" class="browser">
                <div class="browser-icon">F</div>
                <div>
                    <div class="browser-name">Mozilla Firefox</div>
                    <div class="browser-desc">Fast & secure</div>
                </div>
            </a>

            <a href="https://www.microsoft.com/edge" target="_blank" class="browser">
                <div class="browser-icon">E</div>
                <div>
                    <div class="browser-name">Microsoft Edge</div>
                    <div class="browser-desc">Built-in Windows</div>
                </div>
            </a>
        </div>

        <p style="font-size: 14px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 32px;">
            We apologize for the inconvenience. Safari support is on our roadmap and we're working to resolve compatibility issues in future updates.
        </p>
    </div>
</body>
</html>
    `)
    return
  }

  next()
})

// Body parsing middleware
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Static file serving for frontend in production
if (NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../../frontend/dist')
  app.use(express.static(frontendPath))
}

// Swagger JSON endpoint
app.get('/api/docs/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.send(specs)
})

// Swagger API documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Mermaid & YANG API Documentation',
  swaggerOptions: {
    url: '/api/docs/swagger.json'
  }
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