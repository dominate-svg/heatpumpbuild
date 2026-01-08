import { useState } from 'react';
import { TrendingUp, ChevronDown, ChevronUp, Info, Leaf, AlertTriangle, Calculator } from 'lucide-react';
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
import { formatCurrency } from '@/lib/calculations';
import type { EstimateResults, Assumptions } from '@/lib/calculations';
import { useTariffs, formatTariffLabel, type Tariff } from '@/hooks/useTariffs';

interface SavingsCardProps {
  results: EstimateResults;
  assumptions: Assumptions;
  scop: number;
  selectedTariff: Tariff | null;
  onScopChange: (scop: number) => void;
  onTariffChange: (tariff: Tariff) => void;
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
  selectedTariff,
  onScopChange,
  onTariffChange,
}: SavingsCardProps) {
  const [isEfficiencyOpen, setIsEfficiencyOpen] = useState(false);
  const [isCalculationOpen, setIsCalculationOpen] = useState(false);
  const { data: tariffs, isLoading: tariffsLoading } = useTariffs();

  const isNegativeSavings = results.annualSavings < 0;
  const displaySavings = Math.abs(results.annualSavings);

  const handleTariffChange = (tariffId: string) => {
    const tariff = tariffs?.find(t => t.id === tariffId);
    if (tariff) {
      onTariffChange(tariff);
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
          {/* Savings display - prominent */}
          <div className="p-4 md:p-5 bg-gradient-to-r from-success/5 to-accent/5 border-b border-border">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-success/10 flex items-center justify-center animate-pulse-glow flex-shrink-0">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">You could save</p>
                  <p className={`text-xl sm:text-2xl md:text-3xl font-bold ${isNegativeSavings ? 'text-warning' : 'text-success'}`}>
                    {isNegativeSavings ? '-' : ''}{formatCurrency(displaySavings)}
                    <span className="text-xs sm:text-sm font-normal text-muted-foreground">/year</span>
                  </p>
                </div>
              </div>
              
              {/* Tariff dropdown */}
              <Select 
                value={selectedTariff?.id || ''} 
                onValueChange={handleTariffChange}
                disabled={tariffsLoading}
              >
                <SelectTrigger className="w-full sm:w-[240px] text-xs">
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
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-3 text-xs text-muted-foreground">
              <span>
                Current heating: <span className="font-medium text-foreground">{formatCurrency(results.baselineCost)}/year</span>
              </span>
              <span>
                Heat pump: <span className="font-medium text-foreground">{formatCurrency(results.hpCost)}/year</span>
              </span>
            </div>

            {/* Disclaimer */}
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-3 italic">
              This is an estimate. Real savings depend on insulation, system design, and how you use electricity.
            </p>

            {/* Best-case badge */}
            {results.isBestCase && (
              <div className="mt-2">
                <Badge variant="outline" className="text-[10px] bg-warning/10 text-warning border-warning/30">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Best-case scenario — survey will confirm
                </Badge>
              </div>
            )}
          </div>

          {/* Efficiency selector - compact */}
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
                  Higher efficiency = more heat per unit of electricity. At 370% (SCOP 3.7), you get 3.7kWh of heat for every 1kWh used.
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
                    <span>Estimated annual heat demand:</span>
                    <span className="font-medium text-foreground">{results.annualHeatKwh.toLocaleString()} kWh</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Heat demand source:</span>
                    <span className="font-medium text-foreground">
                      {results.heatDemandSource === 'epc' ? 'From EPC' : 'Estimated from floor area'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Heat pump efficiency (SCOP):</span>
                    <span className="font-medium text-foreground">{results.scopUsed.toFixed(1)}</span>
                  </div>
                  {results.offpeakShareUsed > 0 && (
                    <div className="flex justify-between">
                      <span>Off-peak usage share:</span>
                      <span className="font-medium text-foreground">{Math.round(results.offpeakShareUsed * 100)}%</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Tariff weighted rate:</span>
                    <span className="font-medium text-foreground">{(results.weightedRate * 100).toFixed(1)}p/kWh</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Heat pump electricity use:</span>
                    <span className="font-medium text-foreground">{results.hpElectricKwh.toLocaleString()} kWh/year</span>
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
