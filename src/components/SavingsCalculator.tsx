import { useState } from 'react';
import { TrendingUp, TrendingDown, ChevronDown, ChevronUp, Zap } from 'lucide-react';
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
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className="w-5 h-5 text-primary" />
          Annual Running Costs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current vs Heat Pump costs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-secondary/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Current heating</p>
            <p className="text-2xl font-bold text-foreground">
              {formatCurrency(results.baselineCost)}
              <span className="text-sm font-normal text-muted-foreground">/year</span>
            </p>
          </div>
          <div className="bg-primary/10 rounded-lg p-4 border border-primary/30">
            <p className="text-sm text-muted-foreground mb-1">With heat pump</p>
            <p className="text-2xl font-bold text-foreground">
              {formatCurrency(results.hpCost)}
              <span className="text-sm font-normal text-muted-foreground">/year</span>
            </p>
          </div>
        </div>

        {/* Savings display */}
        <div className={`rounded-lg p-4 flex items-center gap-3 ${
          isNegativeSavings 
            ? 'bg-warning/10 border border-warning/30' 
            : 'bg-success/10 border border-success/30'
        }`}>
          {isNegativeSavings ? (
            <>
              <TrendingDown className="w-6 h-6 text-warning" />
              <div>
                <p className="text-sm text-foreground">Estimated change in running cost</p>
                <p className="text-2xl font-bold text-warning">
                  +{formatCurrency(displaySavings)}/yr
                </p>
              </div>
            </>
          ) : (
            <>
              <TrendingUp className="w-6 h-6 text-success" />
              <div>
                <p className="text-sm text-foreground">Annual savings</p>
                <p className="text-2xl font-bold text-success">
                  {formatCurrency(displaySavings)}/yr
                </p>
              </div>
            </>
          )}
        </div>

        {/* Controls */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Efficiency (SCOP)</Label>
            <div className="flex gap-1">
              {EFFICIENCY_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  variant={scop === option.scop ? 'default' : 'secondary'}
                  size="sm"
                  onClick={() => onScopChange(option.scop)}
                  className="flex-1"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Electricity tariff</Label>
            <Select value={tariff} onValueChange={(v) => onTariffChange(v as 'cosy' | 'standard')}>
              <SelectTrigger className="bg-secondary">
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
            <Button variant="ghost" className="w-full justify-between text-muted-foreground">
              View assumptions
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <div className="bg-secondary/50 rounded-lg p-4 text-sm space-y-2">
              <div className="flex justify-between text-foreground">
                <span>Annual heat demand</span>
                <span>{Math.round(results.annualHeatKwh).toLocaleString()} kWh</span>
              </div>
              <div className="flex justify-between text-foreground">
                <span>HP electricity usage</span>
                <span>{Math.round(results.hpElectricKwh).toLocaleString()} kWh</span>
              </div>
              <div className="flex justify-between text-foreground">
                <span>Gas rate</span>
                <span>{assumptions.gas_rate}p/kWh</span>
              </div>
              <div className="flex justify-between text-foreground">
                <span>Boiler efficiency</span>
                <span>{(assumptions.boiler_efficiency * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between text-foreground">
                <span>{tariff === 'cosy' ? 'Cosy blended rate' : 'Electricity rate'}</span>
                <span>
                  {tariff === 'cosy' ? assumptions.cosy_blended_rate : assumptions.electricity_rate}p/kWh
                </span>
              </div>
              <div className="flex justify-between text-foreground">
                <span>SCOP</span>
                <span>{scop}</span>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
