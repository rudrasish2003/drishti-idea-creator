import React from 'react';
import { Check, Code2, TestTube } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface RoadmapCheckpointProps {
  title: string;
  description: string;
  code?: string;
  testing?: string;
  isCompleted: boolean;
  onToggleComplete: () => void;
}

export const RoadmapCheckpoint: React.FC<RoadmapCheckpointProps> = ({
  title,
  description,
  code,
  testing,
  isCompleted,
  onToggleComplete,
}) => {
  return (
    <Card className={`p-4 transition-all ${isCompleted ? 'bg-muted/50 border-primary' : 'bg-card'}`}>
      <div className="flex items-start gap-3">
        <Checkbox
          checked={isCompleted}
          onCheckedChange={onToggleComplete}
          className="mt-1"
        />
        <div className="flex-1 space-y-3">
          <div>
            <h4 className={`font-semibold ${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
              {title}
            </h4>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>

          {code && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Code2 className="h-4 w-4" />
                <span>Code Implementation</span>
              </div>
              <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
                <code>{code}</code>
              </pre>
            </div>
          )}

          {testing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <TestTube className="h-4 w-4" />
                <span>Testing</span>
              </div>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                {testing}
              </p>
            </div>
          )}
        </div>
        {isCompleted && (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground">
            <Check className="h-4 w-4" />
          </div>
        )}
      </div>
    </Card>
  );
};
