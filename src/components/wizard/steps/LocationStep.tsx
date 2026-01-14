import { ArrowLeft, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IllustrationPlaceholder } from '../IllustrationPlaceholder';
import { cn } from '@/lib/utils';

interface LocationStepProps {
  selectedLocation: 'included' | '6m' | '9m';
  onSelect: (value: 'included' | '6m' | '9m') => void;
  onContinue: () => void;
  onBack: () => void;
}

const LOCATION_OPTIONS = [
  {
    value: 'included' as const,
    label: 'Right next to boiler',
    description: 'Best case — minimal pipework',
  },
  {
    value: '6m' as const,
    label: 'Short distance',
    description: 'A few metres of extra pipework',
  },
  {
    value: '9m' as const,
    label: 'Further away',
    description: 'Longer run across the property',
  },
];

export function LocationStep({ 
  selectedLocation, 
  onSelect, 
  onContinue, 
  onBack 
}: LocationStepProps) {
  return (
    <div className="animate-fade-in">
      {/* Back button */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Illustration */}
      <IllustrationPlaceholder 
        label="Illustration: House + heat pump + pipe length diagram" 
        className="mb-6"
      />

      {/* Explanation first */}
      <div className="bg-muted/20 rounded-xl p-4 mb-6 border border-border/50">
        <h3 className="font-medium text-foreground mb-2">The heat pump sits outside</h3>
        <p className="text-sm text-muted-foreground">
          Longer pipes mean a little more install work — but it's usually straightforward.
        </p>
      </div>

      {/* Question */}
      <h2 className="text-xl font-semibold text-foreground mb-4">
        Where would the heat pump go?
      </h2>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {LOCATION_OPTIONS.map((option) => {
          const isSelected = selectedLocation === option.value;
          
          return (
            <button
              key={option.value}
              onClick={() => onSelect(option.value)}
              className={cn(
                'w-full p-4 rounded-xl border-2 text-left transition-all card-selectable',
                isSelected 
                  ? 'border-primary bg-primary/5 shadow-focus' 
                  : 'border-border hover:border-primary/30'
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                  isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground'
                )}>
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{option.label}</p>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* CTA */}
      <Button 
        onClick={onContinue} 
        className="w-full h-12 text-base cta-hover-lift"
        size="lg"
      >
        Continue →
      </Button>
    </div>
  );
}
