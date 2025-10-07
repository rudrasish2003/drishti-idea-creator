import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Project, apiService } from '../services/api';

interface ProjectsContextType {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
  projectGenerationState: Record<string, boolean>;
  fetchProjects: () => Promise<void>;
  fetchProject: (id: string) => Promise<void>;
  createProject: (title: string, idea: string) => Promise<Project>;
  updateProject: (id: string, title: string, idea: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  generatePRD: (projectId: string) => Promise<void>;
  generateImplementationPlan: (projectId: string) => Promise<void>;
  setCurrentProject: (project: Project | null) => void;
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

interface ProjectsProviderProps {
  children: ReactNode;
}

export const ProjectsProvider: React.FC<ProjectsProviderProps> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectGenerationState, setProjectGenerationState] = useState<Record<string, boolean>>({});

  const setProjectGenerating = (projectId: string, generating: boolean) => {
    setProjectGenerationState((prev) => ({ ...prev, [projectId]: generating }));
  };

  const fetchProjects = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await apiService.getProjects();
      setProjects(response.projects);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch projects');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchProject = useCallback(async (id: string) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await apiService.getProject(id);
      const project = {
        ...response.project,
        prd: response.project.prd
          ? {
              ...response.project.prd,
              content:
                typeof response.project.prd.content === 'string'
                  ? JSON.parse(response.project.prd.content)
                  : response.project.prd.content,
            }
          : null,
        implementationPlan: response.project.implementationPlan
          ? {
              ...response.project.implementationPlan,
              content:
                typeof response.project.implementationPlan.content === 'string'
                  ? JSON.parse(response.project.implementationPlan.content)
                  : response.project.implementationPlan.content,
            }
          : null,
      };
      setCurrentProject(project);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch project');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createProject = useCallback(async (title: string, idea: string): Promise<Project> => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await apiService.createProject({ title, idea });
      const newProject = response.project;
      setProjects((prev) => [newProject, ...prev]);
      setCurrentProject(newProject);
      return newProject;
    } catch (error: any) {
      setError(error.message || 'Failed to create project');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProject = useCallback(
    async (id: string, title: string, idea: string) => {
      try {
        setError(null);
        setIsLoading(true);
        const response = await apiService.updateProject(id, { title, idea });
        const updatedProject = response.project;
        setProjects((prev) => prev.map((p) => (p._id === id ? updatedProject : p)));
        if (currentProject?._id === id) {
          setCurrentProject(updatedProject);
        }
      } catch (error: any) {
        setError(error.message || 'Failed to update project');
      } finally {
        setIsLoading(false);
      }
    },
    [currentProject]
  );

  const deleteProject = useCallback(
    async (id: string) => {
      try {
        setError(null);
        setIsLoading(true);
        await apiService.deleteProject(id);
        setProjects((prev) => prev.filter((p) => p._id !== id));
        if (currentProject?._id === id) setCurrentProject(null);
      } catch (error: any) {
        setError(error.message || 'Failed to delete project');
      } finally {
        setIsLoading(false);
      }
    },
    [currentProject]
  );

  const generatePRD = useCallback(
    async (projectId: string) => {
      setProjectGenerating(projectId, true);
      try {
        await apiService.generatePRD(projectId);
        const { project } = await apiService.getProject(projectId);
        setProjects((prev) => prev.map((p) => (p._id === projectId ? project : p)));
        if (currentProject?._id === projectId) setCurrentProject(project);
      } catch (error: any) {
        setError(error.message || 'Failed to generate PRD');
      } finally {
        setProjectGenerating(projectId, false);
      }
    },
    [currentProject]
  );

  const generateImplementationPlan = useCallback(
    async (projectId: string) => {
      setProjectGenerating(projectId, true);
      try {
        await apiService.generateImplementationPlan(projectId);
        const { project } = await apiService.getProject(projectId);
        setProjects((prev) => prev.map((p) => (p._id === projectId ? project : p)));
        if (currentProject?._id === projectId) setCurrentProject(project);
      } catch (error: any) {
        setError(error.message || 'Failed to generate implementation plan');
      } finally {
        setProjectGenerating(projectId, false);
      }
    },
    [currentProject]
  );

  const value: ProjectsContextType = {
    projects,
    currentProject,
    isLoading,
    error,
    projectGenerationState,
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
    generatePRD,
    generateImplementationPlan,
    setCurrentProject,
  };

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
};

export const useProjects = (): ProjectsContextType => {
  const context = useContext(ProjectsContext);
  if (!context) throw new Error('useProjects must be used within a ProjectsProvider');
  return context;
};

export default ProjectsProvider;
