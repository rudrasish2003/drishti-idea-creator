import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sidebar } from '@/components/Sidebar';
import { Flashcard } from '@/components/Flashcard';
import { useProjects } from '@/contexts/ProjectsContext';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { toast } from 'sonner';

const Workspace = () => {
  const { 
    projects, 
    currentProject, 
    isLoading, 
    fetchProjects, 
    createProject, 
    generatePRD, 
    generateImplementationPlan,
    setCurrentProject 
  } = useProjects();
  const { user } = useAuth();
  
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [currentIdea, setCurrentIdea] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'prd' | 'implementation'>('prd');

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Debug logging
  useEffect(() => {
    if (currentProject) {
      console.log('Current project:', currentProject);
      console.log('Has PRD:', !!currentProject.prd);
      console.log('Has Implementation Plan:', !!currentProject.implementationPlan);
    }
  }, [currentProject]);

  const handleNewProject = () => {
    setSelectedProjectId('');
    setCurrentProject(null);
    setCurrentIdea('');
  };

  const handleSelectProject = (projectId: string) => {
    const project = projects.find(p => p._id === projectId);
    if (project) {
      setSelectedProjectId(projectId);
      setCurrentProject(project);
      setCurrentIdea(project.idea);
    }
  };

  const handleGeneratePRD = async () => {
    if (!currentIdea.trim()) return;
    
    setIsGenerating(true);
    
    try {
      if (currentProject) {
        // Generate PRD for existing project
        await generatePRD(currentProject._id);
        toast.success('PRD generated successfully!');
        console.log('PRD generated for existing project');
      } else {
        // Create new project and generate PRD
        const newProject = await createProject(
          currentIdea.slice(0, 50) + (currentIdea.length > 50 ? '...' : ''),
          currentIdea
        );
        setCurrentProject(newProject);
        setSelectedProjectId(newProject._id);
        
        // Generate PRD for the new project
        await generatePRD(newProject._id);
        toast.success('Project created and PRD generated successfully!');
        console.log('PRD generated for new project');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate PRD');
      console.error('PRD generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateImplementation = async () => {
    if (!currentProject?._id) {
      toast.error('No project selected');
      return;
    }
    
    if (!currentProject?.prd) {
      toast.error('Please generate PRD first');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      await generateImplementationPlan(currentProject._id);
      await fetchProjects(); // Refresh projects to get updated data
      toast.success('Implementation plan generated successfully!');
      setActiveTab('implementation');
    } catch (error: any) {
      console.error('Implementation generation error:', error);
      toast.error(error.message || 'Failed to generate implementation plan');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (type: 'prd' | 'plan' | 'complete', format?: 'markdown' | 'pdf') => {
    if (!currentProject) return;
    
    try {
      if (type === 'complete') {
        await apiService.downloadCompleteProject(currentProject._id);
        toast.success('Complete project downloaded!');
      } else if (type === 'prd') {
        if (format === 'markdown') {
          await apiService.downloadPRDMarkdown(currentProject._id);
        } else {
          await apiService.downloadPRDPDF(currentProject._id);
        }
        toast.success(`PRD ${format} downloaded!`);
      } else if (type === 'plan') {
        if (format === 'markdown') {
          await apiService.downloadPlanMarkdown(currentProject._id);
        } else {
          await apiService.downloadPlanPDF(currentProject._id);
        }
        toast.success(`Implementation plan ${format} downloaded!`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Download failed');
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        projects={projects}
        onSelectProject={handleSelectProject}
        onNewProject={handleNewProject}
        selectedProjectId={selectedProjectId}
      />
      
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Main Canvas Area */}
        <div className="flex-1 bg-background relative overflow-auto" 
             style={{
               backgroundImage: 'radial-gradient(circle, hsl(var(--muted-foreground) / 0.08) 1px, transparent 1px)',
               backgroundSize: '24px 24px'
             }}>
          
          {/* Content Area */}
          <div className="min-h-full flex flex-col">
            {/* Generated Content Area */}
            {currentProject?.prd ? (
              <div className="flex-1 max-w-5xl mx-auto p-6 animate-fade-in">
                {/* Tab Navigation */}
                <div className="flex items-center justify-between mb-8 sticky top-6 z-10">
                  <div className="flex bg-background/80 backdrop-blur-sm rounded-xl p-1 border border-border/50 shadow-lg">
                    <button
                      onClick={() => setActiveTab('prd')}
                      className={`px-6 py-3 rounded-lg transition-all duration-200 font-medium ${
                        activeTab === 'prd' 
                          ? 'bg-primary text-primary-foreground shadow-md' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      PRD
                    </button>
                    <button
                      onClick={() => setActiveTab('implementation')}
                      disabled={!currentProject?.implementationPlan}
                      className={`px-6 py-3 rounded-lg transition-all duration-200 font-medium ${
                        activeTab === 'implementation' 
                          ? 'bg-primary text-primary-foreground shadow-md' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-40 disabled:cursor-not-allowed'
                      }`}
                    >
                      Implementation Plan
                    </button>
                  </div>

                  {/* Download Buttons */}
                  <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-xl p-1 border border-border/50 shadow-lg">
                    {activeTab === 'prd' ? (
                      <>
                        <Button 
                          onClick={() => handleDownload('prd', 'markdown')}
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-2 hover:bg-muted/50"
                        >
                          <Download className="h-4 w-4" />
                          PRD MD
                        </Button>
                        <Button 
                          onClick={() => handleDownload('prd', 'pdf')}
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-2 hover:bg-muted/50"
                        >
                          <Download className="h-4 w-4" />
                          PRD PDF
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          onClick={() => handleDownload('plan', 'markdown')}
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-2 hover:bg-muted/50"
                        >
                          <Download className="h-4 w-4" />
                          Plan MD
                        </Button>
                        <Button 
                          onClick={() => handleDownload('plan', 'pdf')}
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-2 hover:bg-muted/50"
                        >
                          <Download className="h-4 w-4" />
                          Plan PDF
                        </Button>
                      </>
                    )}
                    <Button 
                      onClick={() => handleDownload('complete')}
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2 hover:bg-muted/50"
                    >
                      <Download className="h-4 w-4" />
                      Complete
                    </Button>
                  </div>
                </div>

                {/* Panel Content with Slide Animation */}
                <div className="relative overflow-hidden">
                  {/* PRD Panel */}
                  <div className={`transition-all duration-500 ease-out ${
                    activeTab === 'prd' ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 absolute top-0 left-0 w-full'
                  }`}>
                    <div className="space-y-6 pb-8">
                      <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-foreground mb-2">Product Requirements Document</h1>
                        <div className="w-24 h-1 bg-gradient-primary mx-auto rounded-full"></div>
                      </div>
                      
                      <div className="grid gap-6">
                        <Flashcard
                          title="Overview"
                          content={currentProject.prd.content?.overview || 'No overview available'}
                          onEdit={(newContent) => {
                            console.log('Edit overview:', newContent);
                          }}
                        />
                        
                        <Flashcard
                          title="Objectives"
                          content={Array.isArray(currentProject.prd.content?.objectives) 
                            ? currentProject.prd.content.objectives.join('\n• ') 
                            : 'No objectives available'}
                          onEdit={(newContent) => {
                            console.log('Edit objectives:', newContent);
                          }}
                        />
                        
                        <Flashcard
                          title="Target Audience"
                          content={`Primary: ${currentProject.prd.content?.targetAudience?.primary || 'Not specified'}\nSecondary: ${currentProject.prd.content?.targetAudience?.secondary || 'Not specified'}`}
                          onEdit={(newContent) => {
                            console.log('Edit target audience:', newContent);
                          }}
                        />
                        
                        <Flashcard
                          title="Core Features"
                          content={Array.isArray(currentProject.prd.content?.features) 
                            ? currentProject.prd.content.features.map((f: any) => `• ${f.name}: ${f.description}`).join('\n')
                            : 'No features available'}
                          onEdit={(newContent) => {
                            console.log('Edit features:', newContent);
                          }}
                        />
                        
                        <Flashcard
                          title="Success Metrics"
                          content={Array.isArray(currentProject.prd.content?.successMetrics) 
                            ? currentProject.prd.content.successMetrics.join('\n• ')
                            : 'No success metrics available'}
                          onEdit={(newContent) => {
                            console.log('Edit success metrics:', newContent);
                          }}
                        />

                        {/* Generate Implementation Plan Button */}
                        <div className="flex justify-center pt-6">
                          <Button 
                            onClick={handleGenerateImplementation}
                            variant="gradient"
                            disabled={isGenerating}
                            className="px-8 py-3 text-lg hover-scale"
                          >
                            {isGenerating ? (
                              <>
                                <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                                Generating Implementation Plan...
                              </>
                            ) : currentProject?.implementationPlan ? (
                              <>
                                View Implementation Plan
                                <ArrowRight className="ml-2 h-5 w-5" />
                              </>
                            ) : (
                              <>
                                Generate MVP Implementation Plan
                                <ArrowRight className="ml-2 h-5 w-5" />
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Implementation Plan Panel */}
                  {currentProject?.implementationPlan && (
                    <div className={`transition-all duration-500 ease-out ${
                      activeTab === 'implementation' ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 absolute top-0 left-0 w-full'
                    }`}>
                      <div className="space-y-6 pb-8">
                        <div className="text-center mb-8">
                          <h1 className="text-3xl font-bold text-foreground mb-2">Implementation Plan</h1>
                          <div className="w-24 h-1 bg-gradient-primary mx-auto rounded-full"></div>
                        </div>
                        
                        <div className="grid gap-6">
                          <Flashcard
                            title="Project Setup"
                            content={`Tech Stack:\n${JSON.stringify(currentProject.implementationPlan.content?.projectSetup?.techStack, null, 2)}\n\nProject Structure:\n${Array.isArray(currentProject.implementationPlan.content?.projectSetup?.projectStructure) 
                              ? currentProject.implementationPlan.content.projectSetup.projectStructure.join('\n• ')
                              : 'No project structure available'}`}
                            onEdit={(newContent) => {
                              console.log('Edit project setup:', newContent);
                            }}
                          />
                          
                          <Flashcard
                            title="Development Phases"
                            content={Array.isArray(currentProject.implementationPlan.content?.developmentPhases) 
                              ? currentProject.implementationPlan.content.developmentPhases.map((phase: any) => 
                                  `${phase.phase} (${phase.duration})\n${Array.isArray(phase.tasks) ? phase.tasks.map((task: any) => `• ${task.task}: ${task.description}`).join('\n') : 'No tasks'}\n`
                                ).join('\n')
                              : 'No development phases available'}
                            onEdit={(newContent) => {
                              console.log('Edit development phases:', newContent);
                            }}
                          />
                          
                          <Flashcard
                            title="API Design"
                            content={Array.isArray(currentProject.implementationPlan.content?.apiDesign?.endpoints) 
                              ? currentProject.implementationPlan.content.apiDesign.endpoints.map((endpoint: any) => 
                                  `${endpoint.method} ${endpoint.path}\n${endpoint.description}\nAuth: ${endpoint.authentication}\n`
                                ).join('\n')
                              : 'No API design available'}
                            onEdit={(newContent) => {
                              console.log('Edit API design:', newContent);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Empty State */
              <div className="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto p-8">
                <div className="text-center animate-fade-in">
                  <div className="w-32 h-32 bg-gradient-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
                    <Sparkles className="w-16 h-16 text-primary" />
                  </div>
                  <h1 className="text-4xl font-bold text-foreground mb-4">
                    What's your next big idea?
                  </h1>
                  <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
                    Describe your product idea in natural language. Our AI will help you create a structured roadmap.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Input Area at Bottom */}
        <div className="border-t border-border/50 bg-background/95 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto p-6">
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-xl">
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <label className="text-sm font-medium text-foreground">
                    {currentProject ? 'Refine your idea or create a new one' : 'Describe your product idea'}
                  </label>
                </div>
                <Textarea
                  placeholder="Make a website for ecommerce..."
                  value={currentIdea}
                  onChange={(e) => setCurrentIdea(e.target.value)}
                  className="min-h-[100px] text-base resize-none border-border/50 focus:border-primary/50 bg-background/50"
                />
                <div className="flex justify-between items-center">
                  <div className="text-xs text-muted-foreground">
                    {currentIdea.length}/1000 characters
                  </div>
                  <Button 
                    onClick={handleGeneratePRD}
                    variant="gradient"
                    disabled={!currentIdea.trim() || isGenerating}
                    className="px-8 py-2.5 hover-scale"
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
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Workspace;