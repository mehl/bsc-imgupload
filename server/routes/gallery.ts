import { Hono } from 'hono'
import { imageSetRepository } from '../services/ImageSetRepository'
import { imageDocumentRepository } from '../services/ImageDocumentRepository'
import { BASE_URL } from '../config'

export const galleryRouter = new Hono()

galleryRouter.get('/:projectHandle', async (c) => {
    const { projectHandle } = c.req.param()

    const sets = await imageSetRepository.findByProject(projectHandle)

    const result = await Promise.all(sets.map(async (set) => {
        const images = await imageDocumentRepository.findByIds(set.image_ids)
        return {
            id: set._id,
            title: set.title,
            timestamp: set.timestamp,
            images: images.map(img => ({
                id: img._id,
                originalName: img.originalName,
                uploadedAt: img.uploadedAt,
                thumb: `${BASE_URL}/api/image/${img.uuid}/${img.timestamp}/${img.fileId}/300`,
                large: `${BASE_URL}/api/image/${img.uuid}/${img.timestamp}/${img.fileId}/3840`,
            })),
        }
    }))

    return c.json({ projectHandle, sets: result })
})
