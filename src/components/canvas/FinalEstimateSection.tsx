import { Award, Gauge, Zap, Calendar, Check, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/calculations';
import type { EstimateResults, Assumptions } from '@/lib/calculations';
import type { Tariff } from '@/hooks/useTariffs';
import { cn } from '@/lib/utils';

interface FinalEstimateSectionProps {
  results: EstimateResults;
  assumptions: Assumptions;
  scop: number;
  selectedTariff: Tariff | null;
  onBook: () => void;
}

export function FinalEstimateSection({
  results,
  assumptions,
  scop,
  selectedTariff,
  onBook,
}: FinalEstimateSectionProps) {
  const { estimatedSavings, customerContribution } = results;
  const isNegativeSavings = estimatedSavings < 0;
  const displaySavings = Math.abs(estimatedSavings);
  const efficiencyPercent = Math.round(scop * 100);

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-8 section-enter">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 text-success text-sm font-medium mb-4">
          <Check className="w-4 h-4" />
          Ready
        </div>
        <h2 className="text-section-title text-foreground">
          Your final estimate
        </h2>
      </div>

      {/* Summary card */}
      <div className="bg-card rounded-3xl shadow-soft border border-border overflow-hidden section-enter" style={{ animationDelay: '100ms' }}>
        {/* Hero price */}
        <div className="p-8 text-center border-b border-border">
          <p className="text-micro text-muted-foreground mb-2">Install price</p>
          <p className="text-hero text-foreground">
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
            <span className="text-lg font-bold text-success">
              {formatCurrency(assumptions.bus_grant_value)}
            </span>
          </div>

          <div className="h-px bg-border" />

          {/* Specs */}
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-muted-foreground" />
              <span className="text-micro text-muted-foreground">Efficiency</span>
              <span className="font-medium text-foreground ml-auto">{efficiencyPercent}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-muted-foreground" />
              <span className="text-micro text-muted-foreground">Tariff</span>
              <span className="font-medium text-foreground ml-auto truncate max-w-[80px]">
                {selectedTariff?.name?.split(' ')[0] || 'Cosy'}
              </span>
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Savings */}
          <div className={cn(
            'p-5 rounded-2xl',
            isNegativeSavings 
              ? 'bg-amber-50 border border-amber-200'
              : 'bg-success/5 border border-success/20'
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isNegativeSavings 
                  ? <TrendingDown className="w-4 h-4 text-amber-600" />
                  : <TrendingUp className="w-4 h-4 text-success" />
                }
                <span className={cn(
                  'font-medium text-sm',
                  isNegativeSavings ? 'text-amber-700' : 'text-success'
                )}>
                  Annual savings
                </span>
              </div>
              <span className={cn(
                'text-xl font-bold',
                isNegativeSavings ? 'text-amber-600' : 'text-success'
              )}>
                {isNegativeSavings ? '-' : ''}£{displaySavings}/yr
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-8 section-enter" style={{ animationDelay: '200ms' }}>
        <Button 
          onClick={onBook}
          size="lg"
          className="w-full h-16 text-lg font-semibold rounded-xl shadow-lg cta-hover-lift"
        >
          <Calendar className="w-5 h-5 mr-3" />
          Book free home survey
        </Button>
        <p className="text-center text-micro text-muted-foreground mt-4">
          No obligation. Survey confirms the design.
        </p>
      </div>
    </div>
  );
}
