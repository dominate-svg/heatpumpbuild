import { useState, useEffect, useRef } from 'react';
import { Check, HelpCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { EstimateResults, Assumptions } from '@/lib/calculations';

interface EfficiencySectionProps {
  scop: number;
  onScopChange: (scop: number) => void;
  results: EstimateResults | null;
  baseResults: EstimateResults | null;
  assumptions: Assumptions;
  onContinue: () => void;
}

type EfficiencyLevel = 'standard' | 'balanced' | 'high';

const EFFICIENCY_OPTIONS: {
  id: EfficiencyLevel;
  scop: number;
  scopLabel: string;
  title: string;
  description: string;
  helperText: string;
  installBadge: string;
  runningBadge: string;
  isRecommended?: boolean;
}[] = [
  {
    id: 'standard',
    scop: 3.4,
    scopLabel: '340% SCOP',
    title: 'Standard efficiency',
    description: 'Reliable, lowest upfront cost',
    helperText: 'Best if you want to keep installation simple and minimise changes to your home.',
    installBadge: 'Included',
    runningBadge: 'Baseline',
  },
  {
    id: 'balanced',
    scop: 3.7,
    scopLabel: '370% SCOP',
    title: 'Balanced efficiency',
    description: 'Lower bills without major upgrades',
    helperText: 'A good balance between upfront cost and long-term savings.',
    installBadge: '+£250–£500',
    runningBadge: '−£150/year',
    isRecommended: true,
  },
  {
    id: 'high',
    scop: 4.0,
    scopLabel: '400% SCOP',
    title: 'High efficiency',
    description: 'Lowest running costs, most future-proof',
    helperText: 'Best for long-term savings and future energy prices.',
    installBadge: '+£600–£900',
    runningBadge: '−£250/year',
  },
];

// A/B test variant stored in localStorage
function getABVariant(): 'A' | 'B' {
  const stored = localStorage.getItem('efficiency_ab_variant');
  if (stored === 'A' || stored === 'B') return stored;
  
  // Randomly assign variant
  const variant = Math.random() < 0.5 ? 'A' : 'B';
  localStorage.setItem('efficiency_ab_variant', variant);
  
  // Track assignment (would send to analytics in production)
  console.log('[A/B Test] Efficiency default variant:', variant);
  return variant;
}

function getDefaultLevel(): EfficiencyLevel {
  const variant = getABVariant();
  // Variant A: Balanced (370%), Variant B: Standard (340%)
  return variant === 'A' ? 'balanced' : 'standard';
}

export function EfficiencySection({ 
  scop, 
  onScopChange,
  results,
  baseResults,
  assumptions,
  onContinue,
}: EfficiencySectionProps) {
  const [selectedLevel, setSelectedLevel] = useState<EfficiencyLevel>(() => {
    // Map current scop to level
    if (scop >= 4.0) return 'high';
    if (scop >= 3.7) return 'balanced';
    return 'standard';
  });
  const [showExplainer, setShowExplainer] = useState(false);
  const [animatingCard, setAnimatingCard] = useState<EfficiencyLevel | null>(null);
  const hasInitialized = useRef(false);

  // Set default based on A/B variant on first render
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      const defaultLevel = getDefaultLevel();
      setSelectedLevel(defaultLevel);
      const option = EFFICIENCY_OPTIONS.find(o => o.id === defaultLevel);
      if (option) onScopChange(option.scop);
    }
  }, [onScopChange]);

  const handleSelect = (level: EfficiencyLevel) => {
    if (level === selectedLevel) return;
    
    // Trigger card animation
    setAnimatingCard(level);
    setTimeout(() => setAnimatingCard(null), 300);
    
    setSelectedLevel(level);
    const option = EFFICIENCY_OPTIONS.find(o => o.id === level);
    if (option) onScopChange(option.scop);
  };

  return (
    <section className="py-6 sm:py-10 animate-fade-in">
      {/* Title */}
      <div className="text-center mb-2">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1">
          Choose your efficiency level
        </h2>
        <p className="text-sm text-muted-foreground">
          This controls how much heat you get from each unit of electricity
        </p>
      </div>

      {/* Helper text */}
      <p className="text-xs text-muted-foreground text-center mb-6 max-w-sm mx-auto">
        A higher % means lower running costs, but may require slightly more hardware (larger radiators).
      </p>

      {/* Efficiency cards */}
      <div className="space-y-3 sm:grid sm:grid-cols-3 sm:gap-3 sm:space-y-0 mb-4">
        {EFFICIENCY_OPTIONS.map((option) => {
          const isSelected = selectedLevel === option.id;
          const isAnimating = animatingCard === option.id;
          
          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              className={cn(
                'relative w-full p-4 rounded-2xl border-2 text-left transition-all duration-200',
                'bg-white active:scale-[0.98]',
                isSelected 
                  ? 'border-primary shadow-lg shadow-primary/10' 
                  : 'border-border hover:border-primary/30 shadow-sm',
                isAnimating && 'scale-[1.02]',
                isSelected && 'ring-2 ring-primary/20'
              )}
            >
              {/* Recommended pill */}
              {option.isRecommended && (
                <div className="absolute -top-2.5 left-4 px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-semibold rounded-full">
                  Recommended
                </div>
              )}
              
              {/* Checkmark */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}

              {/* SCOP label - headline sized */}
              <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
                {option.scopLabel}
              </div>

              {/* Title */}
              <h3 className="font-semibold text-foreground text-sm mb-1">
                {option.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-2">
                {option.description}
              </p>

              {/* Helper text */}
              <p className="text-xs text-muted-foreground/80 mb-3 leading-relaxed">
                {option.helperText}
              </p>

              {/* Impact badges */}
              <div className="flex flex-wrap gap-1.5">
                <span className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-medium',
                  option.id === 'standard' 
                    ? 'bg-muted text-muted-foreground' 
                    : 'bg-amber-100 text-amber-700'
                )}>
                  Install: {option.installBadge}
                </span>
                <span className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-medium',
                  option.id === 'standard' 
                    ? 'bg-muted text-muted-foreground' 
                    : 'bg-green-100 text-green-700'
                )}>
                  Running: {option.runningBadge}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Microcopy under cards */}
      <div className="bg-muted/50 rounded-xl p-3 mb-4">
        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          <span className="font-medium text-foreground">Radiators don't make heat — they release it.</span>
          <br />
          Higher efficiency systems run at lower temperatures and sometimes need slightly bigger radiators.
        </p>
      </div>

      {/* Why this matters link */}
      <button
        onClick={() => setShowExplainer(true)}
        className="flex items-center gap-1.5 text-sm text-primary hover:underline mx-auto mb-6"
      >
        <HelpCircle className="w-4 h-4" />
        Why does efficiency matter?
      </button>

      {/* CTA */}
      <Button 
        onClick={onContinue}
        size="lg"
        className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold rounded-xl active:scale-[0.98] transition-transform"
      >
        Continue
      </Button>

      {/* Explainer Modal */}
      <Dialog open={showExplainer} onOpenChange={setShowExplainer}>
        <DialogContent className="max-w-md mx-4 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Why efficiency matters</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              A heat pump <span className="text-foreground font-medium">moves heat</span> instead of making it.
            </p>
            <p>
              Efficiency (also called SCOP) tells you how many units of heat you get for each unit of electricity.
            </p>
            
            <div>
              <p className="text-foreground font-medium mb-2">Higher efficiency means:</p>
              <ul className="space-y-1 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-green-600">•</span>
                  Lower electricity bills
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">•</span>
                  Lower carbon emissions
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">•</span>
                  More future-proof as energy prices change
                </li>
              </ul>
            </div>
            
            <div>
              <p className="text-foreground font-medium mb-2">But higher efficiency often means:</p>
              <ul className="space-y-1 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600">•</span>
                  Bigger radiators
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600">•</span>
                  Slightly higher install cost
                </li>
              </ul>
            </div>
            
            <p className="text-foreground">
              That's why we help you choose the right balance.
            </p>
          </div>

          <DialogClose asChild>
            <Button 
              className="w-full h-12 rounded-xl font-semibold mt-2"
            >
              Got it
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </section>
  );
}
