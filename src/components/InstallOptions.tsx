import { MapPin, Droplets } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { formatCurrency } from '@/lib/calculations';
import type { Assumptions } from '@/lib/calculations';

interface InstallOptionsProps {
  locationAdder: 'included' | '6m' | '9m';
  cylinderOption: 'existing' | '150l' | '210l';
  onLocationChange: (value: 'included' | '6m' | '9m') => void;
  onCylinderChange: (value: 'existing' | '150l' | '210l') => void;
  assumptions: Assumptions;
}

export function InstallOptions({
  locationAdder,
  cylinderOption,
  onLocationChange,
  onCylinderChange,
  assumptions,
}: InstallOptionsProps) {
  return (
    <Card className="border shadow-sm bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Installation Options</CardTitle>
        <p className="text-sm text-muted-foreground">Adjust options to update your estimate</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-foreground font-medium">
            <MapPin className="w-4 h-4 text-accent" />
            Heat pump location
          </Label>
          <RadioGroup
            value={locationAdder}
            onValueChange={(v) => onLocationChange(v as 'included' | '6m' | '9m')}
            className="space-y-2"
          >
            <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
              locationAdder === 'included' ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50'
            }`}>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="included" id="loc-3m" />
                <span className="text-foreground">Within 3m of boiler</span>
              </div>
              <span className="text-sm font-semibold text-success">Included</span>
            </label>
            <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
              locationAdder === '6m' ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50'
            }`}>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="6m" id="loc-6m" />
                <span className="text-foreground">Within 6m</span>
              </div>
              <span className="text-sm text-muted-foreground">
                +{formatCurrency(assumptions.adder_location_6m)}
              </span>
            </label>
            <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
              locationAdder === '9m' ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50'
            }`}>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="9m" id="loc-9m" />
                <span className="text-foreground">Within 9m</span>
              </div>
              <span className="text-sm text-muted-foreground">
                +{formatCurrency(assumptions.adder_location_9m)}
              </span>
            </label>
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-foreground font-medium">
            <Droplets className="w-4 h-4 text-accent" />
            Hot water system
          </Label>
          <RadioGroup
            value={cylinderOption}
            onValueChange={(v) => onCylinderChange(v as 'existing' | '150l' | '210l')}
            className="space-y-2"
          >
            <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
              cylinderOption === 'existing' ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50'
            }`}>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="existing" id="cyl-existing" />
                <span className="text-foreground">Re-use existing cylinder</span>
              </div>
              <span className="text-sm font-semibold text-success">Included</span>
            </label>
            <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
              cylinderOption === '150l' ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50'
            }`}>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="150l" id="cyl-150l" />
                <span className="text-foreground">New 150L cylinder</span>
              </div>
              <span className="text-sm text-muted-foreground">
                +{formatCurrency(assumptions.adder_cylinder_150l)}
              </span>
            </label>
            <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
              cylinderOption === '210l' ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50'
            }`}>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="210l" id="cyl-210l" />
                <span className="text-foreground">New 210L cylinder</span>
              </div>
              <span className="text-sm text-muted-foreground">
                +{formatCurrency(assumptions.adder_cylinder_210l)}
              </span>
            </label>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
}
