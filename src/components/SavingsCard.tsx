import { useState } from 'react';
import { TrendingUp, TrendingDown, ChevronDown, ChevronUp, Info, Leaf, Calculator, Fuel, AlertCircle, FileText } from 'lucide-react';
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
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const { data: tariffs, isLoading: tariffsLoading } = useTariffs();

  const { savingsRange, savingsCouldIncrease, confidenceLabel, epcBand, isOilFuel, oilSavings, oilCurrentCost } = results;
  
  // Use worst case to determine if bills could increase
  const worstCaseSavings = isOilFuel && oilSavings 
    ? oilSavings.modernBoiler.worst 
    : savingsRange.worst;
  const showWarning = worstCaseSavings < 0;

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

  // Format savings range display
  const formatSavingsRange = (worst: number, typical: number, best: number) => {
    if (worst < 0 && typical < 0 && best < 0) {
      return `Bills may increase by ${formatCurrency(Math.abs(best))} – ${formatCurrency(Math.abs(worst))}`;
    }
    if (worst < 0) {
      return `${formatCurrency(Math.abs(worst))} more to ${formatCurrency(best)} savings`;
    }
    return `${formatCurrency(worst)} – ${formatCurrency(best)}`;
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
              {/* Main savings figure */}
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
                    {savingsCouldIncrease ? 'Estimated annual change' : 'Estimated annual savings range'}
                  </p>
                  
                  {/* Non-oil display */}
                  {!isOilFuel && (
                    <div className="space-y-2">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className={`text-xl sm:text-2xl md:text-3xl font-bold ${
                          savingsRange.typical < 0 ? 'text-warning' : 'text-success'
                        }`}>
                          {formatSavingsRange(savingsRange.worst, savingsRange.typical, savingsRange.best)}
                        </span>
                        <span className="text-xs sm:text-sm text-muted-foreground">/year</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Typical: <span className="font-medium text-foreground">{formatCurrency(savingsRange.typical)}</span>
                      </div>
                    </div>
                  )}

                  {/* Oil-specific display */}
                  {isOilFuel && oilSavings && (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Compared to modern oil boiler (85% eff)</p>
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className={`text-lg sm:text-xl font-bold ${
                            oilSavings.modernBoiler.typical < 0 ? 'text-warning' : 'text-success'
                          }`}>
                            {formatSavingsRange(oilSavings.modernBoiler.worst, oilSavings.modernBoiler.typical, oilSavings.modernBoiler.best)}
                          </span>
                          <span className="text-xs text-muted-foreground">/year</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Compared to older oil boiler (70% eff)</p>
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className={`text-lg sm:text-xl font-bold ${
                            oilSavings.oldBoiler.typical < 0 ? 'text-warning' : 'text-success'
                          }`}>
                            {formatSavingsRange(oilSavings.oldBoiler.worst, oilSavings.oldBoiler.typical, oilSavings.oldBoiler.best)}
                          </span>
                          <span className="text-xs text-muted-foreground">/year</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Confidence label */}
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={`text-xs ${getConfidenceBadgeClass()}`}>
                  EPC {epcBand}
                </Badge>
                <span className="text-xs text-muted-foreground">{confidenceLabel}</span>
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
              <div className="flex flex-col gap-2 text-xs text-muted-foreground">
                {!isOilFuel ? (
                  <>
                    <span>
                      Current heating: <span className="font-medium text-foreground">{formatCurrency(results.baselineCost)}/year</span>
                    </span>
                    <span>
                      Heat pump: <span className="font-medium text-foreground">{formatCurrency(results.hpCostRange.worst)} – {formatCurrency(results.hpCostRange.best)}/year</span>
                    </span>
                  </>
                ) : oilCurrentCost && (
                  <>
                    <span>
                      Modern oil boiler: <span className="font-medium text-foreground">{formatCurrency(oilCurrentCost.modernBoiler)}/year</span>
                    </span>
                    <span>
                      Older oil boiler: <span className="font-medium text-foreground">{formatCurrency(oilCurrentCost.oldBoiler)}/year</span>
                    </span>
                    <span>
                      Heat pump: <span className="font-medium text-foreground">{formatCurrency(results.hpCostRange.worst)} – {formatCurrency(results.hpCostRange.best)}/year</span>
                    </span>
                  </>
                )}
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
                  We adjust the SCOP based on your home's EPC rating — less efficient homes require higher flow temperatures, 
                  which reduces achievable efficiency.
                </p>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Summary section */}
          <div className="p-4 md:p-5 border-b border-border">
            <Collapsible open={isSummaryOpen} onOpenChange={setIsSummaryOpen}>
              <CollapsibleTrigger asChild>
                <button className="flex items-center gap-1.5 text-xs text-primary hover:underline w-full justify-between">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3 h-3" />
                    Summary
                  </span>
                  {isSummaryOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3">
                <div className="bg-muted/50 p-3 rounded-lg space-y-3 text-xs text-muted-foreground">
                  <p>
                    This estimate is based on national average energy use for homes in your EPC band, typical boiler efficiencies, 
                    and conservative heat pump performance assumptions. It compares your current heating system to a Cosy heat pump 
                    on your selected tariff.
                  </p>
                  <p className="font-medium text-foreground">We account for:</p>
                  <ul className="list-disc list-inside space-y-1 pl-1">
                    <li>How efficient homes in your EPC band typically are</li>
                    <li>The difference between space heating and hot water</li>
                    <li>Real-world heat pump efficiency (not lab ratings)</li>
                    <li>How much heating can realistically run in cheaper tariff hours</li>
                  </ul>
                  <p>
                    Your actual results depend on your home's size, insulation, radiator setup, and usage patterns. 
                    A survey confirms final design and performance.
                  </p>
                </div>
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
                    <p className="font-medium text-foreground">Our methodology:</p>
                    <ol className="list-decimal list-inside space-y-1.5 pl-1">
                      <li>We started with a typical UK home heat demand (11,500 kWh/year) and adjusted it based on your EPC band.</li>
                      <li>We split that into space heating and hot water, which run at different efficiencies.</li>
                      <li>We estimated your current system's fuel use using typical boiler efficiencies.</li>
                      <li>We modelled heat pump electricity use using a conservative seasonal efficiency adjusted for your EPC band.</li>
                      <li>We applied your selected tariff, assuming only part of heating runs in cheaper hours.</li>
                      <li>We compared the two and showed a range to reflect uncertainty.</li>
                    </ol>
                  </div>

                  {/* Detailed breakdown */}
                  <div className="pt-2 border-t border-border space-y-2">
                    <p className="font-medium text-foreground">Your numbers:</p>
                    
                    {/* Heat demand breakdown */}
                    <div className="pb-2 border-b border-border/50">
                      <p className="font-medium text-foreground/80 mb-1 text-[10px] uppercase tracking-wide">Heat demand (EPC {epcBand})</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                        <span>Total useful heat:</span>
                        <span className="font-medium text-foreground text-right">{results.annualHeatKwh.toLocaleString()} kWh/yr</span>
                        <span>Space heating:</span>
                        <span className="font-medium text-foreground text-right">{results.spaceHeatKwh.toLocaleString()} kWh</span>
                        <span>Hot water:</span>
                        <span className="font-medium text-foreground text-right">{results.dhwHeatKwh.toLocaleString()} kWh</span>
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
                        <span>Fuel energy used:</span>
                        <span className="font-medium text-foreground text-right">{results.fuelInputKwh.toLocaleString()} kWh/yr</span>
                      </div>
                    </div>

                    {/* Heat pump performance */}
                    <div className="pb-2 border-b border-border/50">
                      <p className="font-medium text-foreground/80 mb-1 text-[10px] uppercase tracking-wide">Heat pump performance</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                        <span>Selected SCOP:</span>
                        <span className="font-medium text-foreground text-right">{scop.toFixed(1)}</span>
                        <span>EPC derate applied:</span>
                        <span className="font-medium text-foreground text-right">{Math.round(results.epcDerateApplied * 100)}%</span>
                        <span>Adjusted space SCOP:</span>
                        <span className="font-medium text-foreground text-right">{results.scopAdjusted.toFixed(2)}</span>
                        <span>DHW COP (fixed):</span>
                        <span className="font-medium text-foreground text-right">{results.dhwCop.toFixed(1)}</span>
                        <span>Electricity used:</span>
                        <span className="font-medium text-foreground text-right">{results.hpElectricKwh.toLocaleString()} kWh/yr</span>
                      </div>
                    </div>

                    {/* Electricity cost */}
                    <div>
                      <p className="font-medium text-foreground/80 mb-1 text-[10px] uppercase tracking-wide">Electricity cost</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                        <span>Cheap-hour share:</span>
                        <span className="font-medium text-foreground text-right">{Math.round(results.offpeakShareUsed * 100)}%</span>
                        <span>Effective rate:</span>
                        <span className="font-medium text-foreground text-right">{(results.weightedRate * 100).toFixed(2)}p/kWh</span>
                      </div>
                    </div>
                  </div>

                  {/* Note about conservatism */}
                  <div className="flex items-start gap-2 pt-2 mt-2 border-t border-border">
                    <AlertCircle className="w-3 h-3 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] text-muted-foreground">
                      This calculator uses conservative assumptions. We prefer to under-estimate savings rather than over-estimate. 
                      Actual results may be better, especially after insulation improvements.
                    </p>
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