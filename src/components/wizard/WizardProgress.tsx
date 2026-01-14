import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WizardProgressProps {
  currentStep: number;
  steps: { label: string }[];
}

export function WizardProgress({ currentStep, steps }: WizardProgressProps) {
  return (
    <div className="flex items-center justify-center mb-8 px-4">
      <div className="flex items-center gap-0">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = currentStep > stepNumber;
          const isCurrent = currentStep === stepNumber;

          return (
            <div key={index} className="flex items-center">
              {/* Step indicator */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-500',
                    isCompleted && 'bg-primary text-primary-foreground shadow-sm',
                    isCurrent && 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-110',
                    !isCompleted && !isCurrent && 'bg-muted text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" strokeWidth={2.5} />
                  ) : (
                    stepNumber
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs font-medium mt-2 hidden sm:block transition-all duration-300 whitespace-nowrap',
                    isCurrent && 'text-foreground',
                    isCompleted && 'text-primary',
                    !isCurrent && !isCompleted && 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="relative w-16 sm:w-24 h-0.5 mx-2 bg-muted overflow-hidden">
                  <div
                    className={cn(
                      'absolute inset-y-0 left-0 bg-primary transition-all duration-700 ease-out',
                      currentStep > stepNumber ? 'w-full' : 'w-0'
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
