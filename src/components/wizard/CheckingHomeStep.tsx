import { useEffect, useState } from 'react';
import { Check, FileSearch, Thermometer, Cpu, Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckingHomeStepProps {
  onComplete: () => void;
}

const CHECK_ITEMS = [
  { icon: FileSearch, label: 'Finding your EPC record' },
  { icon: Thermometer, label: 'Estimating insulation & heat loss' },
  { icon: Cpu, label: 'Matching the right heat pump size' },
  { icon: Calculator, label: 'Modelling energy costs' },
];

export function CheckingHomeStep({ onComplete }: CheckingHomeStepProps) {
  const [completedItems, setCompletedItems] = useState<number[]>([]);
  const [currentItem, setCurrentItem] = useState(0);

  useEffect(() => {
    let itemIndex = 0;
    const interval = setInterval(() => {
      if (itemIndex < CHECK_ITEMS.length) {
        setCompletedItems(prev => [...prev, itemIndex]);
        itemIndex++;
        setCurrentItem(itemIndex);
      } else {
        clearInterval(interval);
        setTimeout(onComplete, 400);
      }
    }, 600);

    return () => clearInterval(interval);
  }, [onComplete]);

  const progress = (completedItems.length / CHECK_ITEMS.length) * 100;

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 py-12">
      {/* Subtle animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-primary/3 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 max-w-md w-full text-center">
        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight mb-3">
          Checking your home…
        </h1>
        <p className="text-muted-foreground text-lg mb-10">
          We're pulling your EPC and estimating your heating needs.
        </p>

        {/* Check items */}
        <div className="space-y-3 mb-8">
          {CHECK_ITEMS.map((item, idx) => {
            const isCompleted = completedItems.includes(idx);
            const isCurrent = currentItem === idx && !isCompleted;
            const Icon = item.icon;

            return (
              <div
                key={idx}
                className={cn(
                  'flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-500 bg-card border',
                  isCompleted && 'border-primary/20 bg-primary/5',
                  isCurrent && 'border-primary/40 shadow-soft',
                  !isCompleted && !isCurrent && 'border-border opacity-40'
                )}
              >
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500',
                  isCompleted && 'bg-primary text-primary-foreground',
                  isCurrent && 'bg-primary/20',
                  !isCompleted && !isCurrent && 'bg-muted'
                )}>
                  {isCompleted ? (
                    <Check className="w-5 h-5" strokeWidth={2.5} />
                  ) : (
                    <Icon className={cn(
                      'w-5 h-5',
                      isCurrent && 'text-primary animate-pulse',
                      !isCurrent && 'text-muted-foreground/50'
                    )} />
                  )}
                </div>
                <span className={cn(
                  'text-sm font-medium transition-colors duration-300 text-left',
                  isCompleted && 'text-foreground',
                  isCurrent && 'text-foreground',
                  !isCompleted && !isCurrent && 'text-muted-foreground'
                )}>
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
