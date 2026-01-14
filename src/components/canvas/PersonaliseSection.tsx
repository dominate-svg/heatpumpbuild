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
  { value: 3.4, label: 'Comfort', percent: '340%', desc: 'Lower cost, minimal changes' },
  { value: 3.7, label: 'Balanced', percent: '370%', desc: 'Good efficiency, some upgrades' },
  { value: 4.0, label: 'Efficiency', percent: '400%', desc: 'Best savings, full upgrade' },
];

interface PanelProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  badge?: string;
  children: React.ReactNode;
  delay?: number;
}

function Panel({ icon: Icon, title, description, badge, children, delay = 0 }: PanelProps) {
  return (
    <div 
      className="bg-card rounded-3xl border border-border p-6 section-enter"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start gap-4 mb-5">
        <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-foreground">{title}</p>
            {badge && (
              <Badge className="bg-primary/10 text-primary border-0 text-xs font-medium">
                {badge}
              </Badge>
            )}
          </div>
          <p className="text-micro text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

interface OptionButtonProps {
  selected: boolean;
  onClick: () => void;
  label: string;
  sublabel?: string;
  price?: number;
}

function OptionButton({ selected, onClick, label, sublabel, price }: OptionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex-1 p-4 rounded-2xl border-2 text-center transition-all duration-200',
        selected
          ? 'border-primary bg-primary/5 shadow-focus'
          : 'border-border hover:border-primary/30'
      )}
    >
      <span className="text-base font-semibold text-foreground block">{label}</span>
      {sublabel && <span className="text-micro text-muted-foreground">{sublabel}</span>}
      {price !== undefined && (
        <span className="text-micro text-muted-foreground block mt-1">
          {price === 0 ? 'Included' : `+${formatCurrency(price)}`}
        </span>
      )}
    </button>
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

  useEffect(() => {
    const checkIdle = setInterval(() => {
      if (Date.now() - lastChangeTime > 2500) {
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
    { value: 'included' as const, label: 'Within 3m', price: 0 },
    { value: '6m' as const, label: '3-6m', price: assumptions.adder_location_6m },
    { value: '9m' as const, label: '6-9m', price: assumptions.adder_location_9m },
  ];

  const cylinderOptions = [
    { value: 'existing' as const, label: 'Keep existing', price: 0 },
    { value: '150l' as const, label: '150L new', price: assumptions.adder_cylinder_150l },
    { value: '210l' as const, label: '210L new', price: assumptions.adder_cylinder_210l },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-10 section-enter">
        <h2 className="text-section-title text-foreground mb-2">
          Personalise your estimate
        </h2>
        <p className="text-muted-foreground">
          Adjust to see how choices affect your price and savings
        </p>
      </div>

      {/* Live summary - sticky */}
      <div className="sticky top-4 z-20 mb-8">
        <div className="bg-card/95 backdrop-blur-sm rounded-2xl border border-border shadow-soft p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-micro text-muted-foreground">Install price</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(customerContribution)}</p>
            </div>
            <div className="h-10 w-px bg-border" />
            <div className="text-right">
              <p className="text-micro text-muted-foreground flex items-center justify-end gap-1">
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

      {/* Panels grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Efficiency */}
        <Panel
          icon={Gauge}
          title="Efficiency"
          description="Trade-off between cost and savings"
          delay={0}
        >
          <div className="flex gap-2">
            {EFFICIENCY_OPTIONS.map((opt) => (
              <OptionButton
                key={opt.value}
                selected={scop === opt.value}
                onClick={() => handleChange(() => onScopChange(opt.value))}
                label={opt.label}
                sublabel={opt.percent}
              />
            ))}
          </div>
        </Panel>

        {/* Tariff */}
        <Panel
          icon={Zap}
          title="Tariff"
          description="Your electricity plan"
          badge={selectedTariff?.name?.toLowerCase().includes('cosy') ? 'Recommended' : undefined}
          delay={50}
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
        </Panel>

        {/* Location */}
        <Panel
          icon={MapPin}
          title="Location"
          description="Distance from boiler"
          delay={100}
        >
          <div className="flex gap-2">
            {locationOptions.map((opt) => (
              <OptionButton
                key={opt.value}
                selected={locationAdder === opt.value}
                onClick={() => handleChange(() => onLocationChange(opt.value))}
                label={opt.label}
                price={opt.price}
              />
            ))}
          </div>
        </Panel>

        {/* Cylinder */}
        <Panel
          icon={Droplets}
          title="Cylinder"
          description="Hot water storage"
          delay={150}
        >
          <div className="flex gap-2">
            {cylinderOptions.map((opt) => (
              <OptionButton
                key={opt.value}
                selected={cylinderOption === opt.value}
                onClick={() => handleChange(() => onCylinderChange(opt.value))}
                label={opt.label}
                price={opt.price}
              />
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
