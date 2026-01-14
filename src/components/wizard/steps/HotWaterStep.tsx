import { ArrowLeft, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IllustrationPlaceholder } from '../IllustrationPlaceholder';
import { cn } from '@/lib/utils';

interface HotWaterStepProps {
  selectedCylinder: 'existing' | '150l' | '210l';
  onSelect: (value: 'existing' | '150l' | '210l') => void;
  onContinue: () => void;
  onBack: () => void;
}

const CYLINDER_OPTIONS = [
  {
    value: 'existing' as const,
    label: 'Use existing cylinder',
    description: "If you already have a good one, we can often reuse it",
    people: '1–2 people',
  },
  {
    value: '150l' as const,
    label: 'New 150L cylinder',
    description: 'Good for smaller households',
    people: '2–3 people',
  },
  {
    value: '210l' as const,
    label: 'New 210L cylinder',
    description: 'Better for larger households',
    people: '4+ people',
  },
];

export function HotWaterStep({ 
  selectedCylinder, 
  onSelect, 
  onContinue, 
  onBack 
}: HotWaterStepProps) {
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
        label="Illustration: Family showering + cylinder size comparison" 
        className="mb-6"
      />

      {/* Explanation first */}
      <div className="bg-muted/20 rounded-xl p-4 mb-6 border border-border/50">
        <h3 className="font-medium text-foreground mb-2">Heat pumps store hot water in a cylinder</h3>
        <p className="text-sm text-muted-foreground">
          Bigger households need more stored water. If you have a combi boiler, you'll need a new cylinder.
        </p>
      </div>

      {/* Question */}
      <h2 className="text-xl font-semibold text-foreground mb-4">
        What about hot water?
      </h2>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {CYLINDER_OPTIONS.map((option) => {
          const isSelected = selectedCylinder === option.value;
          
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
                  <Users className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-foreground">{option.label}</p>
                    <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                      {option.people}
                    </span>
                  </div>
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
