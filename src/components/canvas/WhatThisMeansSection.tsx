import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Award, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/calculations';
import type { EstimateResults, Assumptions } from '@/lib/calculations';
import { useCountUp } from '@/hooks/useCountUp';
import { cn } from '@/lib/utils';

interface WhatThisMeansSectionProps {
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
  delay?: number;
  icon?: React.ComponentType<{ className?: string }>;
}

function MetricCard({ 
  label, 
  value, 
  prefix = '£',
  suffix = '',
  variant = 'default',
  delay = 0,
  icon: Icon,
}: MetricCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { value: animatedValue } = useCountUp(value, { delay: delay + 200, duration: 500 });

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
        'relative p-6 sm:p-8 rounded-3xl border transition-all duration-300',
        variantStyles[variant],
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
      )}
    >
      {/* Glow on success */}
      {isVisible && variant === 'success' && (
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-success/5 to-transparent" />
      )}
      
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          {Icon && <Icon className={cn('w-5 h-5', valueStyles[variant])} />}
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
        </div>
        <p className={cn('text-card-number animate-count-glow', valueStyles[variant])}>
          {prefix}{animatedValue.toLocaleString()}{suffix}
        </p>
      </div>
    </div>
  );
}

export function WhatThisMeansSection({ results, assumptions, onContinue }: WhatThisMeansSectionProps) {
  const [showCTA, setShowCTA] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setShowCTA(true), 1200);
    return () => clearTimeout(timeout);
  }, []);

  const { estimatedSavings, customerContribution } = results;
  const isNegativeSavings = estimatedSavings < 0;
  const displaySavings = Math.abs(estimatedSavings);
  const grantAmount = assumptions.bus_grant_value;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-16">
      {/* Headline */}
      <div className="text-center mb-10 section-enter">
        <h2 className="text-section-title text-foreground">
          What this means for you
        </h2>
      </div>

      {/* Metrics */}
      <div className="space-y-4 mb-8">
        <MetricCard
          label="Estimated install price"
          value={customerContribution}
          variant="default"
          delay={0}
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MetricCard
            label="Government grant included"
            value={grantAmount}
            variant="success"
            delay={300}
            icon={Award}
          />
          
          <MetricCard
            label="Estimated annual savings"
            value={displaySavings}
            prefix={isNegativeSavings ? '-£' : '£'}
            suffix="/yr"
            variant={isNegativeSavings ? 'warning' : 'success'}
            delay={450}
            icon={isNegativeSavings ? TrendingDown : TrendingUp}
          />
        </div>
      </div>

      {/* Microcopy */}
      <p className="text-center text-micro text-muted-foreground mb-8 section-enter" style={{ animationDelay: '600ms' }}>
        These are balanced estimates based on homes like yours.
      </p>

      {/* CTA */}
      <div className={cn(
        'transition-all duration-300',
        showCTA ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      )}>
        <Button 
          onClick={onContinue}
          size="lg"
          className="w-full h-14 text-base font-semibold rounded-xl shadow-lg cta-hover-lift"
        >
          Personalise this
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
