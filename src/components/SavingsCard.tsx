import { useState } from 'react';
import { TrendingUp, TrendingDown, ChevronDown, ChevronUp, Info, Leaf, Calculator, Fuel, AlertTriangle } from 'lucide-react';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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

  const { estimatedSavings, epcBand, transparency } = results;
  const isNegativeSavings = estimatedSavings < 0;
  const displaySavings = Math.abs(estimatedSavings);

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
          <p className="text-xs text-muted-foreground">Balanced estimate on Octopus Cosy</p>
        </div>
        <div className="flex items-center gap-2 text-success">
          <Leaf className="w-5 h-5 animate-bounce-in" style={{ animationDelay: '0.3s' }} />
        </div>
      </div>

      <Card className="border border-border shadow-card overflow-hidden">
        <CardContent className="p-0">
          {/* Savings display - supports negative values */}
          <div className={`p-4 md:p-5 border-b border-border ${
            isNegativeSavings 
              ? 'bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20' 
              : 'bg-gradient-to-r from-success/5 to-accent/5'
          }`}>
            <div className="flex flex-col gap-4">
              {/* Main savings figure */}
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 ${
                  isNegativeSavings ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-success/10'
                }`}>
                  {isNegativeSavings ? (
                    <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 dark:text-amber-400" />
                  ) : (
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Estimated annual savings</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className={`text-2xl sm:text-3xl md:text-4xl font-bold ${
                        isNegativeSavings ? 'text-amber-600 dark:text-amber-400' : 'text-success'
                      }`}>
                        {isNegativeSavings ? '-' : ''}£{displaySavings}
                      </span>
                      <span className="text-sm text-muted-foreground">/year</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Balanced estimate using national averages and conservative assumptions. Survey confirms actual costs.
                    </p>
                  </div>
                </div>
              </div>

              {/* High sensitivity warning */}
              {transparency.isHighSensitivity && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                  <span className="text-xs text-amber-700 dark:text-amber-300">
                    High-sensitivity estimate — survey will confirm
                  </span>
                </div>
              )}

              {/* Negative savings message */}
              {isNegativeSavings && (
                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                  <p className="text-xs text-muted-foreground">
                    Many homes still choose Cosy for comfort + future-proofing — survey can often improve this with design tweaks.
                  </p>
                </div>
              )}

              {/* EPC badge */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className={`text-xs ${
                  isNegativeSavings ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' : 'bg-success/10 text-success'
                }`}>
                  EPC {epcBand}
                </Badge>
                {results.isOilFuel && (
                  <Badge variant="outline" className="text-xs">
                    Oil home (national average model)
                  </Badge>
                )}
              </div>
              
              {/* Tariff info */}
              <div className="w-full space-y-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-xs text-muted-foreground cursor-help">
                        <span className="font-medium text-foreground">Octopus Energy — Cosy (3-rate tariff)</span>
                        <br />
                        Typical effective rate: ~{transparency.blendedRate.toFixed(1)}p/kWh
                        <br />
                        <span className="text-[10px]">Tariff bands: ~{transparency.cosyOffpeakRate}p / ~{transparency.cosyMidRate}p / ~{transparency.cosyPeakRate}p (varies by region)</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs">
                        We model Cosy using a blended rate that reflects when heat pumps actually run — mostly overnight and midday when power is cheapest. For EPC {epcBand}, we assume {Math.round(transparency.cosyCheapShare * 100)}% cheap / {Math.round(transparency.cosyMidShare * 100)}% mid / {Math.round(transparency.cosyPeakShare * 100)}% peak usage.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
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
                <p className="text-[10px] text-muted-foreground italic">
                  We model Cosy using a blended rate based on when heat pumps typically run (cheap hours + some peak use).
                </p>
              </div>

              {/* Cost breakdown */}
              <div className="flex flex-col gap-2 text-xs text-muted-foreground">
                <span>
                  Current heating: <span className="font-medium text-foreground">{formatCurrency(results.baselineCost)}/year</span>
                </span>
                <span>
                  Heat pump: <span className="font-medium text-foreground">{formatCurrency(results.hpCost)}/year</span>
                </span>
              </div>

              {/* Safety & trust language */}
              <p className="text-[10px] sm:text-xs text-muted-foreground border-t border-border pt-3">
                This is an estimate, not a guarantee. It assumes average behaviour, typical insulation for EPC {epcBand}, 
                and smart use of cheap electricity hours. Your home survey confirms final costs and savings.
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
                  Higher efficiency = more heat per unit of electricity. At 370% (SCOP 3.8), you get 3.8kWh of heat for every 1kWh used. 
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
                  {/* Summary explanation */}
                  <div className="space-y-2">
                    <p>
                      We estimate your current heating cost from your EPC, national averages, and typical boiler efficiency.
                      We estimate heat pump running costs using the Cosy tariff structure and how heat pumps actually use electricity through the day.
                      This gives a balanced, realistic estimate — not best-case and not pessimistic.
                    </p>
                  </div>

                  {/* Methodology explanation */}
                  <div className="space-y-2 pt-2 border-t border-border">
                    <p className="font-medium text-foreground">Your estimate is based on:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>EPC band {epcBand} typical heat demand ({transparency.totalHeatDemand.toLocaleString()} kWh/year)</li>
                      <li>Heat split: space {Math.round((1 - transparency.dhwShare) * 100)}% / hot water {Math.round(transparency.dhwShare * 100)}%</li>
                      <li>Typical boiler efficiency for {getFuelDisplayName(results.currentFuelType)} ({Math.round(results.boilerEfficiency * 100)}%)</li>
                      <li>Energy prices:
                        <ul className="list-none ml-4 mt-1 space-y-0.5">
                          {results.currentFuelType === 'gas' && <li>– Gas: 5.93p/kWh (Ofgem cap)</li>}
                          {results.currentFuelType === 'oil' && transparency.oilPricePerLitre && (
                            <li>– Oil: {transparency.oilPricePerLitre}p per litre (≈ {(transparency.oilPricePerLitre / (transparency.oilKwhPerLitre || 10.35)).toFixed(2)}p/kWh input energy)</li>
                          )}
                          {results.currentFuelType === 'lpg' && <li>– LPG: 10.5p/kWh</li>}
                          <li>– Electricity: {transparency.blendedRate.toFixed(1)}p/kWh effective on Cosy</li>
                        </ul>
                      </li>
                      <li>Selected efficiency target: {Math.round(scop * 100)}% (base SCOP {transparency.baseScop.toFixed(1)})</li>
                      <li>EPC performance adjustment: ×{transparency.epcScopMultiplier.toFixed(2)} → space SCOP {transparency.scopSpace.toFixed(2)}</li>
                      <li>Hot water SCOP penalty: ×0.75 → DHW SCOP {transparency.scopDhw.toFixed(2)}</li>
                    </ul>
                    <p className="italic">Your final design and survey confirm exact figures.</p>
                  </div>

                  {/* Detailed breakdown */}
                  <div className="pt-2 border-t border-border space-y-2">
                    <p className="font-medium text-foreground">Detailed breakdown:</p>
                    
                    {/* Heat demand */}
                    <div className="pb-2 border-b border-border/50">
                      <p className="font-medium text-foreground/80 mb-1 text-[10px] uppercase tracking-wide">Heat demand (EPC {epcBand})</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                        <span>Total heat demand:</span>
                        <span className="font-medium text-foreground text-right">{transparency.totalHeatDemand.toLocaleString()} kWh/yr</span>
                        <span>Space heating ({Math.round((1 - transparency.dhwShare) * 100)}%):</span>
                        <span className="font-medium text-foreground text-right">{Math.round(transparency.spaceHeatDemand).toLocaleString()} kWh/yr</span>
                        <span>Hot water ({Math.round(transparency.dhwShare * 100)}%):</span>
                        <span className="font-medium text-foreground text-right">{Math.round(transparency.dhwDemand).toLocaleString()} kWh/yr</span>
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
                        {results.currentFuelType === 'oil' && transparency.oilLitresUsed && (
                          <>
                            <span>Oil consumption:</span>
                            <span className="font-medium text-foreground text-right">{Math.round(transparency.oilLitresUsed).toLocaleString()} litres/yr</span>
                            <span>Oil price:</span>
                            <span className="font-medium text-foreground text-right">{transparency.oilPricePerLitre}p/litre</span>
                            <span>Energy per litre:</span>
                            <span className="font-medium text-foreground text-right">{transparency.oilKwhPerLitre} kWh</span>
                          </>
                        )}
                        {results.currentFuelType !== 'oil' && (
                          <>
                            <span>Fuel input needed:</span>
                            <span className="font-medium text-foreground text-right">{results.fuelInputKwh.toLocaleString()} kWh</span>
                          </>
                        )}
                        <span>Annual cost:</span>
                        <span className="font-medium text-foreground text-right">{formatCurrency(results.baselineCost)}</span>
                      </div>
                    </div>

                    {/* Heat pump */}
                    <div className="pb-2 border-b border-border/50">
                      <p className="font-medium text-foreground/80 mb-1 text-[10px] uppercase tracking-wide">Heat pump</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                        <span>Space heating SCOP:</span>
                        <span className="font-medium text-foreground text-right">{transparency.scopSpace.toFixed(2)}</span>
                        <span>Hot water SCOP:</span>
                        <span className="font-medium text-foreground text-right">{transparency.scopDhw.toFixed(2)}</span>
                        <span>Electricity (space):</span>
                        <span className="font-medium text-foreground text-right">{Math.round(transparency.hpKwhSpace).toLocaleString()} kWh</span>
                        <span>Electricity (DHW):</span>
                        <span className="font-medium text-foreground text-right">{Math.round(transparency.hpKwhDhw).toLocaleString()} kWh</span>
                        <span>Total electricity:</span>
                        <span className="font-medium text-foreground text-right">{results.hpElectricKwh.toLocaleString()} kWh</span>
                      </div>
                    </div>

                    {/* Cosy tariff */}
                    <div className="pb-2 border-b border-border/50">
                      <p className="font-medium text-foreground/80 mb-1 text-[10px] uppercase tracking-wide">Cosy tariff (3-rate)</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                        <span>Off-peak rate:</span>
                        <span className="font-medium text-foreground text-right">{transparency.cosyOffpeakRate}p/kWh</span>
                        <span>Mid rate:</span>
                        <span className="font-medium text-foreground text-right">{transparency.cosyMidRate}p/kWh</span>
                        <span>Peak rate:</span>
                        <span className="font-medium text-foreground text-right">{transparency.cosyPeakRate}p/kWh</span>
                        <span>Usage split (EPC {epcBand}):</span>
                        <span className="font-medium text-foreground text-right">{Math.round(transparency.cosyCheapShare * 100)}% / {Math.round(transparency.cosyMidShare * 100)}% / {Math.round(transparency.cosyPeakShare * 100)}%</span>
                        <span>Blended rate:</span>
                        <span className="font-medium text-foreground text-right">{transparency.blendedRate.toFixed(1)}p/kWh</span>
                        <span>Annual cost:</span>
                        <span className="font-medium text-foreground text-right">{formatCurrency(results.hpCost)}</span>
                      </div>
                    </div>

                    {/* Savings */}
                    <div>
                      <p className="font-medium text-foreground/80 mb-1 text-[10px] uppercase tracking-wide">Estimated savings</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                        <span>Annual savings:</span>
                        <span className={`font-medium text-right ${isNegativeSavings ? 'text-amber-600 dark:text-amber-400' : 'text-success'}`}>
                          {isNegativeSavings ? '-' : ''}{formatCurrency(displaySavings)}
                        </span>
                        {transparency.savingsWasClamped && (
                          <>
                            <span className="text-[10px]">Raw calculation:</span>
                            <span className="text-[10px] text-right">{formatCurrency(transparency.rawSavingsBeforeClamp)}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Standing charges note */}
                    <div className="pt-2 border-t border-border">
                      <p className="text-[10px] italic">
                        Standing charges excluded from savings comparison (you pay them either way).
                      </p>
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
