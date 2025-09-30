import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Download, ChevronDown, Edit3, FileText, Settings, X } from 'lucide-react';
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
  const [showWritingOverlay, setShowWritingOverlay] = useState(false);
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);

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
    setShowWritingOverlay(false);
  };

  const handleSelectProject = (projectId: string) => {
    const project = projects.find(p => p._id === projectId);
    if (project) {
      setSelectedProjectId(projectId);
      setCurrentProject(project);
      setCurrentIdea(project.idea);
      setShowWritingOverlay(false);
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
      setShowWritingOverlay(false);
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
    setShowDownloadDropdown(false);
  };

  const hasGeneratedContent = currentProject?.prd;

  return (
    <div className="flex h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Sidebar 
        projects={projects}
        onSelectProject={handleSelectProject}
        onNewProject={handleNewProject}
        selectedProjectId={selectedProjectId}
      />
      
      <main className="flex-1 overflow-hidden flex flex-col relative">
        {hasGeneratedContent ? (
          /* Generated Content View */
          <div className="flex-1 flex flex-col">
            {/* Header with Tab Navigation and Download */}
            <div className="flex items-center justify-between p-6 border-b border-border/50 bg-background/95 backdrop-blur-sm">
              <div className="flex bg-muted/50 rounded-xl p-1">
                <button
                  onClick={() => setActiveTab('prd')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-300 font-medium ${
                    activeTab === 'prd' 
                      ? 'bg-primary text-primary-foreground shadow-md transform scale-105' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  📄 PRD
                </button>
                <button
                  onClick={() => setActiveTab('implementation')}
                  disabled={!currentProject?.implementationPlan}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-300 font-medium ${
                    activeTab === 'implementation' 
                      ? 'bg-primary text-primary-foreground shadow-md transform scale-105' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-background/50 disabled:opacity-40 disabled:cursor-not-allowed'
                  }`}
                >
                  <Settings className="h-4 w-4" />
                  ⚙️ Implementation
                </button>
              </div>

              {/* Download Button with Dropdown */}
              <div className="relative">
                <Button 
                  onClick={() => setShowDownloadDropdown(!showDownloadDropdown)}
                  variant="outline"
                  className="flex items-center gap-2 bg-background/80 backdrop-blur-sm border-border/50 hover:bg-muted/50"
                >
                  <Download className="h-4 w-4" />
                  Download
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showDownloadDropdown ? 'rotate-180' : ''}`} />
                </Button>

                {showDownloadDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-background/95 backdrop-blur-sm border border-border/50 rounded-xl shadow-xl z-50 animate-scale-in">
                    <div className="p-2 space-y-1">
                      {activeTab === 'prd' ? (
                        <>
                          <button
                            onClick={() => handleDownload('prd', 'pdf')}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted/50 text-sm transition-colors"
                          >
                            📥 Download PRD (PDF)
                          </button>
                          <button
                            onClick={() => handleDownload('prd', 'markdown')}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted/50 text-sm transition-colors"
                          >
                            📥 Download PRD (DOCX)
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleDownload('plan', 'pdf')}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted/50 text-sm transition-colors"
                          >
                            📥 Download Implementation (PDF)
                          </button>
                          <button
                            onClick={() => handleDownload('plan', 'markdown')}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted/50 text-sm transition-colors"
                          >
                            📥 Download Implementation (DOCX)
                          </button>
                        </>
                      )}
                      <div className="border-t border-border/50 my-1"></div>
                      <button
                        onClick={() => handleDownload('complete')}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted/50 text-sm transition-colors font-medium"
                      >
                        📥 Download Both
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Content Panels */}
            <div className="flex-1 overflow-hidden relative">
              {/* PRD Panel */}
              <div className={`absolute inset-0 transition-all duration-500 ease-out ${
                activeTab === 'prd' ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
              }`}>
                <div className="h-full overflow-auto">
                  <div className="max-w-4xl mx-auto p-6 space-y-6">
                    <div className="text-center mb-8">
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-4">
                        Product Requirements Document
                      </h1>
                      <div className="w-24 h-1 bg-gradient-to-r from-primary to-primary/70 mx-auto rounded-full"></div>
                    </div>
                    
                    <div className="grid gap-6">
                      <Flashcard
                        title="📋 Overview"
                        content={currentProject.prd.content?.overview || 'No overview available'}
                        onEdit={(newContent) => console.log('Edit overview:', newContent)}
                      />
                      
                      <Flashcard
                        title="🎯 Objectives"
                        content={Array.isArray(currentProject.prd.content?.objectives) 
                          ? currentProject.prd.content.objectives.map(obj => `• ${obj}`).join('\n')
                          : 'No objectives available'}
                        onEdit={(newContent) => console.log('Edit objectives:', newContent)}
                      />
                      
                      <Flashcard
                        title="👥 Target Audience"
                        content={`Primary: ${currentProject.prd.content?.targetAudience?.primary || 'Not specified'}\n\nSecondary: ${currentProject.prd.content?.targetAudience?.secondary || 'Not specified'}`}
                        onEdit={(newContent) => console.log('Edit target audience:', newContent)}
                      />
                      
                      <Flashcard
                        title="⚡ Core Features"
                        content={Array.isArray(currentProject.prd.content?.features) 
                          ? currentProject.prd.content.features.map((f: any) => `• ${f.name}: ${f.description}`).join('\n')
                          : 'No features available'}
                        onEdit={(newContent) => console.log('Edit features:', newContent)}
                      />
                      
                      <Flashcard
                        title="📊 Success Metrics"
                        content={Array.isArray(currentProject.prd.content?.successMetrics) 
                          ? currentProject.prd.content.successMetrics.map(metric => `• ${metric}`).join('\n')
                          : 'No success metrics available'}
                        onEdit={(newContent) => console.log('Edit success metrics:', newContent)}
                      />

                      {/* Generate Implementation Button */}
                      <div className="flex justify-center pt-6">
                        <Button 
                          onClick={handleGenerateImplementation}
                          variant="outline"
                          disabled={isGenerating}
                          className="px-8 py-4 text-lg bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 hover:from-primary/20 hover:to-primary/10 hover:border-primary/30 hover:scale-105 transition-all duration-300"
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
              </div>

              {/* Implementation Panel */}
              {currentProject?.implementationPlan && (
                <div className={`absolute inset-0 transition-all duration-500 ease-out ${
                  activeTab === 'implementation' ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
                }`}>
                  <div className="h-full overflow-auto">
                    <div className="max-w-4xl mx-auto p-6 space-y-6">
                      <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-4">
                          Implementation Plan
                        </h1>
                        <div className="w-24 h-1 bg-gradient-to-r from-primary to-primary/70 mx-auto rounded-full"></div>
                      </div>
                      
                      <div className="grid gap-6">
                        <Flashcard
                          title="🛠️ Project Setup"
                          content={`Tech Stack:\n${JSON.stringify(currentProject.implementationPlan.content?.projectSetup?.techStack, null, 2)}\n\nProject Structure:\n${Array.isArray(currentProject.implementationPlan.content?.projectSetup?.projectStructure) 
                            ? currentProject.implementationPlan.content.projectSetup.projectStructure.map(item => `• ${item}`).join('\n')
                            : 'No project structure available'}`}
                          onEdit={(newContent) => console.log('Edit project setup:', newContent)}
                        />
                        
                        <Flashcard
                          title="🔄 Development Phases"
                          content={Array.isArray(currentProject.implementationPlan.content?.developmentPhases) 
                            ? currentProject.implementationPlan.content.developmentPhases.map((phase: any) => 
                                `${phase.phase} (${phase.duration})\n${Array.isArray(phase.tasks) ? phase.tasks.map((task: any) => `• ${task.task}: ${task.description}`).join('\n') : 'No tasks'}\n`
                              ).join('\n')
                            : 'No development phases available'}
                          onEdit={(newContent) => console.log('Edit development phases:', newContent)}
                        />
                        
                        <Flashcard
                          title="🔌 API Design"
                          content={Array.isArray(currentProject.implementationPlan.content?.apiDesign?.endpoints) 
                            ? currentProject.implementationPlan.content.apiDesign.endpoints.map((endpoint: any) => 
                                `${endpoint.method} ${endpoint.path}\n${endpoint.description}\nAuth: ${endpoint.authentication}\n`
                              ).join('\n')
                            : 'No API design available'}
                          onEdit={(newContent) => console.log('Edit API design:', newContent)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Initial Empty State */
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center animate-fade-in mb-12">
              <div className="w-32 h-32 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                <Sparkles className="w-16 h-16 text-primary" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent mb-4">
                What's your next big idea?
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Describe your product idea in natural language. Our AI will help you create a structured roadmap.
              </p>
            </div>

            {/* Large Initial Typing Area */}
            <div className="w-full max-w-3xl bg-background/80 backdrop-blur-sm border border-border/50 rounded-2xl p-8 shadow-2xl animate-scale-in">
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                  <label className="text-lg font-medium text-foreground">
                    Describe your idea...
                  </label>
                </div>
                <Textarea
                  placeholder="Make a website for ecommerce that sells handmade jewelry with user authentication, product catalog, shopping cart, and payment integration..."
                  value={currentIdea}
                  onChange={(e) => setCurrentIdea(e.target.value)}
                  className="min-h-[200px] text-lg resize-none border-border/30 focus:border-primary/50 bg-background/50 rounded-xl"
                />
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    {currentIdea.length}/1000 characters
                  </div>
                  <Button 
                    onClick={handleGeneratePRD}
                    disabled={!currentIdea.trim() || isGenerating}
                    className="px-12 py-4 text-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 hover:scale-105 transition-all duration-300 shadow-lg"
                  >
                    {isGenerating ? (
                      <>
                        <Sparkles className="mr-3 h-5 w-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-3 h-5 w-5" />
                        Generate PRD
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Floating Writing Overlay Button */}
        {hasGeneratedContent && !showWritingOverlay && (
          <Button
            onClick={() => setShowWritingOverlay(true)}
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary hover:bg-primary/90 shadow-2xl hover:scale-110 transition-all duration-300 z-50"
          >
            <Edit3 className="h-6 w-6" />
          </Button>
        )}

        {/* Writing Overlay */}
        {showWritingOverlay && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
            <div className="w-full max-w-2xl bg-background border border-border/50 rounded-2xl p-6 shadow-2xl mx-4 animate-scale-in">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Edit Your Idea</h3>
                <Button
                  onClick={() => setShowWritingOverlay(false)}
                  variant="ghost"
                  size="sm"
                  className="rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <Textarea
                  placeholder="Refine your idea or describe a new one..."
                  value={currentIdea}
                  onChange={(e) => setCurrentIdea(e.target.value)}
                  className="min-h-[150px] text-base resize-none"
                />
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    {currentIdea.length}/1000 characters
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => setShowWritingOverlay(false)}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleGeneratePRD}
                      disabled={!currentIdea.trim() || isGenerating}
                      className="bg-gradient-to-r from-primary to-primary/80"
                    >
                      {isGenerating ? (
                        <>
                          <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Update PRD
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Click outside to close dropdown */}
        {showDownloadDropdown && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowDownloadDropdown(false)}
          />
        )}
      </main>
    </div>
  );
};

export default Workspace;