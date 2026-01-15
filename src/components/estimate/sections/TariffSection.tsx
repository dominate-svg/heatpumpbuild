import { useState, useMemo } from 'react';
import { ArrowLeft, Zap, Check, Star, TrendingDown, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useTariffs, type Tariff } from '@/hooks/useTariffs';
import { calculateEstimate, type EPCData, type Assumptions } from '@/lib/calculations';
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

  // Calculate savings for each tariff
  const tariffSavings = useMemo(() => {
    if (!tariffs || !epcData || !assumptions) return new Map<string, number>();
    
    const savings = new Map<string, number>();
    
    tariffs.forEach(tariff => {
      const result = calculateEstimate({
        floorArea: epcData.totalFloorArea || 100,
        heatingCostCurrent: epcData.heatingCostCurrent,
        spaceHeatingDemand: epcData.spaceHeatingDemand,
        currentFuel,
        propertyType: epcData.propertyType,
        region: epcData.region || 'England',
        epcBand: epcData.epcBand,
        scop,
        tariff,
        locationAdder,
        cylinderOption,
      }, assumptions);
      
      savings.set(tariff.id, result.estimatedSavings);
    });
    
    return savings;
  }, [tariffs, epcData, assumptions, scop, currentFuel, locationAdder, cylinderOption]);

  const handleSelectTariff = (tariff: Tariff) => {
    onTariffChange(tariff);
  };

  const isCosy = selectedTariff?.name.toLowerCase().includes('cosy');
  const cosySavings = cosyTariff ? tariffSavings.get(cosyTariff.id) || 0 : 0;

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
                <div className="flex items-center gap-2 mb-3">
                  <span className={cn(
                    'px-3 py-1.5 rounded-lg font-bold text-sm tabular-nums',
                    cosySavings > 0 ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'
                  )}>
                    {cosySavings > 0 ? `Save £${cosySavings}/yr` : 'No savings'}
                  </span>
                  <span className="text-xs text-green-600 font-medium">Best savings</span>
                </div>

                {/* Rate breakdown */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-green-50 text-center">
                    <p className="text-[10px] text-green-700 uppercase tracking-wide mb-0.5">Off-peak</p>
                    <p className="font-bold text-green-700">7p/kWh</p>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-50 text-center">
                    <p className="text-[10px] text-amber-700 uppercase tracking-wide mb-0.5">Mid</p>
                    <p className="font-bold text-amber-700">19p/kWh</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Peak</p>
                    <p className="font-bold text-foreground">40p/kWh</p>
                  </div>
                </div>
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
            <p className="text-xs text-amber-700 leading-relaxed">
              Heat pumps work best overnight when electricity is cheapest. Cosy's 7p/kWh off-peak rate (vs 24p+ on standard tariffs) means <strong>significant savings</strong>. Most customers save £200-400/year compared to standard rates.
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
              const hasOffpeak = tariff.offpeak_rate_p_per_kwh !== null;
              const savings = tariffSavings.get(tariff.id) || 0;
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
