import fs from 'fs';
import { Router } from 'express';
import multer from 'multer';
import { UUID_RE } from '../config';
import { sessionService } from '../services/session';
import { fileService } from '../services/file';
import { metaService } from '../services/meta';
import { imageProcessorService } from '../services/imageProcessor';

export const uploadRouter = Router();

uploadRouter.post('/', (req, res) => {
    const uuid = (req.query.uuid as string) ?? '';
    const email = (req.query.email as string) ?? '';
    const nickname = (req.query.nickname as string) ?? '';
    const title = (req.query.title as string) ?? '';
    const sessionId = (req.query.sessionId as string) ?? '';

    if (!UUID_RE.test(uuid)) {
        res.status(400).json({ error: 'Ungültige oder fehlende UUID.' });
        return;
    }

    const session = sessionService.get(sessionId);
    if (!session) {
        res.status(400).json({ error: 'Ungültige oder abgelaufene Session.' });
        return;
    }
    sessionService.refresh(sessionId);

    const spec = { uuid, timestamp: session.timestamp };
    const dir = fileService.dir(spec);
    fs.mkdirSync(dir, { recursive: true });
    const fileId = fileService.nextFileId(spec);

    const storage = multer.diskStorage({
        destination: (_req, _file, cb) => cb(null, dir),
        filename: (_req, file, cb) => cb(null, `${fileId}_original${fileService.sanitizeExt(file.originalname)}`),
    });

    const upload = multer({
        storage,
        limits: { files: 1, fileSize: 50 * 1024 * 1024 },
        fileFilter: (_req, file, cb) => {
            if (file.mimetype.startsWith('image/')) cb(null, true);
            else cb(new Error('Nur Bilddateien sind erlaubt.'));
        },
    }).single('file');

    // @types/multer bundles its own express-serve-static-core, causing type mismatch
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    upload(req as any, res as any, async (err: unknown) => {
        if (err) {
            const msg = err instanceof Error ? err.message : 'Upload fehlgeschlagen.';
            res.status(400).json({ error: msg });
            return;
        }

        const file = req.file as Express.Multer.File | undefined;
        if (!file) {
            res.status(400).json({ error: 'Keine Datei übermittelt.' });
            return;
        }

        metaService.writeUserMeta(uuid, email, nickname);

        const [exif, variants] = await Promise.all([
            imageProcessorService.extractExif(file.path),
            imageProcessorService.generateVariants(file.path, dir, fileId),
        ]);

        metaService.writeBatchMeta(spec, title, session.project.handle);
        metaService.writeFileMeta(spec, fileId, file, variants, exif);

        res.json({ success: true, file: { id: fileId, name: file.filename, size: file.size, format: file.mimetype } });
    });
});
