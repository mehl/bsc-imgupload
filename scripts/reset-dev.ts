import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/imgupload';
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');

async function resetDev() {
    const client = new MongoClient(MONGODB_URI);
    try {
        await client.connect();
        const db = client.db();
        await db.collection('images').deleteMany({});
        console.log('[reset] collection "images" cleared');
        await db.collection('image_sets').deleteMany({});
        console.log('[reset] collection "image_sets" cleared');
    } finally {
        await client.close();
    }

    if (fs.existsSync(UPLOAD_DIR)) {
        execSync(`sudo rm -rf ${UPLOAD_DIR}/*`);
        console.log(`[reset] uploads/ cleared`);
    } else {
        console.log(`[reset] uploads/ not found, skipping`);
    }
}

resetDev().catch((err) => { console.error(err); process.exit(1); });
