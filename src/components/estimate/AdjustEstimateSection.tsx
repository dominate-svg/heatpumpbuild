import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { ChevronDown, ChevronUp, Zap, Bolt, MapPin, Droplets, Info } from 'lucide-react';
import { formatCurrency } from '@/lib/calculations';
import { useTariffs, formatTariffLabel, type Tariff } from '@/hooks/useTariffs';
import type { Assumptions } from '@/lib/calculations';

interface AdjustEstimateSectionProps {
  scop: number;
  selectedTariff: Tariff | null;
  locationAdder: 'included' | '6m' | '9m';
  cylinderOption: 'existing' | '150l' | '210l';
  onScopChange: (scop: number) => void;
  onTariffChange: (tariff: Tariff) => void;
  onLocationChange: (value: 'included' | '6m' | '9m') => void;
  onCylinderChange: (value: 'existing' | '150l' | '210l') => void;
  assumptions: Assumptions;
}

const EFFICIENCY_OPTIONS = [
  { value: 3.4, label: '340%', recommended: true, radiators: 2, description: 'Fewest radiator changes' },
  { value: 3.7, label: '370%', recommended: false, radiators: 6, description: 'Balanced efficiency' },
  { value: 4.0, label: '400%', recommended: false, radiators: 11, description: 'Maximum efficiency' },
];

function AdjustCard({ 
  title, 
  icon: Icon, 
  iconColor = 'text-primary',
  description, 
  children,
  defaultOpen = false,
  isMobile = false 
}: { 
  title: string; 
  icon: React.ElementType;
  iconColor?: string;
  description: string; 
  children: React.ReactNode;
  defaultOpen?: boolean;
  isMobile?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // On desktop, always show content
  if (!isMobile) {
    return (
      <Card className="border border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center`}>
              <Icon className={`w-4 h-4 ${iconColor}`} />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">{title}</CardTitle>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {children}
        </CardContent>
      </Card>
    );
  }

  // On mobile, use collapsible
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border border-border">
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${iconColor}`} />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold">{title}</CardTitle>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
              </div>
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            {children}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

export function AdjustEstimateSection({
  scop,
  selectedTariff,
  locationAdder,
  cylinderOption,
  onScopChange,
  onTariffChange,
  onLocationChange,
  onCylinderChange,
  assumptions,
}: AdjustEstimateSectionProps) {
  const { data: tariffs, isLoading: tariffsLoading } = useTariffs();
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile on mount
  useState(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 768);
    }
  });

  const handleTariffChange = (tariffId: string) => {
    const tariff = tariffs?.find(t => t.id === tariffId);
    if (tariff) {
      onTariffChange(tariff);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-lg font-bold text-foreground">Adjust your estimate</h2>
        <Info className="w-4 h-4 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Changes update your summary totals in real-time.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Efficiency Level Card */}
        <AdjustCard
          title="Efficiency level"
          icon={Zap}
          description="Higher = more heat per unit of electricity"
          defaultOpen={true}
          isMobile={isMobile}
        >
          <div className="grid grid-cols-3 gap-2">
            {EFFICIENCY_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => onScopChange(option.value)}
                className={`relative py-3 px-2 rounded-xl border-2 text-center transition-all ${
                  scop === option.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card hover:border-primary/50'
                }`}
              >
                {option.recommended && (
                  <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-white text-[9px] px-1.5 py-0">
                    Best value
                  </Badge>
                )}
                <span className="block text-lg font-bold text-foreground">{option.label}</span>
                <span className="block text-[10px] text-muted-foreground">{option.radiators} rads</span>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">
            Higher efficiency typically requires more radiator upgrades.
          </p>
        </AdjustCard>

        {/* Electricity Tariff Card */}
        <AdjustCard
          title="Electricity tariff"
          icon={Bolt}
          iconColor="text-octopus"
          description="Affects your running costs"
          defaultOpen={true}
          isMobile={isMobile}
        >
          <Select 
            value={selectedTariff?.id || ''} 
            onValueChange={handleTariffChange}
            disabled={tariffsLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select tariff..." />
            </SelectTrigger>
            <SelectContent>
              {tariffs?.map((tariff) => (
                <SelectItem key={tariff.id} value={tariff.id} className="text-sm">
                  {formatTariffLabel(tariff)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[10px] text-muted-foreground mt-2">
            Octopus Cosy gives you 8 hours of half-price electricity daily.
          </p>
        </AdjustCard>

        {/* Heat Pump Location Card */}
        <AdjustCard
          title="Heat pump location"
          icon={MapPin}
          description="Distance from your boiler"
          isMobile={isMobile}
        >
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onLocationChange('included')}
              className={`py-2.5 px-2 rounded-lg border-2 text-center transition-all ${
                locationAdder === 'included'
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <span className="block text-sm font-medium text-foreground">Within 3m</span>
              <span className="block text-xs text-muted-foreground">Included</span>
            </button>
            <button
              onClick={() => onLocationChange('6m')}
              className={`py-2.5 px-2 rounded-lg border-2 text-center transition-all ${
                locationAdder === '6m'
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <span className="block text-sm font-medium text-foreground">Within 6m</span>
              <span className="block text-xs text-muted-foreground">+{formatCurrency(assumptions.adder_location_6m)}</span>
            </button>
            <button
              onClick={() => onLocationChange('9m')}
              className={`py-2.5 px-2 rounded-lg border-2 text-center transition-all ${
                locationAdder === '9m'
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <span className="block text-sm font-medium text-foreground">Within 9m</span>
              <span className="block text-xs text-muted-foreground">+{formatCurrency(assumptions.adder_location_9m)}</span>
            </button>
          </div>
        </AdjustCard>

        {/* Hot Water Cylinder Card */}
        <AdjustCard
          title="Hot water cylinder"
          icon={Droplets}
          iconColor="text-accent"
          description="Upgrade your hot water"
          isMobile={isMobile}
        >
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onCylinderChange('existing')}
              className={`py-2.5 px-2 rounded-lg border-2 text-center transition-all ${
                cylinderOption === 'existing'
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <span className="block text-sm font-medium text-foreground">Keep existing</span>
              <span className="block text-xs text-muted-foreground">Included</span>
            </button>
            <button
              onClick={() => onCylinderChange('150l')}
              className={`py-2.5 px-2 rounded-lg border-2 text-center transition-all ${
                cylinderOption === '150l'
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <span className="block text-sm font-medium text-foreground">New 150L</span>
              <span className="block text-xs text-muted-foreground">+{formatCurrency(assumptions.adder_cylinder_150l)}</span>
            </button>
            <button
              onClick={() => onCylinderChange('210l')}
              className={`py-2.5 px-2 rounded-lg border-2 text-center transition-all ${
                cylinderOption === '210l'
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <span className="block text-sm font-medium text-foreground">New 210L</span>
              <span className="block text-xs text-muted-foreground">+{formatCurrency(assumptions.adder_cylinder_210l)}</span>
            </button>
          </div>
        </AdjustCard>
      </div>
    </div>
  );
}
