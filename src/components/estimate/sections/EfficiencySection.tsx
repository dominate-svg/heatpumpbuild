import { useState, useEffect, useRef } from 'react';
import { Check, ChevronDown, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import type { EstimateResults, Assumptions } from '@/lib/calculations';

interface EfficiencySectionProps {
  scop: number;
  onScopChange: (scop: number) => void;
  results: EstimateResults | null;
  baseResults: EstimateResults | null;
  assumptions: Assumptions;
  onContinue: () => void;
  onBack: () => void;
}

type BehaviourLevel = 'simple' | 'balanced' | 'best';

const BEHAVIOUR_OPTIONS: {
  id: BehaviourLevel;
  scop: number;
  label: string;
  tag: string;
  tagType: 'neutral' | 'popular' | 'savings';
  description: string;
  installImpact: string;
  runningImpact: string;
  runningType: 'higher' | 'baseline' | 'lower';
}[] = [
  {
    id: 'simple',
    scop: 3.4,
    label: 'Simple & quick',
    tag: 'Easiest install',
    tagType: 'neutral',
    description: 'We change as little as possible. Your system works well, but not at maximum efficiency.',
    installImpact: '+£0',
    runningImpact: '~£150/yr higher',
    runningType: 'higher',
  },
  {
    id: 'balanced',
    scop: 3.7,
    label: 'Balanced',
    tag: 'Most popular',
    tagType: 'popular',
    description: 'We make a few small upgrades so your system runs more efficiently and saves more each year.',
    installImpact: '+£300–500',
    runningImpact: '~£150/yr lower',
    runningType: 'lower',
  },
  {
    id: 'best',
    scop: 4.0,
    label: 'Best long-term',
    tag: 'Lowest bills',
    tagType: 'savings',
    description: 'We fully optimise the system so it runs at maximum efficiency and costs the least to run.',
    installImpact: '+£700–900',
    runningImpact: '~£250/yr lower',
    runningType: 'lower',
  },
];

// A/B test variant
function getABVariant(): 'A' | 'B' {
  const stored = localStorage.getItem('efficiency_ab_variant');
  if (stored === 'A' || stored === 'B') return stored;
  const variant = Math.random() < 0.5 ? 'A' : 'B';
  localStorage.setItem('efficiency_ab_variant', variant);
  return variant;
}

function getDefaultLevel(): BehaviourLevel {
  const variant = getABVariant();
  return variant === 'A' ? 'balanced' : 'simple';
}

export function EfficiencySection({ 
  scop, 
  onScopChange,
  results,
  baseResults,
  assumptions,
  onContinue,
  onBack,
}: EfficiencySectionProps) {
  const [selectedLevel, setSelectedLevel] = useState<BehaviourLevel>(() => {
    if (scop >= 4.0) return 'best';
    if (scop >= 3.7) return 'balanced';
    return 'simple';
  });
  const [explainerOpen, setExplainerOpen] = useState(false);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      const defaultLevel = getDefaultLevel();
      setSelectedLevel(defaultLevel);
      const option = BEHAVIOUR_OPTIONS.find(o => o.id === defaultLevel);
      if (option) onScopChange(option.scop);
    }
  }, [onScopChange]);

  const handleSelect = (level: BehaviourLevel) => {
    if (level === selectedLevel) return;
    setSelectedLevel(level);
    const option = BEHAVIOUR_OPTIONS.find(o => o.id === level);
    if (option) onScopChange(option.scop);
  };

  return (
    <section className="py-6 sm:py-10 animate-fade-in">
      {/* Back button */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Title */}
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
          How do you want your system to behave?
        </h2>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          This just changes how much work we do upfront vs how low your energy bills go.
        </p>
      </div>

      {/* Behaviour cards - stacked vertically */}
      <div className="space-y-3 mb-5">
        {BEHAVIOUR_OPTIONS.map((option) => {
          const isSelected = selectedLevel === option.id;
          
          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              className={cn(
                'relative w-full p-4 rounded-2xl border-2 text-left transition-all duration-200',
                'bg-card active:scale-[0.99]',
                isSelected 
                  ? 'border-primary shadow-md ring-1 ring-primary/20' 
                  : 'border-border hover:border-muted-foreground/40'
              )}
            >
              <div className="flex items-start gap-3.5">
                {/* Selection indicator */}
                <div className={cn(
                  'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200',
                  isSelected 
                    ? 'border-primary bg-primary scale-100' 
                    : 'border-muted-foreground/30 scale-100'
                )}>
                  {isSelected && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <h3 className="font-semibold text-foreground text-base">
                      {option.label}
                    </h3>
                    <span className={cn(
                      'px-2 py-0.5 text-[11px] font-semibold rounded-full',
                      option.tagType === 'popular' && 'bg-primary/10 text-primary',
                      option.tagType === 'neutral' && 'bg-muted text-muted-foreground',
                      option.tagType === 'savings' && 'bg-green-100 text-green-700'
                    )}>
                      {option.tag}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                    {option.description}
                  </p>

                  {/* Impact row */}
                  <div className="flex items-center gap-2 text-xs flex-wrap">
                    <span className={cn(
                      'px-2.5 py-1 rounded-lg font-medium',
                      option.installImpact === '+£0' 
                        ? 'bg-muted text-muted-foreground' 
                        : 'bg-amber-50 text-amber-700'
                    )}>
                      Install: {option.installImpact}
                    </span>
                    <span className={cn(
                      'px-2.5 py-1 rounded-lg font-medium',
                      option.runningType === 'higher' 
                        ? 'bg-amber-50 text-amber-700'
                        : option.runningType === 'lower'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-muted text-muted-foreground'
                    )}>
                      Running: {option.runningImpact}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Collapsible explainer */}
      <Collapsible open={explainerOpen} onOpenChange={setExplainerOpen} className="mb-6">
        <CollapsibleTrigger className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto group">
          <span>What's this?</span>
          <ChevronDown className={cn(
            'w-4 h-4 transition-transform duration-200',
            explainerOpen && 'rotate-180'
          )} />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4 overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
          <div className="bg-muted/50 rounded-xl p-4 text-sm text-muted-foreground space-y-3">
            <p>
              Behind the scenes, this changes system efficiency (what engineers call <span className="font-medium text-foreground">SCOP</span>):
            </p>
            <div className="flex items-center justify-center gap-4 py-2">
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">Simple</div>
                <div className="font-semibold text-foreground">3.4</div>
              </div>
              <div className="text-muted-foreground/40">→</div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">Balanced</div>
                <div className="font-semibold text-foreground">3.7</div>
              </div>
              <div className="text-muted-foreground/40">→</div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">Best</div>
                <div className="font-semibold text-foreground">4.0</div>
              </div>
            </div>
            <p>
              Higher numbers mean more heat per unit of electricity — so lower bills.
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* CTA */}
      <Button 
        onClick={onContinue}
        size="lg"
        className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold rounded-xl active:scale-[0.98] transition-transform"
      >
        Continue
      </Button>
    </section>
  );
}
