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
        originalName: string,
        savedName: string,
        size: number,
        format: string,
        variants: Record<string, string>,
        exif: Record<string, unknown>
    ): FileMeta {
        const meta: FileMeta = {
            id: fileId,
            originalName,
            savedName,
            size,
            format,
            uploadedAt: new Date().toISOString(),
            variants,
            exif,
        };
        fileService.writeJson(spec, meta, String(fileId));
        return meta;
    }
}

export const metaService = MetaService.getInstance();
