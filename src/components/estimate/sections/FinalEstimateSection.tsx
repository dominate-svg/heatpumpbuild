import { PoundSterling, Gift, TrendingDown, Zap, Check, Calendar, Phone, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCountUp } from '@/hooks/useCountUp';
import type { EstimateResults } from '@/lib/calculations';
import { cn } from '@/lib/utils';
import octopusPartnerLogo from '@/assets/octopus-partner.png';

interface FinalEstimateSectionProps {
  results: EstimateResults;
  currentFuel: string;
  onBook: () => void;
}

const FUEL_LABELS: Record<string, string> = {
  gas: 'gas',
  oil: 'oil',
  lpg: 'LPG',
  electric: 'electric',
};

const WHATS_INCLUDED = [
  'Full heat pump system',
  'Hot water cylinder',
  'Professional installation',
  'All controls & wiring',
  '£7,500 BUS grant applied',
  '5-year warranty',
];

const NEXT_STEPS = [
  { step: 1, title: 'Book a design call', description: 'Quick chat to confirm details' },
  { step: 2, title: 'Home survey', description: 'Engineer visits to measure' },
  { step: 3, title: 'Fixed quote', description: 'No surprises — what we quote is what you pay' },
];

export function FinalEstimateSection({ 
  results, 
  currentFuel, 
  onBook 
}: FinalEstimateSectionProps) {
  const { value: installCost } = useCountUp(results.grossInstallPrice, { duration: 1200 });
  const { value: grant } = useCountUp(results.grantApplied, { duration: 1200, delay: 200 });
  const { value: netCost } = useCountUp(results.customerContribution, { duration: 1200, delay: 400 });
  const { value: savings } = useCountUp(Math.abs(results.estimatedSavings), { duration: 1200, delay: 600 });
  
  const savingsPositive = results.estimatedSavings > 0;
  const fuelLabel = FUEL_LABELS[currentFuel] || 'current';

  return (
    <section className="py-8 sm:py-12 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-3 sm:mb-4">
          ✨ Your personalised estimate
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
          Here's your heat pump quote
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Tailored to your home and preferences
        </p>
      </div>

      {/* Main cost card */}
      <div className="p-5 sm:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground mb-4 sm:mb-6 animate-scale-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
          <span className="text-xs sm:text-sm opacity-90">Your cost after grant</span>
          <div className="flex items-center gap-1.5 sm:gap-2 bg-white/20 rounded-full px-2.5 py-1 sm:px-3 self-start sm:self-auto">
            <Gift className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm">£{grant.toLocaleString()} grant</span>
          </div>
        </div>
        <p className="text-4xl sm:text-5xl font-bold mb-1 sm:mb-2">£{netCost.toLocaleString()}</p>
        <p className="text-xs sm:text-sm opacity-75">
          Full install: £{installCost.toLocaleString()} − £{grant.toLocaleString()} grant
        </p>
      </div>

      {/* Savings card */}
      <div className={cn(
        'p-4 sm:p-5 rounded-xl sm:rounded-2xl border mb-4 sm:mb-6 animate-scale-in',
        savingsPositive 
          ? 'bg-green-50 border-green-200' 
          : 'bg-card border-border'
      )} style={{ animationDelay: '200ms' }}>
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0',
            savingsPositive ? 'bg-green-100' : 'bg-muted'
          )}>
            <TrendingDown className={cn(
              'w-5 h-5 sm:w-6 sm:h-6',
              savingsPositive ? 'text-green-600' : 'text-muted-foreground'
            )} />
          </div>
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">Estimated annual savings</p>
            <p className={cn(
              'text-xl sm:text-2xl font-bold',
              savingsPositive ? 'text-green-600' : 'text-foreground'
            )}>
              {savingsPositive ? '£' : '-£'}{savings.toLocaleString()}/year
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Compared to your {fuelLabel} heating
            </p>
          </div>
        </div>
      </div>

      {/* What's included */}
      <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-card border border-border mb-4 sm:mb-6">
        <h3 className="font-semibold text-foreground text-sm sm:text-base mb-3 sm:mb-4">What's included</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          {WHATS_INCLUDED.map((item) => (
            <div key={item} className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
              <span className="text-xs sm:text-sm text-muted-foreground">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* What happens next */}
      <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-muted/30 border border-border mb-6 sm:mb-8">
        <h3 className="font-semibold text-foreground text-sm sm:text-base mb-3 sm:mb-4">What happens next?</h3>
        <div className="space-y-3 sm:space-y-4">
          {NEXT_STEPS.map((step) => (
            <div key={step.step} className="flex items-start gap-2.5 sm:gap-3">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-xs sm:text-sm font-medium text-primary">{step.step}</span>
              </div>
              <div>
                <p className="font-medium text-foreground text-xs sm:text-sm">{step.title}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust badges */}
      <div className="flex items-center justify-center gap-4 mb-4 sm:mb-6">
        <img 
          src={octopusPartnerLogo} 
          alt="Octopus Trusted Partner" 
          className="h-8 sm:h-10 opacity-80"
        />
      </div>

      {/* CTA */}
      <Button 
        onClick={onBook}
        size="lg"
        className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold active:scale-[0.98] transition-transform"
      >
        <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
        Book a design call
      </Button>

      {/* Reassurance */}
      <div className="flex items-center justify-center gap-3 sm:gap-4 mt-3 sm:mt-4 text-xs sm:text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          No obligation
        </span>
        <span>•</span>
        <span>Takes 15 minutes</span>
      </div>
    </section>
  );
}
