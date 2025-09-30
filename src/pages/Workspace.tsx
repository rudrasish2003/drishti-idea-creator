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
  const [inputPosition, setInputPosition] = useState<'center' | 'bottom'>('center');
  const [showCards, setShowCards] = useState(false);

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
    setInputPosition('center');
    setShowCards(false);
  };

  const handleSelectProject = (projectId: string) => {
    const project = projects.find(p => p._id === projectId);
    if (project) {
      setSelectedProjectId(projectId);
      setCurrentProject(project);
      setCurrentIdea(project.idea);
      setShowCards(project.prd ? true : false);
      if (project.prd) {
        setInputPosition('bottom');
      }
    }
  };

  const handleGeneratePRD = async () => {
    if (!currentIdea.trim()) return;
    
    setIsGenerating(true);
    setInputPosition('bottom');
    
    try {
      if (currentProject) {
        // Generate PRD for existing project
        await generatePRD(currentProject._id);
        setTimeout(() => setShowCards(true), 500);
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
        setTimeout(() => setShowCards(true), 500);
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

            {/* ChatGPT-style Input Area */}
            <div className={`transition-all duration-300 ease-in-out ${
              inputPosition === 'center' 
                ? 'relative max-w-2xl mx-auto mt-12'
                : 'fixed bottom-0 left-0 right-0 md:left-80 bg-background/95 border-t border-input/10 z-10'
            }`}>
              <div className={`${inputPosition === 'bottom' ? 'max-w-[48rem] mx-auto py-4 px-4' : 'p-3'}`}>
                <div className="relative bg-background rounded-lg">
                  <Textarea
                    placeholder="Describe your product idea..."
                    value={currentIdea}
                    onChange={(e) => setCurrentIdea(e.target.value)}
                    className={`w-full min-h-[20px] max-h-[400px] py-[10px] px-[14px] pr-10 rounded-lg bg-background resize-none overflow-hidden text-[15px] leading-6 border border-black/10 focus:border-black/20 focus:ring-0 ${
                      inputPosition === 'center' ? 'min-h-[100px]' : ''
                    }`}
                    style={{
                      boxShadow: "0 0 0 1px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.03)",
                      transition: "border-color 0.15s ease, box-shadow 0.15s ease"
                    }}
                  />
                  <Button 
                    onClick={handleGeneratePRD}
                    variant="ghost"
                    disabled={!currentIdea.trim() || isGenerating}
                    className={`absolute right-2 bottom-1.5 p-0 w-7 h-7 bg-primary hover:bg-primary/90 disabled:bg-primary/40 text-primary-foreground rounded-[6px] transition-colors flex items-center justify-center`}
                  >
                    {isGenerating ? (
                      <Sparkles className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Slider Tabs and Content - Only show when cards should be visible */}
            {currentProject?.prd && showCards && (
              <div className="space-y-6 animate-fade-in">
                {/* Tab Navigation */}
                <div className="flex items-center justify-between">
                  <div className="flex bg-gradient-to-r from-background to-background/80 backdrop-blur-sm rounded-xl p-1 border border-border/50 shadow-lg">
                    <button
                      onClick={() => setActiveTab('prd')}
                      className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                        activeTab === 'prd' 
                          ? 'bg-primary text-primary-foreground shadow-md scale-105' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                      }`}
                    >
                      📄 PRD
                    </button>
                    <button
                      onClick={() => setActiveTab('implementation')}
                      disabled={!currentProject?.implementationPlan}
                      className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                        activeTab === 'implementation' 
                          ? 'bg-primary text-primary-foreground shadow-md scale-105' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-background/50 disabled:opacity-40 disabled:cursor-not-allowed'
                      }`}
                    >
                      ⚙️ Implementation
                    </button>
                  </div>

                  {/* Single Download Button with Dropdown */}
                  <div className="relative group">
                    <Button 
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background shadow-md"
                    >
                      <Download className="h-4 w-4" />
                      Download
                      <svg className="h-3 w-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </Button>
                    
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 top-full mt-2 w-48 bg-background/95 backdrop-blur-sm border border-border/50 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="p-2 space-y-1">
                        {activeTab === 'prd' ? (
                          <>
                            <button 
                              onClick={() => handleDownload('prd', 'markdown')}
                              className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted/50 transition-colors"
                            >
                              📄 PRD (Markdown)
                            </button>
                            <button 
                              onClick={() => handleDownload('prd', 'pdf')}
                              className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted/50 transition-colors"
                            >
                              📄 PRD (PDF)
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => handleDownload('plan', 'markdown')}
                              className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted/50 transition-colors"
                            >
                              ⚙️ Plan (Markdown)
                            </button>
                            <button 
                              onClick={() => handleDownload('plan', 'pdf')}
                              className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted/50 transition-colors"
                            >
                              ⚙️ Plan (PDF)
                            </button>
                          </>
                        )}
                        <hr className="border-border/50 my-1" />
                        <button 
                          onClick={() => handleDownload('complete')}
                          className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted/50 transition-colors"
                        >
                          📦 Complete Project
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Panel Content with Slide Animation */}
                <div className="relative overflow-hidden">
                  {/* PRD Panel */}
                  <div className={`transition-transform duration-500 ease-in-out ${
                    activeTab === 'prd' ? 'translate-x-0' : '-translate-x-full absolute top-0 left-0 w-full'
                  }`}>
                    <div className="space-y-4">
                      <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                        📄 Product Requirements Document
                      </h2>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <Flashcard
                          title="🎯 Overview"
                          content={currentProject.prd.content?.overview || 'No overview available'}
                          className="bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm border border-border/50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                          onEdit={(newContent) => {
                            // TODO: Implement PRD content editing
                            console.log('Edit overview:', newContent);
                          }}
                        />
                        
                        <Flashcard
                          title="🚀 Objectives"
                          content={Array.isArray(currentProject.prd.content?.objectives) 
                            ? currentProject.prd.content.objectives.join('\n• ') 
                            : 'No objectives available'}
                          className="bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm border border-border/50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                          onEdit={(newContent) => {
                            // TODO: Implement PRD content editing
                            console.log('Edit objectives:', newContent);
                          }}
                        />
                        
                        <Flashcard
                          title="👥 Target Audience"
                          content={`Primary: ${currentProject.prd.content?.targetAudience?.primary || 'Not specified'}\nSecondary: ${currentProject.prd.content?.targetAudience?.secondary || 'Not specified'}`}
                          className="bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm border border-border/50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                          onEdit={(newContent) => {
                            // TODO: Implement PRD content editing
                            console.log('Edit target audience:', newContent);
                          }}
                        />
                        
                        <Flashcard
                          title="⚡ Core Features"
                          content={Array.isArray(currentProject.prd.content?.features) 
                            ? currentProject.prd.content.features.map((f: any) => `• ${f.name}: ${f.description}`).join('\n')
                            : 'No features available'}
                          className="bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm border border-border/50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                          onEdit={(newContent) => {
                            // TODO: Implement PRD content editing
                            console.log('Edit features:', newContent);
                          }}
                        />
                      </div>
                      
                      <Flashcard
                        title="📊 Success Metrics"
                        content={Array.isArray(currentProject.prd.content?.successMetrics) 
                          ? currentProject.prd.content.successMetrics.join('\n• ')
                          : 'No success metrics available'}
                        className="bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm border border-border/50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                        onEdit={(newContent) => {
                          // TODO: Implement PRD content editing
                          console.log('Edit success metrics:', newContent);
                        }}
                      />

                      
                      {currentProject?.prd && (
                        <div className="flex justify-center mt-8">
                          <Button 
                            onClick={handleGenerateImplementation}
                            variant="gradient"
                            disabled={isGenerating}
                            className="flex items-center gap-2 px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                          >
                            {isGenerating ? (
                              <>
                                <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                                Generating Implementation Plan...
                              </>
                            ) : currentProject?.implementationPlan ? (
                              <>
                                View Implementation Plan
                                <ArrowRight className="h-5 w-5" />
                              </>
                            ) : (
                              <>
                                Generate MVP Implementation Plan
                                <ArrowRight className="h-5 w-5" />
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
                      <div className="space-y-4">
                        <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                          ⚙️ Implementation Plan
                        </h2>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <Flashcard
                            title="🔧 Project Setup"
                            content={`Tech Stack:\n${JSON.stringify(currentProject.implementationPlan.content?.projectSetup?.techStack, null, 2)}\n\nProject Structure:\n${Array.isArray(currentProject.implementationPlan.content?.projectSetup?.projectStructure) 
                              ? currentProject.implementationPlan.content.projectSetup.projectStructure.join('\n• ')
                              : 'No project structure available'}`}
                            className="bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm border border-border/50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                            onEdit={(newContent) => {
                              // TODO: Implement implementation plan content editing
                              console.log('Edit project setup:', newContent);
                            }}
                          />
                          
                          <Flashcard
                            title="📅 Development Phases"
                            content={Array.isArray(currentProject.implementationPlan.content?.developmentPhases) 
                              ? currentProject.implementationPlan.content.developmentPhases.map((phase: any) => 
                                  `${phase.phase} (${phase.duration})\n${Array.isArray(phase.tasks) ? phase.tasks.map((task: any) => `• ${task.task}: ${task.description}`).join('\n') : 'No tasks'}\n`
                                ).join('\n')
                              : 'No development phases available'}
                            className="bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm border border-border/50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                            onEdit={(newContent) => {
                              // TODO: Implement implementation plan content editing
                              console.log('Edit development phases:', newContent);
                            }}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <Flashcard
                            title="🔌 API Design"
                            content={Array.isArray(currentProject.implementationPlan.content?.apiDesign) 
                              ? currentProject.implementationPlan.content.apiDesign.map((api: any) => 
                                  `${api.endpoint}\nDescription: ${api.description}\nParameters: ${Array.isArray(api.parameters) ? api.parameters.join(', ') : 'None'}\nResponse: ${api.response}\n`
                                ).join('\n')
                              : 'No API design available'}
                            className="bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm border border-border/50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                            onEdit={(newContent) => {
                              // TODO: Implement implementation plan content editing
                              console.log('Edit API design:', newContent);
                            }}
                          />
                          
                          <Flashcard
                            title="🗄️ Database Schema"
                            content={Array.isArray(currentProject.implementationPlan.content?.databaseSchema) 
                              ? currentProject.implementationPlan.content.databaseSchema.map((schema: any) => 
                                  `${schema.table}\nFields: ${Array.isArray(schema.fields) ? schema.fields.join(', ') : 'None'}\nRelationships: ${Array.isArray(schema.relationships) ? schema.relationships.join(', ') : 'None'}\n`
                                ).join('\n')
                              : 'No database schema available'}
                            className="bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm border border-border/50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                            onEdit={(newContent) => {
                              // TODO: Implement implementation plan content editing
                              console.log('Edit database schema:', newContent);
                            }}
                          />
                        </div>
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