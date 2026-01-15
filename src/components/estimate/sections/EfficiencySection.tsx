import { useState, useEffect, useRef, useMemo } from 'react';
import { Check, ChevronDown, ArrowLeft, Zap } from 'lucide-react';
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

interface BehaviourOption {
  id: BehaviourLevel;
  scop: number;
  scopPercent: string;
  label: string;
  tag: string;
  tagType: 'neutral' | 'popular' | 'savings';
  description: string;
}

const BEHAVIOUR_OPTIONS: BehaviourOption[] = [
  {
    id: 'simple',
    scop: 3.4,
    scopPercent: '340%',
    label: 'Simple & quick',
    tag: 'Easiest install',
    tagType: 'neutral',
    description: 'We change as little as possible. Your system works well, and you get started faster.',
  },
  {
    id: 'balanced',
    scop: 3.7,
    scopPercent: '370%',
    label: 'Balanced',
    tag: 'Most popular',
    tagType: 'popular',
    description: 'We make a few small upgrades so your system runs more efficiently and saves more each year.',
  },
  {
    id: 'best',
    scop: 4.0,
    scopPercent: '400%',
    label: 'Best long-term',
    tag: 'Lowest bills',
    tagType: 'savings',
    description: 'We fully optimise the system so it runs at maximum efficiency and costs the least to run.',
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

  // Calculate exact £ values for each option based on baseResults (simple SCOP 3.4)
  const optionValues = useMemo(() => {
    if (!baseResults) return null;
    
    const baseInstall = baseResults.customerContribution;
    const baseRunning = baseResults.hpCost;
    
    // Approximate impact calculations based on SCOP differences
    // Higher SCOP = more radiator upgrades = higher install, but lower running
    const simpleInstall = baseInstall;
    const balancedInstall = baseInstall + 400;
    const bestInstall = baseInstall + 800;
    
    // Running costs scale inversely with SCOP
    const simpleRunning = baseRunning;
    const balancedRunning = Math.round(baseRunning * (3.4 / 3.7));
    const bestRunning = Math.round(baseRunning * (3.4 / 4.0));
    
    return {
      simple: { install: simpleInstall, running: simpleRunning },
      balanced: { install: balancedInstall, running: balancedRunning },
      best: { install: bestInstall, running: bestRunning },
    };
  }, [baseResults]);

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
          const values = optionValues?.[option.id];
          const simpleValues = optionValues?.simple;
          
          // Calculate difference from simple option
          const installDiff = values && simpleValues ? values.install - simpleValues.install : 0;
          const runningDiff = values && simpleValues ? simpleValues.running - values.running : 0;
          
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

                  {/* Calculated values display */}
                  {values && (
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">After grant:</span>
                        <span className="font-semibold text-foreground">£{values.install.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Yearly heating cost:</span>
                        <span className="font-semibold text-foreground">£{values.running.toLocaleString()}/yr</span>
                      </div>
                    </div>
                  )}

                  {/* Impact badges + SCOP */}
                  <div className="flex items-center gap-2 text-xs flex-wrap">
                    {installDiff === 0 ? (
                      <span className="px-2.5 py-1 rounded-lg font-medium bg-muted text-muted-foreground">
                        Included
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg font-medium bg-amber-50 text-amber-700">
                        +£{installDiff.toLocaleString()} install
                      </span>
                    )}
                    {runningDiff > 0 && (
                      <span className="px-2.5 py-1 rounded-lg font-medium bg-green-50 text-green-700">
                        £{runningDiff}/yr lower
                      </span>
                    )}
                    <span className="px-2.5 py-1 rounded-lg font-medium bg-muted/50 text-muted-foreground flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      SCOP {option.scop} ({option.scopPercent})
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Collapsible explainer - "Why does this matter?" */}
      <Collapsible open={explainerOpen} onOpenChange={setExplainerOpen} className="mb-6">
        <CollapsibleTrigger className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors mx-auto group">
          <span>Why does this matter?</span>
          <ChevronDown className={cn(
            'w-4 h-4 transition-transform duration-200',
            explainerOpen && 'rotate-180'
          )} />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4 overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
          <div className="bg-muted/50 rounded-xl p-4 text-sm space-y-4">
            {/* Simple explanation */}
            <div className="space-y-2">
              <p className="text-foreground font-medium">Higher efficiency = lower bills</p>
              <p className="text-muted-foreground">
                A more efficient heat pump uses less electricity to make the same amount of warmth. 
                Think of it like a car that goes further on the same tank of fuel.
              </p>
            </div>
            
            {/* Visual diagram */}
            <div className="flex items-center justify-center gap-3 py-3 bg-white rounded-lg border border-border">
              <div className="text-center">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mb-1">
                  <Zap className="w-4 h-4 text-amber-600" />
                </div>
                <p className="text-[10px] text-muted-foreground">1 unit<br/>electricity</p>
              </div>
              <div className="text-muted-foreground">→</div>
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mb-1">
                  <span className="text-lg">🔥</span>
                </div>
                <p className="text-[10px] text-muted-foreground">3–4 units<br/>heat</p>
              </div>
            </div>
            
            {/* Bullet points */}
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Simple installs work well, but use a bit more electricity</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Best long-term uses less electricity but may need larger radiators</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span>We'll confirm exactly what's needed during your design visit</span>
              </li>
            </ul>
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
