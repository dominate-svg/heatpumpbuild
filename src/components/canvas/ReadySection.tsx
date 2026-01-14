import { Award, Calendar, Check, Gauge, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/calculations';
import type { EstimateResults, Assumptions } from '@/lib/calculations';
import type { Tariff } from '@/hooks/useTariffs';
import { cn } from '@/lib/utils';

interface ReadySectionProps {
  results: EstimateResults;
  assumptions: Assumptions;
  scop: number;
  selectedTariff: Tariff | null;
  onBook: () => void;
}

export function ReadySection({
  results,
  assumptions,
  scop,
  selectedTariff,
  onBook,
}: ReadySectionProps) {
  const { estimatedSavings, customerContribution } = results;
  const isNegativeSavings = estimatedSavings < 0;
  const displaySavings = Math.abs(estimatedSavings);
  const efficiencyPercent = Math.round(scop * 100);

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-16 pb-32">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 text-success text-sm font-medium mb-4">
          <Check className="w-4 h-4" />
          Ready when you are
        </div>
        <h2 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
          Your final estimate
        </h2>
      </div>

      {/* Summary card */}
      <div className="bg-card rounded-3xl shadow-elevated overflow-hidden">
        {/* Hero price */}
        <div className="p-8 text-center border-b border-border">
          <p className="text-sm text-muted-foreground mb-2">Install price</p>
          <p className="text-5xl sm:text-6xl font-bold text-foreground tracking-tight">
            {formatCurrency(customerContribution)}
          </p>
        </div>

        {/* Details */}
        <div className="p-6 space-y-4">
          {/* Grant */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                <Award className="w-5 h-5 text-success" />
              </div>
              <span className="font-medium text-foreground">Government grant</span>
            </div>
            <span className="text-xl font-bold text-success">
              {formatCurrency(assumptions.bus_grant_value)}
            </span>
          </div>

          <div className="h-px bg-border" />

          {/* Specs */}
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Efficiency</span>
              <span className="font-medium text-foreground ml-auto">{efficiencyPercent}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Tariff</span>
              <span className="font-medium text-foreground ml-auto truncate max-w-[80px]">
                {selectedTariff?.name?.split(' ')[0] || 'Cosy'}
              </span>
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Savings */}
          <div className={cn(
            'p-5 rounded-xl',
            isNegativeSavings 
              ? 'bg-amber-50 border border-amber-200'
              : 'bg-success/5 border border-success/20'
          )}>
            <div className="flex items-center justify-between">
              <span className={cn(
                'font-medium',
                isNegativeSavings ? 'text-amber-700' : 'text-success'
              )}>
                Estimated annual savings
              </span>
              <span className={cn(
                'text-2xl font-bold',
                isNegativeSavings ? 'text-amber-600' : 'text-success'
              )}>
                {isNegativeSavings ? '-' : ''}£{displaySavings}/yr
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-muted/30 border-t border-border">
          <p className="text-center text-sm text-muted-foreground">
            Survey confirms final design. No obligation to proceed.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-8">
        <Button 
          onClick={onBook}
          size="lg"
          className="w-full h-16 text-lg font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
        >
          <Calendar className="w-5 h-5 mr-3" />
          Book my free home survey
        </Button>
        <p className="text-center text-sm text-muted-foreground mt-4">
          No obligation. This just confirms the design.
        </p>
      </div>
    </div>
  );
}
