import { useState } from 'react';
import { Check, ArrowRight, Users, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Assumptions } from '@/lib/calculations';

interface FineTuneSectionProps {
  locationAdder: 'included' | '6m' | '9m';
  cylinderOption: 'existing' | '150l' | '210l';
  onLocationChange: (value: 'included' | '6m' | '9m') => void;
  onCylinderChange: (value: 'existing' | '150l' | '210l') => void;
  onContinue: () => void;
  assumptions: Assumptions;
}

export function FineTuneSection({ 
  locationAdder,
  cylinderOption,
  onLocationChange,
  onCylinderChange,
  onContinue,
  assumptions,
}: FineTuneSectionProps) {
  const [step, setStep] = useState<'location' | 'cylinder'>('location');

  const locationOptions = [
    { 
      value: 'included' as const, 
      label: 'Within 3m', 
      description: 'Close to existing boiler',
      price: 0,
    },
    { 
      value: '6m' as const, 
      label: '3–6m away', 
      description: 'Moderate pipe run',
      price: assumptions.adder_location_6m,
    },
    { 
      value: '9m' as const, 
      label: '6–9m away', 
      description: 'Longer pipe run',
      price: assumptions.adder_location_9m,
    },
  ];

  const cylinderOptions = [
    { 
      value: 'existing' as const, 
      label: '1–2 people', 
      description: 'Keep existing cylinder',
      price: 0,
    },
    { 
      value: '150l' as const, 
      label: '3–4 people', 
      description: '150L cylinder',
      price: assumptions.adder_cylinder_150l,
    },
    { 
      value: '210l' as const, 
      label: '5+ people', 
      description: '210L cylinder',
      price: assumptions.adder_cylinder_210l,
    },
  ];

  if (step === 'location') {
    return (
      <section className="py-6 sm:py-10 animate-fade-in">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <MapPin className="w-7 h-7 text-primary" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-2">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            Where can the heat pump go?
          </h2>
        </div>

        {/* Explanation */}
        <p className="text-center text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
          The heat pump sits outside. Longer pipes to your boiler location cost a bit more.
        </p>

        {/* Visual diagram */}
        <div className="p-4 rounded-xl bg-muted/30 mb-6">
          <div className="flex items-center justify-between max-w-xs mx-auto">
            <div className="text-center">
              <div className="w-10 h-12 rounded bg-muted border border-border mx-auto mb-1" />
              <p className="text-[10px] text-muted-foreground">Boiler</p>
            </div>
            
            <div className="flex-1 flex items-center justify-center px-2">
              <div className="h-0.5 flex-1 bg-border rounded" />
              <span className="px-2 text-xs text-muted-foreground">pipes</span>
              <div className="h-0.5 flex-1 bg-border rounded" />
            </div>
            
            <div className="text-center">
              <div className="w-10 h-12 rounded bg-primary/20 border border-primary/30 mx-auto mb-1 flex items-center justify-center">
                <span className="text-xs">❄️</span>
              </div>
              <p className="text-[10px] text-muted-foreground">Heat pump</p>
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-2 mb-6">
          {locationOptions.map((option) => {
            const isSelected = locationAdder === option.value;
            
            return (
              <button
                key={option.value}
                onClick={() => onLocationChange(option.value)}
                className={cn(
                  'w-full p-4 rounded-xl border-2 text-left transition-all duration-150 active:scale-[0.99]',
                  'bg-white',
                  isSelected 
                    ? 'border-primary shadow-md' 
                    : 'border-border hover:border-muted-foreground/30'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                      isSelected 
                        ? 'border-primary bg-primary' 
                        : 'border-muted-foreground/30'
                    )}>
                      {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">{option.label}</h3>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                  </div>
                  
                  <span className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-semibold',
                    option.price === 0 
                      ? 'bg-muted text-muted-foreground' 
                      : 'bg-amber-50 text-amber-700'
                  )}>
                    {option.price === 0 ? 'Included' : `+£${option.price}`}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* CTA */}
        <Button 
          onClick={() => setStep('cylinder')}
          size="lg"
          className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold rounded-xl active:scale-[0.98] transition-transform"
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </section>
    );
  }

  return (
    <section className="py-6 sm:py-10 animate-fade-in">
      {/* Icon */}
      <div className="flex justify-center mb-4">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Users className="w-7 h-7 text-primary" />
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-2">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
          How many people live here?
        </h2>
      </div>

      {/* Explanation */}
      <p className="text-center text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
        This sizes your hot water cylinder. More people need more stored hot water.
      </p>

      {/* Cylinder visual */}
      <div className="p-4 rounded-xl bg-muted/30 mb-6">
        <div className="flex items-end justify-center gap-4">
          {[
            { size: 'S', height: 28, label: '1-2', value: 'existing' },
            { size: 'M', height: 40, label: '3-4', value: '150l' },
            { size: 'L', height: 52, label: '5+', value: '210l' },
          ].map((cyl) => (
            <div key={cyl.size} className="text-center">
              <div 
                className={cn(
                  'w-8 rounded-t-xl mx-auto transition-all',
                  cylinderOption === cyl.value ? 'bg-primary' : 'bg-muted'
                )}
                style={{ height: cyl.height }}
              />
              <p className="text-[10px] text-muted-foreground mt-1">{cyl.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Options */}
      <div className="space-y-2 mb-6">
        {cylinderOptions.map((option) => {
          const isSelected = cylinderOption === option.value;
          
          return (
            <button
              key={option.value}
              onClick={() => onCylinderChange(option.value)}
              className={cn(
                'w-full p-4 rounded-xl border-2 text-left transition-all duration-150 active:scale-[0.99]',
                'bg-white',
                isSelected 
                  ? 'border-primary shadow-md' 
                  : 'border-border hover:border-muted-foreground/30'
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                    isSelected 
                      ? 'border-primary bg-primary' 
                      : 'border-muted-foreground/30'
                  )}>
                    {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">{option.label}</h3>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                </div>
                
                <span className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-semibold',
                  option.price === 0 
                    ? 'bg-muted text-muted-foreground' 
                    : 'bg-amber-50 text-amber-700'
                )}>
                  {option.price === 0 ? 'Included' : `+£${option.price.toLocaleString()}`}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* CTA */}
      <Button 
        onClick={onContinue}
        size="lg"
        className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold rounded-xl active:scale-[0.98] transition-transform"
      >
        See my updated estimate
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </section>
  );
}
