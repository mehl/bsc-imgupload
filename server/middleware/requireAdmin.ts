import { MiddlewareHandler } from 'hono';
import { sessionService } from '../services/session';

export const requireAdmin: MiddlewareHandler = async (c, next) => {
    const auth = c.req.header('Authorization') ?? '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token || !sessionService.isAdmin(token)) {
        return c.json({ error: 'Unauthorized' }, 401);
    }
    return next();
};
