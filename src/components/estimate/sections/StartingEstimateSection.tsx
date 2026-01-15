import { Gift, TrendingDown, TrendingUp, ArrowLeft, Shield, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { EstimateResults } from '@/lib/calculations';
import { useCountUp } from '@/hooks/useCountUp';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface StartingEstimateSectionProps {
  results: EstimateResults;
  currentFuel: string;
  onContinue: () => void;
  onBack: () => void;
}

const FUEL_LABELS: Record<string, string> = {
  gas: 'gas boiler',
  oil: 'oil boiler',
  lpg: 'LPG boiler',
  electric: 'electric heating',
};

export function StartingEstimateSection({ 
  results, 
  currentFuel,
  onContinue,
  onBack,
}: StartingEstimateSectionProps) {
  const savingsPositive = results.estimatedSavings > 0;
  const fuelLabel = FUEL_LABELS[currentFuel] || 'current heating';

  const { value: animatedCost } = useCountUp(results.customerContribution, { duration: 500 });
  const { value: animatedRunning } = useCountUp(Math.round(results.hpCost), { duration: 500 });
  const { value: animatedSavings } = useCountUp(Math.abs(results.estimatedSavings), { duration: 500 });

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

      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3">
          ✨ Your starting estimate
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          Here's what we estimate
        </h1>
      </div>

      {/* Main cost card */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground mb-4 shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <Gift className="w-4 h-4" />
          <span className="text-sm font-medium opacity-90">£{results.grantApplied.toLocaleString()} government grant included</span>
        </div>
        <p className="text-xs opacity-75 mb-1 uppercase tracking-wide">Estimated cost after grant</p>
        <p className="text-4xl font-bold mb-1 tabular-nums">
          £{animatedCost.toLocaleString()}
        </p>
        <p className="text-xs opacity-75">
          Full price: £{results.grossInstallPrice.toLocaleString()}
        </p>
      </div>

      {/* Running cost + savings cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Running cost */}
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-1.5 mb-2">
            <p className="text-xs text-muted-foreground">Est. annual running cost</p>
            <Sheet>
              <SheetTrigger asChild>
                <button className="text-muted-foreground/50 hover:text-primary">
                  <Info className="w-3 h-3" />
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-2xl">
                <SheetHeader>
                  <SheetTitle className="text-left">How we calculate running cost</SheetTitle>
                  <SheetDescription className="text-left space-y-2">
                    <p>This is the estimated annual cost of electricity to run your heat pump for heating and hot water.</p>
                    <p>Based on:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Your EPC rating: {results.epcBand}</li>
                      <li>Home size and heat demand</li>
                      <li>Octopus Cosy tariff rates</li>
                      <li>Balanced efficiency (370%)</li>
                    </ul>
                  </SheetDescription>
                </SheetHeader>
              </SheetContent>
            </Sheet>
          </div>
          <p className="text-xl font-bold text-foreground tabular-nums">
            £{animatedRunning}/yr
          </p>
        </div>

        {/* Savings */}
        <div className={cn(
          'p-4 rounded-xl border',
          savingsPositive 
            ? 'bg-green-50 border-green-200' 
            : 'bg-amber-50 border-amber-200'
        )}>
          <div className="flex items-center gap-1.5 mb-2">
            <p className="text-xs text-muted-foreground">Est. annual savings</p>
            <Sheet>
              <SheetTrigger asChild>
                <button className="text-muted-foreground/50 hover:text-primary">
                  <Info className="w-3 h-3" />
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-2xl">
                <SheetHeader>
                  <SheetTitle className="text-left">How we calculate savings</SheetTitle>
                  <SheetDescription className="text-left space-y-2">
                    <p>Savings = Your current {fuelLabel} costs − Heat pump running costs</p>
                    <p>We estimate your current heating costs at £{Math.round(results.baselineCost)}/yr based on your EPC data.</p>
                    <p className="text-xs italic">Actual savings depend on your usage patterns and tariff choice.</p>
                  </SheetDescription>
                </SheetHeader>
              </SheetContent>
            </Sheet>
          </div>
          <div className="flex items-center gap-1.5">
            {savingsPositive ? (
              <TrendingDown className="w-4 h-4 text-green-600" />
            ) : (
              <TrendingUp className="w-4 h-4 text-amber-600" />
            )}
            <p className={cn(
              'text-xl font-bold tabular-nums',
              savingsPositive ? 'text-green-700' : 'text-amber-700'
            )}>
              {savingsPositive ? '−' : '+'}£{animatedSavings}/yr
            </p>
          </div>
        </div>
      </div>

      {/* Trust note */}
      <div className="bg-muted/30 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-foreground font-medium mb-1">Balanced estimate</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This uses your EPC data combined with national averages. Your final quote will be confirmed after a home survey.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <Button 
        onClick={onContinue}
        size="lg"
        className="w-full h-14 text-base font-semibold rounded-xl active:scale-[0.98] transition-all"
      >
        Personalise my estimate →
      </Button>
    </section>
  );
}