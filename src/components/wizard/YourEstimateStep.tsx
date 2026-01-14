import { useState } from 'react';
import { TrendingUp, TrendingDown, Award, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { formatCurrency } from '@/lib/calculations';
import type { EstimateResults, Assumptions } from '@/lib/calculations';

interface YourEstimateStepProps {
  results: EstimateResults;
  assumptions: Assumptions;
  onContinue: () => void;
}

export function YourEstimateStep({ results, assumptions, onContinue }: YourEstimateStepProps) {
  const [isAssumptionsOpen, setIsAssumptionsOpen] = useState(false);

  const { estimatedSavings, customerContribution, epcBand } = results;
  const isNegativeSavings = estimatedSavings < 0;
  const displaySavings = Math.abs(estimatedSavings);
  const grantAmount = assumptions.bus_grant_value;

  // Determine status pill
  const getStatusPill = () => {
    if (estimatedSavings > 100) {
      return { label: 'Likely a good fit', color: 'bg-success/10 text-success' };
    }
    return { label: 'Estimate ready', color: 'bg-muted text-muted-foreground' };
  };

  const statusPill = getStatusPill();

  return (
    <div className="w-full max-w-lg mx-auto px-4 animate-fade-in">
      <Card className="border-2 border-primary/20 shadow-card bg-gradient-to-br from-card to-primary/5 overflow-hidden">
        <CardContent className="p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <Badge className={statusPill.color}>
              <CheckCircle2 className="w-3 h-3 mr-1" />
              {statusPill.label}
            </Badge>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              Your personalised estimate
            </h2>
          </div>

          {/* Three big numbers */}
          <div className="space-y-4">
            {/* Install price */}
            <div className="p-4 rounded-xl bg-background border border-border">
              <p className="text-xs text-muted-foreground mb-1">Estimated install price</p>
              <p className="text-3xl sm:text-4xl font-bold text-foreground">
                {formatCurrency(customerContribution)}
              </p>
            </div>

            {/* Grant */}
            <div className="p-4 rounded-xl bg-success/10 border border-success/20">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-4 h-4 text-success" />
                <p className="text-xs text-success font-medium">BUS Grant included</p>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-success">
                {formatCurrency(grantAmount)}
              </p>
            </div>

            {/* Annual savings */}
            <div className={`p-4 rounded-xl border ${
              isNegativeSavings 
                ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800' 
                : 'bg-success/5 border-success/20'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                {isNegativeSavings ? (
                  <TrendingDown className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                ) : (
                  <TrendingUp className="w-4 h-4 text-success" />
                )}
                <p className={`text-xs font-medium ${
                  isNegativeSavings ? 'text-amber-600 dark:text-amber-400' : 'text-success'
                }`}>
                  Estimated annual savings
                </p>
              </div>
              <p className={`text-2xl sm:text-3xl font-bold ${
                isNegativeSavings ? 'text-amber-600 dark:text-amber-400' : 'text-success'
              }`}>
                {isNegativeSavings ? '-' : ''}£{displaySavings}/year
              </p>
              {isNegativeSavings && (
                <p className="text-xs text-muted-foreground mt-2">
                  Many homes still choose Cosy for comfort + future-proofing. Survey can often improve this with design tweaks.
                </p>
              )}
            </div>
          </div>

          {/* How we calculated this */}
          <Collapsible open={isAssumptionsOpen} onOpenChange={setIsAssumptionsOpen}>
            <CollapsibleTrigger asChild>
              <button className="flex items-center gap-1.5 text-sm text-primary hover:underline mx-auto">
                How did we calculate this?
                {isAssumptionsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4">
              <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-xs text-muted-foreground">
                <p>
                  We use your EPC band ({epcBand}) to estimate heat demand, then model running costs using typical tariff rates and heat pump efficiency.
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Heat demand: {results.annualHeatKwh.toLocaleString()} kWh/year</li>
                  <li>Heat loss: {results.heatLossKw} kW</li>
                  <li>Default efficiency: 340% (SCOP 3.4)</li>
                  <li>Tariff: Octopus Cosy blended rate</li>
                </ul>
                <p className="pt-2 border-t border-border">
                  Your survey will confirm exact sizing, efficiency, and final costs.
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* CTA */}
          <Button 
            onClick={onContinue} 
            className="w-full h-12 text-base font-semibold"
          >
            Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
