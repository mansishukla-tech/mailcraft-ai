import { Router } from 'express'
import { buildPrompt } from '../services/promptBuilder.js'
import { streamCompletion } from '../services/llm.js'

const router = Router()
const MAX_INPUT_LENGTH = 4000
const VALID_MODES = new Set(['email', 'letter', 'rewrite', 'grammar', 'tone'])

router.post('/generate', async (req, res) => {
  const { mode, tone, letterType, recipient, inputText } = req.body || {}

  if (!mode || !VALID_MODES.has(mode)) {
    return res.status(400).json({ error: 'Missing or invalid "mode".' })
  }
  if (!inputText || typeof inputText !== 'string' || !inputText.trim()) {
    return res.status(400).json({ error: 'Please provide some input text.' })
  }
  if (inputText.length > MAX_INPUT_LENGTH) {
    return res.status(400).json({ error: `Input text is too long (max ${MAX_INPUT_LENGTH} characters).` })
  }

  let prompt
  try {
    prompt = buildPrompt({ mode, tone, letterType, recipient, inputText })
  } catch (err) {
    return res.status(err.statusCode || 400).json({ error: err.message })
  }

  // Stream plain text back to the client using chunked transfer encoding.
  res.writeHead(200, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'no-cache',
    'X-Accel-Buffering': 'no',
  })

  try {
    await streamCompletion({ system: prompt.system, user: prompt.user, res })
    res.end()
  } catch (err) {
    console.error('Generation error:', err.message)
    if (!res.headersSent) {
      res.status(err.statusCode || 500).json({ error: err.message })
    } else {
      res.write(`\n\n[Error: ${err.message}]`)
      res.end()
    }
  }
})

export default router
