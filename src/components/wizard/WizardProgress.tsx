import { cn } from '@/lib/utils';

interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
  stepLabel?: string;
}

export function WizardProgress({ currentStep, totalSteps, stepLabel }: WizardProgressProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="h-1 bg-muted/30 rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Step indicator */}
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-muted-foreground">
          Step {currentStep} of {totalSteps}
        </span>
        {stepLabel && (
          <span className="text-xs text-muted-foreground">{stepLabel}</span>
        )}
      </div>
    </div>
  );
}
