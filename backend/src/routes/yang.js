import express from 'express'
import fs from 'fs/promises'
import path from 'path'
import Yang from 'yang-js'

const router = express.Router()

/**
 * @swagger
 * /api/yang/parse:
 *   post:
 *     tags: [YANG]
 *     summary: Parse YANG content
 *     description: Parse and validate YANG model content, extracting structure and metadata
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: YANG model content to parse
 *                 example: |
 *                   module example-module {
 *                     namespace "http://example.com";
 *                     prefix "ex";
 *
 *                     container config {
 *                       leaf hostname {
 *                         type string;
 *                       }
 *                     }
 *                   }
 *               filename:
 *                 type: string
 *                 default: temp.yang
 *                 description: Optional filename for the YANG content
 *     responses:
 *       200:
 *         description: YANG parsing completed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/YangParseResult'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/parse', async (req, res) => {
  try {
    const { content, filename = 'temp.yang' } = req.body

    if (typeof content !== 'string') {
      return res.status(400).json({ error: 'Content must be a string' })
    }

    // Try using node-yang first for more accurate parsing
    let parseResult = await parseWithNodeYang(content, filename)

    // If yang-js failed to parse, try the basic parser as fallback
    if (!parseResult.valid && parseResult.errors.length > 0) {
      console.warn('yang-js parsing failed, falling back to basic parser:', parseResult.errors[0].message)
      const basicResult = parseYangContent(content, filename)

      // If basic parser found modules but yang-js didn't, use basic result
      // Otherwise, keep yang-js result for better error reporting
      if (basicResult.modules.length > 0 && parseResult.modules.length === 0) {
        parseResult = { ...basicResult, parser: 'basic-fallback' }
      }
    }

    res.json({
      valid: parseResult.valid,
      tree: parseResult.tree,
      modules: parseResult.modules,
      errors: parseResult.errors,
      metadata: parseResult.metadata,
      parser: parseResult.parser || 'basic'
    })

  } catch (error) {
    console.error('Error parsing YANG:', error)
    res.status(500).json({ error: 'Failed to parse YANG content' })
  }
})

/**
 * @swagger
 * /api/yang/parse-multiple:
 *   post:
 *     tags: [YANG]
 *     summary: Parse multiple YANG files
 *     description: Parse multiple YANG files and analyze their dependencies and relationships
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - files
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Filename
 *                     content:
 *                       type: string
 *                       description: YANG file content
 *                 description: Array of YANG files to parse
 *                 example:
 *                   - name: "module1.yang"
 *                     content: "module mod1 { namespace 'http://example.com/1'; prefix 'm1'; }"
 *                   - name: "module2.yang"
 *                     content: "module mod2 { namespace 'http://example.com/2'; prefix 'm2'; }"
 *     responses:
 *       200:
 *         description: Multiple YANG files parsed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 files:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/YangParseResult'
 *                       - type: object
 *                         properties:
 *                           filename:
 *                             type: string
 *                 dependencies:
 *                   type: object
 *                   description: Module dependency mapping
 *                 graph:
 *                   type: object
 *                   properties:
 *                     nodes:
 *                       type: array
 *                       items:
 *                         type: object
 *                     edges:
 *                       type: array
 *                       items:
 *                         type: object
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalModules:
 *                       type: number
 *                     validModules:
 *                       type: number
 *                     totalErrors:
 *                       type: number
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/parse-multiple', async (req, res) => {
  try {
    const { files } = req.body

    if (!Array.isArray(files)) {
      return res.status(400).json({ error: 'Files must be an array' })
    }

    const results = []
    const dependencies = new Map()

    for (const file of files) {
      const parseResult = parseYangContent(file.content, file.name)
      results.push({
        filename: file.name,
        ...parseResult
      })

      // Extract dependencies
      if (parseResult.metadata && parseResult.metadata.imports) {
        dependencies.set(file.name, parseResult.metadata.imports)
      }
    }

    // Build dependency graph
    const dependencyGraph = buildDependencyGraph(dependencies)

    res.json({
      files: results,
      dependencies: Object.fromEntries(dependencies),
      graph: dependencyGraph,
      summary: {
        totalModules: results.length,
        validModules: results.filter(r => r.valid).length,
        totalErrors: results.reduce((sum, r) => sum + r.errors.length, 0)
      }
    })

  } catch (error) {
    console.error('Error parsing multiple YANG files:', error)
    res.status(500).json({ error: 'Failed to parse YANG files' })
  }
})

// Advanced YANG parser using yang-js library
async function parseWithNodeYang(content, filename) {
  return new Promise((resolve, reject) => {
    try {
      const model = Yang.parse(content)

      if (!model) {
        const result = {
          valid: false,
          tree: {},
          modules: [],
          errors: [{ line: 1, message: 'Failed to parse YANG model - no model returned', severity: 'error' }],
          metadata: { filename, imports: [], includes: [], revisions: [] },
          parser: 'yang-js'
        }
        resolve(result)
        return
      }

      const result = {
        valid: true,
        tree: {},
        modules: [],
        errors: [],
        metadata: {
          filename,
          imports: [],
          includes: [],
          revisions: [],
          namespace: null,
          prefix: null
        },
        parser: 'yang-js'
      }

      // Extract module information
      if (model.module) {
        const moduleInfo = {
          type: 'module',
          name: model.module.name,
          namespace: model.module.namespace?.value,
          prefix: model.module.prefix?.value,
          children: []
        }

        result.modules.push(moduleInfo)
        result.tree[model.module.name] = moduleInfo
        result.metadata.namespace = model.module.namespace?.value
        result.metadata.prefix = model.module.prefix?.value

        // Extract imports
        if (model.module.import) {
          const imports = Array.isArray(model.module.import) ? model.module.import : [model.module.import]
          result.metadata.imports = imports.map(imp => imp.module)
        }

        // Extract includes
        if (model.module.include) {
          const includes = Array.isArray(model.module.include) ? model.module.include : [model.module.include]
          result.metadata.includes = includes.map(inc => inc.module)
        }

        // Extract revisions
        if (model.module.revision) {
          const revisions = Array.isArray(model.module.revision) ? model.module.revision : [model.module.revision]
          result.metadata.revisions = revisions.map(rev => rev.date)
        }

        // Parse module children recursively
        if (model.module.children) {
          moduleInfo.children = parseYangChildren(model.module.children)
        }
      }

      resolve(result)
    } catch (error) {
      // Create a structured error response instead of rejecting
      const result = {
        valid: false,
        tree: {},
        modules: [],
        errors: [{
          line: 1,
          message: error.message || 'Unknown parsing error',
          severity: 'error'
        }],
        metadata: { filename, imports: [], includes: [], revisions: [] },
        parser: 'yang-js'
      }
      resolve(result)
    }
  })
}

// Helper function to parse YANG children recursively
function parseYangChildren(children) {
  const parsedChildren = []

  for (const [name, child] of Object.entries(children)) {
    const childNode = {
      type: child.keyword || 'unknown',
      name: name,
      description: child.description?.value,
      mandatory: child.mandatory?.value === 'true',
      config: child.config?.value !== 'false',
      properties: {}
    }

    // Add type information for leaf nodes
    if (child.type) {
      childNode.properties.type = child.type.name
      if (child.type.range) {
        childNode.properties.range = child.type.range
      }
      if (child.type.length) {
        childNode.properties.length = child.type.length
      }
      if (child.type.pattern) {
        childNode.properties.pattern = child.type.pattern
      }
    }

    // Add default value
    if (child.default) {
      childNode.properties.default = child.default.value
    }

    // Add units
    if (child.units) {
      childNode.properties.units = child.units.value
    }

    // Add status
    if (child.status) {
      childNode.properties.status = child.status.value
    }

    // Recursively parse children
    if (child.children && Object.keys(child.children).length > 0) {
      childNode.children = parseYangChildren(child.children)
    }

    parsedChildren.push(childNode)
  }

  return parsedChildren
}

// Basic YANG parser implementation (fallback)
function parseYangContent(content, filename = 'unknown') {
  const result = {
    valid: true,
    tree: {},
    modules: [],
    errors: [],
    metadata: {
      filename,
      imports: [],
      includes: [],
      revisions: []
    }
  }

  try {
    const lines = content.split('\n')
    let currentModule = null
    let currentContainer = null
    let depth = 0
    const stack = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      const lineNum = i + 1

      if (!line || line.startsWith('//')) continue

      // Count braces for depth tracking
      const openBraces = (line.match(/\{/g) || []).length
      const closeBraces = (line.match(/\}/g) || []).length
      depth += openBraces - closeBraces

      // Parse module declaration
      const moduleMatch = line.match(/^(module|submodule)\s+([^\s{]+)/)
      if (moduleMatch) {
        currentModule = {
          type: moduleMatch[1],
          name: moduleMatch[2],
          line: lineNum,
          children: []
        }
        result.modules.push(currentModule)
        result.tree[moduleMatch[2]] = currentModule
        stack.push(currentModule)
        continue
      }

      // Parse imports
      const importMatch = line.match(/^import\s+([^\s{]+)/)
      if (importMatch) {
        result.metadata.imports.push(importMatch[1])
        continue
      }

      // Parse includes
      const includeMatch = line.match(/^include\s+([^\s{]+)/)
      if (includeMatch) {
        result.metadata.includes.push(includeMatch[1])
        continue
      }

      // Parse revision
      const revisionMatch = line.match(/^revision\s+([^\s{]+)/)
      if (revisionMatch) {
        result.metadata.revisions.push(revisionMatch[1])
        continue
      }

      // Parse containers
      const containerMatch = line.match(/^container\s+([^\s{]+)/)
      if (containerMatch) {
        const container = {
          type: 'container',
          name: containerMatch[1],
          line: lineNum,
          children: []
        }

        const parent = stack[stack.length - 1]
        if (parent) {
          parent.children.push(container)
        }
        stack.push(container)
        continue
      }

      // Parse lists
      const listMatch = line.match(/^list\s+([^\s{]+)/)
      if (listMatch) {
        const list = {
          type: 'list',
          name: listMatch[1],
          line: lineNum,
          children: []
        }

        const parent = stack[stack.length - 1]
        if (parent) {
          parent.children.push(list)
        }
        stack.push(list)
        continue
      }

      // Parse leaf nodes
      const leafMatch = line.match(/^leaf\s+([^\s{]+)/)
      if (leafMatch) {
        const leaf = {
          type: 'leaf',
          name: leafMatch[1],
          line: lineNum,
          properties: {}
        }

        const parent = stack[stack.length - 1]
        if (parent) {
          parent.children = parent.children || []
          parent.children.push(leaf)
        }
        continue
      }

      // Parse leaf-list nodes
      const leafListMatch = line.match(/^leaf-list\s+([^\s{]+)/)
      if (leafListMatch) {
        const leafList = {
          type: 'leaf-list',
          name: leafListMatch[1],
          line: lineNum,
          properties: {}
        }

        const parent = stack[stack.length - 1]
        if (parent) {
          parent.children = parent.children || []
          parent.children.push(leafList)
        }
        continue
      }

      // Parse RPC
      const rpcMatch = line.match(/^rpc\s+([^\s{]+)/)
      if (rpcMatch) {
        const rpc = {
          type: 'rpc',
          name: rpcMatch[1],
          line: lineNum,
          children: []
        }

        const parent = stack[stack.length - 1]
        if (parent) {
          parent.children.push(rpc)
        }
        stack.push(rpc)
        continue
      }

      // Parse notification
      const notificationMatch = line.match(/^notification\s+([^\s{]+)/)
      if (notificationMatch) {
        const notification = {
          type: 'notification',
          name: notificationMatch[1],
          line: lineNum,
          children: []
        }

        const parent = stack[stack.length - 1]
        if (parent) {
          parent.children.push(notification)
        }
        stack.push(notification)
        continue
      }

      // Handle closing braces
      if (closeBraces > 0) {
        for (let j = 0; j < closeBraces; j++) {
          if (stack.length > 1) { // Keep at least one element (module)
            stack.pop()
          }
        }
      }
    }

    // Basic validation
    if (depth !== 0) {
      result.errors.push({
        line: lines.length,
        message: `Unmatched braces detected. Depth: ${depth}`,
        severity: 'error'
      })
      result.valid = false
    }

    if (result.modules.length === 0) {
      result.errors.push({
        line: 1,
        message: 'No module or submodule declaration found',
        severity: 'error'
      })
      result.valid = false
    }

  } catch (error) {
    result.valid = false
    result.errors.push({
      line: 1,
      message: `Parse error: ${error.message}`,
      severity: 'error'
    })
  }

  return result
}

// Build dependency graph
function buildDependencyGraph(dependencies) {
  const graph = {
    nodes: [],
    edges: []
  }

  const nodeSet = new Set()

  // Add all files as nodes
  for (const [filename, imports] of dependencies) {
    if (!nodeSet.has(filename)) {
      graph.nodes.push({ id: filename, label: filename })
      nodeSet.add(filename)
    }

    // Add imported modules as nodes and create edges
    for (const importedModule of imports) {
      if (!nodeSet.has(importedModule)) {
        graph.nodes.push({ id: importedModule, label: importedModule })
        nodeSet.add(importedModule)
      }

      graph.edges.push({
        source: filename,
        target: importedModule,
        type: 'import'
      })
    }
  }

  return graph
}

export default router