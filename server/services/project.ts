import fs from 'fs';
import { PROJECTS_FILE } from '../config';

export type Project = {
    name: string;
    handle: string;
};

type ProjectsMap = Record<string, Project>;

class ProjectService {
    private static instance: ProjectService;
    private projects: ProjectsMap;

    private constructor() {
        this.projects = JSON.parse(fs.readFileSync(PROJECTS_FILE, 'utf-8'));
    }

    static getInstance(): ProjectService {
        if (!ProjectService.instance) ProjectService.instance = new ProjectService();
        return ProjectService.instance;
    }

    findByPassword(password: string): Project | null {
        return this.projects[password] ?? null;
    }
}

export const projectService = ProjectService.getInstance();
