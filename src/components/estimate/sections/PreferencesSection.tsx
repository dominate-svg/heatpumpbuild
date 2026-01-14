import { Wallet, TrendingDown, Leaf, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PreferencesSectionProps {
  selectedPreference: 'upfront' | 'running' | 'future';
  onSelect: (value: 'upfront' | 'running' | 'future') => void;
  onContinue: () => void;
}

const PREFERENCES = [
  {
    value: 'upfront' as const,
    icon: Wallet,
    title: 'Lower upfront cost',
    description: 'Standard efficiency system — minimise hardware changes',
    benefit: 'Lowest initial spend',
    color: 'text-blue-600 bg-blue-100',
  },
  {
    value: 'running' as const,
    icon: TrendingDown,
    title: 'Lower monthly bills',
    description: 'Higher efficiency — may need a few more radiators',
    benefit: 'Best balance of cost and savings',
    color: 'text-purple-600 bg-purple-100',
  },
  {
    value: 'future' as const,
    icon: Leaf,
    title: 'Most future-proof',
    description: 'Maximum efficiency for best long-term value',
    benefit: 'Lowest bills over 15+ years',
    color: 'text-green-600 bg-green-100',
  },
];

export function PreferencesSection({ 
  selectedPreference, 
  onSelect, 
  onContinue 
}: PreferencesSectionProps) {
  return (
    <section className="py-12 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          What matters most to you?
        </h2>
        <p className="text-muted-foreground">
          This helps us tune your estimate to match your priorities
        </p>
      </div>

      {/* Preference cards */}
      <div className="space-y-4 mb-10">
        {PREFERENCES.map((pref, index) => {
          const Icon = pref.icon;
          const isSelected = selectedPreference === pref.value;
          
          return (
            <button
              key={pref.value}
              onClick={() => onSelect(pref.value)}
              className={cn(
                'w-full p-5 rounded-2xl border-2 text-left transition-all relative overflow-hidden animate-fade-in',
                isSelected 
                  ? 'border-primary bg-primary/5 shadow-md' 
                  : 'border-border bg-card hover:border-primary/30'
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all',
                  isSelected ? 'bg-primary text-primary-foreground' : pref.color
                )}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{pref.title}</h3>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{pref.description}</p>
                  <div className={cn(
                    'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                    isSelected ? 'bg-primary/10 text-primary' : 'bg-muted/50 text-muted-foreground'
                  )}>
                    {pref.benefit}
                  </div>
                </div>
              </div>
              
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute inset-y-0 left-0 w-1 bg-primary rounded-r" />
              )}
            </button>
          );
        })}
      </div>

      {/* CTA */}
      <Button 
        onClick={onContinue}
        size="lg"
        className="w-full h-14 text-lg font-semibold"
      >
        Continue →
      </Button>
    </section>
  );
}
