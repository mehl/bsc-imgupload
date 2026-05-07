import { fileService, FileMeta, BatchMeta } from './file';
import { imageDocumentRepository } from './ImageDocumentRepository';
import { imageSetRepository } from './ImageSetRepository';

export type { ImageDocument } from './ImageDocumentRepository';
export type { ImageSet } from './ImageSetRepository';

class SyncService {
    private static instance: SyncService;

    private constructor() {}

    static getInstance(): SyncService {
        if (!SyncService.instance) SyncService.instance = new SyncService();
        return SyncService.instance;
    }

    async syncFile(uuid: string, timestamp: string, meta: FileMeta): Promise<void> {
        const doc = imageDocumentRepository.toDocument(uuid, timestamp, meta);
        await imageDocumentRepository.upsert(doc);
        const batchMeta = fileService.readJson<BatchMeta>({ uuid, timestamp });
        if (batchMeta) {
            await imageSetRepository.addImage(uuid, timestamp, batchMeta, doc._id);
        }
    }

    async syncBatch(uuid: string, timestamp: string, batchMeta: BatchMeta, images: FileMeta[]): Promise<void> {
        const image_ids: string[] = [];
        for (const image of images) {
            const doc = imageDocumentRepository.toDocument(uuid, timestamp, image);
            await imageDocumentRepository.upsert(doc);
            image_ids.push(doc._id);
        }
        const setDoc = imageSetRepository.toDocument(uuid, timestamp, batchMeta, image_ids);
        await imageSetRepository.upsert(setDoc);
    }

    async syncAll(): Promise<void> {
        const users = fileService.listUsers();
        for (const user of users) {
            const paths = fileService.listUserPaths(user.uuid);
            for (const spec of paths) {
                if (!spec.timestamp) continue;
                const batchMeta = fileService.readJson<BatchMeta>(spec);
                if (!batchMeta) continue;
                const images = fileService.listImages(spec as Parameters<typeof fileService.listImages>[0]);
                await this.syncBatch(spec.uuid, spec.timestamp, batchMeta, images);
            }
        }
        console.log(`[sync] syncAll complete`);
    }
}

export const syncService = SyncService.getInstance();
