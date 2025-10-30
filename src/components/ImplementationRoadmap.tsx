import React, { useState, useEffect } from 'react';
import { RoadmapCheckpoint } from './RoadmapCheckpoint';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface Checkpoint {
  id: string;
  title: string;
  description: string;
  code?: string;
  testing?: string;
}

interface Stage {
  id: string;
  title: string;
  checkpoints: Checkpoint[];
}

interface Phase {
  id: string;
  title: string;
  description: string;
  stages: Stage[];
}

interface ImplementationRoadmapProps {
  phases: Phase[];
  projectId: string;
}

export const ImplementationRoadmap: React.FC<ImplementationRoadmapProps> = ({ phases, projectId }) => {
  const [completedCheckpoints, setCompletedCheckpoints] = useState<Set<string>>(() => {
    const stored = localStorage.getItem(`checkpoints_${projectId}`);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  useEffect(() => {
    const stored = localStorage.getItem(`checkpoints_${projectId}`);
    setCompletedCheckpoints(stored ? new Set(JSON.parse(stored)) : new Set());
  }, [projectId]);

  const toggleCheckpoint = (checkpointId: string) => {
    setCompletedCheckpoints(prev => {
      const newSet = new Set(prev);
      if (newSet.has(checkpointId)) {
        newSet.delete(checkpointId);
      } else {
        newSet.add(checkpointId);
      }
      localStorage.setItem(`checkpoints_${projectId}`, JSON.stringify(Array.from(newSet)));
      return newSet;
    });
  };

  const getTotalCheckpoints = () => {
    return phases.reduce((total, phase) => 
      total + phase.stages.reduce((stageTotal, stage) => 
        stageTotal + stage.checkpoints.length, 0
      ), 0
    );
  };

  const getProgress = () => {
    const total = getTotalCheckpoints();
    return total > 0 ? (completedCheckpoints.size / total) * 100 : 0;
  };

  return (
    <div className="space-y-8">
      {/* Overall Progress */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Overall Progress</h3>
            <span className="text-2xl font-bold text-primary">{Math.round(getProgress())}%</span>
          </div>
          <Progress value={getProgress()} className="h-2" />
          <p className="text-sm text-muted-foreground">
            {completedCheckpoints.size} of {getTotalCheckpoints()} checkpoints completed
          </p>
        </div>
      </Card>

      {/* Phases */}
      {phases.map((phase, phaseIndex) => {
        const phaseCheckpoints = phase.stages.flatMap(s => s.checkpoints.map(c => c.id));
        const phaseCompleted = phaseCheckpoints.filter(id => completedCheckpoints.has(id)).length;
        const phaseProgress = phaseCheckpoints.length > 0 
          ? (phaseCompleted / phaseCheckpoints.length) * 100 
          : 0;

        return (
          <div key={phase.id} className="space-y-4 animate-fade-in" style={{ animationDelay: `${phaseIndex * 100}ms` }}>
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold shrink-0">
                {phaseIndex + 1}
              </div>
              <div className="flex-1 space-y-2">
                <div>
                  <h3 className="text-xl font-bold text-foreground">{phase.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{phase.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={phaseProgress} className="h-1.5 flex-1" />
                  <span className="text-xs font-medium text-muted-foreground">
                    {phaseCompleted}/{phaseCheckpoints.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Stages */}
            <div className="ml-14 space-y-6">
              {phase.stages.map((stage, stageIndex) => (
                <div key={stage.id} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground">
                      {stageIndex + 1}
                    </div>
                    <h4 className="font-semibold text-foreground">{stage.title}</h4>
                  </div>
                  
                  {/* Checkpoints */}
                  <div className="ml-8 space-y-3 overflow-x-auto">
                    {stage.checkpoints.map((checkpoint) => (
                      <RoadmapCheckpoint
                        key={checkpoint.id}
                        title={checkpoint.title}
                        description={checkpoint.description}
                        code={checkpoint.code}
                        testing={checkpoint.testing}
                        isCompleted={completedCheckpoints.has(checkpoint.id)}
                        onToggleComplete={() => toggleCheckpoint(checkpoint.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};