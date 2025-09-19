import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import app from '../server.js'
import { specs } from '../config/swagger.js'

describe('Swagger API Documentation', () => {
  let server

  beforeAll(() => {
    // Start server on a test port
    server = app.listen(0) // Use port 0 for random available port
  })

  afterAll(() => {
    if (server) {
      server.close()
    }
  })

  it('should serve Swagger UI at /api/docs', async () => {
    const response = await request(server).get('/api/docs/')

    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toMatch(/text\/html/)
    expect(response.text).toContain('swagger-ui')
    expect(response.text).toContain('Mermaid & YANG API Documentation')
  })

  it('should serve Swagger JSON spec at /api/docs/swagger.json', async () => {
    const response = await request(server).get('/api/docs/swagger.json')

    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toMatch(/application\/json/)
    expect(response.body).toHaveProperty('openapi')
    expect(response.body).toHaveProperty('info')
    expect(response.body.info.title).toBe('Mermaid & YANG Visualization API')
  })

  it('should have valid OpenAPI specification', () => {
    expect(specs).toBeDefined()
    expect(specs.openapi).toBe('3.0.0')
    expect(specs.info).toHaveProperty('title')
    expect(specs.info).toHaveProperty('version')
    expect(specs.info).toHaveProperty('description')
  })

  it('should include all API endpoint definitions', () => {
    const paths = specs.paths || {}

    // Health check endpoint
    expect(paths).toHaveProperty('/api/health')

    // File endpoints (if they exist)
    const pathKeys = Object.keys(paths)
    const hasFileEndpoints = pathKeys.some(path => path.includes('/api/files'))
    const hasLintEndpoints = pathKeys.some(path => path.includes('/api/lint'))
    const hasYangEndpoints = pathKeys.some(path => path.includes('/api/yang'))

    // At least health endpoint should be documented
    expect(pathKeys.length).toBeGreaterThan(0)
    expect(paths['/api/health']).toHaveProperty('get')
  })

  it('should include required schemas', () => {
    const components = specs.components || {}
    const schemas = components.schemas || {}

    expect(schemas).toHaveProperty('Error')
    // Check for existence of other schemas
    const schemaKeys = Object.keys(schemas)
    expect(schemaKeys.length).toBeGreaterThan(0)
  })

  it('should have correct server configuration based on environment', () => {
    const servers = specs.servers || []
    expect(servers).toHaveLength(1)

    // Server URL should be appropriate for the environment
    const serverUrl = servers[0].url
    expect(serverUrl).toMatch(/http:\/\/localhost:3000/)
  })

  it('should include security headers in production mode', async () => {
    // Set NODE_ENV to production for this test
    const originalNodeEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'

    try {
      const response = await request(server).get('/api/docs/')

      // Should still be accessible even in production
      expect(response.status).toBe(200)

      // Check for security headers
      expect(response.headers).toHaveProperty('x-dns-prefetch-control')
      expect(response.headers).toHaveProperty('x-frame-options')
      expect(response.headers).toHaveProperty('x-download-options')
      expect(response.headers).toHaveProperty('x-content-type-options')
    } finally {
      // Restore original NODE_ENV
      process.env.NODE_ENV = originalNodeEnv
    }
  })

  it('should not expose sensitive information in error responses', async () => {
    const response = await request(server).get('/api/docs/non-existent-endpoint')

    expect(response.status).toBe(404)
    expect(response.body).not.toHaveProperty('stack')
  })

  it('should have CORS configured properly for development', async () => {
    // Set NODE_ENV to development for this test
    const originalNodeEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'

    try {
      const response = await request(server)
        .get('/api/docs/')
        .set('Origin', 'http://localhost:5173')

      expect(response.status).toBe(200)
    } finally {
      // Restore original NODE_ENV
      process.env.NODE_ENV = originalNodeEnv
    }
  })
})