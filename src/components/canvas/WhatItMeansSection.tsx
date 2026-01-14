import { useState, useEffect } from 'react';
import { Award, TrendingUp, TrendingDown, HelpCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatCurrency } from '@/lib/calculations';
import type { EstimateResults, Assumptions } from '@/lib/calculations';
import { useCountUp } from '@/hooks/useCountUp';
import { cn } from '@/lib/utils';

interface WhatItMeansSectionProps {
  results: EstimateResults;
  assumptions: Assumptions;
  onContinue: () => void;
}

interface MetricCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  variant?: 'default' | 'success' | 'warning';
  tooltip: string;
  delay?: number;
  icon?: React.ComponentType<{ className?: string }>;
}

function MetricCard({
  label,
  value,
  prefix = '£',
  suffix = '',
  variant = 'default',
  tooltip,
  delay = 0,
  icon: Icon,
}: MetricCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { value: animatedValue } = useCountUp(value, { delay: delay + 200, duration: 800 });

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
        'relative p-6 rounded-2xl border shadow-soft transition-all duration-500',
        variantStyles[variant],
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      )}
    >
      {/* Glow effect */}
      {isVisible && variant === 'success' && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-success/5 to-transparent opacity-100 animate-count-glow" />
      )}

      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {Icon && <Icon className={cn('w-5 h-5', valueStyles[variant])} />}
            <p className="text-micro text-muted-foreground font-medium">{label}</p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                    <HelpCircle className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="text-sm">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className={cn('text-card-number font-bold tracking-tight', valueStyles[variant])}>
            {prefix}{animatedValue.toLocaleString()}{suffix}
          </p>
        </div>
      </div>
    </div>
  );
}

export function WhatItMeansSection({ results, assumptions, onContinue }: WhatItMeansSectionProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timeout);
  }, []);

  const { estimatedSavings, customerContribution } = results;
  const isNegativeSavings = estimatedSavings < 0;
  const displaySavings = Math.abs(estimatedSavings);
  const grantAmount = assumptions.bus_grant_value;

  return (
    <section className="py-16 px-6">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div
          className={cn(
            'text-center mb-10 transition-all duration-500',
            showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          )}
        >
          <h2 className="text-section-title font-semibold text-foreground tracking-tight mb-3">
            What this means for your home
          </h2>
          <p className="text-body text-muted-foreground">
            Connecting your home's needs to real numbers.
          </p>
        </div>

        {/* Metric cards */}
        <div className="space-y-4 mb-8">
          <MetricCard
            label="Estimated install cost"
            value={customerContribution}
            variant="default"
            tooltip="This is the price after the government grant is applied. It includes your heat pump, installation, and any upgrades needed."
            delay={100}
          />

          <MetricCard
            label="Government grant included"
            value={grantAmount}
            variant="success"
            tooltip="The Boiler Upgrade Scheme (BUS) provides up to £7,500 towards your heat pump. We apply this automatically."
            delay={300}
            icon={Award}
          />

          <MetricCard
            label="Estimated annual savings"
            value={displaySavings}
            prefix={isNegativeSavings ? '-£' : '£'}
            suffix="/year"
            variant={isNegativeSavings ? 'warning' : 'success'}
            tooltip={
              isNegativeSavings
                ? "Running costs may be slightly higher than your current heating. Many choose Cosy for comfort, future-proofing, and environmental benefits."
                : "This is how much less you could spend on heating each year compared to your current system."
            }
            delay={500}
            icon={isNegativeSavings ? TrendingDown : TrendingUp}
          />
        </div>

        {/* Microcopy */}
        <p
          className={cn(
            'text-center text-micro text-muted-foreground mb-8 transition-all duration-500 delay-700',
            showContent ? 'opacity-100' : 'opacity-0'
          )}
        >
          These are balanced estimates based on homes like yours.
        </p>

        {/* CTA */}
        <div
          className={cn(
            'text-center transition-all duration-500 delay-1000',
            showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          )}
        >
          <Button
            onClick={onContinue}
            size="lg"
            className="h-14 px-10 text-base font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
          >
            Personalise this
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
}
