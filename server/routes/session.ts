import { Hono } from 'hono'
import { ADMIN_PASSWORD } from '../config'
import { projectService } from '../services/project'
import { sessionService } from '../services/session'

export const sessionRouter = new Hono()

sessionRouter.post('/', (c) => {
    const password = c.req.query('password') ?? ''

    if (ADMIN_PASSWORD && password === ADMIN_PASSWORD) {
        const sessionId = sessionService.createAdmin()
        return c.json({ sessionId, isAdmin: true })
    }

    const project = projectService.findByPassword(password)
    if (!project) return c.json({ error: 'Ungültiger Code.' }, 401)
    const { sessionId } = sessionService.create(project)
    return c.json({ sessionId, isAdmin: false })
})
