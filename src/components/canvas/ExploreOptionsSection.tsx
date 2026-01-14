import { useState } from 'react';
import { Gauge, Zap, MapPin, Droplets, Sparkles, TrendingUp, TrendingDown, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
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
import { cn } from '@/lib/utils';

interface ExploreOptionsSectionProps {
  results: EstimateResults;
  assumptions: Assumptions;
  scop: number;
  selectedTariff: Tariff | null;
  locationAdder: 'included' | '6m' | '9m';
  cylinderOption: 'existing' | '150l' | '210l';
  onScopChange: (scop: number) => void;
  onTariffChange: (tariff: Tariff) => void;
  onLocationChange: (location: 'included' | '6m' | '9m') => void;
  onCylinderChange: (cylinder: 'existing' | '150l' | '210l') => void;
  onContinue: () => void;
}

const EFFICIENCY_OPTIONS = [
  { value: 3.4, label: 'Lower cost', radiators: 2, description: 'Minimal radiator changes' },
  { value: 3.7, label: 'Balanced', radiators: 6, description: 'Some radiator upgrades' },
  { value: 4.0, label: 'Lower bills', radiators: 11, description: 'Full radiator upgrade' },
];

export function ExploreOptionsSection({
  results,
  assumptions,
  scop,
  selectedTariff,
  locationAdder,
  cylinderOption,
  onScopChange,
  onTariffChange,
  onLocationChange,
  onCylinderChange,
  onContinue,
}: ExploreOptionsSectionProps) {
  const { data: tariffs, isLoading: tariffsLoading } = useTariffs();
  const [activePanel, setActivePanel] = useState<string | null>('efficiency');

  const efficiencyPercent = Math.round(scop * 100);
  const { estimatedSavings, customerContribution } = results;
  const isNegativeSavings = estimatedSavings < 0;
  const displaySavings = Math.abs(estimatedSavings);

  const scopIndex = EFFICIENCY_OPTIONS.findIndex(o => o.value === scop);
  const currentEfficiency = EFFICIENCY_OPTIONS[scopIndex] || EFFICIENCY_OPTIONS[0];

  const handleTariffChange = (tariffId: string) => {
    const tariff = tariffs?.find(t => t.id === tariffId);
    if (tariff) onTariffChange(tariff);
  };

  const locationOptions = [
    { value: 'included' as const, label: 'Within 3m', sublabel: 'of boiler location', price: 0 },
    { value: '6m' as const, label: '3-6m away', sublabel: 'longer pipe run', price: assumptions.adder_location_6m },
    { value: '9m' as const, label: '6-9m away', sublabel: 'extended installation', price: assumptions.adder_location_9m },
  ];

  const cylinderOptions = [
    { value: 'existing' as const, label: 'Keep existing', sublabel: 'if suitable', price: 0 },
    { value: '150l' as const, label: '150L cylinder', sublabel: '2-3 person home', price: assumptions.adder_cylinder_150l },
    { value: '210l' as const, label: '210L cylinder', sublabel: '4+ person home', price: assumptions.adder_cylinder_210l },
  ];

  return (
    <section className="py-16 px-6 bg-muted/30">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 section-enter">
          <h2 className="text-section-title font-semibold text-foreground tracking-tight mb-3">
            Explore your options
          </h2>
          <p className="text-body text-muted-foreground">
            Adjust settings to see how they affect your estimate.
          </p>
        </div>

        {/* Live summary */}
        <div className="bg-card rounded-2xl border border-border shadow-soft p-5 mb-8 section-enter" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between gap-6">
            <div>
              <p className="text-micro text-muted-foreground mb-1">Install price</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(customerContribution)}</p>
            </div>
            <div className="h-10 w-px bg-border" />
            <div className="text-right">
              <p className="text-micro text-muted-foreground mb-1 flex items-center justify-end gap-1">
                {isNegativeSavings ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                Annual savings
              </p>
              <p className={cn(
                'text-2xl font-bold',
                isNegativeSavings ? 'text-amber-600' : 'text-success'
              )}>
                {isNegativeSavings ? '-' : ''}£{displaySavings}/yr
              </p>
            </div>
          </div>
        </div>

        {/* Interactive panels */}
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          {/* Efficiency */}
          <div
            className={cn(
              'bg-card rounded-2xl border shadow-soft p-5 cursor-pointer transition-all section-enter',
              activePanel === 'efficiency' ? 'border-primary ring-2 ring-primary/10' : 'border-border hover:border-primary/30'
            )}
            style={{ animationDelay: '200ms' }}
            onClick={() => setActivePanel(activePanel === 'efficiency' ? null : 'efficiency')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Gauge className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Efficiency</p>
                  <p className="text-micro text-muted-foreground">{efficiencyPercent}% • {currentEfficiency.radiators} radiators</p>
                </div>
              </div>
              <ChevronRight className={cn('w-5 h-5 text-muted-foreground transition-transform', activePanel === 'efficiency' && 'rotate-90')} />
            </div>

            {activePanel === 'efficiency' && (
              <div className="pt-4 border-t border-border space-y-4">
                <div className="flex justify-between text-micro text-muted-foreground">
                  <span>Lower cost</span>
                  <span>Lower bills</span>
                </div>
                <Slider
                  value={[scopIndex]}
                  onValueChange={([val]) => onScopChange(EFFICIENCY_OPTIONS[val].value)}
                  max={2}
                  step={1}
                  className="py-2"
                />
                <p className="text-micro text-muted-foreground text-center">
                  {currentEfficiency.description}
                </p>
              </div>
            )}
          </div>

          {/* Tariff */}
          <div
            className={cn(
              'bg-card rounded-2xl border shadow-soft p-5 cursor-pointer transition-all section-enter',
              activePanel === 'tariff' ? 'border-primary ring-2 ring-primary/10' : 'border-border hover:border-primary/30'
            )}
            style={{ animationDelay: '300ms' }}
            onClick={() => setActivePanel(activePanel === 'tariff' ? null : 'tariff')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Tariff</p>
                  <p className="text-micro text-muted-foreground flex items-center gap-1">
                    {selectedTariff?.name || 'Select'}
                    {selectedTariff?.name?.toLowerCase().includes('cosy') && (
                      <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-0 ml-1">Recommended</Badge>
                    )}
                  </p>
                </div>
              </div>
              <ChevronRight className={cn('w-5 h-5 text-muted-foreground transition-transform', activePanel === 'tariff' && 'rotate-90')} />
            </div>

            {activePanel === 'tariff' && (
              <div className="pt-4 border-t border-border" onClick={e => e.stopPropagation()}>
                <Select
                  value={selectedTariff?.id || ''}
                  onValueChange={handleTariffChange}
                  disabled={tariffsLoading}
                >
                  <SelectTrigger className="w-full h-12 rounded-xl">
                    <SelectValue placeholder="Select tariff..." />
                  </SelectTrigger>
                  <SelectContent>
                    {tariffs?.map((tariff) => (
                      <SelectItem key={tariff.id} value={tariff.id}>
                        <div className="flex items-center gap-2">
                          {tariff.name.toLowerCase().includes('cosy') && (
                            <Sparkles className="w-3 h-3 text-primary" />
                          )}
                          {formatTariffLabel(tariff)}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-micro text-muted-foreground mt-3">
                  Cosy offers 8 cheap hours daily — best for heat pumps.
                </p>
              </div>
            )}
          </div>

          {/* Location */}
          <div
            className={cn(
              'bg-card rounded-2xl border shadow-soft p-5 cursor-pointer transition-all section-enter',
              activePanel === 'location' ? 'border-primary ring-2 ring-primary/10' : 'border-border hover:border-primary/30'
            )}
            style={{ animationDelay: '400ms' }}
            onClick={() => setActivePanel(activePanel === 'location' ? null : 'location')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Location</p>
                  <p className="text-micro text-muted-foreground">
                    {locationOptions.find(o => o.value === locationAdder)?.label}
                  </p>
                </div>
              </div>
              <ChevronRight className={cn('w-5 h-5 text-muted-foreground transition-transform', activePanel === 'location' && 'rotate-90')} />
            </div>

            {activePanel === 'location' && (
              <div className="pt-4 border-t border-border space-y-2" onClick={e => e.stopPropagation()}>
                {locationOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => onLocationChange(option.value)}
                    className={cn(
                      'w-full p-3 rounded-xl border-2 text-left transition-all flex justify-between items-center',
                      locationAdder === option.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/30'
                    )}
                  >
                    <div>
                      <span className="font-medium text-sm">{option.label}</span>
                      <span className="text-micro text-muted-foreground ml-2">{option.sublabel}</span>
                    </div>
                    <span className="text-micro text-muted-foreground">
                      {option.price === 0 ? 'Included' : `+${formatCurrency(option.price)}`}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cylinder */}
          <div
            className={cn(
              'bg-card rounded-2xl border shadow-soft p-5 cursor-pointer transition-all section-enter',
              activePanel === 'cylinder' ? 'border-primary ring-2 ring-primary/10' : 'border-border hover:border-primary/30'
            )}
            style={{ animationDelay: '500ms' }}
            onClick={() => setActivePanel(activePanel === 'cylinder' ? null : 'cylinder')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <Droplets className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Cylinder</p>
                  <p className="text-micro text-muted-foreground">
                    {cylinderOptions.find(o => o.value === cylinderOption)?.label}
                  </p>
                </div>
              </div>
              <ChevronRight className={cn('w-5 h-5 text-muted-foreground transition-transform', activePanel === 'cylinder' && 'rotate-90')} />
            </div>

            {activePanel === 'cylinder' && (
              <div className="pt-4 border-t border-border space-y-2" onClick={e => e.stopPropagation()}>
                {cylinderOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => onCylinderChange(option.value)}
                    className={cn(
                      'w-full p-3 rounded-xl border-2 text-left transition-all flex justify-between items-center',
                      cylinderOption === option.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/30'
                    )}
                  >
                    <div>
                      <span className="font-medium text-sm">{option.label}</span>
                      <span className="text-micro text-muted-foreground ml-2">{option.sublabel}</span>
                    </div>
                    <span className="text-micro text-muted-foreground">
                      {option.price === 0 ? 'Included' : `+${formatCurrency(option.price)}`}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Continue button */}
        <div className="text-center section-enter" style={{ animationDelay: '600ms' }}>
          <button
            onClick={onContinue}
            className="h-14 px-10 bg-primary text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
          >
            Continue
          </button>
        </div>
      </div>
    </section>
  );
}
