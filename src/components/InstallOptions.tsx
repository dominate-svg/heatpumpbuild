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
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-foreground">Installation Options</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-foreground">
            <MapPin className="w-4 h-4 text-primary" />
            Heat pump location
          </Label>
          <RadioGroup
            value={locationAdder}
            onValueChange={(v) => onLocationChange(v as 'included' | '6m' | '9m')}
            className="space-y-2"
          >
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
              <div className="flex items-center gap-3">
                <RadioGroupItem value="included" id="loc-3m" />
                <Label htmlFor="loc-3m" className="cursor-pointer text-foreground">
                  Within 3m of boiler
                </Label>
              </div>
              <span className="text-sm text-success font-medium">Included</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
              <div className="flex items-center gap-3">
                <RadioGroupItem value="6m" id="loc-6m" />
                <Label htmlFor="loc-6m" className="cursor-pointer text-foreground">
                  Within 6m
                </Label>
              </div>
              <span className="text-sm text-muted-foreground">
                +{formatCurrency(assumptions.adder_location_6m)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
              <div className="flex items-center gap-3">
                <RadioGroupItem value="9m" id="loc-9m" />
                <Label htmlFor="loc-9m" className="cursor-pointer text-foreground">
                  Within 9m
                </Label>
              </div>
              <span className="text-sm text-muted-foreground">
                +{formatCurrency(assumptions.adder_location_9m)}
              </span>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-foreground">
            <Droplets className="w-4 h-4 text-primary" />
            Hot water system
          </Label>
          <RadioGroup
            value={cylinderOption}
            onValueChange={(v) => onCylinderChange(v as 'existing' | '150l' | '210l')}
            className="space-y-2"
          >
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
              <div className="flex items-center gap-3">
                <RadioGroupItem value="existing" id="cyl-existing" />
                <Label htmlFor="cyl-existing" className="cursor-pointer text-foreground">
                  Re-use existing cylinder
                </Label>
              </div>
              <span className="text-sm text-success font-medium">Included</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
              <div className="flex items-center gap-3">
                <RadioGroupItem value="150l" id="cyl-150l" />
                <Label htmlFor="cyl-150l" className="cursor-pointer text-foreground">
                  New 150L cylinder
                </Label>
              </div>
              <span className="text-sm text-muted-foreground">
                +{formatCurrency(assumptions.adder_cylinder_150l)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
              <div className="flex items-center gap-3">
                <RadioGroupItem value="210l" id="cyl-210l" />
                <Label htmlFor="cyl-210l" className="cursor-pointer text-foreground">
                  New 210L cylinder
                </Label>
              </div>
              <span className="text-sm text-muted-foreground">
                +{formatCurrency(assumptions.adder_cylinder_210l)}
              </span>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
}
