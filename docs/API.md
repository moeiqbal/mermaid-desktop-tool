# Mermaid & YANG Visualization Tool - API Documentation

## Overview

This document describes the REST API endpoints available in the Mermaid & YANG visualization web application. The API provides file management, Mermaid diagram processing, YANG model parsing, and Markdown linting capabilities.

**Base URL:** `http://localhost:3000/api`
**Content Type:** `application/json` (unless otherwise specified)

## Health Check

### GET /health
Returns the health status of the API server.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-09-17T10:30:00.000Z",
  "environment": "development",
  "uptime": 1234.567
}
```

## File Management API

### GET /files
List all uploaded files with metadata.

**Response:**
```json
[
  {
    "id": "1726574400000_example.md",
    "name": "example.md",
    "path": "/uploads/1726574400000_example.md",
    "size": 1024,
    "modified": "2025-09-17T10:00:00.000Z",
    "type": "markdown",
    "extension": ".md"
  }
]
```

### GET /files/:fileId/content
Get the content of a specific file.

**Parameters:**
- `fileId` (string): The file ID returned from the file list

**Response:**
```json
{
  "content": "# Example\n\n```mermaid\nflowchart TD\n  A[Start] --> B[End]\n```"
}
```

**Error Responses:**
- `404` - File not found
- `500` - Failed to read file

### POST /files/upload
Upload one or more files to the server.

**Content Type:** `multipart/form-data`

**Form Fields:**
- `files` (File[]): Array of files to upload

**Supported File Types:**
- `.md` - Markdown files
- `.mmd` - Mermaid files
- `.mermaid` - Mermaid files
- `.yang` - YANG model files

**Limits:**
- Maximum file size: 10MB per file
- Maximum files per request: 10

**Response:**
```json
{
  "message": "Successfully uploaded 2 file(s)",
  "files": [
    {
      "id": "1726574400000_diagram.mmd",
      "name": "diagram.mmd",
      "size": 512,
      "type": "mermaid",
      "path": "/uploads/1726574400000_diagram.mmd"
    }
  ]
}
```

**Error Responses:**
- `400` - No files uploaded or invalid file type
- `500` - Upload failed

### PUT /files/:fileId/content
Update the content of an existing file.

**Parameters:**
- `fileId` (string): The file ID to update

**Request Body:**
```json
{
  "content": "Updated file content"
}
```

**Response:**
```json
{
  "message": "File updated successfully"
}
```

**Error Responses:**
- `400` - Content must be a string
- `404` - File not found
- `500` - Failed to update file

### DELETE /files/:fileId
Delete a file from the server.

**Parameters:**
- `fileId` (string): The file ID to delete

**Response:**
```json
{
  "message": "File deleted successfully"
}
```

**Error Responses:**
- `404` - File not found
- `500` - Failed to delete file

## YANG Parser API

### POST /yang/parse
Parse a single YANG model and return its structure.

**Request Body:**
```json
{
  "content": "module example { ... }",
  "filename": "example.yang"
}
```

**Response:**
```json
{
  "valid": true,
  "tree": {
    "example": {
      "type": "module",
      "name": "example",
      "namespace": "http://example.com/yang/example",
      "prefix": "ex",
      "children": [
        {
          "type": "container",
          "name": "config",
          "description": "Configuration data",
          "children": []
        }
      ]
    }
  },
  "modules": [
    {
      "type": "module",
      "name": "example",
      "namespace": "http://example.com/yang/example",
      "prefix": "ex"
    }
  ],
  "errors": [],
  "metadata": {
    "filename": "example.yang",
    "imports": ["ietf-inet-types"],
    "includes": [],
    "revisions": ["2025-09-17"],
    "namespace": "http://example.com/yang/example",
    "prefix": "ex"
  },
  "parser": "node-yang"
}
```

**Error Responses:**
- `400` - Content must be a string
- `500` - Failed to parse YANG content

### POST /yang/parse-multiple
Parse multiple YANG files and analyze their dependencies.

**Request Body:**
```json
{
  "files": [
    {
      "name": "module1.yang",
      "content": "module module1 { ... }"
    },
    {
      "name": "module2.yang",
      "content": "module module2 { import module1; ... }"
    }
  ]
}
```

**Response:**
```json
{
  "files": [
    {
      "filename": "module1.yang",
      "valid": true,
      "tree": { ... },
      "modules": [ ... ],
      "errors": [],
      "metadata": { ... }
    }
  ],
  "dependencies": {
    "module1.yang": [],
    "module2.yang": ["module1"]
  },
  "graph": {
    "nodes": [
      { "id": "module1.yang", "label": "module1.yang" },
      { "id": "module2.yang", "label": "module2.yang" }
    ],
    "edges": [
      {
        "source": "module2.yang",
        "target": "module1",
        "type": "import"
      }
    ]
  },
  "summary": {
    "totalModules": 2,
    "validModules": 2,
    "totalErrors": 0
  }
}
```

**Error Responses:**
- `400` - Files must be an array
- `500` - Failed to parse YANG files

## Linting API

### POST /lint/markdown
Lint a Markdown file and return issues and suggestions.

**Request Body:**
```json
{
  "content": "# Title\n\nSome markdown content",
  "filename": "example.md"
}
```

**Response:**
```json
{
  "valid": true,
  "issues": [
    {
      "line": 3,
      "column": 1,
      "rule": "MD012/no-multiple-blanks",
      "message": "Multiple consecutive blank lines",
      "severity": "error",
      "fixable": true
    }
  ],
  "fixed": false,
  "suggestions": [
    "Remove extra blank lines",
    "Add missing heading structure"
  ],
  "metadata": {
    "filename": "example.md",
    "linter": "markdownlint"
  }
}
```

### POST /lint/markdown/fix
Automatically fix Markdown linting issues.

**Request Body:**
```json
{
  "content": "# Title\n\n\n\nSome content",
  "filename": "example.md",
  "rules": ["MD012"] // Optional: specific rules to fix
}
```

**Response:**
```json
{
  "fixed": true,
  "content": "# Title\n\nSome content",
  "changes": [
    {
      "line": 3,
      "rule": "MD012",
      "description": "Removed extra blank lines"
    }
  ],
  "remaining": []
}
```

### POST /lint/mermaid
Validate Mermaid syntax and return errors.

**Request Body:**
```json
{
  "content": "flowchart TD\n  A[Start] -> B[End]",
  "filename": "diagram.mmd"
}
```

**Response:**
```json
{
  "valid": true,
  "errors": [],
  "warnings": [],
  "suggestions": [
    "Use arrow style '-->' for better compatibility"
  ],
  "metadata": {
    "filename": "diagram.mmd",
    "diagramType": "flowchart",
    "validator": "mermaid"
  }
}
```

## Data Types

### FileItem
```typescript
interface FileItem {
  id: string           // Unique file identifier (timestamped filename)
  name: string         // Original filename
  path: string         // Full path to file
  size: number         // File size in bytes
  modified: string     // ISO timestamp of last modification
  type: 'markdown' | 'mermaid' | 'yang'  // File type
  extension: string    // File extension including dot
}
```

### YangNode
```typescript
interface YangNode {
  type: string                    // Node type (module, container, leaf, etc.)
  name: string                   // Node name
  description?: string           // Node description
  mandatory?: boolean            // Whether the node is mandatory
  config?: boolean              // Whether the node is configurable
  properties?: {                // Additional properties
    type?: string              // Data type for leaf nodes
    range?: string             // Value range
    length?: string            // String length constraints
    pattern?: string           // Regex pattern
    default?: string           // Default value
    units?: string             // Value units
    status?: string            // Status (current, deprecated, obsolete)
  }
  children?: YangNode[]         // Child nodes
}
```

### Error Response
```typescript
interface ErrorResponse {
  error: string                 // Error message
  stack?: string               // Stack trace (development only)
}
```

## Rate Limiting

The API implements rate limiting of 1000 requests per 15-minute window per IP address. When the limit is exceeded, the server returns:

```json
{
  "error": "Too many requests from this IP, please try again later."
}
```

**Status Code:** `429 Too Many Requests`

## Security Features

- **Helmet**: Security headers for protection against common vulnerabilities
- **CORS**: Configured for development (localhost:5173) and disabled in production
- **File Type Validation**: Only allows specific file extensions
- **File Size Limits**: Maximum 10MB per file
- **Input Validation**: All inputs are validated before processing

## Error Handling

All API endpoints return consistent error responses:

- **4xx Client Errors**: Invalid request format, missing parameters, file not found
- **5xx Server Errors**: Internal server errors, parsing failures, file system errors

Error responses include descriptive messages and appropriate HTTP status codes.