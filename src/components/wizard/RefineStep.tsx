import { useState } from 'react';
import { ChevronDown, ChevronUp, Zap, MapPin, Droplets, Gauge, Sparkles, TrendingUp, TrendingDown } from 'lucide-react';
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
import { cn } from '@/lib/utils';

interface RefineStepProps {
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
  { value: 3.4, label: '340%', radiators: 2, description: 'Standard efficiency, minimal upgrades' },
  { value: 3.7, label: '370%', radiators: 6, description: 'Better efficiency, some radiator work' },
  { value: 4.0, label: '400%', radiators: 11, description: 'Maximum efficiency, full radiator upgrade' },
];

interface RefinePanelProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  badge?: string;
}

function RefinePanel({ icon: Icon, title, subtitle, isOpen, onToggle, children, badge }: RefinePanelProps) {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden transition-all duration-300">
      <Collapsible open={isOpen} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <button className="w-full p-5 flex items-center justify-between text-left hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center">
                <Icon className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground">{title}</p>
                  {badge && (
                    <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-0">
                      {badge}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              </div>
            </div>
            <div className={cn(
              'w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center transition-transform duration-300',
              isOpen && 'rotate-180'
            )}>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </div>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-5 pb-5 pt-0">
            <div className="h-px bg-border mb-5" />
            {children}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export function RefineStep({
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
}: RefineStepProps) {
  const [openPanel, setOpenPanel] = useState<string | null>('efficiency');
  const { data: tariffs, isLoading: tariffsLoading } = useTariffs();

  const efficiencyPercent = Math.round(scop * 100);
  const { estimatedSavings, customerContribution } = results;
  const isNegativeSavings = estimatedSavings < 0;
  const displaySavings = Math.abs(estimatedSavings);

  const handleTariffChange = (tariffId: string) => {
    const tariff = tariffs?.find(t => t.id === tariffId);
    if (tariff) onTariffChange(tariff);
  };

  const locationOptions = [
    { value: 'included' as const, label: 'Within 3m of boiler', price: 0 },
    { value: '6m' as const, label: '3-6m from boiler', price: assumptions.adder_location_6m },
    { value: '9m' as const, label: '6-9m from boiler', price: assumptions.adder_location_9m },
  ];

  const cylinderOptions = [
    { value: 'existing' as const, label: 'Keep existing cylinder', price: 0 },
    { value: '150l' as const, label: 'New 150L cylinder', price: assumptions.adder_cylinder_150l },
    { value: '210l' as const, label: 'New 210L cylinder', price: assumptions.adder_cylinder_210l },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto px-4 pb-8">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight mb-2">
          Refine your estimate
        </h2>
        <p className="text-muted-foreground">
          Explore what matters to you — price, efficiency, or future savings
        </p>
      </div>

      {/* Floating summary card */}
      <div className="sticky top-4 z-10 mb-6">
        <div className="bg-card/95 backdrop-blur-sm rounded-2xl border border-border shadow-elevated p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Install price</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(customerContribution)}</p>
            </div>
            <div className="h-12 w-px bg-border" />
            <div className="text-right">
              <p className="text-sm text-muted-foreground flex items-center justify-end gap-1">
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
      </div>

      {/* Refinement panels */}
      <div className="space-y-4 mb-8">
        {/* Efficiency */}
        <RefinePanel
          icon={Gauge}
          title="Efficiency level"
          subtitle={`${efficiencyPercent}% guaranteed • ${EFFICIENCY_OPTIONS.find(o => o.value === scop)?.radiators} radiators`}
          isOpen={openPanel === 'efficiency'}
          onToggle={() => setOpenPanel(openPanel === 'efficiency' ? null : 'efficiency')}
        >
          <div className="space-y-3">
            {EFFICIENCY_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => onScopChange(option.value)}
                className={cn(
                  'w-full p-4 rounded-xl border-2 text-left transition-all duration-300',
                  scop === option.value
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border hover:border-primary/30'
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-foreground">{option.label}</span>
                      {option.value === 3.4 && (
                        <Badge className="bg-primary/10 text-primary border-0 text-xs">Best value</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">{option.radiators} rads</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </RefinePanel>

        {/* Tariff */}
        <RefinePanel
          icon={Zap}
          title="Electricity tariff"
          subtitle={selectedTariff?.name || 'Select tariff'}
          isOpen={openPanel === 'tariff'}
          onToggle={() => setOpenPanel(openPanel === 'tariff' ? null : 'tariff')}
          badge={selectedTariff?.name?.toLowerCase().includes('cosy') ? 'Recommended' : undefined}
        >
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
          <p className="text-xs text-muted-foreground mt-3">
            Cosy tariff offers cheaper rates during heat pump-friendly hours
          </p>
        </RefinePanel>

        {/* Location */}
        <RefinePanel
          icon={MapPin}
          title="Heat pump location"
          subtitle={locationOptions.find(o => o.value === locationAdder)?.label || 'Select location'}
          isOpen={openPanel === 'location'}
          onToggle={() => setOpenPanel(openPanel === 'location' ? null : 'location')}
        >
          <div className="space-y-2">
            {locationOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onLocationChange(option.value)}
                className={cn(
                  'w-full p-4 rounded-xl border-2 text-left transition-all flex justify-between items-center',
                  locationAdder === option.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/30'
                )}
              >
                <span className="font-medium">{option.label}</span>
                <span className="text-muted-foreground">
                  {option.price === 0 ? 'Included' : `+${formatCurrency(option.price)}`}
                </span>
              </button>
            ))}
          </div>
        </RefinePanel>

        {/* Cylinder */}
        <RefinePanel
          icon={Droplets}
          title="Hot water cylinder"
          subtitle={cylinderOptions.find(o => o.value === cylinderOption)?.label || 'Select option'}
          isOpen={openPanel === 'cylinder'}
          onToggle={() => setOpenPanel(openPanel === 'cylinder' ? null : 'cylinder')}
        >
          <div className="space-y-2">
            {cylinderOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onCylinderChange(option.value)}
                className={cn(
                  'w-full p-4 rounded-xl border-2 text-left transition-all flex justify-between items-center',
                  cylinderOption === option.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/30'
                )}
              >
                <span className="font-medium">{option.label}</span>
                <span className="text-muted-foreground">
                  {option.price === 0 ? 'Included' : `+${formatCurrency(option.price)}`}
                </span>
              </button>
            ))}
          </div>
        </RefinePanel>
      </div>

      {/* Continue button - desktop */}
      <div className="hidden sm:block">
        <button
          onClick={onContinue}
          className="w-full h-14 bg-primary text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
        >
          Continue to summary
        </button>
      </div>

      {/* Mobile sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border sm:hidden z-50">
        <button
          onClick={onContinue}
          className="w-full h-14 bg-primary text-primary-foreground font-semibold rounded-xl shadow-lg"
        >
          Continue to summary
        </button>
      </div>

      {/* Spacer for mobile */}
      <div className="h-24 sm:hidden" />
    </div>
  );
}
