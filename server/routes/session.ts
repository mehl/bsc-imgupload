import { Hono } from 'hono'
import { projectService } from '../services/project'
import { sessionService } from '../services/session'

export const sessionRouter = new Hono()

sessionRouter.post('/', (c) => {
    const password = c.req.query('password') ?? ''
    const project = projectService.findByPassword(password)
    if (!project) return c.json({ error: 'Ungültiger Code.' }, 401)
    const { sessionId } = sessionService.create(project)
    return c.json({ sessionId })
})
