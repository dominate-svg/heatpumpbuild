import { Gift, TrendingDown, Info, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { EstimateResults } from '@/lib/calculations';

interface InitialEstimateSectionProps {
  results: EstimateResults;
  currentFuel: string;
  onContinue: () => void;
  onBack: () => void;
}

const FUEL_LABELS: Record<string, string> = {
  gas: 'gas',
  oil: 'oil',
  lpg: 'LPG',
  electric: 'electric',
};

export function InitialEstimateSection({ 
  results, 
  currentFuel, 
  onContinue,
  onBack,
}: InitialEstimateSectionProps) {
  const savingsPositive = results.estimatedSavings > 0;
  const fuelLabel = FUEL_LABELS[currentFuel] || 'current';

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

      {/* Title */}
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Your estimate
        </h2>
        <p className="text-muted-foreground">
          Based on your home's energy data
        </p>
      </div>

      {/* Main cost display */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground mb-4 shadow-lg">
        {/* Grant badge */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 text-sm mb-4">
          <Gift className="w-3.5 h-3.5" />
          <span>£{results.grantApplied.toLocaleString()} grant applied</span>
        </div>

        {/* Price */}
        <div className="mb-4">
          <p className="text-sm opacity-80 mb-1">Install cost after grant</p>
          <p className="text-4xl sm:text-5xl font-bold">
            £{results.customerContribution.toLocaleString()}
          </p>
          <p className="text-sm opacity-70 mt-1">
            Full price: £{results.grossInstallPrice.toLocaleString()}
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/20 my-4" />

        {/* Running costs */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="opacity-70 mb-0.5">Running cost</p>
            <p className="text-xl font-bold">£{Math.round(results.hpCost).toLocaleString()}/yr</p>
          </div>
          <div>
            <p className="opacity-70 mb-0.5">vs your {fuelLabel}</p>
            <p className="text-xl font-bold">£{Math.round(results.baselineCost).toLocaleString()}/yr</p>
          </div>
        </div>
      </div>

      {/* Savings card */}
      <div className={cn(
        'p-4 rounded-xl border mb-6',
        savingsPositive 
          ? 'bg-green-50 border-green-200' 
          : 'bg-amber-50 border-amber-200'
      )}>
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center',
            savingsPositive ? 'bg-green-100' : 'bg-amber-100'
          )}>
            <TrendingDown className={cn(
              'w-5 h-5',
              savingsPositive ? 'text-green-600' : 'text-amber-600'
            )} />
          </div>
          <div>
            <p className={cn(
              'text-2xl font-bold',
              savingsPositive ? 'text-green-700' : 'text-amber-700'
            )}>
              {savingsPositive ? '' : '−'}£{Math.abs(results.estimatedSavings).toLocaleString()}/year
            </p>
            <p className="text-sm text-muted-foreground">
              {savingsPositive ? 'Estimated annual savings' : 'Estimated extra cost'}
            </p>
          </div>
        </div>
      </div>

      {/* Info note */}
      <div className="flex gap-3 p-3 rounded-xl bg-muted/50 mb-6">
        <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground">
          This estimate is based on your EPC data and national averages. You can fine-tune it next.
        </p>
      </div>

      {/* CTA */}
      <Button 
        onClick={onContinue}
        size="lg"
        className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold rounded-xl active:scale-[0.98] transition-transform"
      >
        Personalise my estimate →
      </Button>
    </section>
  );
}
