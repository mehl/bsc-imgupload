import { Router } from 'express';
import { projectService } from '../services/project';
import { sessionService } from '../services/session';

export const sessionRouter = Router();

sessionRouter.post('/', (req, res) => {
  const password = (req.query.password as string) ?? '';
  const project = projectService.findByPassword(password);
  if (!project) {
    res.status(401).json({ error: 'Ungültiger Code.' });
    return;
  }
  const { sessionId } = sessionService.create(project);
  res.json({ sessionId });
});
