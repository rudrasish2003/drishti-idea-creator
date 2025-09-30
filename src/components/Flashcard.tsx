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
            <div className="text-muted-foreground space-y-4">
              {content.split('\n').map((line, index) => {
                // Check if it's a list item (starts with • or - or *)
                if (line.trim().match(/^[•\-\*]\s/)) {
                  return (
                    <div key={index} className="flex items-start space-x-2 pl-2">
                      <span className="text-primary mt-1.5">•</span>
                      <p className="text-sm leading-relaxed flex-1">{line.trim().replace(/^[•\-\*]\s/, '')}</p>
                    </div>
                  );
                }
                // Check if it's a key-value pair (contains : )
                else if (line.includes(':')) {
                  const [key, value] = line.split(':').map(s => s.trim());
                  return (
                    <div key={index} className="flex flex-col space-y-1">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {key}
                      </span>
                      <p className="text-sm text-foreground font-medium pl-2">
                        {value}
                      </p>
                    </div>
                  );
                }
                // Regular text
                else if (line.trim()) {
                  return (
                    <p key={index} className="text-sm leading-relaxed text-foreground/80">
                      {line}
                    </p>
                  );
                }
                return null;
              })}
            </div>
          )}
          {children}
        </div>
      )}
    </div>
  );
};