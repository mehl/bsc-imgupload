import path from 'path';
import fs from 'fs';
import { UPLOAD_DIR } from '../config';

export type PathSpec = { uuid: string; timestamp?: string; };

export type UserMeta = {
    uuid: string;
    firstSeen: string;
    lastSeen: string;
    email?: string;
    nickname?: string;
};

export type BatchMeta = {
    title: string | null;
    projectHandle: string;
};

export type FileMeta = {
    id: number;
    originalName: string;
    savedName: string;
    size: number;
    format: string;
    uploadedAt: string;
    variants: Record<string, string>;
    exif: Record<string, unknown>;
};
class FileService {
    private static instance: FileService;

    private constructor() { }

    static getInstance(): FileService {
        if (!FileService.instance) FileService.instance = new FileService();
        return FileService.instance;
    }

    dir(spec: PathSpec): string {
        return spec.timestamp
            ? path.join(UPLOAD_DIR, spec.uuid, spec.timestamp)
            : path.join(UPLOAD_DIR, spec.uuid);
    }

    jsonPath(spec: PathSpec, name = 'meta'): string {
        return path.join(this.dir(spec), `${name}.json`);
    }

    readJson<T extends Record<string, unknown>>(spec: PathSpec, name = 'meta'): T | null {
        const p = this.jsonPath(spec, name);
        return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf-8')) as T : null;
    }

    writeJson(spec: PathSpec, data: unknown, name = 'meta'): void {
        fs.writeFileSync(this.jsonPath(spec, name), JSON.stringify(data, null, 2));
    }

    sanitizeExt(originalname: string): string {
        const raw = path.extname(originalname).replace(/[^a-zA-Z0-9.]/g, '').slice(0, 10);
        return raw ? `.${raw.replace(/^\./, '')}` : '';
    }

    nextFileId(spec: PathSpec): number {
        const dir = this.dir(spec);
        if (!fs.existsSync(dir)) return 1;
        const max = fs.readdirSync(dir).reduce((acc, f) => {
            const m = f.match(/^(\d+)_original\./);
            return m ? Math.max(acc, parseInt(m[1], 10)) : acc;
        }, 0);
        return max + 1;
    }

    listUsers(): UserMeta[] {
        if (!fs.existsSync(UPLOAD_DIR)) return [];
        return fs.readdirSync(UPLOAD_DIR, { withFileTypes: true })
            .filter(e => e.isDirectory())
            .flatMap(e => {
                const meta = this.readJson<UserMeta>({ uuid: e.name });
                return meta ? [meta] : [];
            });
    }

    listUserPaths(uuid: string): PathSpec[] {
        const userDir = this.dir({ uuid });
        if (!fs.existsSync(userDir)) return [];
        return fs.readdirSync(userDir, { withFileTypes: true })
            .filter(e => e.isDirectory())
            .map(e => ({ uuid, timestamp: e.name }));
    }

    listImages(spec: PathSpec & { timestamp: string; }): FileMeta[] {
        const batchDir = this.dir(spec);
        if (!fs.existsSync(batchDir)) return [];
        return fs.readdirSync(batchDir)
            .filter(f => /^\d+\.json$/.test(f))
            .map(f => JSON.parse(fs.readFileSync(path.join(batchDir, f), 'utf-8')) as FileMeta);
    }
}

export const fileService = FileService.getInstance();
