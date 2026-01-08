import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { EPCData } from '@/lib/calculations';
import { getFloorAreaFromRange } from '@/lib/calculations';

interface ManualEntryFormProps {
  onSubmit: (data: EPCData) => void;
  onBack: () => void;
  initialPostcode?: string;
}

const PROPERTY_TYPES = [
  { value: 'flat', label: 'Flat' },
  { value: 'terrace', label: 'Terrace' },
  { value: 'semi-detached', label: 'Semi-detached' },
  { value: 'detached', label: 'Detached' },
];

const FLOOR_AREA_RANGES = [
  { value: '<80', label: 'Less than 80m²' },
  { value: '80-120', label: '80 - 120m²' },
  { value: '120-160', label: '120 - 160m²' },
  { value: '160-220', label: '160 - 220m²' },
  { value: '220+', label: 'More than 220m²' },
];

const FUEL_TYPES = [
  { value: 'mains gas', label: 'Gas (mains)' },
  { value: 'electric', label: 'Electric' },
  { value: 'oil', label: 'Oil' },
  { value: 'lpg', label: 'LPG' },
  { value: 'unknown', label: "I don't know" },
];

export function ManualEntryForm({ onSubmit, onBack, initialPostcode }: ManualEntryFormProps) {
  const [postcode, setPostcode] = useState(initialPostcode || '');
  const [address, setAddress] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [floorAreaRange, setFloorAreaRange] = useState('');
  const [fuel, setFuel] = useState('');

  const isValid = postcode && address && propertyType && floorAreaRange && fuel;

  const handleSubmit = () => {
    if (!isValid) return;

    const estimatedFloorArea = getFloorAreaFromRange(floorAreaRange);

    onSubmit({
      address: address,
      postcode: postcode,
      totalFloorArea: estimatedFloorArea,
      mainFuel: fuel,
      propertyType: propertyType,
      region: 'England', // Default to England for manual entries
    });
  };

  return (
    <div className="space-y-6">
      <Button 
        variant="ghost" 
        onClick={onBack}
        className="text-muted-foreground hover:text-foreground -ml-2"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to address search
      </Button>

      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="postcode">Postcode</Label>
            <Input
              id="postcode"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value.toUpperCase())}
              placeholder="SW1A 1AA"
              className="bg-secondary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">House number or name</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 42 or Rose Cottage"
              className="bg-secondary"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Property type</Label>
          <Select value={propertyType} onValueChange={setPropertyType}>
            <SelectTrigger className="bg-secondary">
              <SelectValue placeholder="Select property type" />
            </SelectTrigger>
            <SelectContent>
              {PROPERTY_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Approximate floor area</Label>
          <Select value={floorAreaRange} onValueChange={setFloorAreaRange}>
            <SelectTrigger className="bg-secondary">
              <SelectValue placeholder="Select floor area range" />
            </SelectTrigger>
            <SelectContent>
              {FLOOR_AREA_RANGES.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Current heating fuel</Label>
          <Select value={fuel} onValueChange={setFuel}>
            <SelectTrigger className="bg-secondary">
              <SelectValue placeholder="Select fuel type" />
            </SelectTrigger>
            <SelectContent>
              {FUEL_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={handleSubmit} 
          disabled={!isValid}
          className="w-full h-12 text-lg"
        >
          Get estimate
        </Button>
      </div>
    </div>
  );
}
