import React, { useState } from 'react';
import { ArrowRight, Sparkles, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sidebar } from '@/components/Sidebar';
import { Flashcard } from '@/components/Flashcard';

interface Project {
  id: string;
  title: string;
  createdAt: string;
  idea: string;
  prd?: {
    problem: string;
    goal: string;
    features: string;
    metrics: string;
  };
  implementation?: {
    tasks: string;
    techStack: string;
    timeline: string;
  };
}

const Workspace = () => {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      title: 'AI-powered Task Manager',
      createdAt: '2024-01-15',
      idea: 'A task management app that uses AI to automatically prioritize tasks based on deadlines, importance, and user behavior patterns.',
    },
    {
      id: '2', 
      title: 'Social Recipe Platform',
      createdAt: '2024-01-10',
      idea: 'A social platform where users can share recipes, rate them, and get personalized recommendations based on dietary preferences.',
    }
  ]);
  
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [currentIdea, setCurrentIdea] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<'prd' | 'implementation'>('prd');

  const handleNewProject = () => {
    setSelectedProjectId('');
    setCurrentProject(null);
    setCurrentIdea('');
  };

  const handleSelectProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setSelectedProjectId(projectId);
      setCurrentProject(project);
      setCurrentIdea(project.idea);
    }
  };

  const generatePRD = async () => {
    if (!currentIdea.trim()) return;
    
    setIsGenerating(true);
    
    // Mock PRD generation
    setTimeout(() => {
      const newPRD = {
        problem: `Users struggle with task management because current solutions don't understand context and priority. This leads to decreased productivity and missed deadlines.`,
        goal: `Create an intelligent task management system that automatically prioritizes tasks and adapts to user behavior, increasing productivity by 40%.`,
        features: `• AI-powered task prioritization\n• Smart deadline prediction\n• Behavioral pattern analysis\n• Cross-platform synchronization\n• Voice task creation\n• Integration with calendar and email`,
        metrics: `• User productivity increase: 40%\n• Task completion rate: 85%\n• Daily active users: 10,000+\n• User retention (30-day): 70%\n• Average session time: 15 minutes`
      };

      if (currentProject) {
        const updatedProject = { ...currentProject, prd: newPRD };
        setCurrentProject(updatedProject);
        setProjects(prev => prev.map(p => p.id === currentProject.id ? updatedProject : p));
      } else {
        const newProject: Project = {
          id: Date.now().toString(),
          title: currentIdea.slice(0, 50) + (currentIdea.length > 50 ? '...' : ''),
          createdAt: new Date().toISOString(),
          idea: currentIdea,
          prd: newPRD
        };
        setProjects(prev => [newProject, ...prev]);
        setCurrentProject(newProject);
        setSelectedProjectId(newProject.id);
      }
      
      setIsGenerating(false);
    }, 2000);
  };

  const generateImplementation = async () => {
    if (!currentProject?.prd) return;
    
    setIsGenerating(true);
    
    // Mock implementation generation
    setTimeout(() => {
      const newImplementation = {
        tasks: `Phase 1 (Weeks 1-4):\n• Set up development environment\n• Design database schema\n• Create user authentication system\n• Build basic task CRUD operations\n\nPhase 2 (Weeks 5-8):\n• Implement AI prioritization engine\n• Add behavioral tracking\n• Create mobile responsive UI\n• Integrate third-party APIs`,
        techStack: `Frontend:\n• React with TypeScript\n• Tailwind CSS\n• React Query for state management\n\nBackend:\n• Node.js with Express\n• PostgreSQL database\n• Redis for caching\n• TensorFlow.js for AI features\n\nInfrastructure:\n• AWS for hosting\n• Docker for containerization\n• GitHub Actions for CI/CD`,
        timeline: `Total Duration: 12 weeks\n\nWeek 1-2: Project setup & planning\nWeek 3-6: Core functionality development\nWeek 7-9: AI features implementation\nWeek 10-11: Testing & optimization\nWeek 12: Deployment & launch preparation\n\nTeam: 2 frontend developers, 1 backend developer, 1 AI/ML engineer`
      };

      const updatedProject = { ...currentProject, implementation: newImplementation };
      setCurrentProject(updatedProject);
      setProjects(prev => prev.map(p => p.id === currentProject.id ? updatedProject : p));
      setActiveTab('implementation');
      setIsGenerating(false);
    }, 2000);
  };

  const downloadPanel = () => {
    // Placeholder for download functionality
    console.log(`Downloading ${activeTab} panel content...`);
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        projects={projects}
        onSelectProject={handleSelectProject}
        onNewProject={handleNewProject}
        selectedProjectId={selectedProjectId}
      />
      
      <main className="flex-1 overflow-hidden">
        {/* Figma-style Canvas with dotted grid */}
        <div className="h-full bg-background relative overflow-auto" 
             style={{
               backgroundImage: 'radial-gradient(circle, hsl(var(--muted-foreground) / 0.15) 1px, transparent 1px)',
               backgroundSize: '20px 20px'
             }}>
          
          <div className="max-w-4xl mx-auto p-8">
            {/* Hero Section */}
            <div className="text-center py-12">
              <h1 className="text-3xl font-bold text-foreground mb-4">
                What's your next big idea?
              </h1>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Describe your product idea in natural language. Our AI will help you create a structured roadmap.
              </p>
            </div>

            {/* Idea Input */}
            <div className="flashcard mb-8">
              <div className="space-y-4">
                <Textarea
                  placeholder="Describe your product idea... (e.g., 'A mobile app that helps people find local restaurants based on their dietary restrictions and preferences')"
                  value={currentIdea}
                  onChange={(e) => setCurrentIdea(e.target.value)}
                  className="min-h-[120px] text-base"
                />
                <Button 
                  onClick={generatePRD}
                  variant="gradient"
                  disabled={!currentIdea.trim() || isGenerating}
                  className="w-full sm:w-auto"
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Write to Create
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Slider Tabs and Content */}
            {currentProject?.prd && (
              <div className="space-y-6">
                {/* Tab Navigation */}
                <div className="flex items-center justify-between">
                  <div className="flex bg-muted rounded-lg p-1">
                    <button
                      onClick={() => setActiveTab('prd')}
                      className={`px-4 py-2 rounded-md transition-all ${
                        activeTab === 'prd' 
                          ? 'bg-background text-foreground shadow-sm' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      PRD
                    </button>
                    <button
                      onClick={() => setActiveTab('implementation')}
                      disabled={!currentProject?.implementation}
                      className={`px-4 py-2 rounded-md transition-all ${
                        activeTab === 'implementation' 
                          ? 'bg-background text-foreground shadow-sm' 
                          : 'text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed'
                      }`}
                    >
                      Implementation Plan
                    </button>
                  </div>

                  {/* Download Button */}
                  <Button 
                    onClick={downloadPanel}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>

                {/* Panel Content with Slide Animation */}
                <div className="relative overflow-hidden">
                  {/* PRD Panel */}
                  <div className={`transition-transform duration-300 ease-in-out ${
                    activeTab === 'prd' ? 'translate-x-0' : '-translate-x-full absolute top-0 left-0 w-full'
                  }`}>
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold text-foreground">Product Requirements Document</h2>
                      
                      <Flashcard
                        title="Problem Statement"
                        content={currentProject.prd.problem}
                        onEdit={(newContent) => {
                          if (currentProject) {
                            const updated = { ...currentProject, prd: { ...currentProject.prd!, problem: newContent }};
                            setCurrentProject(updated);
                            setProjects(prev => prev.map(p => p.id === currentProject.id ? updated : p));
                          }
                        }}
                      />
                      
                      <Flashcard
                        title="Goal & Vision"
                        content={currentProject.prd.goal}
                        onEdit={(newContent) => {
                          if (currentProject) {
                            const updated = { ...currentProject, prd: { ...currentProject.prd!, goal: newContent }};
                            setCurrentProject(updated);
                            setProjects(prev => prev.map(p => p.id === currentProject.id ? updated : p));
                          }
                        }}
                      />
                      
                      <Flashcard
                        title="Core Features"
                        content={currentProject.prd.features}
                        onEdit={(newContent) => {
                          if (currentProject) {
                            const updated = { ...currentProject, prd: { ...currentProject.prd!, features: newContent }};
                            setCurrentProject(updated);
                            setProjects(prev => prev.map(p => p.id === currentProject.id ? updated : p));
                          }
                        }}
                      />
                      
                      <Flashcard
                        title="Success Metrics"
                        content={currentProject.prd.metrics}
                        onEdit={(newContent) => {
                          if (currentProject) {
                            const updated = { ...currentProject, prd: { ...currentProject.prd!, metrics: newContent }};
                            setCurrentProject(updated);
                            setProjects(prev => prev.map(p => p.id === currentProject.id ? updated : p));
                          }
                        }}
                      />

                      {!currentProject.implementation && (
                        <div className="flex justify-center">
                          <Button 
                            onClick={generateImplementation}
                            variant="gradient"
                            disabled={isGenerating}
                            className="flex items-center gap-2"
                          >
                            Generate MVP Implementation Plan
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Implementation Plan Panel */}
                  {currentProject?.implementation && (
                    <div className={`transition-transform duration-300 ease-in-out ${
                      activeTab === 'implementation' ? 'translate-x-0' : 'translate-x-full absolute top-0 left-0 w-full'
                    }`}>
                      <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-foreground">Implementation Plan</h2>
                        
                        <Flashcard
                          title="Development Tasks"
                          content={currentProject.implementation.tasks}
                          onEdit={(newContent) => {
                            if (currentProject) {
                              const updated = { ...currentProject, implementation: { ...currentProject.implementation!, tasks: newContent }};
                              setCurrentProject(updated);
                              setProjects(prev => prev.map(p => p.id === currentProject.id ? updated : p));
                            }
                          }}
                        />
                        
                        <Flashcard
                          title="Technology Stack"
                          content={currentProject.implementation.techStack}
                          onEdit={(newContent) => {
                            if (currentProject) {
                              const updated = { ...currentProject, implementation: { ...currentProject.implementation!, techStack: newContent }};
                              setCurrentProject(updated);
                              setProjects(prev => prev.map(p => p.id === currentProject.id ? updated : p));
                            }
                          }}
                        />
                        
                        <Flashcard
                          title="Timeline & Resources"
                          content={currentProject.implementation.timeline}
                          onEdit={(newContent) => {
                            if (currentProject) {
                              const updated = { ...currentProject, implementation: { ...currentProject.implementation!, timeline: newContent }};
                              setCurrentProject(updated);
                              setProjects(prev => prev.map(p => p.id === currentProject.id ? updated : p));
                            }
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Workspace;