import { useEffect, useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PreparingEstimateProps {
  onComplete: () => void;
}

const STEPS = [
  { label: 'Finding your EPC…', duration: 800 },
  { label: 'Estimating heat loss…', duration: 900 },
  { label: 'Sizing your heat pump…', duration: 800 },
  { label: 'Modelling Cosy tariff savings…', duration: 1000 },
];

export function PreparingEstimate({ onComplete }: PreparingEstimateProps) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const runStep = (index: number) => {
      if (index >= STEPS.length) {
        // All steps complete, wait a beat then advance
        timeout = setTimeout(() => {
          onComplete();
        }, 400);
        return;
      }

      setCurrentStep(index);

      timeout = setTimeout(() => {
        setCompletedSteps(prev => [...prev, index]);
        runStep(index + 1);
      }, STEPS[index].duration);
    };

    // Start after a brief delay
    timeout = setTimeout(() => runStep(0), 300);

    return () => clearTimeout(timeout);
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center animate-fade-in">
        {/* Animated icon */}
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Preparing your personalised estimate…
        </h1>
        <p className="text-muted-foreground mb-8">
          We're checking your EPC, estimating heat demand, and modelling running costs.
        </p>

        {/* Progress list */}
        <div className="space-y-3 text-left max-w-xs mx-auto">
          {STEPS.map((step, index) => {
            const isCompleted = completedSteps.includes(index);
            const isActive = currentStep === index && !isCompleted;

            return (
              <div
                key={index}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg transition-all duration-300',
                  isCompleted && 'bg-success/10',
                  isActive && 'bg-primary/5',
                  !isCompleted && !isActive && 'opacity-40'
                )}
              >
                <div
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300',
                    isCompleted && 'bg-success text-white',
                    isActive && 'bg-primary/20'
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : isActive ? (
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                  )}
                </div>
                <span
                  className={cn(
                    'text-sm font-medium transition-colors duration-300',
                    isCompleted && 'text-success',
                    isActive && 'text-foreground',
                    !isCompleted && !isActive && 'text-muted-foreground'
                  )}
                >
                  {isCompleted ? step.label.replace('…', '') : step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
