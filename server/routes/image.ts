import { Hono } from 'hono'
import { existsSync, createReadStream, statSync } from 'fs'
import { Readable } from 'stream'
import path from 'path'
import { UPLOAD_DIR, UUID_RE, VARIANTS } from '../config'

export const imageRouter = new Hono()

const VALID_VARIANTS = new Set(VARIANTS.map(v => v.suffix))

imageRouter.get('/:uuid/:timestamp/:fileId/:variant', async (c) => {
    const { uuid, timestamp, fileId, variant } = c.req.param()

    if (!UUID_RE.test(uuid)) return c.json({ error: 'invalid uuid' }, 400)
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}$/.test(timestamp)) return c.json({ error: 'invalid timestamp' }, 400)
    if (!/^\d+$/.test(fileId)) return c.json({ error: 'invalid fileId' }, 400)
    if (!VALID_VARIANTS.has(variant)) return c.json({ error: 'invalid variant' }, 400)

    const filePath = path.join(UPLOAD_DIR, uuid, timestamp, `${fileId}_${variant}.webp`)

    if (!existsSync(filePath)) return c.notFound()

    const { size } = statSync(filePath)
    const stream = Readable.toWeb(createReadStream(filePath)) as ReadableStream

    return new Response(stream, {
        headers: {
            'Content-Type': 'image/webp',
            'Content-Length': String(size),
            'Cache-Control': 'public, max-age=31536000, immutable',
        },
    })
})
