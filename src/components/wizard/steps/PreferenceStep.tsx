import { ArrowLeft, Wallet, TrendingDown, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PreferenceStepProps {
  selectedPreference: 'upfront' | 'running' | 'future' | null;
  onSelect: (value: 'upfront' | 'running' | 'future') => void;
  onContinue: () => void;
  onBack: () => void;
}

const PREFERENCES = [
  {
    value: 'upfront' as const,
    icon: Wallet,
    title: 'Lower upfront cost',
    description: 'Standard efficiency system with minimal hardware changes.',
    scop: 3.4,
  },
  {
    value: 'running' as const,
    icon: TrendingDown,
    title: 'Lower monthly bills',
    description: 'Higher efficiency — may need a few more radiators.',
    scop: 3.7,
  },
  {
    value: 'future' as const,
    icon: Leaf,
    title: 'Most future-proof',
    description: 'Maximum efficiency for best long-term value.',
    scop: 4.0,
  },
];

export function PreferenceStep({ 
  selectedPreference, 
  onSelect, 
  onContinue, 
  onBack 
}: PreferenceStepProps) {
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

      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          What matters most to you?
        </h1>
        <p className="text-muted-foreground text-sm">
          This helps us tune your estimate to match your priorities.
        </p>
      </div>

      {/* Preference cards */}
      <div className="space-y-3 mb-8">
        {PREFERENCES.map((pref) => {
          const Icon = pref.icon;
          const isSelected = selectedPreference === pref.value;
          
          return (
            <button
              key={pref.value}
              onClick={() => onSelect(pref.value)}
              className={cn(
                'w-full p-4 rounded-xl border-2 text-left transition-all',
                isSelected 
                  ? 'border-primary bg-primary/5 shadow-sm' 
                  : 'border-border hover:border-primary/30 bg-card'
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                  isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{pref.title}</p>
                  <p className="text-sm text-muted-foreground">{pref.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* CTA */}
      <Button 
        onClick={onContinue} 
        className="w-full h-12 text-base"
        size="lg"
      >
        Continue →
      </Button>
    </div>
  );
}

// Helper to convert preference to SCOP
export function preferenceToScop(pref: 'upfront' | 'running' | 'future' | null): number {
  switch (pref) {
    case 'upfront': return 3.4;
    case 'running': return 3.7;
    case 'future': return 4.0;
    default: return 3.7;
  }
}
