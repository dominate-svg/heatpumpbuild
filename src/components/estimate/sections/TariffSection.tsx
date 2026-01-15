import { ArrowLeft, Zap, Info, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTariffs, formatTariffLabel, type Tariff } from '@/hooks/useTariffs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TariffSectionProps {
  selectedTariff: Tariff | null;
  onTariffChange: (tariff: Tariff) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function TariffSection({
  selectedTariff,
  onTariffChange,
  onContinue,
  onBack,
}: TariffSectionProps) {
  const { data: tariffs, isLoading } = useTariffs();

  const handleTariffChange = (tariffId: string) => {
    const tariff = tariffs?.find(t => t.id === tariffId);
    if (tariff) {
      onTariffChange(tariff);
    }
  };

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

      {/* Title with tooltip */}
      <div className="text-center mb-2">
        <div className="flex items-center justify-center gap-2">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            Your electricity tariff
          </h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-muted-foreground/50 hover:text-muted-foreground">
                  <Info className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <div className="space-y-2 text-xs">
                  <p className="font-semibold">Why we ask this</p>
                  <p>Heat pumps run on electricity. Some tariffs offer cheaper rates overnight, which can reduce your running costs significantly.</p>
                  <p className="font-semibold pt-1">How this affects your quote</p>
                  <p>We use your tariff rates to calculate your estimated annual running cost and savings.</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Explanation */}
      <p className="text-center text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
        Heat pumps use electricity. Some tariffs are cheaper overnight, which can lower your bills.
      </p>

      {/* Tariff explainer card */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 mb-6">
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-amber-800 text-sm mb-1">
              Why tariffs matter
            </h3>
            <p className="text-xs text-amber-700 leading-relaxed">
              Heat pumps can run overnight when electricity is cheapest. Time-of-use tariffs like Octopus Cosy can save you hundreds per year compared to standard rates.
            </p>
          </div>
        </div>
      </div>

      {/* Tariff selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">
          Select your tariff
        </label>
        <Select
          value={selectedTariff?.id || ''}
          onValueChange={handleTariffChange}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full h-12 text-left">
            <SelectValue placeholder="Choose a tariff..." />
          </SelectTrigger>
          <SelectContent>
            {tariffs?.map((tariff) => (
              <SelectItem key={tariff.id} value={tariff.id}>
                {formatTariffLabel(tariff)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Selected tariff details */}
      {selectedTariff && (
        <div className="p-4 rounded-xl bg-muted/30 border border-border mb-6 animate-fade-in">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <Check className="w-3 h-3 text-primary-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">
                {selectedTariff.supplier} {selectedTariff.name}
              </p>
              {selectedTariff.notes && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selectedTariff.notes}
                </p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-2 rounded-lg bg-background">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Peak rate</p>
              <p className="font-semibold text-foreground">{selectedTariff.peak_rate_p_per_kwh}p/kWh</p>
            </div>
            {selectedTariff.offpeak_rate_p_per_kwh && (
              <div className="p-2 rounded-lg bg-green-50">
                <p className="text-[10px] text-green-700 uppercase tracking-wide mb-0.5">Off-peak rate</p>
                <p className="font-semibold text-green-700">{selectedTariff.offpeak_rate_p_per_kwh}p/kWh</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CTA */}
      <Button 
        onClick={onContinue}
        size="lg"
        disabled={!selectedTariff}
        className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold rounded-xl active:scale-[0.98] transition-all cta-hover-lift"
      >
        Continue →
      </Button>
    </section>
  );
}
