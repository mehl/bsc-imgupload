import path from 'path';
import sharp from 'sharp';
import { VARIANTS } from '../config';

class ImageProcessorService {
    private static instance: ImageProcessorService;

    private constructor() { }

    static getInstance(): ImageProcessorService {
        if (!ImageProcessorService.instance) ImageProcessorService.instance = new ImageProcessorService();
        return ImageProcessorService.instance;
    }

    async extractExif(filePath: string): Promise<Record<string, unknown>> {
        try {
            const { default: exifr } = await import('exifr') as {
                default: { parse: (p: string, opts: object) => Promise<Record<string, unknown> | null>; };
            };
            const parsed = await exifr.parse(filePath, {
                pick: [
                    'DateTimeOriginal', 'CreateDate',
                    'GPSLatitude', 'GPSLatitudeRef',
                    'GPSLongitude', 'GPSLongitudeRef',
                    'Make', 'Model',
                    'ImageWidth', 'ImageHeight',
                    'Orientation',
                ]
            });
            return parsed ?? {};
        } catch {
            return {};
        }
    }

    async generateVariants(
        filePath: string,
        dir: string,
        fileId: number
    ): Promise<Record<string, string>> {
        const results: Record<string, string> = {};
        for (const v of VARIANTS) {
            const outPath = path.join(dir, `${fileId}_${v.suffix}.webp`);
            try {
                await sharp(filePath)
                    .resize(v.size, v.size, { fit: v.fit, withoutEnlargement: v.withoutEnlargement })
                    .webp({ quality: v.quality })
                    .toFile(outPath);
                results[v.suffix] = `${fileId}_${v.suffix}.webp`;
            } catch (e) {
                console.error(`Variant ${v.suffix} failed for ${filePath}:`, e);
            }
        }
        return results;
    }
}

export const imageProcessorService = ImageProcessorService.getInstance();
