import { useState, useMemo } from 'react';
import { ArrowLeft, Zap, Check, Star, TrendingDown, ChevronDown, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useTariffs, type Tariff } from '@/hooks/useTariffs';
import { calculateEstimate, type EPCData, type Assumptions, type EstimateResults } from '@/lib/calculations';
import { calculateAllTariffOutcomes, roundSavingsForDisplay, type TariffOutcome } from '@/lib/tariffCalculations';
import { CalculationTransparency } from '@/components/estimate/CalculationTransparency';
import cosyBadge from '@/assets/cosy-badge.png';

interface TariffSectionProps {
  selectedTariff: Tariff | null;
  onTariffChange: (tariff: Tariff) => void;
  onContinue: () => void;
  onBack: () => void;
  epcData: EPCData;
  assumptions: Assumptions;
  scop: number;
  currentFuel: string;
  locationAdder: 'included' | '6m' | '9m';
  cylinderOption: 'existing' | '150l' | '210l';
}

export function TariffSection({
  selectedTariff,
  onTariffChange,
  onContinue,
  onBack,
  epcData,
  assumptions,
  scop,
  currentFuel,
  locationAdder,
  cylinderOption,
}: TariffSectionProps) {
  const { data: tariffs, isLoading } = useTariffs();
  const [showOtherTariffs, setShowOtherTariffs] = useState(false);

  // Find the Cosy tariff
  const cosyTariff = tariffs?.find(t => t.name.toLowerCase().includes('cosy'));
  const otherTariffs = tariffs?.filter(t => !t.name.toLowerCase().includes('cosy')) || [];

  // First, get base estimate values (HP kWh and current heating cost)
  // We need these as inputs for per-tariff calculations
  const baseEstimate = useMemo((): { heatPumpKwhAnnual: number; currentHeatingCostAnnual: number; epcBand: string; fullResults: EstimateResults } | null => {
    if (!epcData || !assumptions) return null;
    
    // Calculate once with Cosy to get the common values
    const result = calculateEstimate({
      floorArea: epcData.totalFloorArea || 100,
      heatingCostCurrent: epcData.heatingCostCurrent,
      spaceHeatingDemand: epcData.spaceHeatingDemand,
      currentFuel,
      propertyType: epcData.propertyType,
      region: epcData.region || 'England',
      epcBand: epcData.epcBand,
      scop,
      tariff: cosyTariff || null,
      locationAdder,
      cylinderOption,
    }, assumptions);
    
    return {
      heatPumpKwhAnnual: result.rawHpElectricKwh,
      currentHeatingCostAnnual: result.rawBaselineCost,
      epcBand: result.epcBand,
      fullResults: result,
    };
  }, [epcData, assumptions, scop, currentFuel, locationAdder, cylinderOption, cosyTariff]);

  // Calculate per-tariff savings using the new direct calculation
  const tariffOutcomes = useMemo(() => {
    if (!tariffs || !baseEstimate) return new Map<string, TariffOutcome>();
    
    return calculateAllTariffOutcomes(
      tariffs,
      baseEstimate.epcBand,
      baseEstimate.heatPumpKwhAnnual,
      baseEstimate.currentHeatingCostAnnual
    );
  }, [tariffs, baseEstimate]);

  const handleSelectTariff = (tariff: Tariff) => {
    onTariffChange(tariff);
  };

  const isCosy = selectedTariff?.name.toLowerCase().includes('cosy');
  const cosyOutcome = cosyTariff ? tariffOutcomes.get(cosyTariff.id) : null;
  const cosySavings = cosyOutcome ? roundSavingsForDisplay(cosyOutcome.annualSavings) : 0;
  const savingsNegative = cosySavings < 0;
  const isOilHome = currentFuel.toLowerCase().includes('oil');
  const isHighSensitivity = baseEstimate?.fullResults?.transparency?.isHighSensitivity ?? false;

  return (
    <section className="py-6 sm:py-10 animate-fade-in">
      {/* Back button */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Icon */}
      <div className="flex justify-center mb-4">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Zap className="w-7 h-7 text-primary" />
        </div>
      </div>

      {/* Title */}
      <h2 className="text-xl sm:text-2xl font-bold text-foreground text-center mb-2">
        Your electricity tariff
      </h2>

      {/* Explanation */}
      <p className="text-center text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
        The right tariff can save you hundreds per year. We recommend Octopus Cosy for heat pump owners.
      </p>

      {/* Cosy - Recommended Option */}
      {cosyTariff && (
        <div className="mb-4">
          <button
            onClick={() => handleSelectTariff(cosyTariff)}
            className={cn(
              'w-full p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden',
              selectedTariff?.id === cosyTariff.id
                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                : 'border-border hover:border-primary/50 bg-card'
            )}
          >
            {/* Recommended badge */}
            <div className="absolute top-0 right-0">
              <div className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 rounded-bl-lg flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
                RECOMMENDED
              </div>
            </div>

            <div className="flex items-start gap-3 pr-24">
              {/* Selection indicator */}
              <div className={cn(
                'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5',
                selectedTariff?.id === cosyTariff.id
                  ? 'border-primary bg-primary'
                  : 'border-muted-foreground/30'
              )}>
                {selectedTariff?.id === cosyTariff.id && (
                  <Check className="w-3 h-3 text-primary-foreground" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <img src={cosyBadge} alt="Cosy" className="h-5 w-auto" />
                  <span className="font-semibold text-foreground">Octopus Cosy</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  3-rate tariff designed for heat pumps
                </p>

                {/* Savings highlight */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className={cn(
                    'px-3 py-1.5 rounded-lg font-bold text-sm tabular-nums',
                    cosySavings > 0 ? 'bg-green-100 text-green-700' : 
                    cosySavings < 0 ? 'bg-amber-100 text-amber-700' : 'bg-muted text-muted-foreground'
                  )}>
                    {cosySavings > 0 ? `Save £${cosySavings}/yr` : 
                     cosySavings < 0 ? `£${Math.abs(cosySavings)}/yr more` : 'Similar cost'}
                  </span>
                  {cosySavings > 0 && (
                    <span className="text-xs text-green-600 font-medium">Best savings</span>
                  )}
                  {isHighSensitivity && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                      <AlertTriangle className="w-3 h-3" />
                      Survey confirms
                    </span>
                  )}
                </div>

                {/* Rate breakdown - MUST MATCH calculations.ts (7p/19p/40p) */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-green-50 text-center">
                    <p className="text-[10px] text-green-700 uppercase tracking-wide mb-0.5">Off-peak</p>
                    <p className="font-bold text-green-700">~7p/kWh</p>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-50 text-center">
                    <p className="text-[10px] text-amber-700 uppercase tracking-wide mb-0.5">Mid</p>
                    <p className="font-bold text-amber-700">~19p/kWh</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Peak</p>
                    <p className="font-bold text-foreground">~40p/kWh</p>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 text-center italic">
                  Rates vary by region
                </p>
              </div>
            </div>

            {/* Benefits list */}
            <div className="mt-3 pt-3 border-t border-border/50 ml-8">
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-green-700 bg-green-50 px-2 py-1 rounded-full">
                  <TrendingDown className="w-3 h-3" />
                  Lowest running costs
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                  <Check className="w-3 h-3" />
                  6 hours cheap overnight
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  <Check className="w-3 h-3" />
                  3pm-4pm bonus hour
                </span>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Why Cosy explainer */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 mb-4">
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-amber-800 text-sm mb-1">
              Why we recommend Cosy
            </h3>
            <p className="text-xs text-amber-700 leading-relaxed mb-2">
              Heat pumps work best overnight when electricity is cheapest. Cosy's ~7p/kWh off-peak rate (vs 24p+ on standard tariffs) means <strong>lower running costs</strong>.
            </p>
            <p className="text-[10px] text-amber-600 italic">
              We model Cosy using a blended rate based on when heat pumps typically run (cheap hours + some peak use).
            </p>
          </div>
        </div>
      </div>

      {/* Other tariffs - Collapsible */}
      {otherTariffs.length > 0 && (
        <Collapsible open={showOtherTariffs} onOpenChange={setShowOtherTariffs}>
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/30 bg-card/50 text-sm text-muted-foreground transition-colors mb-2">
              <span>Compare other tariffs</span>
              <ChevronDown className={cn(
                "w-4 h-4 transition-transform duration-200",
                showOtherTariffs && "rotate-180"
              )} />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2">
            {otherTariffs.map((tariff) => {
              const isSelected = selectedTariff?.id === tariff.id;
              const hasOffpeak = tariff.offpeak_rate_p_per_kwh !== null && tariff.offpeak_hours_per_day > 0;
              const outcome = tariffOutcomes.get(tariff.id);
              const savings = outcome ? roundSavingsForDisplay(outcome.annualSavings) : 0;
              const savingsDiff = cosySavings - savings;
              
              return (
                <button
                  key={tariff.id}
                  onClick={() => handleSelectTariff(tariff)}
                  className={cn(
                    'w-full p-3 rounded-lg border text-left transition-all flex items-center gap-3',
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/30 bg-card'
                  )}
                >
                  {/* Selection indicator */}
                  <div className={cn(
                    'w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                    isSelected
                      ? 'border-primary bg-primary'
                      : 'border-muted-foreground/30'
                  )}>
                    {isSelected && (
                      <Check className="w-2.5 h-2.5 text-primary-foreground" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">
                      {tariff.supplier} — {tariff.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {hasOffpeak 
                        ? `${tariff.offpeak_rate_p_per_kwh}p off-peak / ${tariff.peak_rate_p_per_kwh}p peak`
                        : `${tariff.peak_rate_p_per_kwh}p/kWh flat rate`
                      }
                    </p>
                  </div>

                  {/* Savings comparison */}
                  <div className="text-right flex-shrink-0">
                    <p className={cn(
                      'text-sm font-semibold tabular-nums',
                      savings > 0 ? 'text-foreground' : 'text-muted-foreground'
                    )}>
                      {savings > 0 ? `£${savings}/yr` : 'No savings'}
                    </p>
                    {savingsDiff > 0 && (
                      <p className="text-[10px] text-orange-600">
                        £{savingsDiff} less than Cosy
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Warning if not on Cosy */}
      {selectedTariff && !isCosy && (
        <div className="p-3 rounded-lg bg-orange-50 border border-orange-200 mb-4 mt-4 animate-fade-in">
          <p className="text-xs text-orange-800">
            <strong>Note:</strong> Your selected tariff may result in higher running costs. We recommend switching to Octopus Cosy after installation for maximum savings.
          </p>
        </div>
      )}

      {/* Negative savings messaging for oil homes */}
      {savingsNegative && isOilHome && (
        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 mb-4 mt-4 animate-fade-in">
          <p className="text-xs text-blue-800 leading-relaxed">
            <strong>Why consider switching anyway?</strong> Many homes choose heat pumps for comfort, future-proofing, and environmental benefits. A survey can often reveal design improvements that reduce running costs.
          </p>
        </div>
      )}

      {/* How we calculated this - Transparency */}
      {baseEstimate?.fullResults && (
        <CalculationTransparency 
          results={baseEstimate.fullResults} 
          currentFuel={currentFuel} 
        />
      )}

      {/* CTA */}
      <Button 
        onClick={onContinue}
        size="lg"
        disabled={!selectedTariff}
        className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold rounded-xl active:scale-[0.98] transition-all cta-hover-lift mt-4"
      >
        Continue →
      </Button>
    </section>
  );
}
