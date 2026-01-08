import { MapPin, Droplets, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/calculations';
import type { Assumptions } from '@/lib/calculations';

interface InstallOptionsProps {
  locationAdder: 'included' | '6m' | '9m';
  cylinderOption: 'existing' | '150l' | '210l';
  onLocationChange: (value: 'included' | '6m' | '9m') => void;
  onCylinderChange: (value: 'existing' | '150l' | '210l') => void;
  assumptions: Assumptions;
}

interface OptionCardProps {
  selected: boolean;
  onClick: () => void;
  title: string;
  description: string;
  price: string;
  priceColor?: string;
}

function OptionCard({ selected, onClick, title, description, price, priceColor = 'text-muted-foreground' }: OptionCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-xl border-2 text-left transition-all card-selectable ${
        selected 
          ? 'border-primary bg-primary/5 shadow-warm' 
          : 'border-border bg-card hover:border-primary/50'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="font-medium text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold ${selected ? 'text-primary' : priceColor}`}>
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
    <Card className="border border-border shadow-soft bg-card animate-fade-in" style={{ animationDelay: '0.4s' }}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Customise your installation</CardTitle>
        <p className="text-sm text-muted-foreground">Select options to update your estimate</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Location options */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-foreground font-medium">
            <MapPin className="w-4 h-4 text-primary" />
            Heat pump location
          </div>
          <div className="grid gap-2">
            <OptionCard
              selected={locationAdder === 'included'}
              onClick={() => onLocationChange('included')}
              title="Near boiler"
              description="Within 3m — most common"
              price="Included"
              priceColor="text-success"
            />
            <OptionCard
              selected={locationAdder === '6m'}
              onClick={() => onLocationChange('6m')}
              title="Further away"
              description="Within 6m"
              price={`+${formatCurrency(assumptions.adder_location_6m)}`}
            />
            <OptionCard
              selected={locationAdder === '9m'}
              onClick={() => onLocationChange('9m')}
              title="Most flexible"
              description="Within 9m"
              price={`+${formatCurrency(assumptions.adder_location_9m)}`}
            />
          </div>
        </div>

        {/* Cylinder options */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-foreground font-medium">
            <Droplets className="w-4 h-4 text-accent" />
            Hot water cylinder
          </div>
          <div className="grid gap-2">
            <OptionCard
              selected={cylinderOption === 'existing'}
              onClick={() => onCylinderChange('existing')}
              title="Use existing"
              description="Keep your current cylinder"
              price="Included"
              priceColor="text-success"
            />
            <OptionCard
              selected={cylinderOption === '150l'}
              onClick={() => onCylinderChange('150l')}
              title="New 150L"
              description="Good for 1-2 bathrooms"
              price={`+${formatCurrency(assumptions.adder_cylinder_150l)}`}
            />
            <OptionCard
              selected={cylinderOption === '210l'}
              onClick={() => onCylinderChange('210l')}
              title="New 210L"
              description="Better for larger homes"
              price={`+${formatCurrency(assumptions.adder_cylinder_210l)}`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
