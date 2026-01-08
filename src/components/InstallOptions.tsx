import { MapPin, Droplets, Check, HelpCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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

interface OptionCardProps {
  selected: boolean;
  onClick: () => void;
  title: string;
  description: string;
  price: string;
  isCheapest?: boolean;
}

function OptionCard({ selected, onClick, title, description, price, isCheapest }: OptionCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-xl border-2 text-left transition-all relative ${
        selected 
          ? 'border-primary bg-primary-light' 
          : 'border-border bg-card hover:border-primary/50'
      }`}
    >
      {isCheapest && (
        <Badge className="absolute -top-2.5 right-3 bg-success text-white text-xs px-2 py-0.5">
          Cheapest
        </Badge>
      )}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="font-medium text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold ${selected ? 'text-primary' : 'text-foreground'}`}>
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

function ExplainerCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-muted rounded-xl mt-4">
      <HelpCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-medium text-foreground mb-1">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
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
    <div className="space-y-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
      {/* Location options */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Where your heat pump will go
          </h2>
          <p className="text-sm text-muted-foreground">Choose the right location for your system</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-3">
          <OptionCard
            selected={locationAdder === 'included'}
            onClick={() => onLocationChange('included')}
            title="Least disruption"
            description="Within 3m of your boiler"
            price="Included"
            isCheapest
          />
          <OptionCard
            selected={locationAdder === '6m'}
            onClick={() => onLocationChange('6m')}
            title="Further away"
            description="Within 6m of your boiler"
            price={`+${formatCurrency(assumptions.adder_location_6m)}`}
          />
          <OptionCard
            selected={locationAdder === '9m'}
            onClick={() => onLocationChange('9m')}
            title="Most flexible"
            description="Within 9m of your boiler"
            price={`+${formatCurrency(assumptions.adder_location_9m)}`}
          />
        </div>

        <ExplainerCard 
          title="Where can I put my heat pump?"
          description="Heat pumps are typically installed outside your home, often in a garden or side passage. The closer to your boiler, the simpler and more cost-effective the installation."
        />
      </div>

      {/* Cylinder options */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Droplets className="w-5 h-5 text-primary" />
            Upgrading your hot water system
          </h2>
          <p className="text-sm text-muted-foreground">While we upgrade your heating, we can also upgrade your hot water system</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-3">
          <OptionCard
            selected={cylinderOption === 'existing'}
            onClick={() => onCylinderChange('existing')}
            title="Re-use existing"
            description="Keep your current cylinder"
            price="Included"
            isCheapest
          />
          <OptionCard
            selected={cylinderOption === '150l'}
            onClick={() => onCylinderChange('150l')}
            title="New 150L cylinder"
            description="Good for 1-2 bathrooms"
            price={`+${formatCurrency(assumptions.adder_cylinder_150l)}`}
          />
          <OptionCard
            selected={cylinderOption === '210l'}
            onClick={() => onCylinderChange('210l')}
            title="New 210L cylinder"
            description="Better for larger homes"
            price={`+${formatCurrency(assumptions.adder_cylinder_210l)}`}
          />
        </div>

        <ExplainerCard 
          title="Why do I need a hot water cylinder?"
          description="Heat pumps work best when heating water gradually throughout the day. A well-insulated cylinder stores this hot water ready for when you need it, ensuring you always have plenty of hot water on demand."
        />
      </div>
    </div>
  );
}
