import { Wallet, TrendingDown, Leaf, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PrioritySectionProps {
  selectedPriority: 'upfront' | 'running' | 'future';
  onSelect: (value: 'upfront' | 'running' | 'future') => void;
  onContinue: () => void;
}

const PRIORITIES = [
  {
    value: 'upfront' as const,
    icon: Wallet,
    title: 'Lower upfront cost',
    description: 'Standard efficiency — fewer changes needed',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    value: 'running' as const,
    icon: TrendingDown,
    title: 'Lower monthly bills',
    description: 'Higher efficiency — best balance',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    recommended: true,
  },
  {
    value: 'future' as const,
    icon: Leaf,
    title: 'Most future-proof',
    description: 'Maximum efficiency — lowest bills long-term',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
  },
];

export function PrioritySection({ 
  selectedPriority, 
  onSelect, 
  onContinue 
}: PrioritySectionProps) {
  return (
    <section className="py-6 sm:py-10 animate-fade-in">
      {/* Title */}
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1">
          What matters most to you?
        </h2>
        <p className="text-sm text-muted-foreground">
          This helps us tune your estimate
        </p>
      </div>

      {/* Option cards */}
      <div className="space-y-3 mb-8">
        {PRIORITIES.map((priority) => {
          const Icon = priority.icon;
          const isSelected = selectedPriority === priority.value;
          
          return (
            <button
              key={priority.value}
              onClick={() => onSelect(priority.value)}
              className={cn(
                'w-full p-4 rounded-xl border-2 text-left transition-all relative active:scale-[0.98]',
                'bg-white shadow-sm',
                isSelected 
                  ? 'border-primary ring-2 ring-primary/20' 
                  : 'border-border hover:border-primary/30'
              )}
            >
              {priority.recommended && (
                <span className="absolute -top-2.5 left-4 px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-medium rounded-full">
                  Recommended
                </span>
              )}
              
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all',
                  isSelected ? 'bg-primary' : priority.iconBg
                )}>
                  <Icon className={cn(
                    'w-5 h-5',
                    isSelected ? 'text-primary-foreground' : priority.iconColor
                  )} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-sm sm:text-base">{priority.title}</h3>
                  <p className="text-xs text-muted-foreground">{priority.description}</p>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Check className="w-3.5 h-3.5 text-primary-foreground" />
                  </div>
                )}
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
