import { useState } from 'react';
import { TrendingUp, TrendingDown, ChevronDown, ChevronUp, Info, Leaf, Calculator, Fuel } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCurrency, getFuelDisplayName } from '@/lib/calculations';
import type { EstimateResults, Assumptions } from '@/lib/calculations';
import { useTariffs, formatTariffLabel, type Tariff } from '@/hooks/useTariffs';

interface SavingsCardProps {
  results: EstimateResults;
  assumptions: Assumptions;
  scop: number;
  selectedTariff: Tariff | null;
  currentFuel: string;
  userAnnualCost: number | undefined;
  onScopChange: (scop: number) => void;
  onTariffChange: (tariff: Tariff) => void;
  onFuelChange: (fuel: string) => void;
  onUserAnnualCostChange: (cost: number | undefined) => void;
}

const EFFICIENCY_OPTIONS = [
  { value: 3.4, label: '340%', recommended: true, radiators: 2 },
  { value: 3.7, label: '370%', recommended: false, radiators: 6 },
  { value: 4.0, label: '400%', recommended: false, radiators: 11 },
];

const FUEL_OPTIONS = [
  { value: 'gas', label: 'Mains gas' },
  { value: 'oil', label: 'Oil' },
  { value: 'lpg', label: 'LPG' },
  { value: 'electric', label: 'Electric' },
];

export function SavingsCard({
  results,
  assumptions,
  scop,
  selectedTariff,
  currentFuel,
  userAnnualCost,
  onScopChange,
  onTariffChange,
  onFuelChange,
  onUserAnnualCostChange,
}: SavingsCardProps) {
  const [isEfficiencyOpen, setIsEfficiencyOpen] = useState(false);
  const [isCalculationOpen, setIsCalculationOpen] = useState(false);
  const { data: tariffs, isLoading: tariffsLoading } = useTariffs();

  const { savingsRange, savingsCouldIncrease } = results;
  const typicalSavings = savingsRange.typical.savings;
  const isNegativeSavings = typicalSavings < 0;

  const handleTariffChange = (tariffId: string) => {
    const tariff = tariffs?.find(t => t.id === tariffId);
    if (tariff) {
      onTariffChange(tariff);
    }
  };

  const handleAnnualCostChange = (value: string) => {
    const parsed = parseFloat(value);
    if (value === '' || isNaN(parsed)) {
      onUserAnnualCostChange(undefined);
    } else {
      onUserAnnualCostChange(parsed);
    }
  };

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
          {/* Savings display with range */}
          <div className="p-4 md:p-5 bg-gradient-to-r from-success/5 to-accent/5 border-b border-border">
            <div className="flex flex-col gap-4">
              {/* Main savings figure - range display */}
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 ${
                  isNegativeSavings ? 'bg-warning/10' : 'bg-success/10'
                }`}>
                  {isNegativeSavings ? (
                    <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-warning" />
                  ) : (
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">
                    {savingsCouldIncrease ? 'Your costs could increase by' : 'You could save'}
                  </p>
                  
                  {/* Savings range */}
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className={`text-xl sm:text-2xl md:text-3xl font-bold ${
                        isNegativeSavings ? 'text-warning' : 'text-success'
                      }`}>
                        {formatCurrency(Math.abs(savingsRange.worst.savings))}
                        <span className="text-base font-normal mx-1">–</span>
                        {formatCurrency(Math.abs(savingsRange.best.savings))}
                      </span>
                      <span className="text-xs sm:text-sm text-muted-foreground">/year</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Typical: <span className="font-medium text-foreground">{formatCurrency(Math.abs(typicalSavings))}</span>
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Tariff dropdown */}
              <div className="w-full">
                <Select 
                  value={selectedTariff?.id || ''} 
                  onValueChange={handleTariffChange}
                  disabled={tariffsLoading}
                >
                  <SelectTrigger className="w-full text-xs">
                    <SelectValue placeholder="Select tariff..." />
                  </SelectTrigger>
                  <SelectContent>
                    {tariffs?.map((tariff) => (
                      <SelectItem key={tariff.id} value={tariff.id} className="text-xs">
                        {formatTariffLabel(tariff)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Cost breakdown */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs text-muted-foreground">
                <span>
                  Current heating: <span className="font-medium text-foreground">{formatCurrency(results.baselineCost)}/year</span>
                </span>
                <span>
                  Heat pump: <span className="font-medium text-foreground">{formatCurrency(results.hpCost)}/year</span>
                </span>
              </div>

              {/* Disclaimer */}
              <p className="text-[10px] sm:text-xs text-muted-foreground italic">
                Digital estimate — a survey confirms the final design and savings.
              </p>
            </div>
          </div>

          {/* Current fuel selector */}
          <div className="p-4 md:p-5 border-b border-border">
            <div className="flex items-center gap-2 mb-3">
              <Fuel className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">Current heating fuel</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Fuel type</Label>
                <Select value={currentFuel} onValueChange={onFuelChange}>
                  <SelectTrigger className="w-full text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FUEL_OPTIONS.map((fuel) => (
                      <SelectItem key={fuel.value} value={fuel.value} className="text-xs">
                        {fuel.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Detected: {getFuelDisplayName(results.currentFuelType)}
                </p>
              </div>
              
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Your annual bill (optional)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">£</span>
                  <Input
                    type="number"
                    placeholder="e.g. 1200"
                    value={userAnnualCost ?? ''}
                    onChange={(e) => handleAnnualCostChange(e.target.value)}
                    className="pl-7 text-xs"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Overrides our estimate
                </p>
              </div>
            </div>
          </div>

          {/* Efficiency selector */}
          <div className="p-4 md:p-5 border-b border-border">
            <p className="text-sm font-medium text-foreground mb-3">Choose efficiency level:</p>
            <div className="grid grid-cols-3 gap-2">
              {EFFICIENCY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onScopChange(option.value)}
                  className={`relative py-2.5 sm:py-3 px-1.5 sm:px-2 rounded-lg sm:rounded-xl border-2 text-center transition-all card-selectable ${
                    scop === option.value
                      ? 'border-primary bg-primary-light'
                      : 'border-border bg-card hover:border-primary/50'
                  }`}
                >
                  {option.recommended && (
                    <Badge className="absolute -top-2 sm:-top-2.5 left-1/2 -translate-x-1/2 bg-primary text-white text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0 sm:py-0.5 whitespace-nowrap">
                      Best value
                    </Badge>
                  )}
                  <span className="block text-base sm:text-lg font-bold text-foreground">{option.label}</span>
                  <span className="block text-[9px] sm:text-[10px] text-muted-foreground">{option.radiators} rads</span>
                </button>
              ))}
            </div>

            <Collapsible open={isEfficiencyOpen} onOpenChange={setIsEfficiencyOpen}>
              <CollapsibleTrigger asChild>
                <button className="flex items-center gap-1.5 text-xs text-primary hover:underline mt-3">
                  <Info className="w-3 h-3" />
                  What does efficiency mean?
                  {isEfficiencyOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  Higher efficiency = more heat per unit of electricity. At 370% (SCOP 3.7), you get 3.7kWh of heat for every 1kWh used. We adjust for your home's EPC rating — less efficient homes may not achieve the full rated SCOP.
                </p>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Transparency accordion */}
          <div className="p-4 md:p-5">
            <Collapsible open={isCalculationOpen} onOpenChange={setIsCalculationOpen}>
              <CollapsibleTrigger asChild>
                <button className="flex items-center gap-1.5 text-xs text-primary hover:underline w-full justify-between">
                  <span className="flex items-center gap-1.5">
                    <Calculator className="w-3 h-3" />
                    How we calculated this
                  </span>
                  {isCalculationOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3">
                <div className="bg-muted/50 p-3 rounded-lg space-y-2 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Heat demand:</span>
                    <span className="font-medium text-foreground">
                      {results.annualHeatKwh.toLocaleString()} kWh
                      <span className="text-muted-foreground ml-1">
                        ({results.heatDemandSource === 'epc' ? 'from EPC' : 'estimated'})
                      </span>
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Current fuel:</span>
                    <span className="font-medium text-foreground">
                      {getFuelDisplayName(results.currentFuelType)} ({Math.round(results.boilerEfficiency * 100)}% eff.)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rated SCOP:</span>
                    <span className="font-medium text-foreground">{scop.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Adjusted SCOP (for your home):</span>
                    <span className="font-medium text-foreground">{results.scopAdjusted.toFixed(2)}</span>
                  </div>
                  {results.offpeakShareUsed > 0 && (
                    <div className="flex justify-between">
                      <span>Off-peak usage share:</span>
                      <span className="font-medium text-foreground">{Math.round(results.offpeakShareUsed * 100)}%</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Effective electricity rate:</span>
                    <span className="font-medium text-foreground">{(results.weightedRate * 100).toFixed(1)}p/kWh</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Heat pump electricity use:</span>
                    <span className="font-medium text-foreground">{results.hpElectricKwh.toLocaleString()} kWh/year</span>
                  </div>
                  {results.savingsClamped && (
                    <p className="text-[10px] text-muted-foreground mt-2 pt-2 border-t border-border">
                      Note: Gas savings are capped at realistic levels based on typical switching outcomes.
                    </p>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
