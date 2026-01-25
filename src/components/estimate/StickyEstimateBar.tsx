import { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, TrendingDown, TrendingUp, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EstimateResults } from '@/lib/calculations';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface StickyEstimateBarProps {
  results: EstimateResults | null;
  currentFuel: string;
  epcContribution?: number | null;
  radiatorAdder?: number;
  className?: string;
}

interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  highlightDirection?: 'up' | 'down' | null;
}

function AnimatedNumber({ 
  value, 
  prefix = '£',
  suffix = '',
  highlightDirection,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevValueRef = useRef(value);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (prevValueRef.current === value) return;
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    setIsAnimating(true);
    
    const startValue = prevValueRef.current;
    const endValue = value;
    const duration = 500;
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      
      const newValue = Math.round(startValue + (endValue - startValue) * eased);
      setDisplayValue(newValue);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        prevValueRef.current = value;
        animationRef.current = null;
        setTimeout(() => setIsAnimating(false), 200);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value]);

  useEffect(() => {
    prevValueRef.current = value;
    setDisplayValue(value);
  }, []);

  return (
    <span className={cn(
      'transition-all duration-300 inline-block tabular-nums',
      isAnimating && highlightDirection === 'down' && 'text-green-600 scale-105',
      isAnimating && highlightDirection === 'up' && 'text-amber-600 scale-105',
    )}>
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  );
}

export function StickyEstimateBar({ results, currentFuel, epcContribution, radiatorAdder = 0, className }: StickyEstimateBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!results) return null;

  // Use EPC-based contribution + radiator adder from efficiency plan
  const baseContribution = epcContribution ?? results.customerContribution;
  const displayContribution = baseContribution + radiatorAdder;
  const savingsPositive = results.estimatedSavings > 0;

  return (
    <>
      {/* Backdrop when expanded */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
          onClick={() => setIsExpanded(false)}
        />
      )}
      
      {/* Panel - mobile bottom (compact), desktop top-right corner */}
      <div 
        className={cn(
          'fixed z-50 bg-card border shadow-xl transition-all duration-300',
          // Mobile: compact bottom bar with safe spacing
          'bottom-0 left-0 right-0 border-t rounded-t-xl',
          // Desktop: top-right corner, below header
          'lg:left-auto lg:right-4 lg:top-20 lg:bottom-auto lg:w-64 lg:rounded-xl lg:border lg:shadow-lg',
          isExpanded && 'rounded-t-xl lg:rounded-xl',
          className
        )}
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {/* Header - always visible, compact on mobile */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-3 py-2 lg:px-4 lg:py-3 flex items-center justify-between active:bg-muted/50 transition-colors"
        >
          <div className="flex-1 text-left">
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide mb-0.5 lg:mb-1">
              Your estimate
            </p>
            <div className="flex items-center gap-2 sm:gap-3 lg:flex-col lg:items-start lg:gap-1">
              <div className="flex items-baseline gap-1">
                <span className="text-lg sm:text-xl lg:text-xl font-bold text-foreground">
                  <AnimatedNumber value={displayContribution} highlightDirection="up" />
                </span>
                <span className="text-[9px] sm:text-[10px] text-muted-foreground">after grant</span>
              </div>
              
              <div className={cn(
                'flex items-center gap-0.5',
                savingsPositive ? 'text-green-600' : 'text-amber-600'
              )}>
                {savingsPositive ? (
                  <TrendingDown className="w-3 h-3" />
                ) : (
                  <TrendingUp className="w-3 h-3" />
                )}
                <span className="text-xs sm:text-sm font-bold tabular-nums">
                  <AnimatedNumber 
                    value={Math.abs(results.estimatedSavings)} 
                    prefix={savingsPositive ? '−£' : '+£'}
                    suffix="/yr"
                    highlightDirection={savingsPositive ? 'down' : 'up'}
                  />
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1 text-muted-foreground ml-2">
            <span className="text-[10px] sm:text-xs font-medium hidden sm:inline">Details</span>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </div>
        </button>

        {/* Expanded breakdown */}
        {isExpanded && (
          <div className="px-4 pb-4 border-t border-border animate-fade-in">
            <div className="pt-4 space-y-4">
              {/* Install cost breakdown */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Install cost
                  </p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-muted-foreground/50 hover:text-muted-foreground">
                          <Info className="w-3 h-3" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs">Includes heat pump, installation, cylinder, controls, and 5-year warranty.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Full price</span>
                    <span className="font-medium tabular-nums">£{results.grossInstallPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-600">Government grant</span>
                    <span className="font-medium text-green-600 tabular-nums">−£{results.grantApplied.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-1.5 border-t border-border">
                    <span className="font-semibold">You pay</span>
                    <span className="font-bold text-base tabular-nums">£{displayContribution.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Annual costs breakdown */}
              <div className="pt-2 border-t border-border">
                <div className="flex items-center gap-1.5 mb-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Yearly heating costs
                  </p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-muted-foreground/50 hover:text-muted-foreground">
                          <Info className="w-3 h-3" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs">Based on your EPC data, home size, and the Octopus Cosy tariff.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Heat pump</span>
                    <span className="font-medium tabular-nums">£{Math.round(results.hpCost).toLocaleString()}/yr</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current {currentFuel}</span>
                    <span className="font-medium tabular-nums">£{Math.round(results.baselineCost).toLocaleString()}/yr</span>
                  </div>
                  <div className={cn(
                    'flex justify-between pt-1.5 border-t border-border',
                    savingsPositive ? 'text-green-600' : 'text-amber-600'
                  )}>
                    <span className="font-semibold">
                      {savingsPositive ? 'Annual savings' : 'Extra yearly cost'}
                    </span>
                    <span className="font-bold tabular-nums">
                      {savingsPositive ? '−' : '+'}£{Math.abs(results.estimatedSavings).toLocaleString()}/yr
                    </span>
                  </div>
                </div>
                
                {/* Credibility note */}
                <p className="text-[10px] text-muted-foreground mt-3 leading-relaxed">
                  Balanced estimate using national averages & conservative Cosy usage. Survey confirms final costs.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
