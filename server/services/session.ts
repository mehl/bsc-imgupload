import { randomUUID } from 'crypto';
import { SESSION_TTL_MS } from '../config';
import { Project } from './project';

export interface Session {
    timestamp: string;
    expiresAt: number;
    project: Project;
}

class SessionService {
    private static instance: SessionService;
    private sessions = new Map<string, Session>();

    private constructor() {
        setInterval(() => {
            const now = Date.now();
            for (const [id, session] of this.sessions) {
                if (session.expiresAt < now) this.sessions.delete(id);
            }
        }, 60_000);
    }

    static getInstance(): SessionService {
        if (!SessionService.instance) SessionService.instance = new SessionService();
        return SessionService.instance;
    }

    create(project: Project): { sessionId: string; timestamp: string } {
        const sessionId = randomUUID();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        this.sessions.set(sessionId, { timestamp, expiresAt: Date.now() + SESSION_TTL_MS, project });
        return { sessionId, timestamp };
    }

    get(sessionId: string): Session | null {
        const session = this.sessions.get(sessionId);
        if (!session || session.expiresAt < Date.now()) {
            this.sessions.delete(sessionId);
            return null;
        }
        return session;
    }

    refresh(sessionId: string): void {
        const session = this.sessions.get(sessionId);
        if (session) session.expiresAt = Date.now() + SESSION_TTL_MS;
    }
}

export const sessionService = SessionService.getInstance();
