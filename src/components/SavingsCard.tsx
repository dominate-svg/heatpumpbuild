import { useState } from 'react';
import { TrendingUp, ChevronDown, ChevronUp, Leaf, Play, Info } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  
  const tariffLabel = tariff === 'cosy' 
    ? `Octopus Cosy (${(assumptions.cosy_blended_rate * 100).toFixed(0)}p/kWh blended)` 
    : `Standard tariff (${(assumptions.electricity_rate * 100).toFixed(0)}p/kWh)`;

  return (
    <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.15s' }}>
      {/* Section header */}
      <div>
        <h2 className="text-xl font-semibold text-foreground">Annual savings</h2>
        <p className="text-sm text-muted-foreground">Your projected savings from your new system</p>
      </div>

      <Card className="border border-border shadow-card overflow-hidden">
        <CardContent className="p-0">
          <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">
            {/* Left: Efficiency selector */}
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm font-medium text-foreground mb-3">
                  Select your preferred guaranteed efficiency:
                </p>
                <div className="flex gap-2">
                  {EFFICIENCY_OPTIONS.map((option) => (
                    <div key={option.value} className="relative flex-1">
                      {option.recommended && (
                        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs px-2 py-0.5 z-10">
                          Recommended
                        </Badge>
                      )}
                      <button
                        onClick={() => onScopChange(option.value)}
                        className={`w-full py-3 px-4 rounded-lg border-2 text-center font-semibold transition-all ${
                          scop === option.value
                            ? 'border-primary bg-primary-light text-primary'
                            : 'border-border bg-background text-foreground hover:border-primary/50'
                        }`}
                      >
                        {option.label}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CollapsibleTrigger asChild>
                  <button className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <Info className="w-4 h-4" />
                    Why does efficiency make a difference to running cost?
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-3">
                  <p className="text-sm text-muted-foreground">
                    A higher efficiency means your heat pump converts more electricity into heat. 
                    At 370% efficiency (SCOP 3.7), for every 1kWh of electricity used, you get 3.7kWh of heat. 
                    This directly reduces your running costs and carbon footprint.
                  </p>
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Right: Savings summary */}
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Annual savings</p>
                  <p className={`text-3xl font-bold ${isNegativeSavings ? 'text-warning' : 'text-success'}`}>
                    {isNegativeSavings ? '-' : ''}{formatCurrency(displaySavings)}
                  </p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Based on your chosen guaranteed efficiency
              </p>

              {/* Tariff selector */}
              <div className="space-y-2">
                <select 
                  value={tariff}
                  onChange={(e) => onTariffChange(e.target.value as 'cosy' | 'standard')}
                  className="w-full p-3 rounded-lg border border-border bg-background text-sm text-foreground"
                >
                  <option value="cosy">Octopus Cosy tariff ({(assumptions.cosy_blended_rate * 100).toFixed(0)}p/kWh blended)</option>
                  <option value="standard">Standard tariff ({(assumptions.electricity_rate * 100).toFixed(0)}p/kWh)</option>
                </select>
              </div>

              <p className="text-sm text-muted-foreground">
                We've estimated your current annual heating bill to be <span className="font-medium text-foreground">{formatCurrency(results.baselineCost)}</span>.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Video placeholder card */}
      <Card className="border border-border shadow-card overflow-hidden">
        <CardContent className="p-0">
          <div className="relative bg-muted aspect-video flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Play className="w-8 h-8 text-primary ml-1" />
              </div>
              <p className="text-sm font-medium text-foreground">Learn how heat pumps save you money</p>
              <p className="text-xs text-muted-foreground">2 min video</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
