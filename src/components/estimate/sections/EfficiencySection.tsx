import { useState, useEffect, useRef } from 'react';
import { Check, HelpCircle } from 'lucide-react';
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
  scopDisplay: string;
  title: string;
  subtitle: string;
  installImpact: { label: string; type: 'neutral' | 'cost' };
  runningImpact: { label: string; type: 'neutral' | 'savings' };
  isRecommended?: boolean;
}[] = [
  {
    id: 'standard',
    scop: 3.4,
    scopDisplay: '340%',
    title: 'Standard',
    subtitle: 'Lowest upfront cost, simple installation',
    installImpact: { label: 'Included', type: 'neutral' },
    runningImpact: { label: 'Baseline', type: 'neutral' },
  },
  {
    id: 'balanced',
    scop: 3.7,
    scopDisplay: '370%',
    title: 'Balanced',
    subtitle: 'Lower bills without major changes',
    installImpact: { label: '+£250–500', type: 'cost' },
    runningImpact: { label: '−£150/yr', type: 'savings' },
    isRecommended: true,
  },
  {
    id: 'high',
    scop: 4.0,
    scopDisplay: '400%',
    title: 'Maximum',
    subtitle: 'Lowest bills, most future-proof',
    installImpact: { label: '+£600–900', type: 'cost' },
    runningImpact: { label: '−£250/yr', type: 'savings' },
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

function getDefaultLevel(): EfficiencyLevel {
  const variant = getABVariant();
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
    if (scop >= 4.0) return 'high';
    if (scop >= 3.7) return 'balanced';
    return 'standard';
  });
  const [showExplainer, setShowExplainer] = useState(false);
  const hasInitialized = useRef(false);

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
    setSelectedLevel(level);
    const option = EFFICIENCY_OPTIONS.find(o => o.id === level);
    if (option) onScopChange(option.scop);
  };

  return (
    <section className="py-6 sm:py-10 animate-fade-in">
      {/* Title */}
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
          How efficient should your system be?
        </h2>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          Higher efficiency = lower bills, but may need some radiator upgrades
        </p>
      </div>

      {/* Efficiency cards - stacked vertically */}
      <div className="space-y-3 mb-6">
        {EFFICIENCY_OPTIONS.map((option) => {
          const isSelected = selectedLevel === option.id;
          
          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              className={cn(
                'relative w-full p-4 rounded-2xl border-2 text-left transition-all duration-150',
                'bg-white active:scale-[0.99]',
                isSelected 
                  ? 'border-primary shadow-md' 
                  : 'border-border hover:border-muted-foreground/30'
              )}
            >
              <div className="flex items-start gap-4">
                {/* Selection indicator */}
                <div className={cn(
                  'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors',
                  isSelected 
                    ? 'border-primary bg-primary' 
                    : 'border-muted-foreground/30'
                )}>
                  {isSelected && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">
                      {option.title}
                    </h3>
                    <span className="text-xs text-muted-foreground font-medium">
                      {option.scopDisplay}
                    </span>
                    {option.isRecommended && (
                      <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] font-semibold rounded">
                        Recommended
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {option.subtitle}
                  </p>

                  {/* Impact row */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className={cn(
                      'px-2 py-1 rounded-md font-medium',
                      option.installImpact.type === 'neutral' 
                        ? 'bg-muted text-muted-foreground' 
                        : 'bg-amber-50 text-amber-700'
                    )}>
                      Install: {option.installImpact.label}
                    </span>
                    <span className={cn(
                      'px-2 py-1 rounded-md font-medium',
                      option.runningImpact.type === 'neutral' 
                        ? 'bg-muted text-muted-foreground' 
                        : 'bg-green-50 text-green-700'
                    )}>
                      Running: {option.runningImpact.label}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Why this matters link */}
      <button
        onClick={() => setShowExplainer(true)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto mb-6"
      >
        <HelpCircle className="w-4 h-4" />
        What does efficiency mean?
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
            <DialogTitle className="text-xl font-bold">What is efficiency?</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              A heat pump <span className="text-foreground font-medium">moves heat</span> from outside into your home — it doesn't create it like a boiler.
            </p>
            <p>
              Efficiency tells you how much heat you get for each unit of electricity. For example, <span className="text-foreground font-medium">370% means 3.7 units of heat for every 1 unit of electricity</span>.
            </p>
            
            <div className="bg-muted/50 rounded-xl p-3 space-y-2">
              <p className="text-foreground font-medium">Higher efficiency means:</p>
              <ul className="space-y-1.5 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  Lower electricity bills
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  Lower carbon footprint
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  May need larger radiators
                </li>
              </ul>
            </div>
            
            <p>
              We'll help you find the right balance between upfront cost and long-term savings.
            </p>
          </div>

          <DialogClose asChild>
            <Button className="w-full h-12 rounded-xl font-semibold mt-2">
              Got it
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </section>
  );
}
