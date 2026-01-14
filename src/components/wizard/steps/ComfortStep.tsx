import { ArrowLeft, Wallet, Scale, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IllustrationPlaceholder } from '../IllustrationPlaceholder';
import { cn } from '@/lib/utils';

interface ComfortStepProps {
  selectedComfort: number;
  onSelect: (value: number) => void;
  onContinue: () => void;
  onBack: () => void;
}

const COMFORT_OPTIONS = [
  {
    value: 3.4,
    label: 'Lowest upfront cost',
    description: 'Standard efficiency, minimal changes',
    icon: Wallet,
  },
  {
    value: 3.7,
    label: 'Balanced',
    description: 'Good efficiency with reasonable investment',
    icon: Scale,
  },
  {
    value: 4.0,
    label: 'Lowest running cost',
    description: 'Highest efficiency, may need more radiators',
    icon: TrendingDown,
  },
];

export function ComfortStep({ 
  selectedComfort, 
  onSelect, 
  onContinue, 
  onBack 
}: ComfortStepProps) {
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
        label="Illustration: Thermometer + cosy living room" 
        className="mb-6"
      />

      {/* Question */}
      <h2 className="text-xl font-semibold text-foreground mb-2">
        What matters most to you?
      </h2>
      <p className="text-muted-foreground mb-6">
        Higher efficiency systems save more over time, but sometimes need a bit more hardware.
      </p>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {COMFORT_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedComfort === option.value;
          
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
                  <Icon className="w-5 h-5" />
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
