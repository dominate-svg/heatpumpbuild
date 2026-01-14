import { forwardRef } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Calculator, Info } from 'lucide-react';
import { getFuelDisplayName } from '@/lib/calculations';
import type { EstimateResults } from '@/lib/calculations';

interface CalculationDetailsProps {
  results: EstimateResults;
  epcBand: string;
  scop: number;
}

export const CalculationDetails = forwardRef<HTMLDivElement, CalculationDetailsProps>(
  ({ results, epcBand, scop }, ref) => {
    const { transparency } = results;

    return (
      <div ref={ref} className="scroll-mt-4">
        <Accordion type="single" collapsible defaultValue="">
          <AccordionItem value="calculation" className="border border-border rounded-xl bg-card overflow-hidden">
            <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calculator className="w-4 h-4 text-primary" />
                </div>
                <span className="font-semibold text-foreground">How we calculated this</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-5">
              <div className="space-y-4 text-sm">
                {/* Summary explanation */}
                <p className="text-muted-foreground leading-relaxed">
                  We estimate your current heating cost from your EPC, national averages, and typical boiler efficiency.
                  We estimate heat pump running costs using the selected tariff structure and how heat pumps actually use electricity through the day.
                </p>

                {/* Data used */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <p className="font-medium text-foreground flex items-center gap-2">
                    <Info className="w-4 h-4 text-primary" />
                    Your estimate is based on:
                  </p>
                  <ul className="list-disc list-inside space-y-1.5 text-muted-foreground text-xs">
                    <li>EPC band <span className="font-medium text-foreground">{epcBand}</span> typical heat demand ({transparency.totalHeatDemand.toLocaleString()} kWh/year)</li>
                    <li>Heat split: space {Math.round((1 - transparency.dhwShare) * 100)}% / hot water {Math.round(transparency.dhwShare * 100)}%</li>
                    <li>Current fuel: <span className="font-medium text-foreground">{getFuelDisplayName(results.currentFuelType)}</span> ({Math.round(results.boilerEfficiency * 100)}% boiler efficiency)</li>
                    <li>Heat pump efficiency: <span className="font-medium text-foreground">{Math.round(scop * 100)}%</span> (SCOP {scop})</li>
                    <li>Effective electricity rate: <span className="font-medium text-foreground">~{transparency.blendedRate.toFixed(1)}p/kWh</span></li>
                  </ul>
                </div>

                {/* Energy prices */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p className="font-medium text-foreground text-xs">Energy prices used:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {results.currentFuelType === 'gas' && <li>Gas: 5.93p/kWh (Ofgem cap)</li>}
                    {results.currentFuelType === 'oil' && transparency.oilPricePerLitre && (
                      <li>Oil: {transparency.oilPricePerLitre}p per litre (≈ {(transparency.oilPricePerLitre / (transparency.oilKwhPerLitre || 10.35)).toFixed(2)}p/kWh)</li>
                    )}
                    {results.currentFuelType === 'lpg' && <li>LPG: 10.5p/kWh</li>}
                    <li>Electricity: {transparency.blendedRate.toFixed(1)}p/kWh effective rate</li>
                  </ul>
                </div>

                {/* Tariff details */}
                {transparency.isCosy && (
                  <div className="bg-octopus/5 border border-octopus/20 rounded-lg p-4 space-y-2">
                    <p className="font-medium text-foreground text-xs flex items-center gap-2">
                      <span className="text-octopus">🐙</span>
                      Octopus Cosy tariff model:
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>Off-peak rate: ~{transparency.cosyOffpeakRate}p/kWh</li>
                      <li>Mid rate: ~{transparency.cosyMidRate}p/kWh</li>
                      <li>Peak rate: ~{transparency.cosyPeakRate}p/kWh</li>
                      <li>
                        For EPC {epcBand}: {Math.round(transparency.cosyCheapShare * 100)}% cheap / {Math.round(transparency.cosyMidShare * 100)}% mid / {Math.round(transparency.cosyPeakShare * 100)}% peak usage
                      </li>
                    </ul>
                  </div>
                )}

                {/* Disclaimer */}
                <div className="border-t border-border pt-4">
                  <p className="text-xs text-muted-foreground italic">
                    <strong>Estimate only.</strong> This is based on typical usage patterns and conservative assumptions. 
                    A home survey confirms the final design and costs for your specific situation.
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    );
  }
);

CalculationDetails.displayName = 'CalculationDetails';
