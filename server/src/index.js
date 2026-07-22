import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import rateLimit from 'express-rate-limit'
import generateRouter from './routes/generate.js'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 8080

app.disable('x-powered-by')
app.use(express.json({ limit: '100kb' }))

// CORS is only needed when the Vite dev server (port 5173) calls this
// server directly. In production the React build is served by this same
// Express app, so requests are same-origin and CORS is unnecessary.
if (process.env.NODE_ENV !== 'production') {
  app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }))
}

const generateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please wait a moment and try again.' },
})

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api', generateLimiter, generateRouter)

// Serve the built React app (copied into ./public by the Docker build)
const publicDir = path.join(__dirname, '..', 'public')
app.use(express.static(publicDir))

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next()
  res.sendFile(path.join(publicDir, 'index.html'))
})

// Central error handler
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Something went wrong on the server.' })
})

app.listen(PORT, () => {
  console.log(`MailCraft AI server listening on port ${PORT}`)
})
