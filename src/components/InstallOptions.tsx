import { MapPin, Droplets, Check, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/calculations';
import type { Assumptions } from '@/lib/calculations';

interface InstallOptionsProps {
  locationAdder: 'included' | '6m' | '9m';
  cylinderOption: 'existing' | '150l' | '210l';
  onLocationChange: (value: 'included' | '6m' | '9m') => void;
  onCylinderChange: (value: 'existing' | '150l' | '210l') => void;
  assumptions: Assumptions;
}

interface OptionButtonProps {
  selected: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
  price: string;
  isCheapest?: boolean;
}

function OptionButton({ selected, onClick, title, subtitle, price, isCheapest }: OptionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`relative p-3 rounded-xl border-2 text-left transition-all card-selectable ${
        selected 
          ? 'border-primary bg-primary-light' 
          : 'border-border bg-card hover:border-primary/50'
      }`}
    >
      {isCheapest && (
        <Badge className="absolute -top-2 right-2 bg-success text-white text-[10px] px-1.5 py-0">
          Best
        </Badge>
      )}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm text-foreground truncate">{title}</p>
          <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className={`text-xs font-semibold ${selected ? 'text-primary' : 'text-foreground'}`}>
            {price}
          </span>
          {selected && (
            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

export function InstallOptions({
  locationAdder,
  cylinderOption,
  onLocationChange,
  onCylinderChange,
  assumptions,
}: InstallOptionsProps) {
  return (
    <div className="space-y-6 animate-fade-in" style={{ animationDelay: '0.25s' }}>
      {/* Location options */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <MapPin className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm">Heat pump location</h3>
            <p className="text-xs text-muted-foreground">Distance from your boiler</p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <OptionButton
            selected={locationAdder === 'included'}
            onClick={() => onLocationChange('included')}
            title="Within 3m"
            subtitle="Least disruption"
            price="Included"
            isCheapest
          />
          <OptionButton
            selected={locationAdder === '6m'}
            onClick={() => onLocationChange('6m')}
            title="Within 6m"
            subtitle="Further away"
            price={`+${formatCurrency(assumptions.adder_location_6m)}`}
          />
          <OptionButton
            selected={locationAdder === '9m'}
            onClick={() => onLocationChange('9m')}
            title="Within 9m"
            subtitle="Most flexible"
            price={`+${formatCurrency(assumptions.adder_location_9m)}`}
          />
        </div>
      </div>

      {/* Cylinder options */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Droplets className="w-4 h-4 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm">Hot water cylinder</h3>
            <p className="text-xs text-muted-foreground">Upgrade your hot water system</p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <OptionButton
            selected={cylinderOption === 'existing'}
            onClick={() => onCylinderChange('existing')}
            title="Keep existing"
            subtitle="No change"
            price="Included"
            isCheapest
          />
          <OptionButton
            selected={cylinderOption === '150l'}
            onClick={() => onCylinderChange('150l')}
            title="New 150L"
            subtitle="1-2 bathrooms"
            price={`+${formatCurrency(assumptions.adder_cylinder_150l)}`}
          />
          <OptionButton
            selected={cylinderOption === '210l'}
            onClick={() => onCylinderChange('210l')}
            title="New 210L"
            subtitle="Larger homes"
            price={`+${formatCurrency(assumptions.adder_cylinder_210l)}`}
          />
        </div>
      </div>

      {/* Compact info */}
      <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-xl">
        <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          Heat pumps work best outdoors in a garden or side passage. Distance affects pipework costs.
        </p>
      </div>
    </div>
  );
}
