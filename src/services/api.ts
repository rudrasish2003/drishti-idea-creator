// API Configuration
import { config } from '../config/env';

const API_BASE_URL = config.API_BASE_URL;

// Types
export interface User {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface Project {
  _id: string;
  title: string;
  idea: string;
  status: 'draft' | 'prd_generated' | 'plan_generated' | 'completed';
  owner: string;
  prd?: {
    version: number;
    content: any;
    generatedAt: string;
  };
  implementationPlan?: {
    version: number;
    content: any;
    generatedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProjectsResponse {
  projects: Project[];
  pagination: {
    current: number;
    pages: number;
    total: number;
  };
}

export interface ProjectResponse {
  project: Project;
}

// API Service Class
class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('authToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // Build a friendly error message from common server shapes
        let msg = errorData.error || errorData.message || '';
        if (!msg && errorData.details) {
          if (Array.isArray(errorData.details)) {
            // express-validator: details is an array of { msg, param }
            msg = errorData.details.map((d: any) => d.msg || JSON.stringify(d)).join('; ');
          } else if (typeof errorData.details === 'string') {
            msg = errorData.details;
          }
        }
        if (!msg) msg = `HTTP error! status: ${response.status}`;

        const error: any = new Error(msg);
        error.status = response.status;
        error.body = errorData;
        throw error;
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  private async downloadFile(endpoint: string, filename: string): Promise<void> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('File download failed:', error);
      throw error;
    }
  }

  // Authentication Methods
  async register(userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    this.setToken(response.token);
    return response;
  }

  async login(credentials: {
    username: string;
    password: string;
  }): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    this.setToken(response.token);
    return response;
  }

  async getCurrentUser(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/auth/me');
  }

  // Project Methods
  async getProjects(page: number = 1, limit: number = 10): Promise<ProjectsResponse> {
    return this.request<ProjectsResponse>(`/projects?page=${page}&limit=${limit}`);
  }

  async getProject(id: string): Promise<ProjectResponse> {
    return this.request<ProjectResponse>(`/projects/${id}`);
  }

  async createProject(projectData: {
    title: string;
    idea: string;
  }): Promise<{ message: string; project: Project }> {
    return this.request<{ message: string; project: Project }>('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async updateProject(id: string, projectData: {
    title: string;
    idea: string;
  }): Promise<{ message: string; project: Project }> {
    return this.request<{ message: string; project: Project }>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  }

  async deleteProject(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // Account methods
  async deleteAccount(): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/auth/me`, {
      method: 'DELETE',
    });
  }

  // AI Generation Methods
  async generatePRD(projectId: string): Promise<{
    message: string;
    prd: {
      version: number;
      content: any;
      generatedAt: string;
    };
  }> {
    return this.request<{
      message: string;
      prd: {
        version: number;
        content: any;
        generatedAt: string;
      };
    }>(`/projects/${projectId}/generate-prd`, {
      method: 'POST',
    });
  }

  async generateImplementationPlan(projectId: string): Promise<{
    message: string;
    implementationPlan: {
      version: number;
      content: any;
      generatedAt: string;
    };
  }> {
    return this.request<{
      message: string;
      implementationPlan: {
        version: number;
        content: any;
        generatedAt: string;
      };
    }>(`/projects/${projectId}/generate-plan`, {
      method: 'POST',
    });
  }

  // Export Methods
  async downloadPRDMarkdown(projectId: string): Promise<void> {
    return this.downloadFile(`/exports/${projectId}/prd/markdown`, 'PRD.md');
  }

  async downloadPRDPDF(projectId: string): Promise<void> {
    return this.downloadFile(`/exports/${projectId}/prd/pdf`, 'PRD.pdf');
  }

  async downloadPlanMarkdown(projectId: string): Promise<void> {
    return this.downloadFile(`/exports/${projectId}/plan/markdown`, 'Implementation_Plan.md');
  }

  async downloadPlanPDF(projectId: string): Promise<void> {
    return this.downloadFile(`/exports/${projectId}/plan/pdf`, 'Implementation_Plan.pdf');
  }

  async downloadCompleteProject(projectId: string): Promise<void> {
    return this.downloadFile(`/exports/${projectId}/complete`, 'project.zip');
  }

  // Token Management
  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  clearToken(): void {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

// Create and export singleton instance
export const apiService = new ApiService();
export default apiService;
