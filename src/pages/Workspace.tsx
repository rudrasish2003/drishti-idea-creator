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
                  onClick={handleGeneratePRD}
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
                      disabled={!currentProject?.implementationPlan}
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
                  <div className="flex items-center gap-2">
                    {activeTab === 'prd' ? (
                      <>
                        <Button 
                          onClick={() => handleDownload('prd', 'markdown')}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          PRD MD
                        </Button>
                        <Button 
                          onClick={() => handleDownload('prd', 'pdf')}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          PRD PDF
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          onClick={() => handleDownload('plan', 'markdown')}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Plan MD
                        </Button>
                        <Button 
                          onClick={() => handleDownload('plan', 'pdf')}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Plan PDF
                        </Button>
                      </>
                    )}
                    <Button 
                      onClick={() => handleDownload('complete')}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Complete
                    </Button>
                  </div>
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
                        title="Overview"
                        content={currentProject.prd.content?.overview || 'No overview available'}
                        onEdit={(newContent) => {
                          // TODO: Implement PRD content editing
                          console.log('Edit overview:', newContent);
                        }}
                      />
                      
                      <Flashcard
                        title="Objectives"
                        content={Array.isArray(currentProject.prd.content?.objectives) 
                          ? currentProject.prd.content.objectives.join('\n• ') 
                          : 'No objectives available'}
                        onEdit={(newContent) => {
                          // TODO: Implement PRD content editing
                          console.log('Edit objectives:', newContent);
                        }}
                      />
                      
                      <Flashcard
                        title="Target Audience"
                        content={`Primary: ${currentProject.prd.content?.targetAudience?.primary || 'Not specified'}\nSecondary: ${currentProject.prd.content?.targetAudience?.secondary || 'Not specified'}`}
                        onEdit={(newContent) => {
                          // TODO: Implement PRD content editing
                          console.log('Edit target audience:', newContent);
                        }}
                      />
                      
                      <Flashcard
                        title="Core Features"
                        content={Array.isArray(currentProject.prd.content?.features) 
                          ? currentProject.prd.content.features.map((f: any) => `• ${f.name}: ${f.description}`).join('\n')
                          : 'No features available'}
                        onEdit={(newContent) => {
                          // TODO: Implement PRD content editing
                          console.log('Edit features:', newContent);
                        }}
                      />
                      
                      <Flashcard
                        title="Success Metrics"
                        content={Array.isArray(currentProject.prd.content?.successMetrics) 
                          ? currentProject.prd.content.successMetrics.join('\n• ')
                          : 'No success metrics available'}
                        onEdit={(newContent) => {
                          // TODO: Implement PRD content editing
                          console.log('Edit success metrics:', newContent);
                        }}
                      />

                      {/* Debug info */}
                      <div className="text-xs text-muted-foreground mb-4 p-2 bg-muted rounded">
                        Debug: Has PRD: {currentProject?.prd ? 'Yes' : 'No'}, 
                        Has Implementation Plan: {currentProject?.implementationPlan ? 'Yes' : 'No'}
                      </div>
                      
                      {currentProject?.prd && (
                        <div className="flex justify-center">
                          <Button 
                            onClick={handleGenerateImplementation}
                            variant="gradient"
                            disabled={isGenerating}
                            className="flex items-center gap-2"
                          >
                            {isGenerating ? (
                              <>
                                <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                                Generating Implementation Plan...
                              </>
                            ) : currentProject?.implementationPlan ? (
                              <>
                                View Implementation Plan
                                <ArrowRight className="h-4 w-4" />
                              </>
                            ) : (
                              <>
                                Generate MVP Implementation Plan
                                <ArrowRight className="h-4 w-4" />
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Implementation Plan Panel */}
                  {currentProject?.implementationPlan && (
                    <div className={`transition-transform duration-300 ease-in-out ${
                      activeTab === 'implementation' ? 'translate-x-0' : 'translate-x-full absolute top-0 left-0 w-full'
                    }`}>
                      <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-foreground">Implementation Plan</h2>
                        
                        <Flashcard
                          title="Project Setup"
                          content={`Tech Stack:\n${JSON.stringify(currentProject.implementationPlan.content?.projectSetup?.techStack, null, 2)}\n\nProject Structure:\n${Array.isArray(currentProject.implementationPlan.content?.projectSetup?.projectStructure) 
                            ? currentProject.implementationPlan.content.projectSetup.projectStructure.join('\n• ')
                            : 'No project structure available'}`}
                          onEdit={(newContent) => {
                            // TODO: Implement implementation plan content editing
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
                            // TODO: Implement implementation plan content editing
                            console.log('Edit development phases:', newContent);
                          }}
                        />
                        
                        <Flashcard
                          title="API Design"
                          content={Array.isArray(currentProject.implementationPlan.content?.apiDesign) 
                            ? currentProject.implementationPlan.content.apiDesign.map((api: any) => 
                                `${api.endpoint}\nDescription: ${api.description}\nParameters: ${Array.isArray(api.parameters) ? api.parameters.join(', ') : 'None'}\nResponse: ${api.response}\n`
                              ).join('\n')
                            : 'No API design available'}
                          onEdit={(newContent) => {
                            // TODO: Implement implementation plan content editing
                            console.log('Edit API design:', newContent);
                          }}
                        />
                        
                        <Flashcard
                          title="Database Schema"
                          content={Array.isArray(currentProject.implementationPlan.content?.databaseSchema) 
                            ? currentProject.implementationPlan.content.databaseSchema.map((schema: any) => 
                                `${schema.table}\nFields: ${Array.isArray(schema.fields) ? schema.fields.join(', ') : 'None'}\nRelationships: ${Array.isArray(schema.relationships) ? schema.relationships.join(', ') : 'None'}\n`
                              ).join('\n')
                            : 'No database schema available'}
                          onEdit={(newContent) => {
                            // TODO: Implement implementation plan content editing
                            console.log('Edit database schema:', newContent);
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