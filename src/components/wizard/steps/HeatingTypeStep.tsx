import { ArrowLeft, Flame, Droplet, Zap, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IllustrationPlaceholder } from '../IllustrationPlaceholder';
import { cn } from '@/lib/utils';

interface HeatingTypeStepProps {
  detectedFuel?: string;
  selectedFuel: string;
  onSelect: (value: string) => void;
  onContinue: () => void;
  onBack: () => void;
}

const FUEL_OPTIONS = [
  {
    value: 'gas',
    label: 'Gas boiler',
    description: 'Mains gas central heating',
    icon: Flame,
  },
  {
    value: 'oil',
    label: 'Oil boiler',
    description: 'Oil tank in garden or outbuilding',
    icon: Droplet,
  },
  {
    value: 'lpg',
    label: 'LPG',
    description: 'Bottled or tank gas',
    icon: Flame,
  },
  {
    value: 'electric',
    label: 'Electric heating',
    description: 'Storage heaters or electric radiators',
    icon: Zap,
  },
  {
    value: 'unknown',
    label: 'Not sure',
    description: "We'll use typical values",
    icon: HelpCircle,
  },
];

export function HeatingTypeStep({ 
  detectedFuel, 
  selectedFuel, 
  onSelect, 
  onContinue, 
  onBack 
}: HeatingTypeStepProps) {
  const effectiveSelection = selectedFuel || detectedFuel || '';

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
        label="Illustration: Boiler vs oil tank vs heat pump icons" 
        className="mb-6"
      />

      {/* Explanation first */}
      <div className="bg-muted/20 rounded-xl p-4 mb-6 border border-border/50">
        <h3 className="font-medium text-foreground mb-2">Different fuels cost very different amounts</h3>
        <p className="text-sm text-muted-foreground">
          This helps us compare your current costs to a heat pump fairly.
        </p>
      </div>

      {/* Detected fuel callout */}
      {detectedFuel && detectedFuel !== 'unknown' && (
        <div className="bg-primary/5 rounded-xl p-4 mb-6 border border-primary/20">
          <p className="text-sm text-foreground">
            <span className="font-medium">Your EPC shows {detectedFuel} heating</span> — we've pre-selected this for you.
          </p>
        </div>
      )}

      {/* Question */}
      <h2 className="text-xl font-semibold text-foreground mb-4">
        What do you currently heat your home with?
      </h2>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {FUEL_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = effectiveSelection === option.value;
          
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
        disabled={!effectiveSelection}
      >
        Continue →
      </Button>
    </div>
  );
}
