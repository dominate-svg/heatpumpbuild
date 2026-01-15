import { useState, useEffect, useRef, useMemo } from 'react';
import { Check, ChevronDown, ArrowLeft, Zap, Info, PiggyBank, TrendingUp, Thermometer, Wrench, CircleDollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import type { EstimateResults } from '@/lib/calculations';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface OptimisationSectionProps {
  scop: number;
  onScopChange: (scop: number) => void;
  optionResults: Record<'simple' | 'balanced' | 'optimised', EstimateResults> | null;
  onContinue: () => void;
  onBack: () => void;
}

type OptLevel = 'simple' | 'balanced' | 'optimised';

interface OptOption {
  id: OptLevel;
  scop: number;
  efficiency: number;
  label: string;
  tag: string;
  tagType: 'neutral' | 'popular' | 'savings';
  description: string;
  whatsIncluded: string[];
  whyEfficiency: string;
  valueBreakdown: string;
}

const OPT_OPTIONS: OptOption[] = [
  {
    id: 'simple',
    scop: 3.4,
    efficiency: 340,
    label: 'Simple setup',
    tag: 'Lowest upfront',
    tagType: 'neutral',
    description: 'Minimal changes. Lower install cost but higher running bills.',
    whatsIncluded: [
      'Heat pump sized for your home',
      'Basic pipework & connections',
      'Keep existing radiators',
      'Standard hot water cylinder',
    ],
    whyEfficiency: 'Running at higher water temperatures (55°C) to work with your existing radiators. Less efficient but no radiator changes needed.',
    valueBreakdown: 'Best if you want to minimise upfront cost and are less concerned about long-term running costs.',
  },
  {
    id: 'balanced',
    scop: 3.7,
    efficiency: 370,
    label: 'Balanced upgrade',
    tag: 'Recommended',
    tagType: 'popular',
    description: 'Best value. A few upgrades for noticeably lower bills.',
    whatsIncluded: [
      'Heat pump sized for your home',
      'Optimised pipework & connections',
      '4-6 key radiator upgrades',
      'Premium hot water cylinder',
      'Smart heating controls',
    ],
    whyEfficiency: 'Running at medium temperatures (45°C) with upgraded radiators in key rooms. Great balance of efficiency and cost.',
    valueBreakdown: 'The extra upfront investment typically pays back in 3-5 years through lower bills, then you save every year after.',
  },
  {
    id: 'optimised',
    scop: 4.0,
    efficiency: 400,
    label: 'Fully optimised',
    tag: 'Lowest bills',
    tagType: 'savings',
    description: 'Maximum efficiency. Higher upfront but lowest bills long-term.',
    whatsIncluded: [
      'Heat pump sized for your home',
      'Premium pipework & connections',
      'Full radiator upgrade (8-12 rads)',
      'Premium hot water cylinder',
      'Smart zoned heating controls',
      'Weather compensation setup',
    ],
    whyEfficiency: 'Running at low temperatures (35°C) with all radiators upgraded for maximum heat transfer. The most efficient setup possible.',
    valueBreakdown: 'Highest upfront cost but lowest bills forever. Best for those staying long-term or prioritising comfort & sustainability.',
  },
];

export function OptimisationSection({ 
  scop, 
  onScopChange,
  optionResults,
  onContinue,
  onBack,
}: OptimisationSectionProps) {
  const [selectedLevel, setSelectedLevel] = useState<OptLevel>(() => {
    if (scop >= 4.0) return 'optimised';
    if (scop >= 3.7) return 'balanced';
    return 'simple';
  });
  const [expandedOption, setExpandedOption] = useState<OptLevel | null>(null);
  const [explainerOpen, setExplainerOpen] = useState(false);
  const hasInitialized = useRef(false);

  const optionValues = useMemo(() => {
    if (!optionResults) return null;

    const simple = optionResults.simple;
    const balanced = optionResults.balanced;
    const optimised = optionResults.optimised;

    return {
      simple: {
        install: simple.customerContribution,
        running: simple.hpCost,
        savings: simple.estimatedSavings,
        installDiff: 0,
        savingsDiff: 0,
      },
      balanced: {
        install: balanced.customerContribution,
        running: balanced.hpCost,
        savings: balanced.estimatedSavings,
        installDiff: balanced.customerContribution - simple.customerContribution,
        savingsDiff: balanced.estimatedSavings - simple.estimatedSavings,
      },
      optimised: {
        install: optimised.customerContribution,
        running: optimised.hpCost,
        savings: optimised.estimatedSavings,
        installDiff: optimised.customerContribution - simple.customerContribution,
        savingsDiff: optimised.estimatedSavings - simple.estimatedSavings,
      },
    };
  }, [optionResults]);

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
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

  const toggleExpanded = (e: React.MouseEvent, level: OptLevel) => {
    e.stopPropagation();
    setExpandedOption(expandedOption === level ? null : level);
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
          <Zap className="w-7 h-7 text-primary" />
        </div>
      </div>

      {/* Title with tooltip */}
      <div className="text-center mb-2">
        <div className="flex items-center justify-center gap-2">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            Choose your efficiency level
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
                  <p className="font-semibold">What is efficiency?</p>
                  <p>Efficiency (SCOP) measures how much heat you get per £1 of electricity. 370% means £1 of electricity produces £3.70 worth of heat.</p>
                  <p className="font-semibold pt-1">Higher efficiency = lower bills</p>
                  <p>But may require upgrading some radiators to work at lower water temperatures.</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Subtitle */}
      <p className="text-center text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
        Higher efficiency means lower bills. We'll recommend upgrades to achieve it.
      </p>

      {/* Educational callout */}
      <div className="bg-gradient-to-r from-primary/5 to-green-50 border border-primary/10 rounded-xl p-3.5 mb-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <div className="text-sm">
            <p className="font-medium text-foreground mb-0.5">How efficiency works</p>
            <p className="text-muted-foreground text-xs leading-relaxed">
              At <strong className="text-foreground">370% efficiency</strong>, every £1 of electricity produces £3.70 of heat. 
              Higher efficiency = less electricity needed = <strong className="text-green-700">lower bills</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Option cards */}
      <div className="space-y-3 mb-5">
        {OPT_OPTIONS.map((option) => {
          const isSelected = selectedLevel === option.id;
          const isExpanded = expandedOption === option.id;
          const values = optionValues?.[option.id];
          const efficiencyPercent = ((option.efficiency - 300) / 120) * 100;
          
          return (
            <div
              key={option.id}
              className={cn(
                'relative w-full rounded-2xl border-2 text-left transition-all',
                'bg-card',
                isSelected 
                  ? 'border-primary ring-2 ring-primary/20' 
                  : 'border-border hover:border-muted-foreground/40'
              )}
            >
              {/* Main clickable area */}
              <button
                onClick={() => handleSelect(option.id)}
                className="w-full p-4 text-left touch-manipulation"
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
                        option.tagType === 'popular' && 'bg-primary/10 text-primary',
                        option.tagType === 'neutral' && 'bg-blue-50 text-blue-700',
                        option.tagType === 'savings' && 'bg-green-100 text-green-700'
                      )}>
                        {option.tag}
                      </span>
                    </div>

                    {/* Efficiency indicator */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <Zap className={cn(
                          'w-4 h-4',
                          option.efficiency >= 400 ? 'text-green-600' :
                          option.efficiency >= 370 ? 'text-primary' : 'text-blue-600'
                        )} />
                        <span className={cn(
                          'text-lg font-bold tabular-nums',
                          option.efficiency >= 400 ? 'text-green-600' :
                          option.efficiency >= 370 ? 'text-primary' : 'text-foreground'
                        )}>
                          {option.efficiency}%
                        </span>
                        <span className="text-xs text-foreground/70">efficiency</span>
                      </div>
                      <div className="flex-1 h-2 bg-primary/10 rounded-full overflow-hidden max-w-20">
                        <div 
                          className={cn(
                            'h-full rounded-full transition-all duration-300',
                            option.efficiency >= 400 ? 'bg-green-500' :
                            option.efficiency >= 370 ? 'bg-primary' : 'bg-blue-500'
                          )}
                          style={{ width: `${efficiencyPercent}%` }}
                        />
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                      {option.description}
                    </p>

                    {/* Price badges */}
                    {values && (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2.5 text-xs flex-wrap">
                          <span className={cn(
                            'px-2.5 py-1.5 rounded-lg font-bold tabular-nums',
                            values.installDiff === 0 
                              ? 'bg-green-50 text-green-700' 
                              : 'bg-amber-50 text-amber-700'
                          )}>
                            {values.installDiff === 0 ? '+£0 upfront' : `+£${values.installDiff.toLocaleString()} upfront`}
                          </span>
                        </div>
                        
                        <div className={cn(
                          'flex items-center gap-2 px-3 py-2 rounded-xl',
                          values.savings > 0 
                            ? 'bg-gradient-to-r from-green-100 to-green-50 border border-green-200' 
                            : 'bg-gradient-to-r from-amber-100 to-amber-50 border border-amber-200'
                        )}>
                          <div className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center',
                            values.savings > 0 ? 'bg-green-200/50' : 'bg-amber-200/50'
                          )}>
                            <PiggyBank className={cn(
                              'w-4 h-4',
                              values.savings > 0 ? 'text-green-700' : 'text-amber-700'
                            )} />
                          </div>
                          <div className="flex-1">
                            <p className={cn(
                              'text-lg font-bold tabular-nums leading-tight',
                              values.savings > 0 ? 'text-green-700' : 'text-amber-700'
                            )}>
                              {values.savings > 0 
                                ? `Save £${values.savings.toLocaleString()}` 
                                : `£${Math.abs(values.savings).toLocaleString()} extra`}
                              <span className="text-sm font-semibold">/year</span>
                            </p>
                            <p className={cn(
                              'text-[10px]',
                              values.savings > 0 ? 'text-green-600' : 'text-amber-600'
                            )}>
                              on your energy bills
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </button>

              {/* Expandable details trigger */}
              <button
                onClick={(e) => toggleExpanded(e, option.id)}
                className={cn(
                  'w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium border-t transition-colors',
                  isExpanded 
                    ? 'bg-primary/5 text-primary border-primary/20' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 border-border'
                )}
              >
                <span>{isExpanded ? 'Hide details' : 'What\'s included?'}</span>
                <ChevronDown className={cn(
                  'w-3.5 h-3.5 transition-transform duration-200',
                  isExpanded && 'rotate-180'
                )} />
              </button>

              {/* Expandable content */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-border/50 animate-fade-in">
                  {/* What's included */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Wrench className="w-4 h-4 text-primary" />
                      <h4 className="text-sm font-semibold text-foreground">What's included</h4>
                    </div>
                    <ul className="space-y-1.5 ml-6">
                      {option.whatsIncluded.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <Check className="w-3.5 h-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Why this efficiency */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Thermometer className="w-4 h-4 text-primary" />
                      <h4 className="text-sm font-semibold text-foreground">Why {option.efficiency}% efficiency?</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed ml-6">
                      {option.whyEfficiency}
                    </p>
                  </div>

                  {/* Value breakdown */}
                  <div className="bg-gradient-to-r from-primary/5 to-green-50/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <CircleDollarSign className="w-4 h-4 text-green-600" />
                      <h4 className="text-sm font-semibold text-foreground">Is it worth it?</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {option.valueBreakdown}
                    </p>
                    {values && values.savingsDiff > 0 && option.id !== 'simple' && (
                      <p className="text-xs font-medium text-green-700 mt-2">
                        You'll save an extra £{values.savingsDiff.toLocaleString()}/year compared to Simple setup.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Collapsible explainer */}
      <Collapsible open={explainerOpen} onOpenChange={setExplainerOpen} className="mb-6">
        <CollapsibleTrigger className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors mx-auto group">
          <span>Learn more about efficiency</span>
          <ChevronDown className={cn(
            'w-4 h-4 transition-transform duration-200',
            explainerOpen && 'rotate-180'
          )} />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4 overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
          <div className="bg-primary/5 rounded-xl p-4 text-sm space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">What is SCOP/efficiency?</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              <strong className="text-foreground">SCOP (Seasonal Coefficient of Performance)</strong> measures how efficiently a heat pump converts electricity into heat over a year.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              A heat pump with <strong className="text-foreground">370% efficiency (SCOP 3.7)</strong> produces 3.7 kWh of heat for every 1 kWh of electricity — that's <strong className="text-green-700">3.7× more energy out than you put in</strong>.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              To achieve higher efficiency, heat pumps run at lower water temperatures. This sometimes requires <strong className="text-foreground">larger radiators</strong> so your home stays just as warm.
            </p>
            <p className="text-foreground font-medium pt-1">
              We'll confirm exactly what's needed during your home survey.
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
