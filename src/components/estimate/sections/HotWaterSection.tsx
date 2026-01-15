import { Droplets, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Assumptions } from '@/lib/calculations';

interface HotWaterSectionProps {
  selectedCylinder: 'existing' | '150l' | '210l';
  onSelect: (value: 'existing' | '150l' | '210l') => void;
  onContinue: () => void;
  assumptions: Assumptions;
}

export function HotWaterSection({ 
  selectedCylinder, 
  onSelect, 
  onContinue,
  assumptions,
}: HotWaterSectionProps) {
  const options = [
    { 
      value: 'existing' as const, 
      label: '1–2 people', 
      description: 'Keep existing cylinder',
      icon: '👤',
      priceImpact: 0,
    },
    { 
      value: '150l' as const, 
      label: '3–4 people', 
      description: '150L cylinder',
      icon: '👥',
      priceImpact: assumptions.adder_cylinder_150l,
    },
    { 
      value: '210l' as const, 
      label: '5+ people', 
      description: '210L cylinder',
      icon: '👨‍👩‍👧‍👦',
      priceImpact: assumptions.adder_cylinder_210l,
    },
  ];

  return (
    <section className="py-6 sm:py-10 animate-fade-in">
      {/* Visual - cylinder comparison */}
      <div className="mb-6 p-4 rounded-xl bg-white border border-border shadow-sm">
        <div className="flex items-end justify-center gap-4 mb-3">
          {[
            { size: 'S', height: 32 },
            { size: 'M', height: 44 },
            { size: 'L', height: 56 },
          ].map((cyl, i) => (
            <div key={cyl.size} className="text-center">
              <div 
                className={cn(
                  'w-8 rounded-t-xl mx-auto transition-all',
                  (selectedCylinder === 'existing' && i === 0) ||
                  (selectedCylinder === '150l' && i === 1) ||
                  (selectedCylinder === '210l' && i === 2)
                    ? 'bg-primary'
                    : 'bg-muted'
                )}
                style={{ height: cyl.height }}
              />
              <p className="text-[10px] text-muted-foreground mt-1">{cyl.size}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Bigger households need more stored hot water
        </p>
      </div>

      {/* Title */}
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1">
          How many people live here?
        </h2>
        <p className="text-sm text-muted-foreground">
          This sizes your hot water cylinder
        </p>
      </div>

      {/* Option cards with price impact */}
      <div className="space-y-2 mb-8">
        {options.map((option) => {
          const isSelected = selectedCylinder === option.value;
          
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
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{option.icon}</span>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">{option.label}</h3>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
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
                    : `+£${option.priceImpact.toLocaleString()}`
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
