import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import fs from 'fs'
import path from 'path'
import { PORT, UPLOAD_DIR, DIST_DIR, ALLOWED_ORIGINS } from './config'

import { sessionRouter } from './routes/session'
import { uploadRouter } from './routes/upload'
import { galleryRouter } from './routes/gallery'
import { imageRouter } from './routes/image'
import { syncService } from './services/sync'

const app = new Hono()

fs.mkdirSync(UPLOAD_DIR, { recursive: true })

app.use(cors({
    origin: ALLOWED_ORIGINS.length > 0 ? ALLOWED_ORIGINS : '*',
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
}))

// Block API requests from non-whitelisted origins
app.use('/api/*', async (c, next) => {
    if (ALLOWED_ORIGINS.length === 0) return next()
    const origin = c.req.header('origin')
    if (!origin || !ALLOWED_ORIGINS.includes(origin)) {
        return c.json({ error: 'Forbidden' }, 403)
    }
    return next()
})

app.route('/api/upload/session', sessionRouter)
app.route('/api/upload', uploadRouter)
app.route('/api/gallery', galleryRouter)
app.route('/api/image', imageRouter)

if (fs.existsSync(DIST_DIR)) {
    app.get('/', (c) => c.redirect('/test.html'))
    app.use('/*', serveStatic({ root: path.relative(process.cwd(), DIST_DIR) }))
}

serve({ fetch: app.fetch, port: PORT }, (info) => {
    console.log(`imgupload server listening on http://0.0.0.0:${info.port}`)
    syncService.syncAll().catch(console.error)
})
