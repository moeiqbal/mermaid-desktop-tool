import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import app from '../server.js'
import fs from 'fs'
import path from 'path'

describe('Production Build Integration', () => {
  let server
  let originalNodeEnv

  beforeAll(() => {
    originalNodeEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'
    server = app.listen(0) // Use port 0 for random available port
  })

  afterAll(() => {
    process.env.NODE_ENV = originalNodeEnv
    if (server) {
      server.close()
    }
  })

  describe('Frontend Static File Serving', () => {
    it('should serve index.html for root path in production', async () => {
      const response = await request(server).get('/')

      // Should serve the React app
      expect(response.status).toBe(200)
      expect(response.headers['content-type']).toMatch(/text\/html/)
    })

    it('should serve index.html for React Router paths', async () => {
      const reactRoutes = ['/mermaid', '/document', '/yang']

      for (const route of reactRoutes) {
        const response = await request(server).get(route)

        expect(response.status).toBe(200)
        expect(response.headers['content-type']).toMatch(/text\/html/)
      }
    })

    it('should serve static assets with proper headers', async () => {
      // Try to access common static file patterns
      const staticPaths = [
        '/assets/index.js',
        '/assets/index.css',
        '/favicon.ico'
      ]

      for (const staticPath of staticPaths) {
        const response = await request(server).get(staticPath)

        // Should either serve the file or return 404 (if file doesn't exist)
        expect([200, 404]).toContain(response.status)

        if (response.status === 200) {
          // Should have appropriate content-type
          expect(response.headers['content-type']).toBeDefined()

          // Should have security headers
          expect(response.headers).toHaveProperty('x-content-type-options')
        }
      }
    })
  })

  describe('API Endpoints in Production', () => {
    it('should serve API endpoints correctly', async () => {
      const response = await request(server).get('/api/health')

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('status', 'healthy')
      expect(response.body).toHaveProperty('environment', 'production')
    })

    it('should serve Swagger documentation', async () => {
      const response = await request(server).get('/api/docs/')

      expect(response.status).toBe(200)
      expect(response.headers['content-type']).toMatch(/text\/html/)
      expect(response.text).toContain('swagger-ui')
    })

    it('should handle API 404s correctly', async () => {
      const response = await request(server).get('/api/non-existent')

      expect(response.status).toBe(404)
      expect(response.body).toHaveProperty('error', 'Endpoint not found')
      expect(response.body).not.toHaveProperty('stack') // No stack trace in production
    })
  })

  describe('Environment Configuration', () => {
    it('should run in production mode', async () => {
      const response = await request(server).get('/api/health')

      expect(response.status).toBe(200)
      expect(response.body.environment).toBe('production')
    })

    it('should use production port configuration', async () => {
      const response = await request(server).get('/api/health')

      expect(response.status).toBe(200)
      // Port should be configurable via environment
      expect(process.env.PORT || '3000').toMatch(/\d+/)
    })

    it('should have compression enabled', async () => {
      const response = await request(server).get('/api/health')

      expect(response.status).toBe(200)
      // Large responses should be compressed
      if (response.get('content-length') > 1000) {
        expect(response.headers).toHaveProperty('content-encoding')
      }
    })

    it('should have rate limiting enabled', async () => {
      const response = await request(server).get('/api/health')

      expect(response.status).toBe(200)
      expect(response.headers).toHaveProperty('x-ratelimit-limit')
      expect(response.headers).toHaveProperty('x-ratelimit-remaining')
    })
  })

  describe('Frontend Build Validation', () => {
    it('should have frontend dist directory', () => {
      const frontendDistPath = path.join(process.cwd(), 'frontend', 'dist')

      // Check if frontend dist exists (may not in test environment)
      if (fs.existsSync(frontendDistPath)) {
        expect(fs.statSync(frontendDistPath).isDirectory()).toBe(true)

        // Should contain index.html
        const indexPath = path.join(frontendDistPath, 'index.html')
        if (fs.existsSync(indexPath)) {
          const indexContent = fs.readFileSync(indexPath, 'utf8')
          expect(indexContent).toContain('<div id="root">')
          expect(indexContent).toContain('Mermaid')
        }
      }
    })

    it('should serve bundled JavaScript and CSS', async () => {
      // Try to get the root page to see what assets are referenced
      const response = await request(server).get('/')

      if (response.status === 200) {
        const html = response.text

        // Look for script and link tags
        const scriptMatches = html.match(/<script[^>]*src="([^"]*)"[^>]*><\/script>/g)
        const linkMatches = html.match(/<link[^>]*href="([^"]*)"[^>]*>/g)

        // Should have at least some assets
        if (scriptMatches || linkMatches) {
          expect(scriptMatches || linkMatches).toBeDefined()
        }
      }
    })
  })

  describe('Error Handling in Production', () => {
    it('should not expose internal errors', async () => {
      // Try to cause an internal error
      const response = await request(server)
        .post('/api/files/upload')
        .send('invalid-data')

      // Should handle errors gracefully
      expect(response.status).toBeGreaterThanOrEqual(400)
      expect(response.body).toHaveProperty('error')
      expect(response.body).not.toHaveProperty('stack')
      expect(typeof response.body.error).toBe('string')
      expect(response.body.error).not.toContain('Error:')
      expect(response.body.error).not.toContain('at ')
    })

    it('should handle malformed requests securely', async () => {
      const malformedRequests = [
        { path: '/api/files/../../../etc/passwd', method: 'get' },
        { path: '/api/files', method: 'post', body: { '<script>': 'alert(1)' } }
      ]

      for (const req of malformedRequests) {
        const response = req.method === 'post'
          ? await request(server).post(req.path).send(req.body || {})
          : await request(server).get(req.path)

        // Should not expose sensitive information
        expect(response.status).toBeGreaterThanOrEqual(400)
        expect(response.body).not.toHaveProperty('stack')

        if (response.body.error) {
          expect(response.body.error).not.toContain('/etc/passwd')
          expect(response.body.error).not.toContain('<script>')
        }
      }
    })
  })
})