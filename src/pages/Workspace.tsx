import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Download, Send, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sidebar } from '@/components/Sidebar';
import { Flashcard } from '@/components/Flashcard';
import { LoadingStages } from '@/components/LoadingStages';
import { ImplementationRoadmap } from '@/components/ImplementationRoadmap';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
  const [showCards, setShowCards] = useState(false);
  const [hasStartedGeneration, setHasStartedGeneration] = useState(false);
  const [roadmapPhases, setRoadmapPhases] = useState<any[]>([]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (currentProject) {
      console.log('Current project:', currentProject);
      console.log('Has PRD:', !!currentProject.prd);
      console.log('Has Implementation Plan:', !!currentProject.implementationPlan);
      
      // Load roadmap when project changes
      if (currentProject.implementationPlan?.content) {
        console.log('Implementation Plan Content:', currentProject.implementationPlan.content);
        const phases = transformImplementationToRoadmap(currentProject.implementationPlan.content);
        console.log('Transformed Phases:', phases);
        setRoadmapPhases(phases);
      }
    }
  }, [currentProject]);

  const handleNewProject = () => {
    setSelectedProjectId('');
    setCurrentProject(null);
    setCurrentIdea('');
    setShowCards(false);
    setHasStartedGeneration(false);
    setRoadmapPhases([]);
  };

  const handleSelectProject = (projectId: string) => {
    const project = projects.find(p => p._id === projectId);
    if (project) {
      setSelectedProjectId(projectId);
      setCurrentProject(project);
      setCurrentIdea(project.idea);
      setShowCards(!!project.prd);
      setHasStartedGeneration(!!project.prd);
      
      // Load roadmap phases if implementation plan exists
      if (project.implementationPlan?.content) {
        const phases = transformImplementationToRoadmap(project.implementationPlan.content);
        setRoadmapPhases(phases);
      } else {
        setRoadmapPhases([]);
      }
    }
  };

  const handleGeneratePRD = async () => {
    if (!currentIdea.trim()) return;
    
    setIsGenerating(true);
    setHasStartedGeneration(true);
    setShowCards(false);
    
    let projectId = currentProject?._id;
    
    try {
      if (currentProject) {
        await generatePRD(currentProject._id);
        projectId = currentProject._id;
        toast.success('PRD generated successfully!');
      } else {
        const newProject = await createProject(
          currentIdea.slice(0, 50) + (currentIdea.length > 50 ? '...' : ''),
          currentIdea
        );
        projectId = newProject._id;
        setSelectedProjectId(newProject._id);
        
        await generatePRD(newProject._id);
        toast.success('Project created and PRD generated successfully!');
      }
      
      // Fetch the updated project to ensure we have the latest PRD
      if (projectId) {
        const { project: updatedProject } = await apiService.getProject(projectId);
        setCurrentProject(updatedProject);
      }
      
      // Stay on PRD tab
      setActiveTab('prd');
      setShowCards(true);
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate PRD');
      console.error('PRD generation error:', error);
      setHasStartedGeneration(false);
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Transform implementation plan JSON to roadmap format
   * Handles both old format (developmentPhases) and new format (phases)
   */
  const transformImplementationToRoadmap = (implementationPlan: any) => {
    console.log('Transforming implementation plan:', implementationPlan);
    
    // Check for the new format with phases directly in content
    if (implementationPlan?.phases && Array.isArray(implementationPlan.phases)) {
      console.log('Using phases format');
      return implementationPlan.phases;
    }
    
    // Check for old format with developmentPhases
    if (implementationPlan?.developmentPhases && Array.isArray(implementationPlan.developmentPhases)) {
      console.log('Using developmentPhases format - transforming...');
      return implementationPlan.developmentPhases.map((phase: any, phaseIndex: number) => ({
        id: `phase-${phaseIndex + 1}`,
        title: phase.phase,
        description: `Duration: ${phase.duration}`,
        stages: [{
          id: `phase-${phaseIndex + 1}-stage-1`,
          title: phase.phase,
          checkpoints: phase.tasks.map((task: any, taskIndex: number) => ({
            id: `phase-${phaseIndex + 1}-checkpoint-${taskIndex + 1}`,
            title: task.task,
            description: task.description,
            code: task.dependencies?.length > 0 
              ? `Dependencies: ${task.dependencies.join(', ')}` 
              : undefined,
            testing: `Estimated: ${task.estimatedHours}`
          }))
        }]
      }));
    }
    
    console.warn('No valid phases structure found in implementation plan');
    return [];
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
    
    const projectId = currentProject._id;
    setIsGenerating(true);
    
    try {
      // Generate implementation plan
      const response = await generateImplementationPlan(projectId);
      console.log('Generate implementation response:', response);
      
      // Fetch updated project data
      await fetchProjects();
      
      // Wait for context to update, then find and set the updated project
      setTimeout(async () => {
        // Fetch the specific project to ensure we have latest data
        const { project: updatedProject } = await apiService.getProject(projectId);
        console.log('Updated project after generation:', updatedProject);
        
        // Update current project in context
        setCurrentProject(updatedProject);
        
        if (updatedProject?.implementationPlan?.content) {
          const phases = transformImplementationToRoadmap(updatedProject.implementationPlan.content);
          console.log('Setting roadmap phases:', phases);
          setRoadmapPhases(phases);
          setActiveTab('implementation');
        }
      }, 500);
      
      toast.success('Implementation plan generated successfully!');
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
        <div className="h-full bg-background relative overflow-auto" 
             style={{
               backgroundImage: 'radial-gradient(circle, hsl(var(--muted-foreground) / 0.15) 1px, transparent 1px)',
               backgroundSize: '20px 20px'
             }}>
          
          <div className={`transition-all duration-500 ${hasStartedGeneration ? 'max-w-4xl mx-auto p-8' : 'flex items-center justify-center min-h-screen px-8'}`}>
            {/* ChatGPT-style centered input */}
            {!hasStartedGeneration && (
              <div className="w-full max-w-3xl space-y-8 animate-fade-in">
                <div className="text-center space-y-4">
                  <h1 className="text-4xl font-bold text-foreground">
                    What's your next big idea?
                  </h1>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Describe your product idea and we'll help you create a structured roadmap
                  </p>
                </div>

                <div className="relative">
                  <Textarea
                    placeholder="Describe your product idea..."
                    value={currentIdea}
                    onChange={(e) => setCurrentIdea(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleGeneratePRD();
                      }
                    }}
                    className="min-h-[120px] text-base bg-card border-border rounded-2xl px-6 py-4 pr-14 resize-none focus-visible:ring-2 focus-visible:ring-primary shadow-lg"
                  />
                  <Button
                    onClick={handleGeneratePRD}
                    disabled={!currentIdea.trim() || isGenerating}
                    size="icon"
                    className="absolute bottom-4 right-4 rounded-xl bg-primary hover:bg-primary-dark"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Moved-up input after generation starts */}
            {hasStartedGeneration && (
              <div className="mb-8 animate-slide-up">
                <div className="relative bg-card border border-border rounded-2xl shadow-md">
                  <Textarea
                    placeholder="Describe your product idea..."
                    value={currentIdea}
                    onChange={(e) => setCurrentIdea(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleGeneratePRD();
                      }
                    }}
                    className="min-h-[80px] text-base border-0 rounded-2xl px-6 py-4 pr-14 resize-none focus-visible:ring-0"
                  />
                  <Button
                    onClick={handleGeneratePRD}
                    disabled={!currentIdea.trim() || isGenerating}
                    size="icon"
                    className="absolute bottom-4 right-4 rounded-xl bg-primary hover:bg-primary-dark"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Loading Animation */}
            {isGenerating && (
              <div className="flex items-center justify-center min-h-[400px]">
                <LoadingStages />
              </div>
            )}

            {/* Slider Tabs and Content */}
            {currentProject?.prd && showCards && (
              <div className="space-y-6 animate-fade-in">
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
                          : !currentProject?.implementationPlan
                          ? 'text-muted-foreground/50 cursor-not-allowed'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Implementation Plan
                    </button>
                  </div>

                  {/* Download Button */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {activeTab === 'prd' ? (
                        <>
                          <DropdownMenuItem onClick={() => handleDownload('prd', 'markdown')}>
                            PRD (Markdown)
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownload('prd', 'pdf')}>
                            PRD (PDF)
                          </DropdownMenuItem>
                        </>
                      ) : (
                        <>
                          <DropdownMenuItem onClick={() => handleDownload('plan', 'markdown')}>
                            Implementation Plan (MD)
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownload('plan', 'pdf')}>
                            Implementation Plan (PDF)
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDownload('complete')}>
                        Complete Project
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
                          console.log('Edit overview:', newContent);
                        }}
                        style={{ animationDelay: '0.1s' }}
                      />
                      
                      <Flashcard
                        title="Objectives"
                        content={Array.isArray(currentProject.prd.content?.objectives) 
                          ? currentProject.prd.content.objectives.join('\n• ') 
                          : 'No objectives available'}
                        onEdit={(newContent) => {
                          console.log('Edit objectives:', newContent);
                        }}
                        style={{ animationDelay: '0.2s' }}
                      />
                      
                      <Flashcard
                        title="Target Audience"
                        content={`Primary: ${currentProject.prd.content?.targetAudience?.primary || 'Not specified'}\nSecondary: ${currentProject.prd.content?.targetAudience?.secondary || 'Not specified'}`}
                        onEdit={(newContent) => {
                          console.log('Edit target audience:', newContent);
                        }}
                        style={{ animationDelay: '0.3s' }}
                      />
                      
                      <Flashcard
                        title="Core Features"
                        content={Array.isArray(currentProject.prd.content?.features) 
                          ? currentProject.prd.content.features.map((f: any) => `• ${f.name}: ${f.description}`).join('\n')
                          : 'No features available'}
                        onEdit={(newContent) => {
                          console.log('Edit features:', newContent);
                        }}
                        style={{ animationDelay: '0.4s' }}
                      />
                      
                      <Flashcard
                        title="Success Metrics"
                        content={Array.isArray(currentProject.prd.content?.successMetrics) 
                          ? currentProject.prd.content.successMetrics.join('\n• ')
                          : 'No success metrics available'}
                        onEdit={(newContent) => {
                          console.log('Edit success metrics:', newContent);
                        }}
                        style={{ animationDelay: '0.5s' }}
                      />
                      
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
                        <h2 className="text-2xl font-bold text-foreground">Implementation Roadmap</h2>
                        
                        {roadmapPhases.length > 0 ? (
                          <ImplementationRoadmap phases={roadmapPhases} />
                        ) : (
                          <div className="text-center text-muted-foreground py-12 bg-muted/30 rounded-lg">
                            <p className="text-lg">No roadmap available yet</p>
                            <p className="text-sm mt-2">The implementation plan structure could not be parsed</p>
                          </div>
                        )}
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