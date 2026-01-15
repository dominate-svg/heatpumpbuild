import { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EstimateResults } from '@/lib/calculations';

interface StickyEstimatePanelProps {
  results: EstimateResults | null;
  currentFuel: string;
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
    // Always update if value changes
    if (prevValueRef.current === value) return;
    
    // Cancel any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    setIsAnimating(true);
    
    const startValue = prevValueRef.current;
    const endValue = value;
    const duration = 400;
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      
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

  // Sync display value on mount or if value changes without animation
  useEffect(() => {
    prevValueRef.current = value;
    setDisplayValue(value);
  }, []); // Only on mount

  return (
    <span className={cn(
      'transition-colors duration-300 inline-block',
      isAnimating && highlightDirection === 'down' && 'text-green-600',
      isAnimating && highlightDirection === 'up' && 'text-amber-600',
    )}>
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  );
}

export function StickyEstimatePanel({ results, currentFuel, className }: StickyEstimatePanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!results) return null;

  const savingsPositive = results.estimatedSavings > 0;

  return (
    <>
      {/* Backdrop when expanded */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}
      
      {/* Panel */}
      <div 
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-lg transition-all duration-300',
          'lg:left-auto lg:right-4 lg:bottom-4 lg:w-80 lg:rounded-2xl lg:border',
          isExpanded && 'rounded-t-2xl',
          className
        )}
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {/* Collapsed view - always visible */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-4 flex items-center justify-between active:bg-muted/50 transition-colors"
        >
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-0.5">Your estimate</p>
            <div className="flex items-baseline gap-4">
              <div>
                <span className="text-lg font-bold text-foreground">
                  <AnimatedNumber value={results.customerContribution} highlightDirection="up" />
                </span>
                <span className="text-xs text-muted-foreground ml-1">install</span>
              </div>
              <div className={cn(
                'flex items-center gap-1',
                savingsPositive ? 'text-green-600' : 'text-muted-foreground'
              )}>
                {savingsPositive ? (
                  <TrendingDown className="w-3.5 h-3.5" />
                ) : (
                  <TrendingUp className="w-3.5 h-3.5" />
                )}
                <span className="text-sm font-semibold">
                  <AnimatedNumber 
                    value={Math.abs(results.estimatedSavings)} 
                    prefix={savingsPositive ? '£' : '-£'}
                    suffix="/yr"
                    highlightDirection={savingsPositive ? 'down' : 'up'}
                  />
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="text-xs">Details</span>
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
            <div className="pt-4 space-y-3">
              {/* Install breakdown */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Install cost</p>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Full installation</span>
                    <span className="font-medium">£{results.grossInstallPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Government grant</span>
                    <span className="font-medium text-green-600">−£{results.grantApplied.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-1 border-t border-border">
                    <span className="font-semibold">You pay</span>
                    <span className="font-bold text-lg">£{results.customerContribution.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Running costs */}
              <div className="pt-2 border-t border-border">
                <p className="text-xs font-medium text-muted-foreground mb-2">Running costs</p>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Heat pump / year</span>
                    <span className="font-medium">£{Math.round(results.hpCost).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Your current {currentFuel}</span>
                    <span className="font-medium">£{Math.round(results.baselineCost).toLocaleString()}</span>
                  </div>
                  <div className={cn(
                    'flex justify-between text-sm pt-1 border-t border-border',
                    savingsPositive ? 'text-green-600' : 'text-amber-600'
                  )}>
                    <span className="font-semibold">
                      {savingsPositive ? 'Annual savings' : 'Difference'}
                    </span>
                    <span className="font-bold">
                      {savingsPositive ? '£' : '+£'}{Math.abs(results.estimatedSavings).toLocaleString()}/yr
                    </span>
                  </div>
                </div>
              </div>

              {/* What's included */}
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Includes heat pump, cylinder, installation, controls, and 5-year warranty
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
