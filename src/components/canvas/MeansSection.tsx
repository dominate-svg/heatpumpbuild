import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Award, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/calculations';
import type { EstimateResults, Assumptions } from '@/lib/calculations';
import { useCountUp } from '@/hooks/useCountUp';
import { cn } from '@/lib/utils';

interface MeansSectionProps {
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
  description?: string;
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
}: MetricCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { value: animatedValue } = useCountUp(value, { delay: delay + 300, duration: 1200 });

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
        'relative p-6 sm:p-8 rounded-2xl border shadow-sm transition-all duration-700',
        variantStyles[variant],
        isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95'
      )}
    >
      {/* Glow effect */}
      {isVisible && variant === 'success' && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-success/10 to-transparent opacity-100 transition-opacity duration-1000" />
      )}
      
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          {Icon && <Icon className={cn('w-5 h-5', valueStyles[variant])} />}
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
        </div>
        <p className={cn('text-4xl sm:text-5xl font-bold tracking-tight', valueStyles[variant])}>
          {prefix}{animatedValue.toLocaleString()}{suffix}
        </p>
        {description && (
          <p className="text-sm text-muted-foreground mt-3">{description}</p>
        )}
      </div>
    </div>
  );
}

export function MeansSection({ results, assumptions, onContinue }: MeansSectionProps) {
  const [showCTA, setShowCTA] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setShowCTA(true), 1800);
    return () => clearTimeout(timeout);
  }, []);

  const { estimatedSavings, customerContribution } = results;
  const isNegativeSavings = estimatedSavings < 0;
  const displaySavings = Math.abs(estimatedSavings);
  const grantAmount = assumptions.bus_grant_value;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-16">
      {/* Headline */}
      <div className="text-center mb-12 animate-fade-in">
        <h2 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
          Here's what this means for you
        </h2>
      </div>

      {/* Metrics grid - staggered animation */}
      <div className="grid grid-cols-1 gap-4 mb-10">
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
            delay={400}
            icon={Award}
          />
          
          <MetricCard
            label="Estimated annual savings"
            value={displaySavings}
            prefix={isNegativeSavings ? '-£' : '£'}
            suffix="/yr"
            variant={isNegativeSavings ? 'warning' : 'success'}
            delay={800}
            icon={isNegativeSavings ? TrendingDown : TrendingUp}
          />
        </div>
      </div>

      {/* CTA */}
      <div className={cn(
        'transition-all duration-700',
        showCTA ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      )}>
        <Button 
          onClick={onContinue}
          size="lg"
          className="w-full h-14 text-base font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
        >
          Let me tweak this
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
