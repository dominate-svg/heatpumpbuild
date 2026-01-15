import { Gift, TrendingDown, Check, Calendar, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { EstimateResults } from '@/lib/calculations';
import octopusPartnerLogo from '@/assets/octopus-partner.png';

interface ReviewSectionProps {
  results: EstimateResults;
  currentFuel: string;
  onAskQuestions: () => void;
  onContinue: () => void;
}

const FUEL_LABELS: Record<string, string> = {
  gas: 'gas',
  oil: 'oil',
  lpg: 'LPG',
  electric: 'electric',
};

const WHATS_INCLUDED = [
  'Heat pump unit',
  'Hot water cylinder',
  'Full installation',
  'All controls & wiring',
  '£7,500 grant applied',
  '5-year warranty',
];

export function ReviewSection({ 
  results, 
  currentFuel, 
  onAskQuestions,
  onContinue,
}: ReviewSectionProps) {
  const savingsPositive = results.estimatedSavings > 0;
  const fuelLabel = FUEL_LABELS[currentFuel] || 'current';

  return (
    <section className="py-6 sm:py-10 animate-fade-in">
      {/* Title */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
          ✨ Your personalised estimate
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
          Here's your heat pump quote
        </h2>
      </div>

      {/* Main cost card */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground mb-4 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <Gift className="w-4 h-4" />
          <span className="text-sm opacity-90">£{results.grantApplied.toLocaleString()} grant applied</span>
        </div>
        <p className="text-xs opacity-75 mb-1">You pay</p>
        <p className="text-4xl sm:text-5xl font-bold mb-1">
          £{results.customerContribution.toLocaleString()}
        </p>
        <p className="text-xs opacity-75">
          Full install: £{results.grossInstallPrice.toLocaleString()}
        </p>
      </div>

      {/* Savings card */}
      <div className={cn(
        'p-4 rounded-xl border mb-4',
        savingsPositive 
          ? 'bg-green-50 border-green-200' 
          : 'bg-white border-border'
      )}>
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center',
            savingsPositive ? 'bg-green-100' : 'bg-muted'
          )}>
            <TrendingDown className={cn(
              'w-5 h-5',
              savingsPositive ? 'text-green-600' : 'text-muted-foreground'
            )} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Estimated annual savings</p>
            <p className={cn(
              'text-xl font-bold',
              savingsPositive ? 'text-green-600' : 'text-foreground'
            )}>
              {savingsPositive ? '£' : '-£'}{Math.abs(results.estimatedSavings).toLocaleString()}/year
            </p>
            <p className="text-xs text-muted-foreground">
              vs your {fuelLabel} heating
            </p>
          </div>
        </div>
      </div>

      {/* What's included */}
      <div className="p-4 rounded-xl bg-white border border-border mb-4">
        <h3 className="font-semibold text-foreground text-sm mb-3">What's included</h3>
        <div className="grid grid-cols-2 gap-2">
          {WHATS_INCLUDED.map((item) => (
            <div key={item} className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
              <span className="text-xs text-muted-foreground">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Trust badge */}
      <div className="flex justify-center mb-6">
        <img 
          src={octopusPartnerLogo} 
          alt="Octopus Trusted Partner" 
          className="h-8 opacity-70"
        />
      </div>

      {/* CTAs */}
      <div className="space-y-3">
        <Button 
          onClick={onContinue}
          size="lg"
          className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold rounded-xl active:scale-[0.98] transition-transform"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Book a design call
        </Button>
        
        <Button 
          onClick={onAskQuestions}
          variant="outline"
          size="lg"
          className="w-full h-12 text-base font-medium rounded-xl active:scale-[0.98] transition-transform"
        >
          <HelpCircle className="w-4 h-4 mr-2" />
          Ask questions first
        </Button>
      </div>

      {/* Reassurance */}
      <p className="text-center text-xs text-muted-foreground mt-4">
        No obligation • Takes 15 minutes • We'll confirm everything
      </p>
    </section>
  );
}
