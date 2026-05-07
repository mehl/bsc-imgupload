import { Hono } from 'hono';
import { imageSetRepository } from '../services/ImageSetRepository';
import { requireAdmin } from '../middleware/requireAdmin';

export const adminRouter = new Hono();

adminRouter.patch('/gallery/:projectHandle/sets/:setId', requireAdmin, async (c) => {
    const { setId } = c.req.param();
    const body = await c.req.json<{ title?: string }>();
    if (typeof body.title !== 'string' || !body.title.trim()) {
        return c.json({ error: 'title required' }, 400);
    }
    const ok = await imageSetRepository.rename(setId, body.title.trim());
    if (!ok) return c.json({ error: 'Set not found' }, 404);
    return c.json({ success: true });
});

adminRouter.delete('/gallery/:projectHandle/sets/:setId/images/:imageId', requireAdmin, async (c) => {
    const { setId, imageId } = c.req.param();
    const ok = await imageSetRepository.removeImage(setId, imageId);
    if (!ok) return c.json({ error: 'Set not found' }, 404);
    return c.json({ success: true });
});

adminRouter.post('/gallery/:projectHandle/sets/:setId/images/:imageId/move', requireAdmin, async (c) => {
    const { setId, imageId } = c.req.param();
    const body = await c.req.json<{ targetSetId?: string }>();
    if (!body.targetSetId) return c.json({ error: 'targetSetId required' }, 400);
    const ok = await imageSetRepository.moveImage(setId, body.targetSetId, imageId);
    if (!ok) return c.json({ error: 'Image not found in source set' }, 404);
    return c.json({ success: true });
});
