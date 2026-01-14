import { Award, TrendingUp, TrendingDown, Gauge, Zap, Calendar, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/calculations';
import type { EstimateResults, Assumptions } from '@/lib/calculations';
import type { Tariff } from '@/hooks/useTariffs';
import { cn } from '@/lib/utils';

interface SummaryStepProps {
  results: EstimateResults;
  assumptions: Assumptions;
  scop: number;
  selectedTariff: Tariff | null;
  onBack: () => void;
  onBook: () => void;
}

export function SummaryStep({
  results,
  assumptions,
  scop,
  selectedTariff,
  onBack,
  onBook,
}: SummaryStepProps) {
  const { estimatedSavings, customerContribution } = results;
  const isNegativeSavings = estimatedSavings < 0;
  const displaySavings = Math.abs(estimatedSavings);
  const efficiencyPercent = Math.round(scop * 100);

  return (
    <div className="w-full max-w-xl mx-auto px-4 pb-8">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 text-success text-sm font-medium mb-4">
          <Check className="w-4 h-4" />
          Ready when you are
        </div>
        <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
          Your final estimate
        </h2>
      </div>

      {/* Summary card */}
      <div className="bg-card rounded-3xl shadow-elevated overflow-hidden animate-fade-in mb-6">
        {/* Main figures */}
        <div className="p-8 space-y-6">
          {/* Install price - hero */}
          <div className="text-center pb-6 border-b border-border">
            <p className="text-sm text-muted-foreground mb-2">Install price</p>
            <p className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
              {formatCurrency(customerContribution)}
            </p>
          </div>

          {/* Grant */}
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                <Award className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="font-medium text-foreground">Government grant</p>
                <p className="text-sm text-muted-foreground">BUS scheme included</p>
              </div>
            </div>
            <p className="text-xl font-bold text-success">{formatCurrency(assumptions.bus_grant_value)}</p>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-muted/30">
              <div className="flex items-center gap-2 mb-1">
                <Gauge className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Efficiency</p>
              </div>
              <p className="text-lg font-semibold text-foreground">{efficiencyPercent}%</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/30">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Tariff</p>
              </div>
              <p className="text-lg font-semibold text-foreground truncate">{selectedTariff?.name || 'Cosy'}</p>
            </div>
          </div>

          {/* Annual savings */}
          <div className={cn(
            'p-5 rounded-2xl',
            isNegativeSavings 
              ? 'bg-amber-50 border border-amber-200'
              : 'bg-success/5 border border-success/20'
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center',
                  isNegativeSavings ? 'bg-amber-100' : 'bg-success/10'
                )}>
                  {isNegativeSavings 
                    ? <TrendingDown className="w-5 h-5 text-amber-600" />
                    : <TrendingUp className="w-5 h-5 text-success" />
                  }
                </div>
                <div>
                  <p className={cn(
                    'font-medium',
                    isNegativeSavings ? 'text-amber-700' : 'text-success'
                  )}>
                    Estimated annual savings
                  </p>
                  <p className="text-sm text-muted-foreground">On current heating costs</p>
                </div>
              </div>
              <p className={cn(
                'text-2xl font-bold',
                isNegativeSavings ? 'text-amber-600' : 'text-success'
              )}>
                {isNegativeSavings ? '-' : ''}£{displaySavings}
              </p>
            </div>
          </div>
        </div>

        {/* Footer disclaimer */}
        <div className="px-8 py-5 bg-muted/30 border-t border-border">
          <p className="text-center text-sm text-muted-foreground">
            Survey confirms final design and cost. No obligation to proceed.
          </p>
        </div>
      </div>

      {/* CTA section */}
      <div className="space-y-4">
        <Button 
          onClick={onBook}
          className="w-full h-16 text-lg font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
        >
          <Calendar className="w-5 h-5 mr-3" />
          Book free home survey
        </Button>

        <button
          onClick={onBack}
          className="w-full flex items-center justify-center gap-2 py-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Refine estimate
        </button>
      </div>

      {/* Mobile spacer */}
      <div className="h-8" />
    </div>
  );
}
