import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, User, AlertTriangle, Target, Code, Clock, TrendingUp, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PRDContent {
  overview?: string;
  objectives?: string[];
  targetAudience?: {
    primary?: string;
    secondary?: string;
  };
  features?: Array<{
    name: string;
    description: string;
    priority?: 'high' | 'medium' | 'low';
  }>;
  technicalRequirements?: string[];
  timeline?: Array<{
    phase: string;
    duration: string;
    deliverables: string[];
  }>;
  successMetrics?: string[];
  risks?: Array<{
    risk: string;
    mitigation: string;
  }>;
}

interface PRDViewProps {
  content: PRDContent;
  onEdit?: (section: string, value: any) => void;
}

const sections = [
  { id: 'overview', label: 'Overview', icon: Target },
  { id: 'objectives', label: 'Objectives', icon: TrendingUp },
  { id: 'audience', label: 'Target Audience', icon: Users },
  { id: 'features', label: 'Features', icon: Code },
  { id: 'technical', label: 'Technical', icon: Code },
  { id: 'timeline', label: 'Timeline', icon: Clock },
  { id: 'metrics', label: 'Success Metrics', icon: TrendingUp },
  { id: 'risks', label: 'Risks', icon: AlertTriangle },
];

export const PRDView: React.FC<PRDViewProps> = ({ content }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const scrollPosition = container.scrollTop + 100;

      for (const section of sections) {
        const element = sectionRefs.current[section.id];
        if (element) {
          const top = element.offsetTop;
          const bottom = top + element.offsetHeight;
          
          if (scrollPosition >= top && scrollPosition < bottom) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = sectionRefs.current[sectionId];
    if (element && containerRef.current) {
      const container = containerRef.current;
      const top = element.offsetTop - 80;
      container.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-primary/20 text-primary';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const featuresByPriority = {
    high: content.features?.filter(f => f.priority?.toLowerCase() === 'high') || [],
    medium: content.features?.filter(f => f.priority?.toLowerCase() === 'medium') || [],
    low: content.features?.filter(f => f.priority?.toLowerCase() === 'low') || [],
  };

  // Filter sections based on available content
  const availableSections = sections.filter(section => {
    switch (section.id) {
      case 'overview':
        return Boolean(content.overview);
      case 'objectives':
        return content.objectives && content.objectives.length > 0;
      case 'audience':
        return Boolean(content.targetAudience?.primary || content.targetAudience?.secondary);
      case 'features':
        return content.features && content.features.length > 0;
      case 'technical':
        return content.technicalRequirements && content.technicalRequirements.length > 0;
      case 'timeline':
        return content.timeline && content.timeline.length > 0;
      case 'metrics':
        return content.successMetrics && content.successMetrics.length > 0;
      case 'risks':
        return content.risks && content.risks.length > 0;
      default:
        return true;
    }
  });

  return (
    <div className="relative h-full">
      {/* Sticky Navigation */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
        <ScrollArea className="w-full">
          <div className="flex gap-1 p-2">
            {availableSections.map((section) => {
              const Icon = section.icon;
              return (
                <Button
                  key={section.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => scrollToSection(section.id)}
                  className={cn(
                    "flex items-center gap-2 transition-colors whitespace-nowrap",
                    activeSection === section.id && "bg-muted text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {section.label}
                </Button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Content */}
      <div ref={containerRef} className="overflow-auto h-[calc(100vh-200px)] px-6 py-6 space-y-8">
        {/* Overview */}
        <section
          ref={(el) => (sectionRefs.current['overview'] = el)}
          className="animate-fade-in space-y-4"
        >
          <h2 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Overview
          </h2>
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {content.overview || 'No overview available'}
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Objectives */}
        <section
          ref={(el) => (sectionRefs.current['objectives'] = el)}
          className="animate-fade-in space-y-4"
          style={{ animationDelay: '50ms' }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              Objectives
            </h2>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Objective
            </Button>
          </div>
          <Accordion type="single" collapsible defaultValue="objectives-content">
            <AccordionItem value="objectives-content" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                View {content.objectives?.length || 0} Objectives
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid md:grid-cols-2 gap-3 pt-2">
                  {content.objectives?.map((objective, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-3 bg-muted/50 rounded-md hover:bg-muted transition-colors">
                      <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs text-primary-foreground font-bold">{idx + 1}</span>
                      </div>
                      <p className="text-sm text-foreground">{objective}</p>
                    </div>
                  )) || <p className="text-muted-foreground">No objectives available</p>}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* Target Audience */}
        <section
          ref={(el) => (sectionRefs.current['audience'] = el)}
          className="animate-fade-in space-y-4"
          style={{ animationDelay: '100ms' }}
        >
          <h2 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Target Audience
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5" />
                  Primary Audience
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {content.targetAudience?.primary || 'Not specified'}
                </p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5" />
                  Secondary Audience
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {content.targetAudience?.secondary || 'Not specified'}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Features */}
        <section
          ref={(el) => (sectionRefs.current['features'] = el)}
          className="animate-fade-in space-y-4"
          style={{ animationDelay: '150ms' }}
        >
          <h2 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Code className="h-6 w-6 text-primary" />
            Core Features
          </h2>
          <Tabs defaultValue="high" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="high">
                High Priority ({featuresByPriority.high.length})
              </TabsTrigger>
              <TabsTrigger value="medium">
                Medium Priority ({featuresByPriority.medium.length})
              </TabsTrigger>
              <TabsTrigger value="low">
                Low Priority ({featuresByPriority.low.length})
              </TabsTrigger>
            </TabsList>
            {(['high', 'medium', 'low'] as const).map((priority) => (
              <TabsContent key={priority} value={priority} className="mt-4">
                <ScrollArea className="w-full">
                  <div className="flex gap-4 pb-4 snap-x snap-mandatory">
                    {featuresByPriority[priority].length > 0 ? (
                      featuresByPriority[priority].map((feature, idx) => (
                        <Card
                          key={idx}
                          className="min-w-[300px] max-w-[300px] snap-start hover:shadow-lg transition-all hover:scale-105"
                        >
                          <CardHeader>
                            <div className="flex items-start justify-between gap-2">
                              <CardTitle className="text-base">{feature.name}</CardTitle>
                              <Badge className={getPriorityColor(feature.priority)}>
                                {feature.priority}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <p className="text-muted-foreground p-4">No {priority} priority features</p>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        </section>

        {/* Technical Requirements */}
        {content.technicalRequirements && content.technicalRequirements.length > 0 && (
          <section
            ref={(el) => (sectionRefs.current['technical'] = el)}
            className="animate-fade-in space-y-4"
            style={{ animationDelay: '200ms' }}
          >
            <h2 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Code className="h-6 w-6 text-primary" />
              Technical Requirements
            </h2>
            <Card>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-3">
                  {content.technicalRequirements.map((req, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-3 bg-muted/50 rounded-md">
                      <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs text-primary-foreground">✓</span>
                      </div>
                      <p className="text-sm text-foreground">{req}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Timeline */}
        {content.timeline && content.timeline.length > 0 && (
          <section
            ref={(el) => (sectionRefs.current['timeline'] = el)}
            className="animate-fade-in space-y-4"
            style={{ animationDelay: '250ms' }}
          >
            <h2 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Clock className="h-6 w-6 text-primary" />
              Project Timeline
            </h2>
            <Accordion type="single" collapsible className="space-y-2">
              {content.timeline.map((phase, idx) => (
                <AccordionItem key={idx} value={`phase-${idx}`} className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3 text-left">
                      <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-semibold">{phase.phase}</p>
                        <p className="text-sm text-muted-foreground">{phase.duration}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pl-11 pt-2 space-y-2">
                      <p className="text-sm font-medium text-foreground">Deliverables:</p>
                      <ul className="space-y-1">
                        {phase.deliverables.map((deliverable, dIdx) => (
                          <li key={dIdx} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-primary">•</span>
                            {deliverable}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        )}

        {/* Success Metrics */}
        <section
          ref={(el) => (sectionRefs.current['metrics'] = el)}
          className="animate-fade-in space-y-4"
          style={{ animationDelay: '300ms' }}
        >
          <h2 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            Success Metrics
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {content.successMetrics?.map((metric, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground font-medium">{metric}</p>
                </CardContent>
              </Card>
            )) || <p className="text-muted-foreground col-span-full">No success metrics available</p>}
          </div>
        </section>

        {/* Risks */}
        {content.risks && content.risks.length > 0 && (
          <section
            ref={(el) => (sectionRefs.current['risks'] = el)}
            className="animate-fade-in space-y-4"
            style={{ animationDelay: '350ms' }}
          >
            <h2 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-primary" />
              Risks & Mitigation
            </h2>
            <Accordion type="single" collapsible className="space-y-2">
              {content.risks.map((risk, idx) => {
                // Handle different risk formats
                let riskText = '';
                let mitigationText = '';
                
                // Extract risk text first
                if (typeof risk === 'string') {
                  riskText = risk;
                } else if (risk && typeof risk === 'object') {
                  riskText = risk.risk || 'Risk not specified';
                  mitigationText = risk.mitigation || '';
                } else {
                  riskText = 'Risk not specified';
                }
                
                // If mitigation is not provided, generate contextual mitigation
                if (!mitigationText) {
                  const lowerRisk = riskText.toLowerCase();
                  if (lowerRisk.includes('timeline') || lowerRisk.includes('delay')) {
                    mitigationText = 'Implement agile methodology with regular sprint reviews and buffer time for critical paths. Monitor progress daily and adjust resources proactively.';
                  } else if (lowerRisk.includes('budget') || lowerRisk.includes('cost')) {
                    mitigationText = 'Establish detailed cost tracking system, implement phased spending approach, and maintain contingency fund of 15-20% for unforeseen expenses.';
                  } else if (lowerRisk.includes('scope') || lowerRisk.includes('requirement')) {
                    mitigationText = 'Define clear scope boundaries, implement formal change request process, and conduct regular stakeholder alignment meetings.';
                  } else if (lowerRisk.includes('technical') || lowerRisk.includes('technology')) {
                    mitigationText = 'Conduct proof of concept early, maintain technical documentation, ensure team training, and establish technical review checkpoints.';
                  } else if (lowerRisk.includes('resource') || lowerRisk.includes('team')) {
                    mitigationText = 'Cross-train team members, document key processes, maintain backup resources, and implement knowledge sharing sessions.';
                  } else if (lowerRisk.includes('quality') || lowerRisk.includes('bug')) {
                    mitigationText = 'Implement comprehensive testing strategy, conduct regular code reviews, establish quality metrics, and allocate dedicated QA time.';
                  } else {
                    mitigationText = 'Develop comprehensive risk response plan, assign risk owners, implement regular monitoring, and establish escalation procedures for early intervention.';
                  }
                }
                
                return (
                  <AccordionItem key={idx} value={`risk-${idx}`} className="border-2 border-destructive/20 rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 text-left">
                        <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
                        <p className="font-semibold text-foreground">{riskText}</p>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pl-8 pt-2">
                        <p className="text-sm font-medium text-foreground mb-1">Mitigation Strategy:</p>
                        <p className="text-sm text-muted-foreground">{mitigationText}</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </section>
        )}
      </div>
    </div>
  );
};
