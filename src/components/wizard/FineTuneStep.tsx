import { useState } from 'react';
import { ChevronDown, ChevronUp, Zap, MapPin, Droplets, Info, TrendingUp, TrendingDown, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

interface FineTuneStepProps {
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
  onBack: () => void;
  onBook: () => void;
}

const EFFICIENCY_OPTIONS = [
  { value: 3.4, label: '340%', radiators: 2 },
  { value: 3.7, label: '370%', radiators: 6 },
  { value: 4.0, label: '400%', radiators: 11 },
];

export function FineTuneStep({
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
  onBack,
  onBook,
}: FineTuneStepProps) {
  const [isEfficiencyOpen, setIsEfficiencyOpen] = useState(true);
  const [isTariffOpen, setIsTariffOpen] = useState(true);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isCylinderOpen, setIsCylinderOpen] = useState(false);
  
  const { data: tariffs, isLoading: tariffsLoading } = useTariffs();

  const { estimatedSavings, customerContribution } = results;
  const isNegativeSavings = estimatedSavings < 0;
  const displaySavings = Math.abs(estimatedSavings);
  const efficiencyPercent = Math.round(scop * 100);

  const handleTariffChange = (tariffId: string) => {
    const tariff = tariffs?.find(t => t.id === tariffId);
    if (tariff) {
      onTariffChange(tariff);
    }
  };

  const locationPrice = (option: 'included' | '6m' | '9m') => {
    switch (option) {
      case 'included': return 0;
      case '6m': return assumptions.adder_location_6m;
      case '9m': return assumptions.adder_location_9m;
    }
  };

  const cylinderPrice = (option: 'existing' | '150l' | '210l') => {
    switch (option) {
      case 'existing': return 0;
      case '150l': return assumptions.adder_cylinder_150l;
      case '210l': return assumptions.adder_cylinder_210l;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 space-y-6 animate-fade-in pb-32 sm:pb-24">
      {/* Section A: Fine-tune your estimate */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">Fine-tune your estimate</h2>

        {/* Efficiency selector */}
        <Card className="border border-border shadow-sm">
          <Collapsible open={isEfficiencyOpen} onOpenChange={setIsEfficiencyOpen}>
            <CollapsibleTrigger asChild>
              <button className="w-full p-4 flex items-center justify-between text-left">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Efficiency level</p>
                    <p className="text-xs text-muted-foreground">{efficiencyPercent}% guaranteed</p>
                  </div>
                </div>
                {isEfficiencyOpen ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 pb-4 px-4">
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
                      {option.value === 3.4 && (
                        <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] px-2">
                          Best value
                        </Badge>
                      )}
                      <span className="block text-lg font-bold text-foreground">{option.label}</span>
                      <span className="block text-[10px] text-muted-foreground">{option.radiators} rads upgraded</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3 flex items-start gap-1.5">
                  <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  Higher efficiency = more savings, but requires more radiator upgrades.
                </p>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Tariff selector */}
        <Card className="border border-border shadow-sm">
          <Collapsible open={isTariffOpen} onOpenChange={setIsTariffOpen}>
            <CollapsibleTrigger asChild>
              <button className="w-full p-4 flex items-center justify-between text-left">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Electricity tariff</p>
                    <p className="text-xs text-muted-foreground">{selectedTariff?.name || 'Select tariff'}</p>
                  </div>
                </div>
                {isTariffOpen ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 pb-4 px-4">
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
                      <SelectItem key={tariff.id} value={tariff.id}>
                        {formatTariffLabel(tariff)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Location selector */}
        <Card className="border border-border shadow-sm">
          <Collapsible open={isLocationOpen} onOpenChange={setIsLocationOpen}>
            <CollapsibleTrigger asChild>
              <button className="w-full p-4 flex items-center justify-between text-left">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Heat pump location</p>
                    <p className="text-xs text-muted-foreground">
                      {locationAdder === 'included' ? 'Within 3m of boiler' : `${locationAdder} from boiler`}
                      {locationPrice(locationAdder) > 0 && ` (+${formatCurrency(locationPrice(locationAdder))})`}
                    </p>
                  </div>
                </div>
                {isLocationOpen ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 pb-4 px-4">
                <div className="space-y-2">
                  {(['included', '6m', '9m'] as const).map((option) => (
                    <button
                      key={option}
                      onClick={() => onLocationChange(option)}
                      className={`w-full p-3 rounded-lg border-2 text-left transition-all flex justify-between items-center ${
                        locationAdder === option
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <span className="text-sm">
                        {option === 'included' ? 'Within 3m of boiler' : `${option} from boiler`}
                      </span>
                      <span className="text-sm font-medium">
                        {locationPrice(option) === 0 ? 'Included' : `+${formatCurrency(locationPrice(option))}`}
                      </span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Cylinder selector */}
        <Card className="border border-border shadow-sm">
          <Collapsible open={isCylinderOpen} onOpenChange={setIsCylinderOpen}>
            <CollapsibleTrigger asChild>
              <button className="w-full p-4 flex items-center justify-between text-left">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <Droplets className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Hot water cylinder</p>
                    <p className="text-xs text-muted-foreground">
                      {cylinderOption === 'existing' ? 'Re-use existing' : `New ${cylinderOption.toUpperCase()}`}
                      {cylinderPrice(cylinderOption) > 0 && ` (+${formatCurrency(cylinderPrice(cylinderOption))})`}
                    </p>
                  </div>
                </div>
                {isCylinderOpen ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 pb-4 px-4">
                <div className="space-y-2">
                  {(['existing', '150l', '210l'] as const).map((option) => (
                    <button
                      key={option}
                      onClick={() => onCylinderChange(option)}
                      className={`w-full p-3 rounded-lg border-2 text-left transition-all flex justify-between items-center ${
                        cylinderOption === option
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <span className="text-sm">
                        {option === 'existing' ? 'Re-use existing cylinder' : `New ${option.toUpperCase()} cylinder`}
                      </span>
                      <span className="text-sm font-medium">
                        {cylinderPrice(option) === 0 ? 'Included' : `+${formatCurrency(cylinderPrice(option))}`}
                      </span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </div>

      {/* Section B: Final summary */}
      <Card className="border-2 border-primary/20 shadow-card bg-gradient-to-br from-card to-primary/5">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-bold text-foreground">Your final estimate</h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Install price</span>
              <span className="text-xl font-bold text-foreground">{formatCurrency(customerContribution)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-success flex items-center gap-1">
                <Award className="w-4 h-4" /> Grant included
              </span>
              <span className="text-lg font-semibold text-success">{formatCurrency(assumptions.bus_grant_value)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Efficiency</span>
              <span className="font-medium text-foreground">{efficiencyPercent}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Tariff</span>
              <span className="font-medium text-foreground">{selectedTariff?.name || 'Cosy'}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-border">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                {isNegativeSavings ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                Est. annual savings
              </span>
              <span className={`text-lg font-bold ${isNegativeSavings ? 'text-amber-600' : 'text-success'}`}>
                {isNegativeSavings ? '-' : ''}£{displaySavings}/year
              </span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center pt-2">
            Survey confirms final design, performance and price.
          </p>
        </CardContent>
      </Card>

      {/* Sticky CTA - Desktop inline, mobile fixed */}
      <div className="hidden sm:block">
        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack} className="flex-1">
            Change home details
          </Button>
          <Button onClick={onBook} className="flex-1 h-12 text-base font-semibold">
            Book free home survey
          </Button>
        </div>
      </div>

      {/* Mobile sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border sm:hidden z-50">
        <div className="flex gap-3 max-w-lg mx-auto">
          <Button variant="outline" onClick={onBack} className="flex-1">
            Back
          </Button>
          <Button onClick={onBook} className="flex-1 h-12 text-base font-semibold">
            Book free survey
          </Button>
        </div>
      </div>
    </div>
  );
}
