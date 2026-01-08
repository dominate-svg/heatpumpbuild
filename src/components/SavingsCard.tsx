import { useState } from 'react';
import { TrendingUp, TrendingDown, ChevronDown, ChevronUp, Leaf, PiggyBank } from 'lucide-react';
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

interface SavingsCardProps {
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
  
  // Rough CO2 estimate (kg CO2 per kWh: gas ~0.2, electricity ~0.15)
  const co2Saved = Math.round((results.annualHeatKwh * 0.2 - results.hpElectricKwh * 0.15) / 1000 * 10) / 10;

  return (
    <Card className="border-0 shadow-cool overflow-hidden animate-fade-in" style={{ animationDelay: '0.3s' }}>
      {/* Cool gradient header */}
      <div className="gradient-cool p-6 border-b border-accent/10">
        <CardTitle className="flex items-center gap-3 text-lg mb-4">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <PiggyBank className="w-5 h-5 text-accent" />
          </div>
          Running cost comparison
        </CardTitle>
        
        {/* Cost comparison */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-4 bg-card rounded-xl border border-border">
            <p className="text-sm text-muted-foreground mb-1">Your current heating cost</p>
            <p className="text-2xl font-bold text-foreground animate-count-up">
              {formatCurrency(results.baselineCost)}
            </p>
            <p className="text-xs text-muted-foreground">per year</p>
          </div>
          <div className="p-4 bg-card rounded-xl border-2 border-success">
            <p className="text-sm text-muted-foreground mb-1">With heat pump</p>
            <p className="text-2xl font-bold text-success animate-count-up">
              {formatCurrency(results.hpCost)}
            </p>
            <p className="text-xs text-muted-foreground">per year</p>
          </div>
        </div>

        {/* Savings highlight */}
        <div className={`rounded-xl p-4 flex items-center gap-4 ${
          isNegativeSavings 
            ? 'bg-warning/10 border border-warning/30' 
            : 'bg-success/10 border border-success/30'
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
              {isNegativeSavings ? 'Estimated change' : 'You could save'}
            </p>
            <p className={`text-3xl font-bold ${isNegativeSavings ? 'text-warning' : 'text-success'}`}>
              ~{formatCurrency(displaySavings)}/yr
            </p>
          </div>
        </div>

        {co2Saved > 0 && (
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Leaf className="w-4 h-4 text-success" />
            <span>~{co2Saved} tonnes CO₂ saved each year</span>
          </div>
        )}
      </div>

      <CardContent className="p-6 bg-card space-y-4">
        {/* Controls */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Efficiency level</Label>
            <div className="flex gap-1">
              {EFFICIENCY_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  variant={scop === option.scop ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onScopChange(option.scop)}
                  className={`flex-1 ${scop === option.scop ? 'gradient-primary border-0 text-white' : ''}`}
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
                <span>Heat pump electricity</span>
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
                <span>Efficiency level</span>
                <span className="font-medium">{scop}</span>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
