import { useState, useEffect, useRef, useMemo } from 'react';
import { Check, ChevronDown, ArrowLeft, Settings, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import type { EstimateResults, Assumptions } from '@/lib/calculations';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface OptimisationSectionProps {
  scop: number;
  onScopChange: (scop: number) => void;
  results: EstimateResults | null;
  baseResults: EstimateResults | null;
  assumptions: Assumptions;
  onContinue: () => void;
  onBack: () => void;
}

type OptLevel = 'simple' | 'balanced' | 'optimised';

interface OptOption {
  id: OptLevel;
  scop: number;
  label: string;
  tag: string;
  tagType: 'neutral' | 'popular' | 'savings';
  description: string;
}

const OPT_OPTIONS: OptOption[] = [
  {
    id: 'simple',
    scop: 3.4,
    label: 'Simple setup',
    tag: 'Lowest upfront',
    tagType: 'neutral',
    description: 'We change as little as possible. Lowest install cost, slightly higher bills.',
  },
  {
    id: 'balanced',
    scop: 3.7,
    label: 'Balanced upgrade',
    tag: 'Recommended',
    tagType: 'popular',
    description: 'A few upgrades to reduce your bills without big changes.',
  },
  {
    id: 'optimised',
    scop: 4.0,
    label: 'Fully optimised',
    tag: 'Lowest bills',
    tagType: 'savings',
    description: 'More upgrades now for the lowest possible bills long-term.',
  },
];

export function OptimisationSection({ 
  scop, 
  onScopChange,
  results,
  baseResults,
  assumptions,
  onContinue,
  onBack,
}: OptimisationSectionProps) {
  const [selectedLevel, setSelectedLevel] = useState<OptLevel>(() => {
    if (scop >= 4.0) return 'optimised';
    if (scop >= 3.7) return 'balanced';
    return 'simple';
  });
  const [explainerOpen, setExplainerOpen] = useState(false);
  const hasInitialized = useRef(false);

  // Calculate exact £ values for each option
  const optionValues = useMemo(() => {
    if (!baseResults) return null;
    
    const baseInstall = baseResults.customerContribution;
    const baseRunning = baseResults.hpCost;
    const baseSavings = baseResults.estimatedSavings;
    
    // Running costs scale inversely with SCOP
    const simpleRunning = baseRunning;
    const balancedRunning = Math.round(baseRunning * (3.4 / 3.7));
    const bestRunning = Math.round(baseRunning * (3.4 / 4.0));
    
    // Install differences (radiator upgrades)
    const radCost = assumptions.rad_upgrade_cost || 350;
    const simpleInstall = baseInstall;
    const balancedInstall = baseInstall + (4 * radCost); // ~4 extra rads
    const bestInstall = baseInstall + (9 * radCost);     // ~9 extra rads
    
    // Savings improvement
    const simpleSavings = baseSavings;
    const balancedSavings = simpleSavings + (simpleRunning - balancedRunning);
    const bestSavings = simpleSavings + (simpleRunning - bestRunning);
    
    return {
      simple: { 
        install: simpleInstall, 
        running: simpleRunning,
        savings: simpleSavings,
        installDiff: 0,
        savingsDiff: 0,
      },
      balanced: { 
        install: balancedInstall, 
        running: balancedRunning,
        savings: balancedSavings,
        installDiff: balancedInstall - simpleInstall,
        savingsDiff: balancedSavings - simpleSavings,
      },
      optimised: { 
        install: bestInstall, 
        running: bestRunning,
        savings: bestSavings,
        installDiff: bestInstall - simpleInstall,
        savingsDiff: bestSavings - simpleSavings,
      },
    };
  }, [baseResults, assumptions]);

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      // Default to 'balanced' on first load
      setSelectedLevel('balanced');
      onScopChange(3.7);
    }
  }, [onScopChange]);

  const handleSelect = (level: OptLevel) => {
    if (level === selectedLevel) return;
    setSelectedLevel(level);
    const option = OPT_OPTIONS.find(o => o.id === level);
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

      {/* Icon */}
      <div className="flex justify-center mb-4">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Settings className="w-7 h-7 text-primary" />
        </div>
      </div>

      {/* Title with tooltip */}
      <div className="text-center mb-2">
        <div className="flex items-center justify-center gap-2">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            How optimised should your system be?
          </h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-muted-foreground/50 hover:text-muted-foreground">
                  <Info className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <div className="space-y-2 text-xs">
                  <p className="font-semibold">Why we ask this</p>
                  <p>A more optimised system runs more efficiently, lowering your electricity bills but requiring more upfront investment.</p>
                  <p className="font-semibold pt-1">How we calculate this</p>
                  <p>We use your heat loss, EPC rating, and radiator sizing to determine what upgrades would improve efficiency.</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Subtitle */}
      <p className="text-center text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
        This affects how much we upgrade to lower your bills.
      </p>

      {/* Option cards */}
      <div className="space-y-3 mb-5">
        {OPT_OPTIONS.map((option) => {
          const isSelected = selectedLevel === option.id;
          const values = optionValues?.[option.id];
          
          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              className={cn(
                'option-card relative w-full p-4 rounded-2xl border-2 text-left',
                'bg-card touch-manipulation',
                isSelected 
                  ? 'option-card-selected border-primary' 
                  : 'border-border hover:border-muted-foreground/40'
              )}
            >
              <div className="flex items-start gap-3.5">
                {/* Selection indicator */}
                <div className={cn(
                  'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200',
                  isSelected 
                    ? 'border-primary bg-primary scale-110' 
                    : 'border-muted-foreground/30'
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
                      'px-2 py-0.5 text-[11px] font-bold rounded-full',
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

                  {/* Price impact badges - exact numbers */}
                  {values && (
                    <div className="flex items-center gap-2 text-xs flex-wrap">
                      <span className={cn(
                        'px-2.5 py-1.5 rounded-lg font-bold tabular-nums',
                        values.installDiff === 0 
                          ? 'bg-green-50 text-green-700' 
                          : 'bg-amber-50 text-amber-700'
                      )}>
                        {values.installDiff === 0 ? '+£0 install' : `+£${values.installDiff.toLocaleString()} install`}
                      </span>
                      {values.savingsDiff > 0 && (
                        <span className="px-2.5 py-1.5 rounded-lg font-bold bg-green-50 text-green-700 tabular-nums">
                          +£{values.savingsDiff}/yr savings
                        </span>
                      )}
                      {values.savingsDiff === 0 && (
                        <span className="px-2.5 py-1.5 rounded-lg font-medium bg-muted text-muted-foreground">
                          Base savings
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Collapsible explainer */}
      <Collapsible open={explainerOpen} onOpenChange={setExplainerOpen} className="mb-6">
        <CollapsibleTrigger className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors mx-auto group">
          <span>How does this work?</span>
          <ChevronDown className={cn(
            'w-4 h-4 transition-transform duration-200',
            explainerOpen && 'rotate-180'
          )} />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4 overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
          <div className="bg-muted/50 rounded-xl p-4 text-sm space-y-3">
            <p className="text-muted-foreground leading-relaxed">
              A more efficient heat pump uses less electricity to produce the same warmth — like a car that goes further on the same tank of fuel.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              To run more efficiently, we may recommend larger radiators that transfer heat better at lower temperatures. This costs more upfront but saves money every year.
            </p>
            <p className="text-foreground font-medium">
              We'll confirm exactly what's needed during your design visit.
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* CTA */}
      <Button 
        onClick={onContinue}
        size="lg"
        className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold rounded-xl active:scale-[0.98] transition-all cta-hover-lift"
      >
        Continue →
      </Button>
    </section>
  );
}
