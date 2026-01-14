import { PoundSterling, Gift, TrendingDown, Zap, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCountUp } from '@/hooks/useCountUp';
import type { EstimateResults } from '@/lib/calculations';
import { cn } from '@/lib/utils';

interface InitialEstimateSectionProps {
  results: EstimateResults;
  currentFuel: string;
  onPersonalise: () => void;
}

const FUEL_LABELS: Record<string, string> = {
  gas: 'gas',
  oil: 'oil',
  lpg: 'LPG',
  electric: 'electric',
};

interface EstimateCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  description: string;
  variant?: 'default' | 'primary' | 'success';
  delay?: number;
}

function EstimateCard({ 
  icon, 
  label, 
  value, 
  prefix = '£', 
  suffix = '',
  description, 
  variant = 'default',
  delay = 0
}: EstimateCardProps) {
  const { value: displayValue } = useCountUp(value, { duration: 1500, delay });
  
  return (
    <div className={cn(
      'p-4 sm:p-5 rounded-xl sm:rounded-2xl border animate-scale-in',
      variant === 'primary' && 'bg-primary/5 border-primary/20',
      variant === 'success' && 'bg-green-50 border-green-200',
      variant === 'default' && 'bg-card border-border'
    )}>
      <div className="flex items-center gap-2.5 sm:gap-3 mb-2 sm:mb-3">
        <div className={cn(
          'w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center',
          variant === 'primary' && 'bg-primary/10',
          variant === 'success' && 'bg-green-100',
          variant === 'default' && 'bg-muted/50'
        )}>
          {icon}
        </div>
        <span className="text-xs sm:text-sm text-muted-foreground">{label}</span>
      </div>
      
      <p className={cn(
        'text-2xl sm:text-3xl font-bold mb-0.5 sm:mb-1',
        variant === 'primary' && 'text-primary',
        variant === 'success' && 'text-green-600',
        variant === 'default' && 'text-foreground'
      )}>
        {prefix}{displayValue.toLocaleString()}{suffix}
      </p>
      
      <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function InitialEstimateSection({ 
  results, 
  currentFuel, 
  onPersonalise 
}: InitialEstimateSectionProps) {
  const savingsPositive = results.estimatedSavings > 0;
  const fuelLabel = FUEL_LABELS[currentFuel] || 'current';

  return (
    <section className="py-8 sm:py-12 animate-fade-in">
      {/* Header with celebration */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-3 sm:mb-4">
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          Your starting estimate
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2 px-2">
          Here's what a heat pump could look like for you
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Based on similar homes with your EPC and fuel type
        </p>
      </div>

      {/* Estimate cards */}
      <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
        <EstimateCard
          icon={<PoundSterling className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />}
          label="Full install cost"
          value={results.grossInstallPrice}
          description="Heat pump, cylinder, and full installation"
          delay={0}
        />

        <EstimateCard
          icon={<Gift className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />}
          label="Government grant"
          value={results.grantApplied}
          prefix="-£"
          description="Boiler Upgrade Scheme — we handle the paperwork"
          variant="primary"
          delay={200}
        />

        {/* Net cost highlight */}
        <div className="p-5 sm:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground animate-scale-in" style={{ animationDelay: '400ms' }}>
          <p className="text-xs sm:text-sm opacity-90 mb-0.5 sm:mb-1">Your cost after grant</p>
          <p className="text-3xl sm:text-4xl font-bold">£{results.customerContribution.toLocaleString()}</p>
        </div>

        <EstimateCard
          icon={<Zap className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />}
          label="Running cost"
          value={Math.round(results.hpCost)}
          suffix="/year"
          description="Estimated annual electricity with smart tariff"
          delay={600}
        />

        <EstimateCard
          icon={<TrendingDown className={cn(
            'w-4 h-4 sm:w-5 sm:h-5',
            savingsPositive ? 'text-green-600' : 'text-muted-foreground'
          )} />}
          label="Annual savings"
          value={Math.abs(results.estimatedSavings)}
          prefix={savingsPositive ? '£' : '-£'}
          suffix="/year"
          description={savingsPositive 
            ? `Compared to your ${fuelLabel} heating`
            : `Your ${fuelLabel} is already efficient — savings grow as prices rise`
          }
          variant={savingsPositive ? 'success' : 'default'}
          delay={800}
        />
      </div>

      {/* Reassurance */}
      <div className="bg-muted/30 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-6 sm:mb-8">
        <p className="text-xs sm:text-sm text-muted-foreground text-center">
          This is a realistic starting estimate — let's personalise it next
        </p>
      </div>

      {/* CTA */}
      <Button 
        onClick={onPersonalise}
        size="lg"
        className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold active:scale-[0.98] transition-transform"
      >
        Personalise this →
      </Button>
    </section>
  );
}
