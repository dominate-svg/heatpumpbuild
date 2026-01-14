import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PreparingEstimateProps {
  onComplete: () => void;
}

const STEPS = [
  { label: 'Finding your EPC', duration: 700 },
  { label: 'Estimating heat loss', duration: 800 },
  { label: 'Matching system size', duration: 700 },
  { label: 'Modelling energy costs', duration: 800 },
];

export function PreparingEstimate({ onComplete }: PreparingEstimateProps) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [progressWidth, setProgressWidth] = useState(0);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const runStep = (index: number) => {
      if (index >= STEPS.length) {
        setProgressWidth(100);
        timeout = setTimeout(() => {
          onComplete();
        }, 500);
        return;
      }

      setCurrentStep(index);
      setProgressWidth(((index + 0.5) / STEPS.length) * 100);

      timeout = setTimeout(() => {
        setCompletedSteps(prev => [...prev, index]);
        setProgressWidth(((index + 1) / STEPS.length) * 100);
        
        setTimeout(() => runStep(index + 1), 150);
      }, STEPS[index].duration);
    };

    // Start after entrance animation
    timeout = setTimeout(() => runStep(0), 400);

    return () => clearTimeout(timeout);
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Main content */}
        <div className="text-center mb-12 animate-fade-in">
          {/* Elegant icon */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto mb-8 shadow-sm">
            <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground mb-3 tracking-tight">
            We're building your personalised estimate
          </h1>
          <p className="text-muted-foreground text-base">
            Combining your EPC, home size, and heating profile
          </p>
        </div>

        {/* Progress list */}
        <div 
          className="space-y-4 mb-10"
          style={{ animationDelay: '200ms' }}
        >
          {STEPS.map((step, index) => {
            const isCompleted = completedSteps.includes(index);
            const isActive = currentStep === index && !isCompleted;

            return (
              <div
                key={index}
                className={cn(
                  'flex items-center gap-4 py-3 px-4 rounded-xl transition-all duration-500',
                  isCompleted && 'bg-primary/5',
                  isActive && 'bg-muted/50',
                  !isCompleted && !isActive && 'opacity-30'
                )}
                style={{
                  animationDelay: `${300 + index * 100}ms`,
                }}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500',
                    isCompleted && 'bg-primary text-white scale-100',
                    isActive && 'bg-primary/10 scale-100',
                    !isCompleted && !isActive && 'bg-muted scale-90'
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" strokeWidth={2.5} />
                  ) : isActive ? (
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                  )}
                </div>
                <span
                  className={cn(
                    'text-sm font-medium transition-all duration-500',
                    isCompleted && 'text-primary',
                    isActive && 'text-foreground',
                    !isCompleted && !isActive && 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Elegant progress bar */}
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressWidth}%` }}
          />
        </div>
      </div>
    </div>
  );
}
