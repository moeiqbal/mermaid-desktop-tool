import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mermaid & YANG Visualization API',
      version: '1.0.0',
      description: 'API for managing Mermaid diagrams, Markdown files, YANG models, and linting functionality',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' ? 'http://localhost:3000' : 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      schemas: {
        File: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'File identifier'
            },
            name: {
              type: 'string',
              description: 'Original filename'
            },
            size: {
              type: 'number',
              description: 'File size in bytes'
            },
            modified: {
              type: 'string',
              format: 'date-time',
              description: 'Last modification date'
            },
            type: {
              type: 'string',
              enum: ['markdown', 'mermaid', 'yang'],
              description: 'File type'
            },
            extension: {
              type: 'string',
              description: 'File extension'
            }
          }
        },
        Diagram: {
          type: 'object',
          properties: {
            content: {
              type: 'string',
              description: 'Mermaid diagram content'
            },
            index: {
              type: 'number',
              description: 'Diagram index in file'
            },
            title: {
              type: 'string',
              description: 'Diagram title'
            },
            startLine: {
              type: 'number',
              description: 'Starting line number'
            },
            endLine: {
              type: 'number',
              description: 'Ending line number'
            }
          }
        },
        LintResult: {
          type: 'object',
          properties: {
            valid: {
              type: 'boolean',
              description: 'Whether content is valid'
            },
            issues: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/LintIssue'
              }
            },
            summary: {
              type: 'object',
              properties: {
                total: { type: 'number' },
                errors: { type: 'number' },
                warnings: { type: 'number' }
              }
            }
          }
        },
        LintIssue: {
          type: 'object',
          properties: {
            line: {
              type: 'number',
              description: 'Line number'
            },
            column: {
              type: 'number',
              description: 'Column number'
            },
            severity: {
              type: 'string',
              enum: ['error', 'warning', 'info'],
              description: 'Issue severity'
            },
            rule: {
              type: 'string',
              description: 'Linting rule name'
            },
            message: {
              type: 'string',
              description: 'Issue description'
            },
            detail: {
              type: 'string',
              description: 'Detailed error information'
            }
          }
        },
        YangParseResult: {
          type: 'object',
          properties: {
            valid: {
              type: 'boolean',
              description: 'Whether YANG content is valid'
            },
            tree: {
              type: 'object',
              description: 'Parsed YANG tree structure'
            },
            modules: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/YangModule'
              }
            },
            errors: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/LintIssue'
              }
            },
            metadata: {
              $ref: '#/components/schemas/YangMetadata'
            }
          }
        },
        YangModule: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['module', 'submodule'],
              description: 'Module type'
            },
            name: {
              type: 'string',
              description: 'Module name'
            },
            namespace: {
              type: 'string',
              description: 'Module namespace'
            },
            prefix: {
              type: 'string',
              description: 'Module prefix'
            },
            children: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/YangNode'
              }
            }
          }
        },
        YangNode: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              description: 'Node type (container, list, leaf, etc.)'
            },
            name: {
              type: 'string',
              description: 'Node name'
            },
            description: {
              type: 'string',
              description: 'Node description'
            },
            mandatory: {
              type: 'boolean',
              description: 'Whether node is mandatory'
            },
            config: {
              type: 'boolean',
              description: 'Whether node is configurable'
            },
            properties: {
              type: 'object',
              description: 'Additional node properties'
            },
            children: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/YangNode'
              }
            }
          }
        },
        YangMetadata: {
          type: 'object',
          properties: {
            filename: {
              type: 'string',
              description: 'YANG file name'
            },
            imports: {
              type: 'array',
              items: { type: 'string' },
              description: 'Imported modules'
            },
            includes: {
              type: 'array',
              items: { type: 'string' },
              description: 'Included modules'
            },
            revisions: {
              type: 'array',
              items: { type: 'string' },
              description: 'Module revisions'
            },
            namespace: {
              type: 'string',
              description: 'Module namespace'
            },
            prefix: {
              type: 'string',
              description: 'Module prefix'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message'
            },
            stack: {
              type: 'string',
              description: 'Error stack trace (development only)'
            }
          }
        }
      },
      responses: {
        BadRequest: {
          description: 'Bad request',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        InternalServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Health',
        description: 'API health check endpoints'
      },
      {
        name: 'Files',
        description: 'File management operations'
      },
      {
        name: 'Linting',
        description: 'Markdown and Mermaid linting operations'
      },
      {
        name: 'YANG',
        description: 'YANG model parsing and processing'
      }
    ]
  },
  apis: [
    // Use absolute paths to ensure they work in both dev and production
    path.join(__dirname, '../routes/*.js'),
    path.join(__dirname, '../server.js')
  ], // paths to files containing OpenAPI definitions
}

const specs = swaggerJsdoc(options)

export { specs, swaggerUi }