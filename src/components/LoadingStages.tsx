import React, { useState, useEffect } from 'react';
import { Sparkles, FileText, Code, Zap } from 'lucide-react';

const stages = [
  { icon: Sparkles, text: 'Analyzing your idea' },
  { icon: FileText, text: 'Structuring requirements' },
  { icon: Code, text: 'Building documentation' },
  { icon: Zap, text: 'Finalizing details' },
];

export const LoadingStages = () => {
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStage((prev) => (prev + 1) % stages.length);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const CurrentIcon = stages[currentStage].icon;

  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-16">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
        <div className="relative bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 backdrop-blur-sm border border-primary/20">
          <CurrentIcon className="h-12 w-12 text-primary animate-bounce" />
        </div>
      </div>
      
      <div className="text-center space-y-2">
        <p className="text-lg font-medium text-foreground animate-pulse">
          {stages[currentStage].text}
        </p>
        <div className="flex items-center justify-center gap-2">
          {stages.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentStage 
                  ? 'w-8 bg-primary' 
                  : 'w-2 bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
