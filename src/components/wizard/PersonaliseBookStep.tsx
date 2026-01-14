import { useState } from 'react';
import { Gauge, MapPin, Droplets, TrendingUp, TrendingDown, ArrowLeft, CalendarCheck, Info, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { formatCurrency } from '@/lib/calculations';
import type { EstimateResults, Assumptions } from '@/lib/calculations';
import type { Tariff } from '@/hooks/useTariffs';
import { cn } from '@/lib/utils';

interface PersonaliseBookStepProps {
  results: EstimateResults;
  assumptions: Assumptions;
  scop: number;
  selectedTariff: Tariff | null;
  locationAdder: 'included' | '6m' | '9m';
  cylinderOption: 'existing' | '150l' | '210l';
  onScopChange: (scop: number) => void;
  onLocationChange: (location: 'included' | '6m' | '9m') => void;
  onCylinderChange: (cylinder: 'existing' | '150l' | '210l') => void;
  onBook: () => void;
  onBack: () => void;
}

const EFFICIENCY_OPTIONS = [
  { value: 3.4, label: 'Lower upfront', radiators: 2 },
  { value: 3.7, label: 'Balanced', radiators: 6 },
  { value: 4.0, label: 'Highest efficiency', radiators: 11 },
];

export function PersonaliseBookStep({
  results,
  assumptions,
  scop,
  selectedTariff,
  locationAdder,
  cylinderOption,
  onScopChange,
  onLocationChange,
  onCylinderChange,
  onBook,
  onBack,
}: PersonaliseBookStepProps) {
  const { estimatedSavings, customerContribution, grantApplied } = results;
  const isNegativeSavings = estimatedSavings < 0;
  const displaySavings = Math.abs(estimatedSavings);

  const scopIndex = EFFICIENCY_OPTIONS.findIndex(o => o.value === scop);
  const currentEfficiency = EFFICIENCY_OPTIONS[scopIndex] || EFFICIENCY_OPTIONS[0];
  const efficiencyPercent = Math.round(scop * 100);

  const locationOptions = [
    { value: 'included' as const, label: 'Within 3m', sublabel: 'of boiler', price: 0 },
    { value: '6m' as const, label: '3–6m away', sublabel: 'longer pipes', price: assumptions.adder_location_6m },
    { value: '9m' as const, label: '6–9m away', sublabel: 'extended run', price: assumptions.adder_location_9m },
  ];

  const cylinderOptions = [
    { value: 'existing' as const, label: 'Keep existing', sublabel: 'if suitable', price: 0, tip: '' },
    { value: '150l' as const, label: '150L new', sublabel: '1–2 people', price: assumptions.adder_cylinder_150l, tip: 'Smaller households' },
    { value: '210l' as const, label: '210L new', sublabel: '3+ people', price: assumptions.adder_cylinder_210l, tip: 'Larger households' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 section-enter"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>

        {/* Header */}
        <div className="text-center mb-10 section-enter">
          <h1 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight mb-4">
            Personalise your estimate
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Choose what matters most — we'll show the impact.
          </p>
        </div>

        {/* Choice cards */}
        <div className="space-y-6 mb-10">
          {/* Choice 1: Efficiency */}
          <div className="bg-card rounded-2xl border border-border shadow-soft p-6 section-enter" style={{ animationDelay: '100ms' }}>
            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Gauge className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">
                  Efficiency (how much heat you get per £1 of electricity)
                </h3>
                <p className="text-sm text-muted-foreground">
                  A more efficient system can reduce bills, but it sometimes needs extra radiator capacity.
                </p>
              </div>
            </div>

            {/* Slider */}
            <div className="px-2 mb-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-3">
                <span>Lower upfront</span>
                <span>Highest efficiency</span>
              </div>
              <Slider
                value={[scopIndex]}
                onValueChange={([val]) => onScopChange(EFFICIENCY_OPTIONS[val].value)}
                max={2}
                step={1}
                className="py-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-3">
                {EFFICIENCY_OPTIONS.map((opt, idx) => (
                  <span
                    key={opt.value}
                    className={cn(
                      'transition-colors',
                      scopIndex === idx && 'text-primary font-medium'
                    )}
                  >
                    {Math.round(opt.value * 100)}%
                  </span>
                ))}
              </div>
            </div>

            {/* Current selection */}
            <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
              <strong className="text-foreground">{currentEfficiency.label}</strong> — {currentEfficiency.radiators} radiators may need upgrading
            </div>

            {/* Radiator explainer */}
            <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
              <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span>Radiators don't 'make' heat — they release it. Some homes need bigger radiators for best efficiency.</span>
            </div>
          </div>

          {/* Choice 2: Location */}
          <div className="bg-card rounded-2xl border border-border shadow-soft p-6 section-enter" style={{ animationDelay: '200ms' }}>
            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">
                  Where the heat pump goes
                </h3>
                <p className="text-sm text-muted-foreground">
                  Longer pipe runs can increase install cost slightly.
                </p>
              </div>
            </div>

            {/* Location illustration placeholder */}
            <div className="bg-muted/30 rounded-xl border border-dashed border-border p-4 mb-4 text-center">
              <p className="text-xs text-muted-foreground">Illustration: house + unit + pipe length</p>
            </div>

            {/* Location options */}
            <div className="grid grid-cols-3 gap-2">
              {locationOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onLocationChange(option.value)}
                  className={cn(
                    'p-3 rounded-xl border-2 text-center transition-all',
                    locationAdder === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/30'
                  )}
                >
                  <span className="block text-sm font-medium text-foreground">{option.label}</span>
                  <span className="block text-xs text-muted-foreground">{option.sublabel}</span>
                  <span className="block text-xs text-muted-foreground mt-1">
                    {option.price === 0 ? 'Included' : `+${formatCurrency(option.price)}`}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Choice 3: Cylinder */}
          <div className="bg-card rounded-2xl border border-border shadow-soft p-6 section-enter" style={{ animationDelay: '300ms' }}>
            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                <Droplets className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">
                  Hot water storage
                </h3>
                <p className="text-sm text-muted-foreground">
                  If you already have a good cylinder we can often reuse it. Bigger households may prefer a larger one.
                </p>
              </div>
            </div>

            {/* Cylinder illustration placeholder */}
            <div className="bg-muted/30 rounded-xl border border-dashed border-border p-4 mb-4 text-center">
              <p className="text-xs text-muted-foreground">Illustration: cylinder size comparison</p>
            </div>

            {/* Cylinder options */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {cylinderOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onCylinderChange(option.value)}
                  className={cn(
                    'p-3 rounded-xl border-2 text-center transition-all',
                    cylinderOption === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/30'
                  )}
                >
                  <span className="block text-sm font-medium text-foreground">{option.label}</span>
                  <span className="block text-xs text-muted-foreground">{option.sublabel}</span>
                  <span className="block text-xs text-muted-foreground mt-1">
                    {option.price === 0 ? 'Included' : `+${formatCurrency(option.price)}`}
                  </span>
                </button>
              ))}
            </div>

            {/* Sizing tip */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="w-3 h-3" />
              <span>1–2 people: smaller • 3–4: medium • 5+: larger</span>
            </div>
          </div>
        </div>

        {/* Final summary card */}
        <div className="bg-card rounded-2xl border-2 border-primary/20 shadow-elevated p-6 mb-8 section-enter" style={{ animationDelay: '400ms' }}>
          <h3 className="font-semibold text-foreground mb-4 text-center">Your final estimate</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground">Install price</span>
              <span className="text-xl font-bold text-foreground">{formatCurrency(customerContribution)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground">Grant included</span>
              <span className="font-medium text-primary">{formatCurrency(grantApplied)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground">Tariff</span>
              <span className="font-medium text-foreground">{selectedTariff?.name || 'Cosy'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground">Efficiency</span>
              <span className="font-medium text-foreground">{efficiencyPercent}%</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-muted-foreground">Annual savings</span>
              <span className={cn(
                'text-xl font-bold flex items-center gap-1',
                isNegativeSavings ? 'text-amber-600' : 'text-green-600'
              )}>
                {isNegativeSavings ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                {isNegativeSavings ? '-' : ''}£{displaySavings}/yr
              </span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center section-enter" style={{ animationDelay: '500ms' }}>
          <Button
            onClick={onBook}
            size="lg"
            className="h-14 px-10 text-base font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
          >
            <CalendarCheck className="w-5 h-5 mr-2" />
            Book free home survey
          </Button>
          <p className="text-sm text-muted-foreground mt-3">
            No obligation. Survey confirms the final design and price.
          </p>
        </div>
      </div>
    </div>
  );
}
