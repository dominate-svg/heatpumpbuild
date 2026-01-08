import { useState } from 'react';
import { TrendingUp, ChevronDown, ChevronUp, Info, Leaf } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { formatCurrency } from '@/lib/calculations';
import type { EstimateResults, Assumptions } from '@/lib/calculations';

interface SavingsCardProps {
  results: EstimateResults;
  assumptions: Assumptions;
  scop: number;
  tariff: 'cosy' | 'standard';
  onScopChange: (scop: number) => void;
  onTariffChange: (tariff: 'cosy' | 'standard') => void;
}

const EFFICIENCY_OPTIONS = [
  { value: 3.4, label: '340%', recommended: true, radiators: 2 },
  { value: 3.7, label: '370%', recommended: false, radiators: 6 },
  { value: 4.0, label: '400%', recommended: false, radiators: 11 },
];

export function SavingsCard({
  results,
  assumptions,
  scop,
  tariff,
  onScopChange,
  onTariffChange,
}: SavingsCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const isNegativeSavings = results.annualSavings < 0;
  const displaySavings = Math.abs(results.annualSavings);

  return (
    <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Annual savings</h2>
          <p className="text-xs text-muted-foreground">Projected savings from your new system</p>
        </div>
        <div className="flex items-center gap-2 text-success">
          <Leaf className="w-5 h-5 animate-bounce-in" style={{ animationDelay: '0.3s' }} />
        </div>
      </div>

      <Card className="border border-border shadow-card overflow-hidden">
        <CardContent className="p-0">
          {/* Savings display - prominent */}
          <div className="p-4 md:p-5 bg-gradient-to-r from-success/5 to-accent/5 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center animate-pulse-glow">
                  <TrendingUp className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">You could save</p>
                  <p className={`text-2xl md:text-3xl font-bold ${isNegativeSavings ? 'text-warning' : 'text-success'}`}>
                    {isNegativeSavings ? '-' : ''}{formatCurrency(displaySavings)}
                    <span className="text-sm font-normal text-muted-foreground">/year</span>
                  </p>
                </div>
              </div>
              <select 
                value={tariff}
                onChange={(e) => onTariffChange(e.target.value as 'cosy' | 'standard')}
                className="text-xs p-2 rounded-lg border border-border bg-background text-muted-foreground max-w-[140px]"
              >
                <option value="cosy">Octopus Cosy</option>
                <option value="standard">Standard tariff</option>
              </select>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Current heating: <span className="font-medium text-foreground">{formatCurrency(results.baselineCost)}/year</span>
            </p>
          </div>

          {/* Efficiency selector - compact */}
          <div className="p-4 md:p-5">
            <p className="text-sm font-medium text-foreground mb-3">Choose efficiency level:</p>
            <div className="flex gap-2">
              {EFFICIENCY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onScopChange(option.value)}
                  className={`flex-1 relative py-3 px-2 rounded-xl border-2 text-center transition-all card-selectable ${
                    scop === option.value
                      ? 'border-primary bg-primary-light'
                      : 'border-border bg-card hover:border-primary/50'
                  }`}
                >
                  {option.recommended && (
                    <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] px-2 py-0.5 whitespace-nowrap">
                      Best value
                    </Badge>
                  )}
                  <span className="block text-lg font-bold text-foreground">{option.label}</span>
                  <span className="block text-[10px] text-muted-foreground">{option.radiators} radiators</span>
                </button>
              ))}
            </div>

            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <CollapsibleTrigger asChild>
                <button className="flex items-center gap-1.5 text-xs text-primary hover:underline mt-3">
                  <Info className="w-3 h-3" />
                  What does efficiency mean?
                  {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  Higher efficiency = more heat per unit of electricity. At 370% (SCOP 3.7), you get 3.7kWh of heat for every 1kWh used.
                </p>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
