import { useState } from 'react';
import { TrendingUp, TrendingDown, ChevronDown, ChevronUp, Zap, PiggyBank } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { formatCurrency } from '@/lib/calculations';
import type { EstimateResults, Assumptions } from '@/lib/calculations';

interface SavingsCalculatorProps {
  results: EstimateResults;
  assumptions: Assumptions;
  scop: number;
  tariff: 'cosy' | 'standard';
  onScopChange: (scop: number) => void;
  onTariffChange: (tariff: 'cosy' | 'standard') => void;
}

const EFFICIENCY_OPTIONS = [
  { value: '3.4', label: '340%', scop: 3.4 },
  { value: '3.7', label: '370%', scop: 3.7 },
  { value: '4.0', label: '400%', scop: 4.0 },
];

export function SavingsCalculator({
  results,
  assumptions,
  scop,
  tariff,
  onScopChange,
  onTariffChange,
}: SavingsCalculatorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const isNegativeSavings = results.annualSavings < 0;
  const displaySavings = Math.abs(results.annualSavings);

  return (
    <Card className="border shadow-sm bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
            <PiggyBank className="w-4 h-4 text-success" />
          </div>
          Running Cost Comparison
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Cost comparison */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-muted/50 rounded-xl border-2 border-transparent">
            <p className="text-sm text-muted-foreground mb-2">Current heating</p>
            <p className="text-3xl font-bold text-foreground">
              {formatCurrency(results.baselineCost)}
            </p>
            <p className="text-xs text-muted-foreground">per year</p>
          </div>
          <div className="p-4 bg-success/5 rounded-xl border-2 border-success/30">
            <p className="text-sm text-muted-foreground mb-2">With heat pump</p>
            <p className="text-3xl font-bold text-success">
              {formatCurrency(results.hpCost)}
            </p>
            <p className="text-xs text-muted-foreground">per year</p>
          </div>
        </div>

        {/* Savings highlight */}
        <div className={`rounded-xl p-5 flex items-center gap-4 ${
          isNegativeSavings 
            ? 'bg-warning/10 border-2 border-warning/30' 
            : 'bg-success/10 border-2 border-success/30'
        }`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isNegativeSavings ? 'bg-warning/20' : 'bg-success/20'
          }`}>
            {isNegativeSavings ? (
              <TrendingDown className="w-6 h-6 text-warning" />
            ) : (
              <TrendingUp className="w-6 h-6 text-success" />
            )}
          </div>
          <div>
            <p className="text-sm text-foreground font-medium">
              {isNegativeSavings ? 'Estimated change in running cost' : 'Estimated annual savings'}
            </p>
            <p className={`text-3xl font-bold ${isNegativeSavings ? 'text-warning' : 'text-success'}`}>
              {isNegativeSavings ? '+' : ''}{formatCurrency(displaySavings)}/yr
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Efficiency (SCOP)</Label>
            <div className="flex gap-1">
              {EFFICIENCY_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  variant={scop === option.scop ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onScopChange(option.scop)}
                  className={`flex-1 ${scop === option.scop ? 'gradient-primary border-0' : ''}`}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Electricity tariff</Label>
            <Select value={tariff} onValueChange={(v) => onTariffChange(v as 'cosy' | 'standard')}>
              <SelectTrigger className="bg-background border-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cosy">Octopus Cosy (blended)</SelectItem>
                <SelectItem value="standard">Typical tariff</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Assumptions */}
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between text-muted-foreground hover:text-foreground">
              View assumptions
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <div className="bg-muted/50 rounded-xl p-4 text-sm space-y-2">
              <div className="flex justify-between text-foreground">
                <span>Annual heat demand</span>
                <span className="font-medium">{Math.round(results.annualHeatKwh).toLocaleString()} kWh</span>
              </div>
              <div className="flex justify-between text-foreground">
                <span>HP electricity usage</span>
                <span className="font-medium">{Math.round(results.hpElectricKwh).toLocaleString()} kWh</span>
              </div>
              <div className="flex justify-between text-foreground">
                <span>Gas rate</span>
                <span className="font-medium">{(assumptions.gas_rate * 100).toFixed(1)}p/kWh</span>
              </div>
              <div className="flex justify-between text-foreground">
                <span>Boiler efficiency</span>
                <span className="font-medium">{(assumptions.boiler_efficiency * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between text-foreground">
                <span>{tariff === 'cosy' ? 'Cosy blended rate' : 'Electricity rate'}</span>
                <span className="font-medium">
                  {((tariff === 'cosy' ? assumptions.cosy_blended_rate : assumptions.electricity_rate) * 100).toFixed(1)}p/kWh
                </span>
              </div>
              <div className="flex justify-between text-foreground">
                <span>SCOP</span>
                <span className="font-medium">{scop}</span>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
