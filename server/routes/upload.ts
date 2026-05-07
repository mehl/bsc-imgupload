import { Hono } from 'hono'
import fs from 'fs'
import path from 'path'
import { UUID_RE } from '../config'
import { sessionService } from '../services/session'
import { fileService } from '../services/file'
import { metaService } from '../services/meta'
import { imageProcessorService } from '../services/imageProcessor'
import { syncService } from '../services/sync'

export const uploadRouter = new Hono()

uploadRouter.post('/', async (c) => {
    const uuid = c.req.query('uuid') ?? ''
    const email = c.req.query('email') ?? ''
    const nickname = c.req.query('nickname') ?? ''
    const title = c.req.query('title') ?? ''

    if (!UUID_RE.test(uuid)) {
        return c.json({ error: 'Ungültige oder fehlende UUID.' }, 400)
    }

    const auth = c.req.header('Authorization') ?? ''
    const sessionId = auth.startsWith('Bearer ') ? auth.slice(7) : ''
    const session = sessionService.get(sessionId)
    if (!session || !session.project) {
        return c.json({ error: 'Ungültige oder abgelaufene Session.' }, 400)
    }
    sessionService.refresh(sessionId)

    const body = await c.req.parseBody()
    const file = body['file']

    if (!(file instanceof File)) {
        return c.json({ error: 'Keine Datei übermittelt.' }, 400)
    }
    if (!file.type.startsWith('image/')) {
        return c.json({ error: 'Nur Bilddateien sind erlaubt.' }, 400)
    }
    if (file.size > 50 * 1024 * 1024) {
        return c.json({ error: 'Datei zu groß (max. 50 MB).' }, 400)
    }

    const spec = { uuid, timestamp: session.timestamp }
    const dir = fileService.dir(spec)
    fs.mkdirSync(dir, { recursive: true })
    const fileId = fileService.nextFileId(spec)

    const ext = fileService.sanitizeExt(file.name)
    const filename = `${fileId}_original${ext}`
    const filepath = path.join(dir, filename)

    await fs.promises.writeFile(filepath, Buffer.from(await file.arrayBuffer()))

    metaService.writeUserMeta(uuid, email, nickname)

    const [exif, variants] = await Promise.all([
        imageProcessorService.extractExif(filepath),
        imageProcessorService.generateVariants(filepath, dir, fileId),
    ])

    metaService.writeBatchMeta(spec, title, session.project.handle)
    const fileMeta = metaService.writeFileMeta(spec, fileId, file.name, filename, file.size, file.type, variants, exif)
    syncService.syncFile(spec.uuid, spec.timestamp, fileMeta).catch(console.error)

    return c.json({ success: true, file: { id: fileId, name: filename, size: file.size, format: file.type } })
})
