import React, { useState } from 'react';
import { Plus, FileText, Menu, X, Trash2, User as UserIcon, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProjects } from '@/contexts/ProjectsContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { useNavigate } from 'react-router-dom';

interface Project {
  _id: string;
  title: string;
  createdAt: string;
  status: 'draft' | 'prd_generated' | 'plan_generated' | 'completed';
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
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { deleteProject } = useProjects();
  const { user, logout, deleteAccount } = useAuth();
  const navigate = useNavigate();

  const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent project selection when clicking delete
    
    try {
      await deleteProject(projectId);
      toast.success('Project deleted successfully');
      if (selectedProjectId === projectId) {
        onNewProject(); // Reset if the deleted project was selected
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete project');
    }
  };

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
                key={project._id}
                onClick={() => {
                  onSelectProject(project._id);
                  setIsMobileOpen(false);
                }}
                className={`w-full p-3 text-left rounded-md transition-colors relative group ${
                  selectedProjectId === project._id
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'hover:bg-sidebar-accent/50'
                }`}
              >
                <div className="font-medium text-sm truncate pr-8">{project.title}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date(project.createdAt).toLocaleDateString()}
                </div>
                <div className="text-xs text-muted-foreground mt-1 capitalize">
                  {project.status.replace('_', ' ')}
                </div>
                
                {/* Delete Button */}
                <button
                  onClick={(e) => handleDeleteProject(project._id, e)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-opacity"
                  title="Delete project"
                >
                  <Trash2 className="h-4 w-4 text-destructive hover:text-destructive/80" />
                </button>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Profile Section */}
      <div className="mt-auto p-4 border-t border-sidebar-border">
        <div className="flex items-center justify-between">
          <Popover>
            <PopoverTrigger asChild>
              <div className="flex items-center space-x-3 cursor-pointer p-2 rounded-md transition-all duration-200 hover:bg-sidebar-accent/70 hover:scale-[0.98] active:scale-[0.97]">
                <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center">
                  <UserIcon className="h-4 w-4 text-sidebar-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>
            </PopoverTrigger>

            <PopoverContent align="end">
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium">{user?.firstName} {user?.lastName}</div>
                  <div className="text-xs text-muted-foreground">{user?.email}</div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      logout();
                      setIsMobileOpen(false);
                    }}
                  >
                    Logout
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">Delete account</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete account</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete your account and all associated projects. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="mt-4 flex justify-end gap-2">
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={async () => {
                            try {
                              await deleteAccount();
                              toast.success('Account deleted');
                              navigate('/');
                              setIsMobileOpen(false);
                            } catch (err: any) {
                              toast.error(err?.message || 'Failed to delete account');
                            }
                          }}
                        >
                          Yes, delete
                        </AlertDialogAction>
                      </div>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
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
      <div className="hidden md:block w-80">
        {sidebarContent}
      </div>
    </>
  );
};