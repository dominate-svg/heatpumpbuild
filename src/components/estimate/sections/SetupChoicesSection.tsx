import { useState } from 'react';
import { ArrowLeft, Home, Droplets, HelpCircle, Info, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Assumptions } from '@/lib/calculations';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface SetupChoicesSectionProps {
  locationAdder: 'included' | '6m' | '9m';
  cylinderOption: 'existing' | '150l' | '210l';
  onLocationChange: (value: 'included' | '6m' | '9m') => void;
  onCylinderChange: (value: 'existing' | '150l' | '210l') => void;
  onContinue: () => void;
  onBack: () => void;
  assumptions: Assumptions;
}

export function SetupChoicesSection({
  locationAdder,
  cylinderOption,
  onLocationChange,
  onCylinderChange,
  onContinue,
  onBack,
  assumptions,
}: SetupChoicesSectionProps) {
  const locationOptions = [
    {
      value: 'included' as const,
      label: 'Near the old boiler',
      description: 'Within 3 metres',
      price: 0,
    },
    {
      value: '6m' as const,
      label: 'Medium run',
      description: '3-6 metres away',
      price: assumptions.adder_location_6m,
    },
    {
      value: '9m' as const,
      label: 'Long run',
      description: '6-9 metres away',
      price: assumptions.adder_location_9m,
    },
  ];

  const cylinderOptions = [
    {
      value: 'existing' as const,
      label: 'Keep current cylinder',
      description: 'If suitable - we will check at survey',
      price: 0,
    },
    {
      value: '150l' as const,
      label: '150L cylinder',
      description: 'Typical for 1-3 person household',
      price: assumptions.adder_cylinder_150l,
    },
    {
      value: '210l' as const,
      label: '210L cylinder',
      description: 'Larger household or high hot water use',
      price: assumptions.adder_cylinder_210l,
    },
  ];

  return (
    <section className="py-6 sm:py-10 animate-fade-in">
      {/* Back button */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
          A couple of setup questions
        </h2>
        <p className="text-sm text-muted-foreground">
          These affect your install cost. We'll confirm at survey.
        </p>
      </div>

      {/* Question 1: Location */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Home className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Where can the outdoor unit go?</h3>
          <Sheet>
            <SheetTrigger asChild>
              <button className="text-muted-foreground/50 hover:text-primary ml-auto">
                <HelpCircle className="w-4 h-4" />
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl">
              <SheetHeader>
                <SheetTitle className="text-left">Why we ask this</SheetTitle>
                <SheetDescription className="text-left">
                  The heat pump sits outside and connects to your existing heating system via pipes. Longer pipe runs take more time and materials to install, which affects the price.
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        </div>

        {/* Location illustration */}
        <div className="bg-muted/30 rounded-xl p-4 mb-3">
          <div className="flex items-end justify-center gap-2">
            {/* Boiler */}
            <div className="text-center">
              <div className="w-10 h-14 rounded bg-muted border border-border flex items-center justify-center">
                <div className="w-5 h-8 bg-muted-foreground/20 rounded" />
              </div>
              <p className="text-[9px] text-muted-foreground mt-1">Boiler</p>
            </div>
            
            {/* Pipe */}
            <div className="flex-1 max-w-[80px] h-0.5 bg-primary/30 mb-7" />
            
            {/* Heat pump */}
            <div className="text-center">
              <div className="w-12 h-10 rounded bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-primary/20" />
              </div>
              <p className="text-[9px] text-muted-foreground mt-1">Heat pump</p>
            </div>
          </div>
        </div>

        {/* Location options */}
        <div className="space-y-2">
          {locationOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onLocationChange(option.value)}
              className={cn(
                'w-full p-3.5 rounded-xl border-2 text-left transition-all flex items-center gap-3',
                locationAdder === option.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-muted-foreground/40'
              )}
            >
              <div className={cn(
                'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                locationAdder === option.value
                  ? 'border-primary bg-primary'
                  : 'border-muted-foreground/30'
              )}>
                {locationAdder === option.value && (
                  <Check className="w-3 h-3 text-primary-foreground" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm text-foreground">{option.label}</p>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </div>
              <span className={cn(
                'text-sm font-bold tabular-nums',
                option.price === 0 ? 'text-green-600' : 'text-amber-600'
              )}>
                {option.price === 0 ? '+£0' : `+£${option.price}`}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Question 2: Cylinder */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Droplets className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Hot water cylinder</h3>
          <Sheet>
            <SheetTrigger asChild>
              <button className="text-muted-foreground/50 hover:text-primary ml-auto">
                <HelpCircle className="w-4 h-4" />
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl">
              <SheetHeader>
                <SheetTitle className="text-left">Why we ask this</SheetTitle>
                <SheetDescription className="text-left">
                  Cylinder size affects comfort and install cost. Many homes can keep their current cylinder — we'll confirm what's suitable during your survey. Number of people isn't always reliable, so we focus on the cylinder directly.
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        </div>

        {/* Cylinder illustration */}
        <div className="bg-muted/30 rounded-xl p-4 mb-3">
          <div className="flex items-end justify-center gap-4">
            <div className="text-center">
              <div className="w-8 h-10 rounded-full bg-muted border border-border" />
              <p className="text-[9px] text-muted-foreground mt-1">Existing</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-14 rounded-full bg-muted border border-border" />
              <p className="text-[9px] text-muted-foreground mt-1">150L</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-18 rounded-full bg-muted border border-border" style={{ height: 72 }} />
              <p className="text-[9px] text-muted-foreground mt-1">210L</p>
            </div>
          </div>
        </div>

        {/* Cylinder options */}
        <div className="space-y-2">
          {cylinderOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onCylinderChange(option.value)}
              className={cn(
                'w-full p-3.5 rounded-xl border-2 text-left transition-all flex items-center gap-3',
                cylinderOption === option.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-muted-foreground/40'
              )}
            >
              <div className={cn(
                'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                cylinderOption === option.value
                  ? 'border-primary bg-primary'
                  : 'border-muted-foreground/30'
              )}>
                {cylinderOption === option.value && (
                  <Check className="w-3 h-3 text-primary-foreground" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm text-foreground">{option.label}</p>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </div>
              <span className={cn(
                'text-sm font-bold tabular-nums',
                option.price === 0 ? 'text-green-600' : 'text-amber-600'
              )}>
                {option.price === 0 ? '+£0' : `+£${option.price.toLocaleString()}`}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* CTA */}
      <Button 
        onClick={onContinue}
        size="lg"
        className="w-full h-14 text-base font-semibold rounded-xl active:scale-[0.98] transition-all"
      >
        Continue →
      </Button>
    </section>
  );
}