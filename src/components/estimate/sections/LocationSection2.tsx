import { Check, ArrowLeft, MapPin, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Assumptions } from '@/lib/calculations';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface LocationSection2Props {
  locationAdder: 'included' | '6m' | '9m';
  onLocationChange: (value: 'included' | '6m' | '9m') => void;
  onContinue: () => void;
  onBack: () => void;
  assumptions: Assumptions;
}

export function LocationSection2({
  locationAdder,
  onLocationChange,
  onContinue,
  onBack,
  assumptions,
}: LocationSection2Props) {
  const locationOptions = [
    { 
      value: 'included' as const, 
      label: 'Within 3m', 
      description: 'Close to existing boiler',
      priceImpact: 0,
    },
    { 
      value: '6m' as const, 
      label: '3–6m away', 
      description: 'Moderate pipe run',
      priceImpact: assumptions.adder_location_6m,
    },
    { 
      value: '9m' as const, 
      label: '6–9m away', 
      description: 'Longer pipe run',
      priceImpact: assumptions.adder_location_9m,
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

      {/* Icon */}
      <div className="flex justify-center mb-4">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <MapPin className="w-7 h-7 text-primary" />
        </div>
      </div>

      {/* Title with tooltip */}
      <div className="text-center mb-2">
        <div className="flex items-center justify-center gap-2">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            Where can the heat pump go?
          </h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-muted-foreground/50 hover:text-muted-foreground">
                  <Info className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <div className="space-y-2 text-xs">
                  <p className="font-semibold">Why we ask this</p>
                  <p>The heat pump sits outside. Longer pipes to your boiler mean more labour and materials.</p>
                  <p className="font-semibold pt-1">How this affects your quote</p>
                  <p>Each additional 3m of pipework adds to your installation cost as shown.</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Explanation */}
      <p className="text-center text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
        The heat pump sits outside. Longer pipes from your boiler cost a bit more.
      </p>

      {/* Visual diagram */}
      <div className="p-4 rounded-xl bg-muted/30 mb-6">
        <div className="flex items-center justify-between max-w-xs mx-auto">
          <div className="text-center">
            <div className="w-12 h-14 rounded bg-white border-2 border-muted mx-auto mb-1 flex items-center justify-center">
              <span className="text-lg">🔥</span>
            </div>
            <p className="text-[10px] text-muted-foreground font-medium">Boiler</p>
          </div>
          
          <div className="flex-1 flex items-center justify-center px-2">
            <div className="h-1 flex-1 bg-gradient-to-r from-primary/30 to-primary/60 rounded" />
            <span className="px-2 text-xs text-muted-foreground font-medium">pipes</span>
            <div className="h-1 flex-1 bg-gradient-to-r from-primary/60 to-primary/30 rounded" />
          </div>
          
          <div className="text-center">
            <div className="w-12 h-14 rounded bg-primary/10 border-2 border-primary/30 mx-auto mb-1 flex items-center justify-center">
              <span className="text-lg">❄️</span>
            </div>
            <p className="text-[10px] text-muted-foreground font-medium">Heat pump</p>
          </div>
        </div>
      </div>

      {/* Options with exact price impacts */}
      <div className="space-y-2 mb-6">
        {locationOptions.map((option) => {
          const isSelected = locationAdder === option.value;
          
          return (
            <button
              key={option.value}
              onClick={() => onLocationChange(option.value)}
              className={cn(
                'w-full p-4 rounded-xl border-2 text-left transition-all duration-150 active:scale-[0.99]',
                'bg-card',
                isSelected 
                  ? 'border-primary shadow-md ring-1 ring-primary/20' 
                  : 'border-border hover:border-muted-foreground/30'
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                    isSelected 
                      ? 'border-primary bg-primary scale-110' 
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
                  'px-3 py-1.5 rounded-lg text-xs font-bold tabular-nums',
                  option.priceImpact === 0 
                    ? 'bg-green-50 text-green-700' 
                    : 'bg-amber-50 text-amber-700'
                )}>
                  {option.priceImpact === 0 ? '+£0' : `+£${option.priceImpact}`}
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
        className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold rounded-xl active:scale-[0.98] transition-all cta-hover-lift"
      >
        Continue →
      </Button>
    </section>
  );
}
