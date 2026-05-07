import path from 'path';

export const PORT = Number(process.env.PORT) || 3001;
export const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');
export const DIST_DIR = path.join(__dirname, '../dist');
export const PROJECTS_FILE = process.env.PROJECTS_FILE || path.join(__dirname, '../config/projects.json');

export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/imgupload';

export const BASE_URL = (process.env.BASE_URL || '').replace(/\/$/, '');

export const ALLOWED_ORIGINS: string[] = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()).filter(Boolean)
    : [];

export const SESSION_TTL_MS = 2 * 60 * 60 * 1000;
export const ADMIN_SESSION_TTL_MS = 4 * 60 * 60 * 1000;
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? '';
export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type VariantConfig = {
    suffix: string;
    size: number;
    quality: number;
    fit: 'inside' | 'cover';
    withoutEnlargement: boolean;
};

export const VARIANTS: VariantConfig[] = [
    { suffix: '3840', size: 3840, quality: 90, fit: 'inside', withoutEnlargement: true },
    { suffix: '1200', size: 1200, quality: 70, fit: 'inside', withoutEnlargement: true },
    { suffix: '300', size: 300, quality: 60, fit: 'cover', withoutEnlargement: false },
];
