import express from 'express'
import fs from 'fs'
import { PORT, UPLOAD_DIR, DIST_DIR } from './config'
import { sessionRouter } from './routes/session'
import { uploadRouter } from './routes/upload'

const app = express()

fs.mkdirSync(UPLOAD_DIR, { recursive: true })

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') { res.sendStatus(204); return }
  next()
})

if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR))
  app.get('/', (_req, res) => res.redirect('/test.html'))
}

app.use('/api/upload/session', sessionRouter)
app.use('/api/upload', uploadRouter)

app.listen(PORT, () => {
  console.log(`imgupload server listening on http://0.0.0.0:${PORT}`)
})
