import { MongoClient, Collection } from 'mongodb';
import { MONGODB_URI } from '../config';
import { FileMeta } from './file';

export type ImageDocument = {
    _id: string;
    uuid: string;
    timestamp: string;
    fileId: number;
    originalName: string;
    savedName: string;
    size: number;
    format: string;
    uploadedAt: string;
    variants: Record<string, string>;
    exif: Record<string, unknown>;
};

class ImageDocumentRepository {
    private static instance: ImageDocumentRepository;
    private client: MongoClient;
    private collection: Collection<ImageDocument> | null = null;

    private constructor() {
        this.client = new MongoClient(MONGODB_URI);
    }

    static getInstance(): ImageDocumentRepository {
        if (!ImageDocumentRepository.instance) {
            ImageDocumentRepository.instance = new ImageDocumentRepository();
        }
        return ImageDocumentRepository.instance;
    }

    private async getCollection(): Promise<Collection<ImageDocument>> {
        if (!this.collection) {
            await this.client.connect();
            this.collection = this.client.db().collection<ImageDocument>('images');
            await this.collection.createIndex({ uuid: 1, timestamp: 1, fileId: 1 });
        }
        return this.collection;
    }

    toDocument(uuid: string, timestamp: string, meta: FileMeta): ImageDocument {
        return {
            _id: `${uuid}:${timestamp}:${meta.id}`,
            uuid,
            timestamp,
            fileId: meta.id,
            originalName: meta.originalName,
            savedName: meta.savedName,
            size: meta.size,
            format: meta.format,
            uploadedAt: meta.uploadedAt,
            variants: meta.variants,
            exif: meta.exif,
        };
    }

    async upsert(doc: ImageDocument): Promise<void> {
        const col = await this.getCollection();
        await col.replaceOne({ _id: doc._id }, doc, { upsert: true });
    }

    async findByIds(ids: string[]): Promise<ImageDocument[]> {
        const col = await this.getCollection();
        return col.find({ _id: { $in: ids } }).toArray();
    }
}

export const imageDocumentRepository = ImageDocumentRepository.getInstance();
