/* eslint-disable @typescript-eslint/no-explicit-any */
import exifr from 'exifr';

const MAX_DIM = 3840;
const WEBP_QUALITY = 0.75;

const EXIF_PICK = [
    'DateTimeOriginal', 'CreateDate',
    'GPSLatitude', 'GPSLatitudeRef',
    'GPSLongitude', 'GPSLongitudeRef',
    'Make', 'Model',
    'ImageWidth', 'ImageHeight',
    'Orientation',
];

async function extractExif(file: File): Promise<Record<string, unknown>> {
    try {
        const parsed = await (exifr as any).parse(file, { pick: EXIF_PICK });
        return parsed ?? {};
    } catch {
        return {};
    }
}

async function resizeToWebP(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            URL.revokeObjectURL(url);
            let w = img.naturalWidth;
            let h = img.naturalHeight;
            if (w > MAX_DIM || h > MAX_DIM) {
                const r = Math.min(MAX_DIM / w, MAX_DIM / h);
                w = Math.round(w * r);
                h = Math.round(h * r);
            }
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
            canvas.toBlob(
                (blob) => blob ? resolve(blob) : reject(new Error('Konvertierung fehlgeschlagen')),
                'image/webp',
                WEBP_QUALITY,
            );
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Bild konnte nicht geladen werden'));
        };
        img.src = url;
    });
}

export interface UploadFileOptions {
    file: File;
    apiBase: string;
    sessionId: string;
    uuid: string;
    email: string;
    nickname: string;
    title: string;
    onProgress: (progress: number) => void;
}

export async function uploadFile({
    file, apiBase, sessionId, uuid, email, nickname, title, onProgress,
}: UploadFileOptions): Promise<void> {
    const [exif, webpBlob] = await Promise.all([
        extractExif(file),
        resizeToWebP(file),
    ]);

    const params = new URLSearchParams({ uuid, email: email.trim(), nickname: nickname.trim() });
    if (title.trim()) params.append('title', title.trim());

    const webpName = file.name.replace(/\.[^.]+$/, '.webp');
    const formData = new FormData();
    formData.append('file', webpBlob, webpName);
    if (Object.keys(exif).length > 0) {
        formData.append('exif', JSON.stringify(exif));
    }

    return new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${apiBase}/api/upload?${params}`);
        xhr.setRequestHeader('Authorization', `Bearer ${sessionId}`);

        xhr.upload.addEventListener('progress', (ev) => {
            if (ev.lengthComputable) onProgress(Math.round((ev.loaded / ev.total) * 100));
        });

        xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve();
            } else {
                let msg = 'Upload fehlgeschlagen.';
                try { msg = JSON.parse(xhr.responseText).error ?? msg; } catch { /* noop */ }
                reject(new Error(msg));
            }
        });

        xhr.addEventListener('error', () => reject(new Error('Netzwerkfehler.')));
        xhr.send(formData);
    });
}
