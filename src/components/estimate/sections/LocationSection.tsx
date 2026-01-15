import { MapPin, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Assumptions } from '@/lib/calculations';

interface LocationSectionProps {
  selectedLocation: 'included' | '6m' | '9m';
  onSelect: (value: 'included' | '6m' | '9m') => void;
  onContinue: () => void;
  assumptions: Assumptions;
}

export function LocationSection({ 
  selectedLocation, 
  onSelect, 
  onContinue,
  assumptions,
}: LocationSectionProps) {
  const options = [
    { 
      value: 'included' as const, 
      label: 'Within 3m', 
      description: 'Close to boiler',
      priceImpact: 0,
    },
    { 
      value: '6m' as const, 
      label: '3–6m away', 
      description: 'Some extra piping',
      priceImpact: assumptions.adder_location_6m,
    },
    { 
      value: '9m' as const, 
      label: '6–9m away', 
      description: 'Longest run',
      priceImpact: assumptions.adder_location_9m,
    },
  ];

  return (
    <section className="py-6 sm:py-10 animate-fade-in">
      {/* Visual diagram */}
      <div className="mb-6 p-4 rounded-xl bg-white border border-border shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="text-center">
            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mx-auto mb-1">
              <span className="text-lg">🔥</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Boiler</p>
          </div>
          
          <div className="flex-1 flex items-center justify-center px-2">
            <div className="flex items-center">
              <div className="h-0.5 w-6 bg-border rounded" />
              <ArrowRight className="w-4 h-4 text-muted-foreground mx-1" />
              <div className="h-0.5 w-6 bg-border rounded" />
            </div>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-1">
              <span className="text-lg">❄️</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Heat pump</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Longer pipes need more work to install
        </p>
      </div>

      {/* Title */}
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1">
          Where will the heat pump go?
        </h2>
        <p className="text-sm text-muted-foreground">
          Distance from your boiler location
        </p>
      </div>

      {/* Option cards with price impact */}
      <div className="space-y-2 mb-8">
        {options.map((option) => {
          const isSelected = selectedLocation === option.value;
          
          return (
            <button
              key={option.value}
              onClick={() => onSelect(option.value)}
              className={cn(
                'w-full p-4 rounded-xl border-2 text-left transition-all active:scale-[0.98]',
                'bg-white shadow-sm',
                isSelected 
                  ? 'border-primary ring-2 ring-primary/20' 
                  : 'border-border hover:border-primary/30'
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5 text-primary-foreground" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />
                  )}
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">{option.label}</h3>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                </div>
                
                {/* Price impact badge */}
                <div className={cn(
                  'px-2.5 py-1 rounded-full text-xs font-semibold',
                  option.priceImpact === 0 
                    ? 'bg-muted text-muted-foreground' 
                    : 'bg-amber-100 text-amber-700'
                )}>
                  {option.priceImpact === 0 
                    ? 'Included' 
                    : `+£${option.priceImpact}`
                  }
                </div>
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
        Continue
      </Button>
    </section>
  );
}
