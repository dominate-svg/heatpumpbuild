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
    <section className="py-8 sm:py-12 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
          What matters most to you?
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          This helps us tune your estimate to match your priorities
        </p>
      </div>

      {/* Preference cards */}
      <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-10">
        {PREFERENCES.map((pref, index) => {
          const Icon = pref.icon;
          const isSelected = selectedPreference === pref.value;
          
          return (
            <button
              key={pref.value}
              onClick={() => onSelect(pref.value)}
              className={cn(
                'w-full p-4 sm:p-5 rounded-xl sm:rounded-2xl border-2 text-left transition-all relative overflow-hidden animate-fade-in active:scale-[0.98]',
                isSelected 
                  ? 'border-primary bg-primary/5 shadow-md' 
                  : 'border-border bg-card hover:border-primary/30'
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className={cn(
                  'w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 transition-all',
                  isSelected ? 'bg-primary text-primary-foreground' : pref.color
                )}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 sm:mb-1">
                    <h3 className="font-semibold text-foreground text-sm sm:text-base">{pref.title}</h3>
                    {isSelected && (
                      <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1.5 sm:mb-2">{pref.description}</p>
                  <div className={cn(
                    'inline-flex items-center px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium',
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
        className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold active:scale-[0.98] transition-transform"
      >
        Continue →
      </Button>
    </section>
  );
}
