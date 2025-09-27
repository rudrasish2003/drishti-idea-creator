import React, { useState } from 'react';
import { Plus, FileText, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Project {
  id: string;
  title: string;
  createdAt: string;
}

interface SidebarProps {
  projects: Project[];
  onSelectProject: (projectId: string) => void;
  onNewProject: () => void;
  selectedProjectId?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  projects, 
  onSelectProject, 
  onNewProject,
  selectedProjectId 
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const sidebarContent = (
    <div className="h-full flex flex-col bg-sidebar border-r border-sidebar-border">
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sidebar-foreground">Projects</h2>
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="gradient"
          size="sm"
          className="w-full mt-3"
          onClick={() => {
            onNewProject();
            setIsMobileOpen(false);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {projects.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No projects yet</p>
          </div>
        ) : (
          <div className="space-y-1">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => {
                  onSelectProject(project.id);
                  setIsMobileOpen(false);
                }}
                className={`w-full p-3 text-left rounded-md transition-colors ${
                  selectedProjectId === project.id
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'hover:bg-sidebar-accent/50'
                }`}
              >
                <div className="font-medium text-sm truncate">{project.title}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date(project.createdAt).toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="sm"
        className="md:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-80 max-w-[80vw]">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className={`hidden md:block transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-80'}`}>
        {!isCollapsed && sidebarContent}
      </div>
    </>
  );
};