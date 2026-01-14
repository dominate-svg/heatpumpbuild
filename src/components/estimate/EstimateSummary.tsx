import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/calculations';
import { Sparkles, TrendingUp, Award, ChevronDown, Check } from 'lucide-react';
import type { EstimateResults, Assumptions } from '@/lib/calculations';

interface EstimateSummaryProps {
  results: EstimateResults;
  assumptions: Assumptions;
  epcBand: string;
  onBookSurvey: () => void;
  onSeeCalculations: () => void;
}

function getFitStatus(results: EstimateResults): { label: string; variant: 'default' | 'secondary' | 'outline' } {
  const savings = results.estimatedSavings;
  if (savings > 200) return { label: 'Good fit', variant: 'default' };
  if (savings >= 0) return { label: 'Likely fit', variant: 'secondary' };
  return { label: 'Needs review', variant: 'outline' };
}

export function EstimateSummary({ 
  results, 
  assumptions, 
  epcBand,
  onBookSurvey,
  onSeeCalculations 
}: EstimateSummaryProps) {
  const fitStatus = getFitStatus(results);
  const isNegativeSavings = results.estimatedSavings < 0;
  const displaySavings = Math.abs(results.estimatedSavings);

  return (
    <Card className="border-2 border-primary/20 shadow-elevated overflow-hidden bg-gradient-to-br from-card via-card to-primary/5">
      <CardContent className="p-5 md:p-8">
        {/* Header with status */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-xl md:text-2xl font-bold text-foreground">Your personalised estimate</h2>
          </div>
          <Badge 
            variant={fitStatus.variant}
            className={`w-fit ${fitStatus.variant === 'default' ? 'bg-success text-white' : ''}`}
          >
            <Check className="w-3 h-3 mr-1" />
            {fitStatus.label}
          </Badge>
        </div>

        {/* Key metrics grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {/* Install cost */}
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Estimated install cost</p>
            <p className="text-2xl md:text-3xl font-bold text-foreground">
              {formatCurrency(results.customerContribution)}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">After grant</p>
          </div>

          {/* Annual savings */}
          <div className={`border rounded-xl p-4 text-center ${
            isNegativeSavings 
              ? 'bg-amber-50/50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800' 
              : 'bg-success/5 border-success/20'
          }`}>
            <p className="text-xs text-muted-foreground mb-1">
              {isNegativeSavings ? 'Annual change' : 'Estimated annual savings'}
            </p>
            <div className="flex items-center justify-center gap-1">
              <TrendingUp className={`w-5 h-5 ${isNegativeSavings ? 'text-amber-600 rotate-180' : 'text-success'}`} />
              <p className={`text-2xl md:text-3xl font-bold ${
                isNegativeSavings ? 'text-amber-600' : 'text-success'
              }`}>
                {isNegativeSavings ? '-' : ''}£{displaySavings}
              </p>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Per year</p>
          </div>

          {/* Grant included */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Grant included</p>
            <div className="flex items-center justify-center gap-1">
              <Award className="w-5 h-5 text-primary" />
              <p className="text-2xl md:text-3xl font-bold text-primary">
                {formatCurrency(assumptions.bus_grant_value)}
              </p>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">BUS Grant</p>
          </div>
        </div>

        {/* EPC badge */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Badge variant="secondary" className="text-xs">
            EPC {epcBand}
          </Badge>
          {results.isOilFuel && (
            <Badge variant="outline" className="text-xs">
              Oil home
            </Badge>
          )}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={onBookSurvey}
            size="lg" 
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full h-12 font-semibold"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Book free home survey
          </Button>
          <Button 
            onClick={onSeeCalculations}
            variant="outline" 
            size="lg"
            className="flex-1 rounded-full h-12"
          >
            See how we calculated this
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
