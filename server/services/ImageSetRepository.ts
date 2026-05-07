import { MongoClient, Collection } from 'mongodb';
import { MONGODB_URI } from '../config';
import { BatchMeta } from './file';

export type ImageSet = {
    _id: string;
    uuid: string;
    timestamp: string;
    title: string | null;
    projectHandle: string;
    image_ids: string[];
};

class ImageSetRepository {
    private static instance: ImageSetRepository;
    private client: MongoClient;
    private collection: Collection<ImageSet> | null = null;

    private constructor() {
        this.client = new MongoClient(MONGODB_URI);
    }

    static getInstance(): ImageSetRepository {
        if (!ImageSetRepository.instance) {
            ImageSetRepository.instance = new ImageSetRepository();
        }
        return ImageSetRepository.instance;
    }

    private async getCollection(): Promise<Collection<ImageSet>> {
        if (!this.collection) {
            await this.client.connect();
            this.collection = this.client.db().collection<ImageSet>('image_sets');
            await this.collection.createIndex({ uuid: 1, timestamp: 1 });
            await this.collection.createIndex({ projectHandle: 1 });
        }
        return this.collection;
    }

    toDocument(uuid: string, timestamp: string, meta: BatchMeta, image_ids: string[]): ImageSet {
        return {
            _id: `${uuid}:${timestamp}`,
            uuid,
            timestamp,
            title: meta.title,
            projectHandle: meta.projectHandle,
            image_ids,
        };
    }

    async upsert(doc: ImageSet): Promise<void> {
        const col = await this.getCollection();
        await col.replaceOne({ _id: doc._id }, doc, { upsert: true });
    }

    async addImage(uuid: string, timestamp: string, meta: BatchMeta, imageId: string): Promise<void> {
        const col = await this.getCollection();
        await col.updateOne(
            { _id: `${uuid}:${timestamp}` },
            {
                $setOnInsert: { uuid, timestamp, title: meta.title, projectHandle: meta.projectHandle },
                $addToSet: { image_ids: imageId },
            },
            { upsert: true }
        );
    }

    async findByProject(projectHandle: string): Promise<ImageSet[]> {
        const col = await this.getCollection();
        return col.find({ projectHandle }).sort({ timestamp: 1 }).toArray();
    }

    async findById(setId: string): Promise<ImageSet | null> {
        const col = await this.getCollection();
        return col.findOne({ _id: setId });
    }

    async rename(setId: string, title: string): Promise<boolean> {
        const col = await this.getCollection();
        const result = await col.updateOne({ _id: setId }, { $set: { title } });
        return result.matchedCount > 0;
    }

    async removeImage(setId: string, imageId: string): Promise<boolean> {
        const col = await this.getCollection();
        const result = await col.updateOne({ _id: setId }, { $pull: { image_ids: imageId } as any });
        return result.matchedCount > 0;
    }

    async moveImage(fromSetId: string, toSetId: string, imageId: string): Promise<boolean> {
        const col = await this.getCollection();
        const pullResult = await col.updateOne(
            { _id: fromSetId, image_ids: imageId },
            { $pull: { image_ids: imageId } as any }
        );
        if (pullResult.modifiedCount === 0) return false;
        await col.updateOne({ _id: toSetId }, { $addToSet: { image_ids: imageId } });
        return true;
    }
}

export const imageSetRepository = ImageSetRepository.getInstance();
