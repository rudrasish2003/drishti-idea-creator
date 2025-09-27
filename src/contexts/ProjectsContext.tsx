import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Project, apiService } from '../services/api';

interface ProjectsContextType {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
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

  const fetchProjects = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await apiService.getProjects();
      setProjects(response.projects);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch projects');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchProject = useCallback(async (id: string) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await apiService.getProject(id);
      setCurrentProject(response.project);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch project');
      throw error;
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
      setProjects(prev => [newProject, ...prev]);
      setCurrentProject(newProject);
      return newProject;
    } catch (error: any) {
      setError(error.message || 'Failed to create project');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProject = useCallback(async (id: string, title: string, idea: string) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await apiService.updateProject(id, { title, idea });
      const updatedProject = response.project;
      
      setProjects(prev => prev.map(p => p._id === id ? updatedProject : p));
      if (currentProject?._id === id) {
        setCurrentProject(updatedProject);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to update project');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentProject]);

  const deleteProject = useCallback(async (id: string) => {
    try {
      setError(null);
      setIsLoading(true);
      await apiService.deleteProject(id);
      
      setProjects(prev => prev.filter(p => p._id !== id));
      if (currentProject?._id === id) {
        setCurrentProject(null);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to delete project');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentProject]);

  const generatePRD = useCallback(async (projectId: string) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await apiService.generatePRD(projectId);
      
      // Update the project with the new PRD
      const updatedProject = await apiService.getProject(projectId);
      const project = updatedProject.project;
      
      setProjects(prev => prev.map(p => p._id === projectId ? project : p));
      if (currentProject?._id === projectId) {
        setCurrentProject(project);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to generate PRD');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentProject]);

  const generateImplementationPlan = useCallback(async (projectId: string) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await apiService.generateImplementationPlan(projectId);
      
      // Update the project with the new implementation plan
      const updatedProject = await apiService.getProject(projectId);
      const project = updatedProject.project;
      
      setProjects(prev => prev.map(p => p._id === projectId ? project : p));
      if (currentProject?._id === projectId) {
        setCurrentProject(project);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to generate implementation plan');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentProject]);

  const value: ProjectsContextType = {
    projects,
    currentProject,
    isLoading,
    error,
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
    generatePRD,
    generateImplementationPlan,
    setCurrentProject,
  };

  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  );
};

export const useProjects = (): ProjectsContextType => {
  const context = useContext(ProjectsContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectsProvider');
  }
  return context;
};

export default ProjectsProvider;
