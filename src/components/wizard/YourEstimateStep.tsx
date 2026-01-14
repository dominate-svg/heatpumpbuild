import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Award, ChevronDown, ChevronUp, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { formatCurrency } from '@/lib/calculations';
import type { EstimateResults, Assumptions } from '@/lib/calculations';
import { useCountUp } from '@/hooks/useCountUp';
import { cn } from '@/lib/utils';

interface YourEstimateStepProps {
  results: EstimateResults;
  assumptions: Assumptions;
  onContinue: () => void;
}

function MetricCard({ 
  label, 
  value, 
  prefix = '£',
  suffix = '',
  variant = 'default',
  delay = 0,
  icon: Icon,
  description,
}: { 
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  variant?: 'default' | 'success' | 'warning';
  delay?: number;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const { value: animatedValue } = useCountUp(value, { delay: delay + 200, duration: 1000 });

  useEffect(() => {
    const timeout = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timeout);
  }, [delay]);

  const variantStyles = {
    default: 'bg-card border-border',
    success: 'bg-success/5 border-success/20',
    warning: 'bg-amber-50 border-amber-200',
  };

  const valueStyles = {
    default: 'text-foreground',
    success: 'text-success',
    warning: 'text-amber-600',
  };

  return (
    <div 
      className={cn(
        'relative p-6 rounded-2xl border shadow-sm transition-all duration-700',
        variantStyles[variant],
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      )}
    >
      {/* Subtle glow effect */}
      {isVisible && (
        <div className={cn(
          'absolute inset-0 rounded-2xl transition-opacity duration-1000',
          variant === 'success' && 'bg-gradient-to-br from-success/5 to-transparent opacity-100',
          variant === 'default' && 'bg-gradient-to-br from-primary/3 to-transparent opacity-100'
        )} />
      )}
      
      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          {Icon && <Icon className={cn('w-4 h-4', valueStyles[variant])} />}
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
        </div>
        <p className={cn('text-3xl sm:text-4xl font-bold tracking-tight', valueStyles[variant])}>
          {prefix}{animatedValue.toLocaleString()}{suffix}
        </p>
        {description && (
          <p className="text-sm text-muted-foreground mt-2">{description}</p>
        )}
      </div>
    </div>
  );
}

export function YourEstimateStep({ results, assumptions, onContinue }: YourEstimateStepProps) {
  const [isCalculationOpen, setIsCalculationOpen] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timeout);
  }, []);

  const { estimatedSavings, customerContribution, epcBand, annualHeatKwh, heatLossKw } = results;
  const isNegativeSavings = estimatedSavings < 0;
  const displaySavings = Math.abs(estimatedSavings);
  const grantAmount = assumptions.bus_grant_value;

  return (
    <div className="w-full max-w-xl mx-auto px-4">
      <div className="bg-card rounded-3xl shadow-elevated overflow-hidden">
        {/* Header */}
        <div className={cn(
          'px-8 pt-10 pb-8 text-center transition-all duration-700',
          showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        )}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Estimate ready
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
            Here's your personalised estimate
          </h2>
        </div>

        {/* Metrics */}
        <div className="px-8 space-y-4">
          <MetricCard
            label="Estimated install price"
            value={customerContribution}
            variant="default"
            delay={200}
          />
          
          <MetricCard
            label="Government grant included"
            value={grantAmount}
            variant="success"
            delay={400}
            icon={Award}
          />
          
          <MetricCard
            label="Estimated annual savings"
            value={displaySavings}
            prefix={isNegativeSavings ? '-£' : '£'}
            suffix="/yr"
            variant={isNegativeSavings ? 'warning' : 'success'}
            delay={600}
            icon={isNegativeSavings ? TrendingDown : TrendingUp}
            description={isNegativeSavings 
              ? "Many choose Cosy for comfort and future-proofing. Survey can often improve this."
              : undefined
            }
          />
        </div>

        {/* Trust line */}
        <div className={cn(
          'px-8 py-6 transition-all duration-700 delay-700',
          showContent ? 'opacity-100' : 'opacity-0'
        )}>
          <p className="text-center text-sm text-muted-foreground">
            These are realistic estimates. Your survey confirms final details.
          </p>
        </div>

        {/* How we calculated */}
        <div className="px-8 pb-4">
          <Collapsible open={isCalculationOpen} onOpenChange={setIsCalculationOpen}>
            <CollapsibleTrigger asChild>
              <button className="flex items-center justify-center gap-2 w-full py-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
                How is this calculated?
                {isCalculationOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="bg-muted/30 rounded-2xl p-5 space-y-3 text-sm text-muted-foreground mb-4">
                <p>
                  We combine your EPC band ({epcBand}) with national averages to estimate your heating needs.
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-border/50">
                    <span>Estimated heat demand</span>
                    <span className="font-medium text-foreground">{annualHeatKwh.toLocaleString()} kWh/year</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border/50">
                    <span>Heat loss at design temp</span>
                    <span className="font-medium text-foreground">{heatLossKw} kW</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border/50">
                    <span>Default efficiency</span>
                    <span className="font-medium text-foreground">340% (SCOP 3.4)</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span>Tariff modelled</span>
                    <span className="font-medium text-foreground">Octopus Cosy</span>
                  </div>
                </div>
                <p className="pt-2 text-xs italic">
                  Your home survey will measure precisely and confirm the final system design.
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* CTA */}
        <div className={cn(
          'px-8 pb-10 transition-all duration-700 delay-1000',
          showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        )}>
          <Button 
            onClick={onContinue} 
            className="w-full h-14 text-base font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
          >
            Refine my estimate
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
