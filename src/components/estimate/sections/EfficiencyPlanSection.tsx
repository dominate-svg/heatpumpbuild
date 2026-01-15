import { useState, useEffect, useRef, useMemo } from 'react';
import { Check, ChevronDown, ArrowLeft, Settings, HelpCircle, PiggyBank } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import type { EstimateResults, Assumptions } from '@/lib/calculations';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface EfficiencyPlanSectionProps {
  scop: number;
  onScopChange: (scop: number) => void;
  results: EstimateResults | null;
  baseResults: EstimateResults | null;
  assumptions: Assumptions;
  onContinue: () => void;
  onBack: () => void;
}

type PlanLevel = 'simple' | 'balanced' | 'optimised';

interface PlanOption {
  id: PlanLevel;
  scop: number;
  label: string;
  tag: string;
  tagType: 'neutral' | 'recommended' | 'savings';
  efficiencyLabel: string;
  description: string;
}

const PLAN_OPTIONS: PlanOption[] = [
  {
    id: 'simple',
    scop: 3.4,
    label: 'Simple & quick',
    tag: 'Lowest upfront',
    tagType: 'neutral',
    efficiencyLabel: 'Standard (340%)',
    description: 'Keep changes minimal. Lowest install cost, slightly higher running costs.',
  },
  {
    id: 'balanced',
    scop: 3.7,
    label: 'Balanced upgrade',
    tag: 'Recommended',
    tagType: 'recommended',
    efficiencyLabel: 'Improved (370%)',
    description: 'Best mix of price and lower bills. A few upgrades for better efficiency.',
  },
  {
    id: 'optimised',
    scop: 4.0,
    label: 'Fully optimised',
    tag: 'Lowest bills',
    tagType: 'savings',
    efficiencyLabel: 'High (400%)',
    description: 'Lowest bills long-term. May need more radiator upgrades.',
  },
];

// A/B test: check localStorage for default selection
function getDefaultSelection(): PlanLevel {
  try {
    const variant = localStorage.getItem('efficiency_default_variant');
    if (variant === 'B') return 'simple';
  } catch {}
  return 'balanced'; // Variant A (default)
}

export function EfficiencyPlanSection({ 
  scop, 
  onScopChange,
  results,
  baseResults,
  assumptions,
  onContinue,
  onBack,
}: EfficiencyPlanSectionProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanLevel>(() => {
    if (scop >= 4.0) return 'optimised';
    if (scop >= 3.7) return 'balanced';
    return 'simple';
  });
  const [explainerOpen, setExplainerOpen] = useState(false);
  const hasInitialized = useRef(false);

  // Calculate exact £ impacts for each plan
  const planValues = useMemo(() => {
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
        runningDiff: 0,
        savingsDiff: 0,
      },
      balanced: { 
        install: balancedInstall, 
        running: balancedRunning,
        savings: balancedSavings,
        installDiff: balancedInstall - simpleInstall,
        runningDiff: balancedRunning - simpleRunning,
        savingsDiff: balancedSavings - simpleSavings,
      },
      optimised: { 
        install: bestInstall, 
        running: bestRunning,
        savings: bestSavings,
        installDiff: bestInstall - simpleInstall,
        runningDiff: bestRunning - simpleRunning,
        savingsDiff: bestSavings - simpleSavings,
      },
    };
  }, [baseResults, assumptions]);

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      const defaultPlan = getDefaultSelection();
      setSelectedPlan(defaultPlan);
      const option = PLAN_OPTIONS.find(o => o.id === defaultPlan);
      if (option) onScopChange(option.scop);
    }
  }, [onScopChange]);

  const handleSelect = (plan: PlanLevel) => {
    if (plan === selectedPlan) return;
    setSelectedPlan(plan);
    const option = PLAN_OPTIONS.find(o => o.id === plan);
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

      {/* Header icon */}
      <div className="flex justify-center mb-4">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Settings className="w-7 h-7 text-primary" />
        </div>
      </div>

      {/* Title with help */}
      <div className="text-center mb-2">
        <div className="flex items-center justify-center gap-2">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            Pick your comfort & savings plan
          </h2>
          <Sheet>
            <SheetTrigger asChild>
              <button className="text-muted-foreground/50 hover:text-primary">
                <HelpCircle className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl">
              <SheetHeader>
                <SheetTitle className="text-left">Why this matters</SheetTitle>
                <SheetDescription className="text-left space-y-3">
                  <p>
                    <strong>Higher efficiency = lower running costs.</strong> A 370% efficient heat pump produces £3.70 of heat for every £1 of electricity.
                  </p>
                  <p>
                    To achieve higher efficiency, heat pumps run at lower water temperatures. This sometimes means upgrading radiators so they can still heat your home effectively.
                  </p>
                  <p className="text-xs italic">
                    We'll confirm exactly what's needed during your home survey.
                  </p>
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Subtitle */}
      <p className="text-center text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
        This changes efficiency, radiator upgrades, and your estimated running cost.
      </p>

      {/* Plan cards */}
      <div className="space-y-3 mb-5">
        {PLAN_OPTIONS.map((option) => {
          const isSelected = selectedPlan === option.id;
          const values = planValues?.[option.id];
          
          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              className={cn(
                'relative w-full p-4 rounded-2xl border-2 text-left transition-all',
                'bg-card touch-manipulation',
                isSelected 
                  ? 'border-primary ring-2 ring-primary/20' 
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
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-foreground text-base">
                      {option.label}
                    </h3>
                    <span className={cn(
                      'px-2 py-0.5 text-[11px] font-bold rounded-full',
                      option.tagType === 'recommended' && 'bg-primary/10 text-primary',
                      option.tagType === 'neutral' && 'bg-muted text-muted-foreground',
                      option.tagType === 'savings' && 'bg-green-100 text-green-700'
                    )}>
                      {option.tag}
                    </span>
                  </div>
                  
                  {/* Efficiency label */}
                  <p className="text-xs text-muted-foreground mb-2">
                    {option.efficiencyLabel}
                    <span className="ml-1.5 opacity-60">
                      — £1 electricity → £{(option.scop).toFixed(1)} of heat
                    </span>
                  </p>
                  
                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                    {option.description}
                  </p>

                  {/* Exact £ impact badges */}
                  {values && (
                    <div className="flex items-center gap-2.5 text-xs flex-wrap">
                      {/* Install impact */}
                      <span className={cn(
                        'px-2.5 py-1.5 rounded-lg font-bold tabular-nums',
                        values.installDiff === 0 
                          ? 'bg-green-50 text-green-700' 
                          : 'bg-amber-50 text-amber-700'
                      )}>
                        {values.installDiff === 0 ? '+£0 install' : `+£${values.installDiff.toLocaleString()} install`}
                      </span>
                      
                      {/* Prominent savings badge with icon */}
                      <span className={cn(
                        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold tabular-nums',
                        values.savings > 0 
                          ? 'bg-green-100 text-green-700 ring-1 ring-green-200' 
                          : 'bg-amber-100 text-amber-700 ring-1 ring-amber-200'
                      )}>
                        <PiggyBank className="w-3.5 h-3.5" />
                        {values.savings > 0 
                          ? `Save £${Math.round(values.savings)}/yr` 
                          : `£${Math.abs(Math.round(values.savings))}/yr extra`}
                      </span>
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
              <strong className="text-foreground">Efficiency</strong> is how much heat you get from electricity — like a car's fuel efficiency. Higher efficiency = lower running costs.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              To run more efficiently, heat pumps use lower water temperatures. This sometimes means bigger radiators to keep your home just as warm.
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
        className="w-full h-14 text-base font-semibold rounded-xl active:scale-[0.98] transition-all"
      >
        Continue →
      </Button>
    </section>
  );
}