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
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export const Flashcard: React.FC<FlashcardProps> = ({ 
  title, 
  content, 
  isExpandable = true, 
  isEditable = true,
  onEdit,
  className = "",
  children,
  style
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
    <div className={`flashcard fade-in ${className}`} style={style}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <div className="flex items-center gap-2">
          {isEditable && !isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="h-8 w-8 p-0"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
          {isExpandable && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          {isEditing ? (
            <div className="space-y-3">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-3 border border-border rounded-md resize-none min-h-[120px] focus:ring-2 focus:ring-ring focus:outline-none"
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
            <div className="text-muted-foreground whitespace-pre-wrap">
              {content}
            </div>
          )}
          {children}
        </div>
      )}
    </div>
  );
};