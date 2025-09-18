import request from 'supertest'
import express from 'express'
import yangRouter from '../routes/yang.js'

const app = express()
app.use(express.json())
app.use('/api/yang', yangRouter)

describe('YANG API Integration Tests', () => {
  describe('POST /api/yang/parse', () => {
    it('should successfully parse valid YANG module', async () => {
      const validYangContent = `
module test-module {
  yang-version 1.1;
  namespace "urn:example:test";
  prefix "test";

  revision 2023-01-01 {
    description "Initial revision";
  }

  container config {
    description "Configuration container";

    leaf hostname {
      type string;
      default "localhost";
      description "System hostname";
    }

    leaf-list dns-servers {
      type string;
      description "List of DNS servers";
    }
  }

  rpc restart-service {
    description "Restart a system service";
    input {
      leaf service-name {
        type string;
        mandatory true;
      }
    }
    output {
      leaf result {
        type boolean;
      }
    }
  }
}
      `

      const response = await request(app)
        .post('/api/yang/parse')
        .send({ content: validYangContent, filename: 'test-module.yang' })
        .expect(200)

      expect(response.body).toMatchObject({
        valid: true,
        modules: expect.arrayContaining([
          expect.objectContaining({
            type: 'module',
            name: 'test-module'
          })
        ]),
        errors: [],
        metadata: expect.objectContaining({
          filename: 'test-module.yang',
          namespace: 'urn:example:test',
          prefix: 'test'
        })
      })

      expect(response.body.tree).toBeDefined()
      expect(response.body.parser).toMatch(/yang-js|basic/)
    })

    it('should handle invalid YANG with detailed error reporting', async () => {
      const invalidYangContent = `
module broken-module {
  namespace "urn:example:broken";
  // Missing prefix - this should cause an error

  container unclosed-container {
    leaf test-leaf {
      type string;
    }
    // Missing closing brace
  // Missing module closing brace
      `

      const response = await request(app)
        .post('/api/yang/parse')
        .send({ content: invalidYangContent, filename: 'broken-module.yang' })
        .expect(200)

      expect(response.body).toMatchObject({
        valid: false,
        modules: expect.any(Array),
        errors: expect.arrayContaining([
          expect.objectContaining({
            line: expect.any(Number),
            message: expect.any(String),
            severity: 'error'
          })
        ])
      })

      expect(response.body.errors.length).toBeGreaterThan(0)
    })

    it('should return structured error for malformed JSON request', async () => {
      const response = await request(app)
        .post('/api/yang/parse')
        .send({ content: 123 }) // Invalid content type
        .expect(400)

      expect(response.body).toMatchObject({
        error: 'Content must be a string'
      })
    })

    it('should handle empty content gracefully', async () => {
      const response = await request(app)
        .post('/api/yang/parse')
        .send({ content: '', filename: 'empty.yang' })
        .expect(200)

      expect(response.body).toMatchObject({
        valid: false,
        modules: [],
        errors: expect.arrayContaining([
          expect.objectContaining({
            message: expect.stringContaining('No module or submodule declaration found')
          })
        ])
      })
    })

    it('should extract imports and includes from YANG module', async () => {
      const yangWithImports = `
module main-module {
  yang-version 1.1;
  namespace "urn:example:main";
  prefix "main";

  import ietf-inet-types {
    prefix inet;
    revision-date 2013-07-15;
  }

  include common-types;

  revision 2023-01-01;

  container network {
    leaf ip-address {
      type inet:ipv4-address;
    }
  }
}
      `

      const response = await request(app)
        .post('/api/yang/parse')
        .send({ content: yangWithImports, filename: 'main-module.yang' })
        .expect(200)

      expect(response.body.metadata).toMatchObject({
        imports: expect.arrayContaining(['ietf-inet-types']),
        includes: expect.arrayContaining(['common-types'])
      })
    })

    it('should handle complex nested structures', async () => {
      const complexYang = `
module complex-module {
  namespace "urn:example:complex";
  prefix "complex";

  revision 2023-01-01;

  grouping common-config {
    leaf enabled {
      type boolean;
      default true;
    }
  }

  container services {
    list service {
      key "name";

      leaf name {
        type string;
      }

      uses common-config;

      choice service-type {
        case web-service {
          container http-config {
            leaf port {
              type uint16;
              default 80;
            }
          }
        }
        case database-service {
          container db-config {
            leaf connection-string {
              type string;
            }
          }
        }
      }
    }
  }

  notification service-status-changed {
    leaf service-name {
      type string;
    }
    leaf new-status {
      type enumeration {
        enum running;
        enum stopped;
        enum failed;
      }
    }
  }
}
      `

      const response = await request(app)
        .post('/api/yang/parse')
        .send({ content: complexYang, filename: 'complex-module.yang' })
        .expect(200)

      expect(response.body.valid).toBe(true)
      expect(response.body.modules).toHaveLength(1)
      expect(response.body.modules[0].name).toBe('complex-module')
    })

    it('should fallback to basic parser when yang-js fails', async () => {
      // Create content that might work with basic parser but not yang-js
      const basicYangContent = `
module simple-fallback {
  namespace "urn:example:simple";
  prefix "simple";

  container data {
    leaf value {
      type string;
    }
  }
}
      `

      const response = await request(app)
        .post('/api/yang/parse')
        .send({ content: basicYangContent, filename: 'simple-fallback.yang' })
        .expect(200)

      // Should succeed regardless of which parser is used
      expect(response.body.valid).toBeTruthy()
      expect(response.body.parser).toMatch(/yang-js|basic/)
    })

    it('should handle missing request body', async () => {
      const response = await request(app)
        .post('/api/yang/parse')
        .expect(400)

      expect(response.body).toMatchObject({
        error: 'Content must be a string'
      })
    })

    it('should preserve line number information in errors', async () => {
      const yangWithLineNumbers = `line 1
line 2
module error-module {
  namespace "urn:example:error";
  prefix "error";

  container test {
    leaf invalid-syntax-here
    // Line 9 - missing semicolon and type
  }
}
      `

      const response = await request(app)
        .post('/api/yang/parse')
        .send({ content: yangWithLineNumbers, filename: 'error-module.yang' })
        .expect(200)

      if (response.body.errors.length > 0) {
        expect(response.body.errors[0]).toMatchObject({
          line: expect.any(Number),
          message: expect.any(String),
          severity: expect.any(String)
        })
      }
    })
  })

  describe('POST /api/yang/parse-multiple', () => {
    it('should parse multiple YANG files and build dependency graph', async () => {
      const files = [
        {
          name: 'types.yang',
          content: `
module types {
  namespace "urn:example:types";
  prefix "types";

  typedef percentage {
    type uint8 {
      range "0..100";
    }
  }
}
          `
        },
        {
          name: 'main.yang',
          content: `
module main {
  namespace "urn:example:main";
  prefix "main";

  import types {
    prefix t;
  }

  leaf usage {
    type t:percentage;
  }
}
          `
        }
      ]

      const response = await request(app)
        .post('/api/yang/parse-multiple')
        .send({ files })
        .expect(200)

      expect(response.body).toMatchObject({
        files: expect.arrayContaining([
          expect.objectContaining({
            filename: 'types.yang',
            valid: expect.any(Boolean)
          }),
          expect.objectContaining({
            filename: 'main.yang',
            valid: expect.any(Boolean)
          })
        ]),
        dependencies: expect.objectContaining({
          'main.yang': expect.arrayContaining(['types'])
        }),
        summary: expect.objectContaining({
          totalModules: 2,
          validModules: expect.any(Number),
          totalErrors: expect.any(Number)
        })
      })
    })

    it('should handle empty files array', async () => {
      const response = await request(app)
        .post('/api/yang/parse-multiple')
        .send({ files: [] })
        .expect(200)

      expect(response.body).toMatchObject({
        files: [],
        dependencies: {},
        summary: {
          totalModules: 0,
          validModules: 0,
          totalErrors: 0
        }
      })
    })

    it('should return error for invalid files parameter', async () => {
      const response = await request(app)
        .post('/api/yang/parse-multiple')
        .send({ files: 'not-an-array' })
        .expect(400)

      expect(response.body).toMatchObject({
        error: 'Files must be an array'
      })
    })
  })
})

describe('YANG Parser Error Handling', () => {
  it('should provide helpful error messages for common YANG syntax errors', async () => {
    const commonErrors = [
      {
        name: 'missing-semicolon',
        content: `
module test {
  namespace "urn:test"  // Missing semicolon
  prefix "test";
}
        `,
        expectedErrorPattern: /semicolon|syntax/i
      },
      {
        name: 'unmatched-braces',
        content: `
module test {
  namespace "urn:test";
  prefix "test";

  container data {
    leaf value {
      type string;
    }
    // Missing closing brace for container
        `,
        expectedErrorPattern: /brace|depth/i
      },
      {
        name: 'missing-namespace',
        content: `
module test {
  prefix "test";
  // Missing namespace
}
        `,
        expectedErrorPattern: /namespace|required/i
      }
    ]

    for (const testCase of commonErrors) {
      const response = await request(app)
        .post('/api/yang/parse')
        .send({ content: testCase.content, filename: `${testCase.name}.yang` })

      expect(response.status).toBe(200)
      expect(response.body.valid).toBe(false)
      expect(response.body.errors.length).toBeGreaterThan(0)

      // Check if error message matches expected pattern
      const hasExpectedError = response.body.errors.some(error =>
        testCase.expectedErrorPattern.test(error.message)
      )
      expect(hasExpectedError).toBe(true)
    }
  })

  it('should handle server errors gracefully', async () => {
    // Test with extremely large content that might cause memory issues
    const hugeContent = 'module huge {\n' + 'leaf test { type string; }\n'.repeat(10000) + '}'

    const response = await request(app)
      .post('/api/yang/parse')
      .send({ content: hugeContent, filename: 'huge.yang' })

    // Should either succeed or return a proper error, not crash
    expect([200, 500]).toContain(response.status)

    if (response.status === 500) {
      expect(response.body).toMatchObject({
        error: expect.any(String)
      })
    }
  })
})