import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs/promises'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../../uploads')
    try {
      await fs.access(uploadDir)
    } catch {
      await fs.mkdir(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    // Keep original filename with timestamp prefix to avoid conflicts
    const timestamp = Date.now()
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')
    cb(null, `${timestamp}_${sanitizedName}`)
  }
})

const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.md', '.mmd', '.mermaid', '.yang']
  const ext = path.extname(file.originalname).toLowerCase()

  if (allowedExtensions.includes(ext)) {
    cb(null, true)
  } else {
    cb(new Error(`File type ${ext} not supported. Allowed types: ${allowedExtensions.join(', ')}`), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10 // Maximum 10 files at once
  }
})

/**
 * @swagger
 * /api/files:
 *   get:
 *     tags: [Files]
 *     summary: Get all uploaded files
 *     description: Retrieve a list of all uploaded files with metadata
 *     responses:
 *       200:
 *         description: List of files retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/File'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', async (req, res) => {
  try {
    const uploadsDir = path.join(__dirname, '../../../uploads')

    try {
      await fs.access(uploadsDir)
    } catch {
      return res.json([])
    }

    const files = await fs.readdir(uploadsDir)
    const fileDetails = await Promise.all(
      files.map(async (filename) => {
        const filePath = path.join(uploadsDir, filename)
        const stats = await fs.stat(filePath)
        const ext = path.extname(filename).toLowerCase()

        // Extract original filename (remove timestamp prefix)
        const originalName = filename.replace(/^\d+_/, '')

        return {
          id: filename,
          name: originalName,
          path: filePath,
          size: stats.size,
          modified: stats.mtime,
          type: ext === '.md' ? 'markdown' :
                ext === '.yang' ? 'yang' : 'mermaid',
          extension: ext
        }
      })
    )

    // Sort by modification date (newest first)
    fileDetails.sort((a, b) => new Date(b.modified) - new Date(a.modified))

    res.json(fileDetails)
  } catch (error) {
    console.error('Error listing files:', error)
    res.status(500).json({ error: 'Failed to list files' })
  }
})

/**
 * @swagger
 * /api/files/{fileId}/content:
 *   get:
 *     tags: [Files]
 *     summary: Get file content
 *     description: Retrieve the content of a specific file by its ID
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *         description: The file identifier
 *     responses:
 *       200:
 *         description: File content retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 content:
 *                   type: string
 *                   description: The file content as a string
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:fileId/content', async (req, res) => {
  try {
    const { fileId } = req.params
    const filePath = path.join(__dirname, '../../../uploads', fileId)

    const content = await fs.readFile(filePath, 'utf-8')
    res.json({ content })
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({ error: 'File not found' })
    }
    console.error('Error reading file:', error)
    res.status(500).json({ error: 'Failed to read file' })
  }
})

/**
 * @swagger
 * /api/files/upload:
 *   post:
 *     tags: [Files]
 *     summary: Upload files
 *     description: Upload one or more files (.md, .mmd, .mermaid, .yang)
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Files to upload (max 10 files, 10MB each)
 *     responses:
 *       200:
 *         description: Files uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Successfully uploaded 2 file(s)"
 *                 files:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       size:
 *                         type: number
 *                       type:
 *                         type: string
 *                       path:
 *                         type: string
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/upload', upload.array('files'), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' })
    }

    const uploadedFiles = req.files.map(file => ({
      id: file.filename,
      name: file.originalname,
      size: file.size,
      type: path.extname(file.originalname).toLowerCase() === '.md' ? 'markdown' :
            path.extname(file.originalname).toLowerCase() === '.yang' ? 'yang' : 'mermaid',
      path: file.path
    }))

    res.json({
      message: `Successfully uploaded ${uploadedFiles.length} file(s)`,
      files: uploadedFiles
    })
  } catch (error) {
    console.error('Error uploading files:', error)
    res.status(500).json({ error: 'Failed to upload files' })
  }
})

// Delete file
router.delete('/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params
    const filePath = path.join(__dirname, '../../../uploads', fileId)

    await fs.unlink(filePath)
    res.json({ message: 'File deleted successfully' })
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({ error: 'File not found' })
    }
    console.error('Error deleting file:', error)
    res.status(500).json({ error: 'Failed to delete file' })
  }
})

// Update file content
router.put('/:fileId/content', async (req, res) => {
  try {
    const { fileId } = req.params
    const { content } = req.body

    if (typeof content !== 'string') {
      return res.status(400).json({ error: 'Content must be a string' })
    }

    const filePath = path.join(__dirname, '../../../uploads', fileId)

    // Check if file exists
    try {
      await fs.access(filePath)
    } catch {
      return res.status(404).json({ error: 'File not found' })
    }

    await fs.writeFile(filePath, content, 'utf-8')
    res.json({ message: 'File updated successfully' })
  } catch (error) {
    console.error('Error updating file:', error)
    res.status(500).json({ error: 'Failed to update file' })
  }
})

// Extract Mermaid diagrams from a file
router.get('/:fileId/diagrams', async (req, res) => {
  try {
    const { fileId } = req.params
    const filePath = path.join(__dirname, '../../../uploads', fileId)

    const content = await fs.readFile(filePath, 'utf-8')
    const ext = path.extname(fileId).toLowerCase()

    const diagrams = []

    if (ext === '.md') {
      // Extract Mermaid blocks from markdown
      const lines = content.split('\n')
      const mermaidBlockRegex = /```(?:mermaid|mmd)(?:\s+(.+?))?\s*$/
      const endBlockRegex = /^```\s*$/

      let inMermaidBlock = false
      let currentDiagram = []
      let blockStartLine = -1
      let blockTitle = undefined
      let diagramIndex = 0

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]

        if (!inMermaidBlock) {
          const match = line.match(mermaidBlockRegex)
          if (match) {
            inMermaidBlock = true
            blockStartLine = i
            blockTitle = match[1] || undefined
            currentDiagram = []

            // Look for heading above the code block
            if (!blockTitle) {
              for (let j = Math.max(0, i - 3); j < i; j++) {
                const prevLine = lines[j].trim()
                const headingMatch = prevLine.match(/^#+\s+(.+)$/)
                if (headingMatch) {
                  blockTitle = headingMatch[1]
                  break
                }
              }
            }
          }
        } else {
          if (endBlockRegex.test(line)) {
            const diagramContent = currentDiagram.join('\n').trim()
            if (diagramContent) {
              diagrams.push({
                content: diagramContent,
                index: diagramIndex,
                title: blockTitle || `Diagram ${diagramIndex + 1}`,
                startLine: blockStartLine,
                endLine: i
              })
              diagramIndex++
            }
            inMermaidBlock = false
            currentDiagram = []
            blockTitle = undefined
          } else {
            currentDiagram.push(line)
          }
        }
      }

      // Handle unclosed block
      if (inMermaidBlock && currentDiagram.length > 0) {
        const diagramContent = currentDiagram.join('\n').trim()
        if (diagramContent) {
          diagrams.push({
            content: diagramContent,
            index: diagramIndex,
            title: blockTitle || `Diagram ${diagramIndex + 1}`,
            startLine: blockStartLine,
            endLine: lines.length - 1
          })
        }
      }
    } else if (ext === '.mmd' || ext === '.mermaid') {
      // For pure Mermaid files, treat entire content as one diagram
      diagrams.push({
        content: content.trim(),
        index: 0,
        title: path.basename(fileId, ext),
        startLine: 0,
        endLine: content.split('\n').length - 1
      })
    }

    res.json({
      fileId,
      totalDiagrams: diagrams.length,
      diagrams
    })
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({ error: 'File not found' })
    }
    console.error('Error extracting diagrams:', error)
    res.status(500).json({ error: 'Failed to extract diagrams' })
  }
})

// Get a specific diagram from a file
router.get('/:fileId/diagrams/:index', async (req, res) => {
  try {
    const { fileId, index } = req.params
    const diagramIndex = parseInt(index, 10)

    if (isNaN(diagramIndex) || diagramIndex < 0) {
      return res.status(400).json({ error: 'Invalid diagram index' })
    }

    const filePath = path.join(__dirname, '../../../uploads', fileId)
    const content = await fs.readFile(filePath, 'utf-8')
    const ext = path.extname(fileId).toLowerCase()

    // Extract diagrams (similar logic as above)
    const diagrams = []

    if (ext === '.md') {
      // Same extraction logic as in /diagrams endpoint
      const lines = content.split('\n')
      const mermaidBlockRegex = /```(?:mermaid|mmd)(?:\s+(.+?))?\s*$/
      const endBlockRegex = /^```\s*$/

      let inMermaidBlock = false
      let currentDiagram = []
      let blockStartLine = -1
      let blockTitle = undefined
      let currentIndex = 0

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]

        if (!inMermaidBlock) {
          const match = line.match(mermaidBlockRegex)
          if (match) {
            inMermaidBlock = true
            blockStartLine = i
            blockTitle = match[1] || undefined
            currentDiagram = []

            if (!blockTitle) {
              for (let j = Math.max(0, i - 3); j < i; j++) {
                const prevLine = lines[j].trim()
                const headingMatch = prevLine.match(/^#+\s+(.+)$/)
                if (headingMatch) {
                  blockTitle = headingMatch[1]
                  break
                }
              }
            }
          }
        } else {
          if (endBlockRegex.test(line)) {
            const diagramContent = currentDiagram.join('\n').trim()
            if (diagramContent) {
              diagrams.push({
                content: diagramContent,
                index: currentIndex,
                title: blockTitle || `Diagram ${currentIndex + 1}`,
                startLine: blockStartLine,
                endLine: i
              })
              currentIndex++
            }
            inMermaidBlock = false
            currentDiagram = []
            blockTitle = undefined
          } else {
            currentDiagram.push(line)
          }
        }
      }
    } else if (ext === '.mmd' || ext === '.mermaid') {
      diagrams.push({
        content: content.trim(),
        index: 0,
        title: path.basename(fileId, ext),
        startLine: 0,
        endLine: content.split('\n').length - 1
      })
    }

    if (diagramIndex >= diagrams.length) {
      return res.status(404).json({
        error: `Diagram ${diagramIndex} not found. File contains ${diagrams.length} diagram(s).`
      })
    }

    const diagram = diagrams[diagramIndex]

    res.json({
      fileId,
      diagram,
      navigation: {
        current: diagramIndex,
        total: diagrams.length,
        hasPrevious: diagramIndex > 0,
        hasNext: diagramIndex < diagrams.length - 1,
        previousIndex: diagramIndex > 0 ? diagramIndex - 1 : null,
        nextIndex: diagramIndex < diagrams.length - 1 ? diagramIndex + 1 : null
      }
    })
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({ error: 'File not found' })
    }
    console.error('Error getting diagram:', error)
    res.status(500).json({ error: 'Failed to get diagram' })
  }
})

export default router