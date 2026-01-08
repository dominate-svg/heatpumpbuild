import { useState } from 'react';
import { TrendingUp, TrendingDown, ChevronDown, ChevronUp, Info, Leaf, Calculator, Fuel, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  onScopChange: (scop: number) => void;
  onTariffChange: (tariff: Tariff) => void;
  onFuelChange: (fuel: string) => void;
}

const EFFICIENCY_OPTIONS = [
  { value: 3.4, label: '340%', recommended: true, radiators: 2 },
  { value: 3.7, label: '370%', recommended: false, radiators: 6 },
  { value: 4.0, label: '400%', recommended: false, radiators: 11 },
];

const FUEL_OPTIONS = [
  { value: 'gas', label: 'Mains gas' },
  { value: 'oil', label: 'Heating oil' },
  { value: 'lpg', label: 'LPG' },
  { value: 'electric', label: 'Direct electric' },
];

export function SavingsCard({
  results,
  scop,
  selectedTariff,
  currentFuel,
  onScopChange,
  onTariffChange,
  onFuelChange,
}: SavingsCardProps) {
  const [isEfficiencyOpen, setIsEfficiencyOpen] = useState(false);
  const [isCalculationOpen, setIsCalculationOpen] = useState(false);
  const { data: tariffs, isLoading: tariffsLoading } = useTariffs();

  const { estimatedSavings, confidenceLabel, epcBand } = results;
  
  const showWarning = estimatedSavings < 0;

  const handleTariffChange = (tariffId: string) => {
    const tariff = tariffs?.find(t => t.id === tariffId);
    if (tariff) {
      onTariffChange(tariff);
    }
  };

  // Confidence badge color
  const getConfidenceBadgeClass = () => {
    if (['A', 'B', 'C'].includes(epcBand)) return 'bg-success/10 text-success';
    if (['D', 'E'].includes(epcBand)) return 'bg-warning/10 text-warning';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Annual savings</h2>
          <p className="text-xs text-muted-foreground">Conservative estimate based on national averages</p>
        </div>
        <div className="flex items-center gap-2 text-success">
          <Leaf className="w-5 h-5 animate-bounce-in" style={{ animationDelay: '0.3s' }} />
        </div>
      </div>

      <Card className="border border-border shadow-card overflow-hidden">
        <CardContent className="p-0">
          {/* Savings display */}
          <div className={`p-4 md:p-5 border-b border-border ${
            showWarning ? 'bg-warning/5' : 'bg-gradient-to-r from-success/5 to-accent/5'
          }`}>
            <div className="flex flex-col gap-4">
              {/* Main savings figure - ONE number only */}
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 ${
                  showWarning ? 'bg-warning/10' : 'bg-success/10'
                }`}>
                  {showWarning ? (
                    <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-warning" />
                  ) : (
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">
                    {showWarning ? 'Estimated annual change' : 'Estimated annual savings'}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className={`text-2xl sm:text-3xl md:text-4xl font-bold ${
                        showWarning ? 'text-warning' : 'text-success'
                      }`}>
                        {showWarning 
                          ? `£${Math.abs(estimatedSavings)} more`
                          : `£${estimatedSavings}`
                        }
                      </span>
                      <span className="text-sm text-muted-foreground">/year</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {showWarning 
                        ? 'This is a cautious estimate. Many homes improve after system design optimisation.'
                        : 'Based on national averages for your EPC band and fuel type. Final design may improve this.'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Confidence label */}
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={`text-xs ${getConfidenceBadgeClass()}`}>
                  EPC {epcBand}
                </Badge>
                <span className="text-xs text-muted-foreground">{confidenceLabel}</span>
              </div>

              {/* See how to improve link */}
              {showWarning && (
                <button 
                  className="flex items-center gap-1.5 text-xs text-primary hover:underline self-start"
                  onClick={() => {
                    document.getElementById('install-options')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  See how to improve this
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
              
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

              {/* Cost breakdown - simplified */}
              <div className="flex flex-col gap-2 text-xs text-muted-foreground">
                <span>
                  Current heating: <span className="font-medium text-foreground">{formatCurrency(results.baselineCost)}/year</span>
                </span>
                <span>
                  Heat pump: <span className="font-medium text-foreground">{formatCurrency(results.hpCost)}/year</span>
                </span>
              </div>

              {/* Disclaimer */}
              <p className="text-[10px] sm:text-xs text-muted-foreground italic border-t border-border pt-3">
                This is a digital estimate based on national averages and public data. A home survey confirms final system design, costs, and savings.
              </p>
            </div>
          </div>

          {/* Current fuel selector */}
          <div className="p-4 md:p-5 border-b border-border">
            <div className="flex items-center gap-2 mb-3">
              <Fuel className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">Current heating fuel</p>
            </div>
            
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
            <p className="text-[10px] text-muted-foreground mt-2">
              Detected from EPC: {getFuelDisplayName(results.currentFuelType)}
            </p>
          </div>

          {/* Efficiency selector */}
          <div className="p-4 md:p-5 border-b border-border" id="install-options">
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
                  Higher efficiency = more heat per unit of electricity. At 370% (SCOP 3.7), you get 3.7kWh of heat for every 1kWh used. 
                  Higher efficiency typically requires more radiator upgrades to run at lower flow temperatures.
                </p>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* How we calculated this */}
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
                <div className="bg-muted/50 p-3 rounded-lg space-y-3 text-xs text-muted-foreground">
                  {/* Methodology explanation */}
                  <div className="space-y-2">
                    <p>
                      We use national average energy demand for homes in your EPC band and compare the cost of running a heat pump 
                      on the Octopus Cosy tariff with the cost of continuing to heat your home using standard Ofgem-capped gas prices 
                      (or oil/LPG where relevant).
                    </p>
                    <p>
                      We assume realistic system efficiencies and conservative operating behaviour to avoid over-promising.
                      Your final savings may improve after system design and optimisation.
                    </p>
                  </div>

                  {/* Detailed breakdown */}
                  <div className="pt-2 border-t border-border space-y-2">
                    <p className="font-medium text-foreground">Your numbers:</p>
                    
                    {/* Heat demand */}
                    <div className="pb-2 border-b border-border/50">
                      <p className="font-medium text-foreground/80 mb-1 text-[10px] uppercase tracking-wide">Heat demand (EPC {epcBand})</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                        <span>Annual heat demand:</span>
                        <span className="font-medium text-foreground text-right">{results.annualHeatKwh.toLocaleString()} kWh/yr</span>
                      </div>
                    </div>

                    {/* Current system */}
                    <div className="pb-2 border-b border-border/50">
                      <p className="font-medium text-foreground/80 mb-1 text-[10px] uppercase tracking-wide">Current system</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                        <span>Fuel type:</span>
                        <span className="font-medium text-foreground text-right">{getFuelDisplayName(results.currentFuelType)}</span>
                        <span>Boiler efficiency:</span>
                        <span className="font-medium text-foreground text-right">{Math.round(results.boilerEfficiency * 100)}%</span>
                        <span>Fuel input needed:</span>
                        <span className="font-medium text-foreground text-right">{results.fuelInputKwh.toLocaleString()} kWh</span>
                        <span>Annual cost:</span>
                        <span className="font-medium text-foreground text-right">{formatCurrency(results.baselineCost)}</span>
                      </div>
                    </div>

                    {/* Heat pump */}
                    <div className="pb-2 border-b border-border/50">
                      <p className="font-medium text-foreground/80 mb-1 text-[10px] uppercase tracking-wide">Heat pump</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                        <span>Efficiency (SCOP):</span>
                        <span className="font-medium text-foreground text-right">{results.scopUsed.toFixed(1)}</span>
                        <span>Electricity needed:</span>
                        <span className="font-medium text-foreground text-right">{results.hpElectricKwh.toLocaleString()} kWh</span>
                        <span>Cosy tariff rate:</span>
                        <span className="font-medium text-foreground text-right">{(results.cosyRate * 100).toFixed(1)}p/kWh</span>
                        <span>Annual cost:</span>
                        <span className="font-medium text-foreground text-right">{formatCurrency(results.hpCost)}</span>
                      </div>
                    </div>

                    {/* Savings */}
                    <div>
                      <p className="font-medium text-foreground/80 mb-1 text-[10px] uppercase tracking-wide">Savings</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                        <span>Raw savings:</span>
                        <span className="font-medium text-foreground text-right">{formatCurrency(results.rawSavings)}</span>
                        <span>Conservative estimate (×0.9):</span>
                        <span className="font-medium text-foreground text-right">{formatCurrency(results.estimatedSavings)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
