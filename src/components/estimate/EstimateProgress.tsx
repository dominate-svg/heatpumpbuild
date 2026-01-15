import { cn } from '@/lib/utils';

interface EstimateProgressProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

const STEP_LABELS = [
  'Learn',
  'Home',
  'System',
  'Location',
  'Hot water',
  'Tariff',
  'Quote',
  'Book',
];

export function EstimateProgress({ currentStep, totalSteps, className }: EstimateProgressProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;
  
  return (
    <div className={cn('w-full', className)}>
      {/* Step indicator */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground">
          Step {currentStep + 1} of {totalSteps}
        </span>
        <span className="text-xs font-semibold text-primary">
          {STEP_LABELS[currentStep] || ''}
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Step dots - visible on larger screens */}
      <div className="hidden sm:flex items-center justify-between mt-3 px-1">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div 
            key={i}
            className={cn(
              'w-2 h-2 rounded-full transition-all duration-300',
              i < currentStep ? 'bg-primary' : 
              i === currentStep ? 'bg-primary scale-125 ring-2 ring-primary/20' : 
              'bg-muted-foreground/20'
            )}
          />
        ))}
      </div>
    </div>
  );
}
