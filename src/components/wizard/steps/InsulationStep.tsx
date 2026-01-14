import { ArrowLeft, Home, Thermometer, Snowflake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IllustrationPlaceholder } from '../IllustrationPlaceholder';
import { cn } from '@/lib/utils';

interface InsulationStepProps {
  epcBand?: string;
  selectedInsulation: string;
  onSelect: (value: string) => void;
  onContinue: () => void;
  onBack: () => void;
}

const INSULATION_OPTIONS = [
  {
    value: 'good',
    label: 'Very well insulated',
    description: 'New build or recently renovated',
    icon: Home,
    epcBands: ['A', 'B'],
  },
  {
    value: 'average',
    label: 'Average insulation',
    description: 'Most homes built after 1980',
    icon: Thermometer,
    epcBands: ['C', 'D'],
  },
  {
    value: 'poor',
    label: 'Poor insulation',
    description: 'Older home, draughty, single glazing',
    icon: Snowflake,
    epcBands: ['E', 'F', 'G'],
  },
];

function getInsulationFromEPC(epcBand?: string): string {
  if (!epcBand) return '';
  if (['A', 'B'].includes(epcBand)) return 'good';
  if (['C', 'D'].includes(epcBand)) return 'average';
  return 'poor';
}

export function InsulationStep({ 
  epcBand, 
  selectedInsulation, 
  onSelect, 
  onContinue, 
  onBack 
}: InsulationStepProps) {
  // Auto-select based on EPC if available and nothing selected
  const effectiveSelection = selectedInsulation || getInsulationFromEPC(epcBand);

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
        label="Illustration: House cross-section showing heat escaping" 
        className="mb-6"
      />

      {/* Explanation first */}
      <div className="bg-muted/20 rounded-xl p-4 mb-6 border border-border/50">
        <h3 className="font-medium text-foreground mb-2">Homes lose heat at different speeds</h3>
        <p className="text-sm text-muted-foreground">
          A well-insulated home holds warmth longer and costs less to heat. A less insulated home needs more energy — but can benefit more from upgrades.
        </p>
      </div>

      {/* EPC callout if available */}
      {epcBand && (
        <div className="bg-primary/5 rounded-xl p-4 mb-6 border border-primary/20">
          <p className="text-sm text-foreground">
            <span className="font-medium">Your EPC rating is {epcBand}</span> — we've pre-selected based on this, but you can change it.
          </p>
        </div>
      )}

      {/* Question */}
      <h2 className="text-xl font-semibold text-foreground mb-4">
        How well insulated is your home?
      </h2>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {INSULATION_OPTIONS.map((option) => {
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

      {/* Why this matters */}
      <p className="text-xs text-muted-foreground mb-6 text-center">
        This helps us estimate how much heat your home needs — not a judgement.
      </p>

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
