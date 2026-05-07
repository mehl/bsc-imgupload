import { BatchMeta, FileMeta, fileService, PathSpec, UserMeta } from './file';

class MetaService {
    private static instance: MetaService;

    private constructor() { }

    static getInstance(): MetaService {
        if (!MetaService.instance) MetaService.instance = new MetaService();
        return MetaService.instance;
    }

    writeUserMeta(uuid: string, email: string, nickname: string): void {
        const spec: PathSpec = { uuid };
        const existing = fileService.readJson<UserMeta>(spec);
        const meta: UserMeta = {
            uuid,
            firstSeen: existing?.firstSeen ?? new Date().toISOString(),
            lastSeen: new Date().toISOString(),
            email: email || existing?.email,
            nickname: nickname || existing?.nickname,
        };
        fileService.writeJson(spec, meta);
    }

    writeBatchMeta(spec: PathSpec, title: string, projectHandle: string): void {
        if (!fileService.readJson<BatchMeta>(spec)) {
            const meta: BatchMeta = { title: title || null, projectHandle };
            fileService.writeJson(spec, meta);
        }
    }

    writeFileMeta(
        spec: PathSpec,
        fileId: number,
        file: Express.Multer.File,
        variants: Record<string, string>,
        exif: Record<string, unknown>
    ): void {
        const meta: FileMeta = {
            id: fileId,
            originalName: file.originalname,
            savedName: file.filename,
            size: file.size,
            format: file.mimetype,
            uploadedAt: new Date().toISOString(),
            variants,
            exif,
        };
        fileService.writeJson(spec, meta, String(fileId));
    }
}

export const metaService = MetaService.getInstance();
