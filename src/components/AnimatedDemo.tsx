import React, { useState, useEffect } from 'react';
import { ArrowRight, FileText, Lightbulb, Rocket } from 'lucide-react';

const AnimatedDemo = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [typingText, setTypingText] = useState('');
  const [showPRD, setShowPRD] = useState(false);
  const [showImplementation, setShowImplementation] = useState(false);

  const ideaText = "A mobile app that helps users find nearby dog-friendly restaurants and parks";

  useEffect(() => {
    const cycle = async () => {
      // Reset everything
      setCurrentStep(0);
      setTypingText('');
      setShowPRD(false);
      setShowImplementation(false);
      
      // Step 1: Typing animation
      setCurrentStep(1);
      for (let i = 0; i <= ideaText.length; i++) {
        setTypingText(ideaText.slice(0, i));
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 2: Generate PRD
      setCurrentStep(2);
      setShowPRD(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Step 3: Generate Implementation
      setCurrentStep(3);
      setShowImplementation(true);
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Wait before restarting
      await new Promise(resolve => setTimeout(resolve, 2000));
    };

    cycle();
    const interval = setInterval(cycle, 12000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Animated Workspace Mockup */}
      <div className="bg-white rounded-2xl shadow-2xl border border-border overflow-hidden">
        {/* Mock Header */}
        <div className="bg-accent/20 border-b border-border px-6 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
          </div>
          <div className="text-sm text-muted-foreground">drishti.io/workspace</div>
        </div>

        {/* Content Area */}
        <div className="p-8 space-y-8">
          {/* Input Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Describe your idea</h3>
            <div className="relative">
              <textarea
                className="w-full h-24 p-4 border border-border rounded-lg resize-none bg-background text-foreground"
                placeholder="Enter your product idea here..."
                value={typingText}
                readOnly
              />
              {currentStep === 1 && (
                <div className="absolute right-4 bottom-4">
                  <div className="w-0.5 h-5 bg-primary animate-pulse"></div>
                </div>
              )}
            </div>
            <button 
              className={`px-6 py-2 bg-gradient-primary text-white rounded-lg transition-all duration-500 ${
                currentStep >= 2 ? 'scale-105 shadow-lg' : 'hover:shadow-md'
              }`}
            >
              Write to Create
              <ArrowRight className="ml-2 h-4 w-4 inline" />
            </button>
          </div>

          {/* Results Area */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* PRD Panel */}
            <div className={`space-y-4 transition-all duration-700 ${
              showPRD ? 'opacity-100 translate-y-0' : 'opacity-30 translate-y-4'
            }`}>
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-primary" />
                <h4 className="font-semibold text-foreground">Product Requirements</h4>
              </div>
              
              <div className="space-y-3">
                {['Problem Statement', 'Target Users', 'Core Features', 'Success Metrics'].map((item, index) => (
                  <div 
                    key={item}
                    className={`flashcard p-4 transition-all duration-500 ${
                      showPRD ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                    }`}
                    style={{ transitionDelay: `${index * 150}ms` }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{item}</span>
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Implementation Panel */}
            <div className={`space-y-4 transition-all duration-700 ${
              showImplementation ? 'opacity-100 translate-y-0' : 'opacity-30 translate-y-4'
            }`}>
              <div className="flex items-center space-x-2">
                <Rocket className="h-5 w-5 text-primary" />
                <h4 className="font-semibold text-foreground">Implementation Plan</h4>
              </div>
              
              <div className="space-y-3">
                {['Tech Stack', 'Development Phases', 'Task Breakdown', 'Timeline'].map((item, index) => (
                  <div 
                    key={item}
                    className={`flashcard p-4 transition-all duration-500 ${
                      showImplementation ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                    }`}
                    style={{ transitionDelay: `${index * 150}ms` }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{item}</span>
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Flow Arrows */}
          <div className="flex justify-center items-center space-x-8 py-4">
            <div className={`flex items-center space-x-2 transition-all duration-500 ${
              currentStep >= 1 ? 'text-primary' : 'text-muted-foreground'
            }`}>
              <Lightbulb className="h-5 w-5" />
              <span className="text-sm font-medium">Idea</span>
            </div>
            <ArrowRight className={`h-4 w-4 transition-all duration-500 ${
              currentStep >= 2 ? 'text-primary animate-pulse' : 'text-muted-foreground'
            }`} />
            <div className={`flex items-center space-x-2 transition-all duration-500 ${
              currentStep >= 2 ? 'text-primary' : 'text-muted-foreground'
            }`}>
              <FileText className="h-5 w-5" />
              <span className="text-sm font-medium">PRD</span>
            </div>
            <ArrowRight className={`h-4 w-4 transition-all duration-500 ${
              currentStep >= 3 ? 'text-primary animate-pulse' : 'text-muted-foreground'
            }`} />
            <div className={`flex items-center space-x-2 transition-all duration-500 ${
              currentStep >= 3 ? 'text-primary' : 'text-muted-foreground'
            }`}>
              <Rocket className="h-5 w-5" />
              <span className="text-sm font-medium">Plan</span>
            </div>
          </div>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex justify-center mt-6 space-x-2">
        {[1, 2, 3].map((step) => (
          <div
            key={step}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              currentStep >= step ? 'bg-primary' : 'bg-muted'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default AnimatedDemo;