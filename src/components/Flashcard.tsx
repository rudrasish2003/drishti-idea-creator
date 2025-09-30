import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FlashcardProps {
  title: string;
  content: string;
  isExpandable?: boolean;
  isEditable?: boolean;
  onEdit?: (newContent: string) => void;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const Flashcard: React.FC<FlashcardProps> = ({ 
  title, 
  content, 
  isExpandable = true, 
  isEditable = true,
  onEdit,
  className = "",
  style,
  children 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);

  const handleSave = () => {
    if (onEdit) {
      onEdit(editContent);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(content);
    setIsEditing(false);
  };

  return (
    <div className={`p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02] animate-fade-in ${className}`} style={style}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <div className="flex items-center gap-1">
          {isEditable && !isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="h-7 w-7 p-0 opacity-60 hover:opacity-100"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
          )}
          {isExpandable && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-7 w-7 p-0 opacity-60 hover:opacity-100"
            >
              {isExpanded ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </Button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-3">
          {isEditing ? (
            <div className="space-y-3">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-3 border border-border rounded-lg resize-none min-h-[100px] focus:ring-2 focus:ring-ring focus:outline-none text-sm"
                placeholder="Enter content..."
              />
              <div className="flex gap-2">
                <Button variant="gradient" size="sm" onClick={handleSave}>
                  Save
                </Button>
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground whitespace-pre-wrap text-sm leading-relaxed">
              {content}
            </div>
          )}
          {children}
        </div>
      )}
    </div>
  );
};