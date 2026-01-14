import { useState, useEffect } from 'react';
import { Gauge, Zap, MapPin, Droplets, Sparkles, TrendingUp, TrendingDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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

interface PersonaliseSectionProps {
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
  onIdleChange: (isIdle: boolean) => void;
}

const EFFICIENCY_OPTIONS = [
  { value: 3.4, label: 'Comfort', sublabel: '340%', description: 'Minimal radiator work, lower upfront cost' },
  { value: 3.7, label: 'Balanced', sublabel: '370%', description: 'Some upgrades, better running costs' },
  { value: 4.0, label: 'Efficiency', sublabel: '400%', description: 'Full upgrade, lowest running costs' },
];

interface OptionGridProps {
  options: { value: string; label: string; price: number }[];
  selected: string;
  onChange: (value: string) => void;
}

function OptionGrid({ options, selected, onChange }: OptionGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'p-4 rounded-xl border-2 text-left transition-all duration-300',
            selected === option.value
              ? 'border-primary bg-primary/5 shadow-sm'
              : 'border-border hover:border-primary/30'
          )}
        >
          <span className="font-medium text-sm block">{option.label}</span>
          <span className="text-xs text-muted-foreground">
            {option.price === 0 ? 'Included' : `+${formatCurrency(option.price)}`}
          </span>
        </button>
      ))}
    </div>
  );
}

export function PersonaliseSection({
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
  onIdleChange,
}: PersonaliseSectionProps) {
  const { data: tariffs, isLoading: tariffsLoading } = useTariffs();
  const [lastChangeTime, setLastChangeTime] = useState(Date.now());

  // Detect idle state
  useEffect(() => {
    const checkIdle = setInterval(() => {
      if (Date.now() - lastChangeTime > 2000) {
        onIdleChange(true);
      }
    }, 500);
    return () => clearInterval(checkIdle);
  }, [lastChangeTime, onIdleChange]);

  const handleChange = (callback: () => void) => {
    setLastChangeTime(Date.now());
    onIdleChange(false);
    callback();
  };

  const { estimatedSavings, customerContribution } = results;
  const isNegativeSavings = estimatedSavings < 0;
  const displaySavings = Math.abs(estimatedSavings);

  const handleTariffChange = (tariffId: string) => {
    const tariff = tariffs?.find(t => t.id === tariffId);
    if (tariff) handleChange(() => onTariffChange(tariff));
  };

  const locationOptions = [
    { value: 'included', label: 'Within 3m', price: 0 },
    { value: '6m', label: '3-6m away', price: assumptions.adder_location_6m },
    { value: '9m', label: '6-9m away', price: assumptions.adder_location_9m },
  ];

  const cylinderOptions = [
    { value: 'existing', label: 'Keep existing', price: 0 },
    { value: '150l', label: 'New 150L', price: assumptions.adder_cylinder_150l },
    { value: '210l', label: 'New 210L', price: assumptions.adder_cylinder_210l },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-10 animate-fade-in">
        <h2 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight mb-2">
          Let's personalise it
        </h2>
        <p className="text-muted-foreground text-lg">
          Adjust what matters to you
        </p>
      </div>

      {/* Live summary - sticky on desktop */}
      <div className="sticky top-4 z-20 mb-8">
        <div className="bg-card/95 backdrop-blur-sm rounded-2xl border border-border shadow-elevated p-5">
          <div className="flex items-center justify-between gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Install price</p>
              <p className="text-3xl font-bold text-foreground">{formatCurrency(customerContribution)}</p>
            </div>
            <div className="h-12 w-px bg-border" />
            <div className="text-right">
              <p className="text-sm text-muted-foreground flex items-center justify-end gap-1">
                {isNegativeSavings ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                Annual savings
              </p>
              <p className={cn(
                'text-3xl font-bold',
                isNegativeSavings ? 'text-amber-600' : 'text-success'
              )}>
                {isNegativeSavings ? '-' : ''}£{displaySavings}/yr
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Refinement panels */}
      <div className="space-y-6">
        {/* Efficiency selector - visual scale */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Gauge className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Efficiency level</p>
              <p className="text-sm text-muted-foreground">Choose your priority</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {EFFICIENCY_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleChange(() => onScopChange(option.value))}
                className={cn(
                  'flex-1 p-4 rounded-xl border-2 text-center transition-all duration-300',
                  scop === option.value
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border hover:border-primary/30'
                )}
              >
                <span className="text-lg font-bold text-foreground block">{option.label}</span>
                <span className="text-sm text-muted-foreground">{option.sublabel}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            {EFFICIENCY_OPTIONS.find(o => o.value === scop)?.description}
          </p>
        </div>

        {/* Tariff selector */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground">Electricity tariff</p>
                {selectedTariff?.name?.toLowerCase().includes('cosy') && (
                  <Badge className="bg-primary/10 text-primary border-0 text-xs">Recommended</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">Pick your energy plan</p>
            </div>
          </div>
          
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
        </div>

        {/* Location selector */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Heat pump location</p>
              <p className="text-sm text-muted-foreground">Distance from your boiler</p>
            </div>
          </div>
          
          <OptionGrid
            options={locationOptions}
            selected={locationAdder}
            onChange={(v) => handleChange(() => onLocationChange(v as any))}
          />
        </div>

        {/* Cylinder selector */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Droplets className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Hot water cylinder</p>
              <p className="text-sm text-muted-foreground">Choose your setup</p>
            </div>
          </div>
          
          <OptionGrid
            options={cylinderOptions}
            selected={cylinderOption}
            onChange={(v) => handleChange(() => onCylinderChange(v as any))}
          />
        </div>
      </div>
    </div>
  );
}
