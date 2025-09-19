import express from 'express'
import markdownlintPkg from 'markdownlint'
const { markdownlint } = markdownlintPkg
import mermaidPkg from 'mermaid'
import { JSDOM } from 'jsdom'
import { markdownRules, mermaidConfig, presets } from '../config/linting-rules.js'

const mermaid = mermaidPkg.default || mermaidPkg

const router = express.Router()

/**
 * @swagger
 * /api/lint/config:
 *   get:
 *     tags: [Linting]
 *     summary: Get linting configuration
 *     description: Retrieve available linting presets, rules, and configuration options
 *     responses:
 *       200:
 *         description: Linting configuration retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 presets:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Available linting presets
 *                 defaultPreset:
 *                   type: string
 *                   example: default
 *                 markdownRules:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Available markdown linting rules
 *                 mermaidConfig:
 *                   type: object
 *                   properties:
 *                     supportedTypes:
 *                       type: array
 *                       items:
 *                         type: string
 *                     securityLevel:
 *                       type: string
 *                     theme:
 *                       type: string
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/config', (req, res) => {
  try {
    res.json({
      presets: Object.keys(presets),
      defaultPreset: 'default',
      markdownRules: Object.keys(markdownRules),
      mermaidConfig: {
        supportedTypes: mermaidConfig.supportedTypes,
        securityLevel: mermaidConfig.securityLevel,
        theme: mermaidConfig.theme
      }
    })
  } catch (error) {
    console.error('Error getting lint config:', error)
    res.status(500).json({ error: 'Failed to get linting configuration' })
  }
})

// Initialize Mermaid in a virtual DOM environment
let mermaidInitialized = false

const initializeMermaid = () => {
  if (!mermaidInitialized) {
    const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>')
    global.window = dom.window
    global.document = dom.window.document
    global.navigator = dom.window.navigator

    mermaid.initialize({
      startOnLoad: false,
      theme: mermaidConfig.theme,
      securityLevel: mermaidConfig.securityLevel
    })

    mermaidInitialized = true
  }
}

/**
 * @swagger
 * /api/lint/markdown:
 *   post:
 *     tags: [Linting]
 *     summary: Lint Markdown content
 *     description: Validate and analyze Markdown content for linting issues
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
 *                 description: Markdown content to lint
 *                 example: "# My Heading\\n\\nSome content here"
 *               preset:
 *                 type: string
 *                 default: default
 *                 description: Linting preset to use
 *     responses:
 *       200:
 *         description: Markdown linting completed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LintResult'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/markdown', (req, res) => {
  try {
    const { content, preset = 'default' } = req.body

    if (typeof content !== 'string') {
      return res.status(400).json({ error: 'Content must be a string' })
    }

    // Select rules based on preset
    let rules = markdownRules
    if (preset !== 'default' && presets[preset]) {
      rules = presets[preset]
    }

    const options = {
      strings: { content },
      config: rules
    }

    const result = markdownlint.sync(options)
    const issues = []

    // Convert markdownlint results to our format
    if (result.content) {
      result.content.forEach(error => {
        issues.push({
          line: error.lineNumber,
          column: error.errorColumn || 1,
          severity: 'error',
          rule: error.ruleNames[0],
          message: error.ruleDescription,
          detail: error.errorDetail,
          fixInfo: error.fixInfo || null
        })
      })
    }

    res.json({
      valid: issues.length === 0,
      issues,
      summary: {
        total: issues.length,
        errors: issues.length,
        warnings: 0
      }
    })

  } catch (error) {
    console.error('Error linting Markdown:', error)
    res.status(500).json({ error: 'Failed to lint Markdown content' })
  }
})

/**
 * @swagger
 * /api/lint/mermaid:
 *   post:
 *     tags: [Linting]
 *     summary: Lint Mermaid content
 *     description: Validate Mermaid diagram syntax and structure
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
 *                 description: Mermaid diagram content to validate
 *                 example: |
 *                   graph TD
 *                     A[Start] --> B[Process]
 *                     B --> C[End]
 *     responses:
 *       200:
 *         description: Mermaid linting completed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LintResult'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/mermaid', async (req, res) => {
  try {
    const { content } = req.body

    if (typeof content !== 'string') {
      return res.status(400).json({ error: 'Content must be a string' })
    }

    initializeMermaid()

    const issues = []

    try {
      // Parse the Mermaid content
      await mermaid.parse(content)

      // If we get here, the syntax is valid
      res.json({
        valid: true,
        issues: [],
        summary: {
          total: 0,
          errors: 0,
          warnings: 0
        }
      })

    } catch (parseError) {
      // Mermaid syntax error
      let line = 1
      let column = 1

      // Try to extract line/column information from error message
      const lineMatch = parseError.message.match(/line (\d+)/i)
      const columnMatch = parseError.message.match(/column (\d+)/i)

      if (lineMatch) line = parseInt(lineMatch[1], 10)
      if (columnMatch) column = parseInt(columnMatch[1], 10)

      issues.push({
        line,
        column,
        severity: 'error',
        rule: 'mermaid-syntax',
        message: 'Mermaid syntax error',
        detail: parseError.message,
        fixInfo: null
      })

      res.json({
        valid: false,
        issues,
        summary: {
          total: issues.length,
          errors: issues.length,
          warnings: 0
        }
      })
    }

  } catch (error) {
    console.error('Error linting Mermaid:', error)
    res.status(500).json({ error: 'Failed to lint Mermaid content' })
  }
})

// Auto-fix Markdown content
router.post('/markdown/fix', (req, res) => {
  try {
    const { content } = req.body

    if (typeof content !== 'string') {
      return res.status(400).json({ error: 'Content must be a string' })
    }

    // This is a simplified auto-fix implementation
    // In a real application, you'd want more sophisticated fixing logic
    let fixedContent = content

    // Fix common issues
    // Remove trailing spaces
    fixedContent = fixedContent.replace(/[ \t]+$/gm, '')

    // Ensure single newline at end of file
    fixedContent = fixedContent.replace(/\n*$/, '\n')

    // Fix multiple consecutive blank lines
    fixedContent = fixedContent.replace(/\n{3,}/g, '\n\n')

    // Add space after hash in headings
    fixedContent = fixedContent.replace(/^(#{1,6})([^\s#])/gm, '$1 $2')

    // Fix list item spacing
    fixedContent = fixedContent.replace(/^(\s*[-*+]\s*)/gm, (match, prefix) => {
      const indent = prefix.match(/^\s*/)[0]
      return `${indent}- `
    })

    const changes = content !== fixedContent

    res.json({
      fixed: changes,
      content: fixedContent,
      message: changes ? 'Content has been auto-fixed' : 'No fixes needed'
    })

  } catch (error) {
    console.error('Error auto-fixing Markdown:', error)
    res.status(500).json({ error: 'Failed to auto-fix Markdown content' })
  }
})

export default router