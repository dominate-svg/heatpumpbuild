import { useState } from 'react';
import { ChevronDown, AlertTriangle, CheckCircle } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import type { EstimateResults } from '@/lib/calculations';

interface CalculationTransparencyProps {
  results: EstimateResults;
  currentFuel: string;
}

const FUEL_LABELS: Record<string, string> = {
  gas: 'Gas',
  oil: 'Oil',
  lpg: 'LPG',
  electric: 'Electric',
};

export function CalculationTransparency({ results, currentFuel }: CalculationTransparencyProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const { transparency, epcBand, isOilFuel } = results;
  const fuelLabel = FUEL_LABELS[currentFuel] || currentFuel;
  
  // Calculate derived values for display
  const spaceSharePercent = Math.round((1 - transparency.dhwShare) * 100);
  const dhwSharePercent = Math.round(transparency.dhwShare * 100);
  const offpeakSharePercent = Math.round(transparency.cosyCheapShare * 100);
  const midSharePercent = Math.round(transparency.cosyMidShare * 100);
  const peakSharePercent = Math.round(transparency.cosyPeakShare * 100);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-4">
      <CollapsibleTrigger className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors w-full justify-center group">
        <span>How we calculated this</span>
        <ChevronDown className={cn(
          'w-4 h-4 transition-transform duration-200',
          isOpen && 'rotate-180'
        )} />
      </CollapsibleTrigger>
      
      <CollapsibleContent className="mt-4">
        <div className="bg-muted/50 rounded-xl p-4 space-y-4 text-sm">
          {/* Intro */}
          <p className="text-muted-foreground leading-relaxed">
            This estimate uses national averages, EPC-based performance adjustments, and conservative Cosy tariff modelling. A survey will confirm your actual costs.
          </p>
          
          {/* Heat Demand Section */}
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              Heat demand
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-background rounded-lg p-2">
                <span className="text-muted-foreground">EPC band</span>
                <span className="font-bold text-foreground ml-2">{epcBand}</span>
              </div>
              <div className="bg-background rounded-lg p-2">
                <span className="text-muted-foreground">Annual heat</span>
                <span className="font-bold text-foreground ml-2">
                  {Math.round(transparency.totalHeatDemand).toLocaleString()} kWh
                </span>
              </div>
              <div className="bg-background rounded-lg p-2 col-span-2">
                <span className="text-muted-foreground">Split:</span>
                <span className="font-medium text-foreground ml-2">
                  Space {spaceSharePercent}% ({Math.round(transparency.spaceHeatDemand).toLocaleString()} kWh) / 
                  Hot water {dhwSharePercent}% ({Math.round(transparency.dhwDemand).toLocaleString()} kWh)
                </span>
              </div>
            </div>
          </div>
          
          {/* Current System Section */}
          <div className="space-y-2 pt-2 border-t border-border">
            <h4 className="font-semibold text-foreground">Current {fuelLabel} system</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-background rounded-lg p-2">
                <span className="text-muted-foreground">Boiler efficiency</span>
                <span className="font-bold text-foreground ml-2">
                  {Math.round(results.boilerEfficiency * 100)}%
                  {currentFuel === 'gas' && <span className="text-muted-foreground font-normal ml-1">(typical)</span>}
                </span>
              </div>
              {isOilFuel && transparency.oilPricePerLitre && (
                <>
                  <div className="bg-background rounded-lg p-2">
                    <span className="text-muted-foreground">Oil price</span>
                    <span className="font-bold text-foreground ml-2">
                      {transparency.oilPricePerLitre}p/L
                    </span>
                  </div>
                  <div className="bg-background rounded-lg p-2">
                    <span className="text-muted-foreground">Oil used</span>
                    <span className="font-bold text-foreground ml-2">
                      {Math.round(transparency.oilLitresUsed || 0).toLocaleString()} L/yr
                    </span>
                  </div>
                  <div className="bg-background rounded-lg p-2">
                    <span className="text-muted-foreground">Energy content</span>
                    <span className="font-bold text-foreground ml-2">
                      {transparency.oilKwhPerLitre} kWh/L
                    </span>
                  </div>
                </>
              )}
              <div className="bg-background rounded-lg p-2 col-span-2">
                <span className="text-muted-foreground">Annual {fuelLabel.toLowerCase()} cost</span>
                <span className="font-bold text-foreground ml-2">
                  £{Math.round(results.baselineCost).toLocaleString()}/yr
                </span>
              </div>
            </div>
          </div>
          
          {/* Heat Pump Performance Section */}
          <div className="space-y-2 pt-2 border-t border-border">
            <h4 className="font-semibold text-foreground">Heat pump performance</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-background rounded-lg p-2">
                <span className="text-muted-foreground">Base SCOP</span>
                <span className="font-bold text-foreground ml-2">
                  {transparency.baseScop.toFixed(1)}
                </span>
              </div>
              <div className="bg-background rounded-lg p-2">
                <span className="text-muted-foreground">EPC adjustment</span>
                <span className="font-bold text-foreground ml-2">
                  ×{transparency.epcScopMultiplier.toFixed(2)}
                </span>
              </div>
              <div className="bg-background rounded-lg p-2">
                <span className="text-muted-foreground">Space SCOP</span>
                <span className="font-bold text-foreground ml-2">
                  {transparency.scopSpace.toFixed(2)}
                  {transparency.gasScopUpliftApplied && (
                    <span className="text-green-600 font-normal ml-1">(+0.15)</span>
                  )}
                </span>
              </div>
              <div className="bg-background rounded-lg p-2">
                <span className="text-muted-foreground">Hot water SCOP</span>
                <span className="font-bold text-foreground ml-2">
                  {transparency.scopDhw.toFixed(2)}
                  {transparency.gasScopUpliftApplied && (
                    <span className="text-green-600 font-normal ml-1">(+0.10)</span>
                  )}
                </span>
              </div>
              <div className="bg-background rounded-lg p-2">
                <span className="text-muted-foreground">Space elec.</span>
                <span className="font-bold text-foreground ml-2">
                  {Math.round(transparency.hpKwhSpace).toLocaleString()} kWh
                </span>
              </div>
              <div className="bg-background rounded-lg p-2">
                <span className="text-muted-foreground">Hot water elec.</span>
                <span className="font-bold text-foreground ml-2">
                  {Math.round(transparency.hpKwhDhw).toLocaleString()} kWh
                </span>
              </div>
              <div className="bg-background rounded-lg p-2 col-span-2">
                <span className="text-muted-foreground">Total HP electricity</span>
                <span className="font-bold text-foreground ml-2">
                  {Math.round(transparency.hpKwhSpace + transparency.hpKwhDhw).toLocaleString()} kWh/yr
                </span>
              </div>
            </div>
            {transparency.gasScopUpliftApplied && (
              <div className="text-xs text-green-700 bg-green-50 rounded-lg p-2 mt-2">
                Gas-home performance adjustment: +0.15 SCOP (balanced estimate based on typical lower flow temperatures)
              </div>
            )}
          </div>
          
          {/* Cosy Tariff Section */}
          <div className="space-y-2 pt-2 border-t border-border">
            <h4 className="font-semibold text-foreground">Octopus Cosy tariff</h4>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-green-50 rounded-lg p-2 text-center">
                <span className="text-green-700 font-bold block">{transparency.cosyOffpeakRate}p</span>
                <span className="text-green-600 text-[10px]">Off-peak</span>
              </div>
              <div className="bg-amber-50 rounded-lg p-2 text-center">
                <span className="text-amber-700 font-bold block">{transparency.cosyMidRate}p</span>
                <span className="text-amber-600 text-[10px]">Mid</span>
              </div>
              <div className="bg-muted rounded-lg p-2 text-center">
                <span className="text-foreground font-bold block">{transparency.cosyPeakRate}p</span>
                <span className="text-muted-foreground text-[10px]">Peak</span>
              </div>
            </div>
            <div className="bg-background rounded-lg p-2 text-xs mt-2">
              <span className="text-muted-foreground">Usage split for EPC {epcBand}:</span>
              <span className="font-medium text-foreground ml-2">
                {offpeakSharePercent}% off-peak / {midSharePercent}% mid / {peakSharePercent}% peak
              </span>
            </div>
            <div className="bg-background rounded-lg p-2 text-xs">
              <span className="text-muted-foreground">Blended electricity rate:</span>
              <span className="font-bold text-foreground ml-2">
                {transparency.blendedRate.toFixed(1)}p/kWh
              </span>
            </div>
            <div className="bg-background rounded-lg p-2 text-xs">
              <span className="text-muted-foreground">Annual HP running cost:</span>
              <span className="font-bold text-foreground ml-2">
                £{Math.round(results.hpCost).toLocaleString()}/yr
              </span>
            </div>
          </div>
          
          {/* Warnings/Notes */}
          <div className="pt-2 border-t border-border space-y-2">
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Standing charges excluded from savings (you pay them either way).</span>
            </div>
            
            {transparency.savingsWasClamped && (
              <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 rounded-lg p-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Raw savings clamped to realistic range for display.</span>
              </div>
            )}
            
            {transparency.isHighSensitivity && (
              <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 rounded-lg p-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>High-sensitivity estimate — survey will confirm actual savings.</span>
              </div>
            )}
            
            {isOilFuel && (
              <div className="text-xs text-muted-foreground italic">
                Oil home estimate uses national average model. Actual savings depend on your oil usage and prices.
              </div>
            )}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}