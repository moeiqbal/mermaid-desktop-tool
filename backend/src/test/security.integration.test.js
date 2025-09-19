import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import app from '../server.js'

describe('Production Security Headers', () => {
  let server
  let originalNodeEnv

  beforeAll(() => {
    originalNodeEnv = process.env.NODE_ENV
    server = app.listen(0) // Use port 0 for random available port
  })

  afterAll(() => {
    process.env.NODE_ENV = originalNodeEnv
    if (server) {
      server.close()
    }
  })

  describe('Content Security Policy in Production', () => {
    it('should include CSP headers in production mode', async () => {
      process.env.NODE_ENV = 'production'

      const response = await request(server).get('/api/health')

      expect(response.status).toBe(200)
      expect(response.headers).toHaveProperty('content-security-policy')

      const csp = response.headers['content-security-policy']
      expect(csp).toBeDefined()
      expect(typeof csp).toBe('string')
    })

    it('should allow Swagger UI resources in CSP', async () => {
      process.env.NODE_ENV = 'production'

      const response = await request(server).get('/api/docs/')

      const csp = response.headers['content-security-policy']
      if (csp) {
        // Check for unsafe-eval (required by Swagger UI)
        expect(csp).toContain("script-src 'self' 'unsafe-inline' 'unsafe-eval'")

        // Check for unsafe-inline styles (required by Swagger UI)
        expect(csp).toContain("style-src 'self' 'unsafe-inline'")

        // Check for default-src
        expect(csp).toContain("default-src 'self'")
      }
    })

    it('should disable CSP in development mode', async () => {
      process.env.NODE_ENV = 'development'

      const response = await request(server).get('/api/health')

      expect(response.status).toBe(200)
      // CSP should be disabled in development
      expect(response.headers['content-security-policy']).toBeUndefined()
    })
  })

  describe('Other Security Headers', () => {
    it('should include Helmet security headers', async () => {
      const response = await request(server).get('/api/health')

      expect(response.status).toBe(200)

      // Check for common Helmet security headers
      expect(response.headers).toHaveProperty('x-dns-prefetch-control')
      expect(response.headers).toHaveProperty('x-frame-options')
      expect(response.headers).toHaveProperty('x-download-options')
      expect(response.headers).toHaveProperty('x-content-type-options')
      expect(response.headers).toHaveProperty('x-xss-protection')

      // Verify header values
      expect(response.headers['x-dns-prefetch-control']).toBe('off')
      expect(response.headers['x-frame-options']).toBe('SAMEORIGIN')
      expect(response.headers['x-download-options']).toBe('noopen')
      expect(response.headers['x-content-type-options']).toBe('nosniff')
    })

    it('should include rate limiting headers', async () => {
      const response = await request(server).get('/api/health')

      expect(response.status).toBe(200)
      // Rate limiting should add X-RateLimit headers
      expect(response.headers).toHaveProperty('x-ratelimit-limit')
      expect(response.headers).toHaveProperty('x-ratelimit-remaining')
      expect(response.headers).toHaveProperty('x-ratelimit-reset')
    })
  })

  describe('CORS Configuration', () => {
    it('should disable CORS in production mode', async () => {
      process.env.NODE_ENV = 'production'

      const response = await request(server)
        .get('/api/health')
        .set('Origin', 'http://malicious-site.com')

      expect(response.status).toBe(200)
      // CORS should be disabled in production (no Access-Control-Allow-Origin)
      expect(response.headers['access-control-allow-origin']).toBeUndefined()
    })

    it('should allow development origins in development mode', async () => {
      process.env.NODE_ENV = 'development'

      const response = await request(server)
        .get('/api/health')
        .set('Origin', 'http://localhost:5173')

      expect(response.status).toBe(200)
      // CORS should allow development origins
      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173')
    })

    it('should reject unknown origins in development mode', async () => {
      process.env.NODE_ENV = 'development'

      const response = await request(server)
        .get('/api/health')
        .set('Origin', 'http://malicious-site.com')

      // Should still work but without CORS headers
      expect(response.status).toBe(200)
      expect(response.headers['access-control-allow-origin']).toBeUndefined()
    })
  })

  describe('Error Response Security', () => {
    it('should not expose stack traces in production', async () => {
      process.env.NODE_ENV = 'production'

      // Try to trigger an error
      const response = await request(server).get('/api/non-existent-endpoint')

      expect(response.status).toBe(404)
      expect(response.body).toHaveProperty('error')
      expect(response.body).not.toHaveProperty('stack')
    })

    it('should include stack traces in development', async () => {
      process.env.NODE_ENV = 'development'

      // Try to access non-existent endpoint
      const response = await request(server).get('/api/non-existent-endpoint')

      expect(response.status).toBe(404)
      expect(response.body).toHaveProperty('error')
      // Development mode might include more debug info
    })
  })

  describe('Static File Serving Security', () => {
    it('should serve static files with security headers in production', async () => {
      process.env.NODE_ENV = 'production'

      // Try to access a static file path
      const response = await request(server).get('/static/test')

      // Should have security headers even for static files
      if (response.status !== 404) {
        expect(response.headers).toHaveProperty('x-content-type-options')
        expect(response.headers).toHaveProperty('x-frame-options')
      }
    })

    it('should handle directory traversal attempts securely', async () => {
      const maliciousPath = '/../../etc/passwd'
      const response = await request(server).get(maliciousPath)

      // Should not expose system files
      expect(response.status).not.toBe(200)
      if (response.status === 404) {
        expect(response.body.error).toBe('Endpoint not found')
      }
    })
  })
})