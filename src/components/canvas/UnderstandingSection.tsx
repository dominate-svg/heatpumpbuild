import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UnderstandingSectionProps {
  onComplete: () => void;
}

const STEPS = [
  { label: 'EPC records', duration: 650 },
  { label: 'Insulation', duration: 600 },
  { label: 'Heat loss', duration: 650 },
  { label: 'Energy modelling', duration: 700 },
];

export function UnderstandingSection({ onComplete }: UnderstandingSectionProps) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let stepIndex = 0;

    const runStep = () => {
      if (stepIndex >= STEPS.length) {
        setProgress(100);
        timeout = setTimeout(onComplete, 400);
        return;
      }

      setCurrentStep(stepIndex);
      setProgress(((stepIndex + 0.5) / STEPS.length) * 100);

      timeout = setTimeout(() => {
        setCompletedSteps(prev => [...prev, stepIndex]);
        setProgress(((stepIndex + 1) / STEPS.length) * 100);
        stepIndex++;
        setTimeout(runStep, 100);
      }, STEPS[stepIndex]?.duration || 600);
    };

    timeout = setTimeout(runStep, 300);
    return () => clearTimeout(timeout);
  }, [onComplete]);

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-6 py-16">
      {/* Soft gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-primary/[0.02] pointer-events-none" />

      <div className="relative z-10 max-w-lg w-full text-center">
        {/* Title */}
        <h1 className="text-section-title text-foreground mb-3 section-enter">
          Understanding your home
        </h1>
        <p className="text-secondary-foreground mb-12 section-enter" style={{ animationDelay: '50ms' }}>
          I'm pulling together EPC, insulation, and heating data.
        </p>

        {/* Progress steps - horizontal on desktop, vertical on mobile */}
        <div className="mb-10">
          {/* Desktop horizontal */}
          <div className="hidden sm:flex items-center justify-between gap-2 mb-6">
            {STEPS.map((step, idx) => {
              const isCompleted = completedSteps.includes(idx);
              const isCurrent = currentStep === idx && !isCompleted;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-all duration-300',
                      isCompleted && 'bg-primary text-primary-foreground shadow-lg',
                      isCurrent && 'bg-primary/10 border-2 border-primary',
                      !isCompleted && !isCurrent && 'bg-muted/30 border border-border'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" strokeWidth={2.5} />
                    ) : isCurrent ? (
                      <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                    )}
                  </div>
                  <span className={cn(
                    'text-micro font-medium transition-colors duration-200',
                    isCompleted && 'text-primary',
                    isCurrent && 'text-foreground',
                    !isCompleted && !isCurrent && 'text-muted-foreground'
                  )}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Mobile vertical */}
          <div className="sm:hidden space-y-3">
            {STEPS.map((step, idx) => {
              const isCompleted = completedSteps.includes(idx);
              const isCurrent = currentStep === idx && !isCompleted;

              return (
                <div
                  key={idx}
                  className={cn(
                    'flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300',
                    isCompleted && 'bg-primary/5',
                    isCurrent && 'bg-muted/30',
                    !isCompleted && !isCurrent && 'opacity-40'
                  )}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300',
                    isCompleted && 'bg-primary text-primary-foreground',
                    isCurrent && 'bg-primary/10',
                    !isCompleted && !isCurrent && 'bg-muted/50'
                  )}>
                    {isCompleted ? (
                      <Check className="w-4 h-4" strokeWidth={2.5} />
                    ) : isCurrent ? (
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                    )}
                  </div>
                  <span className={cn(
                    'text-sm font-medium transition-colors',
                    isCompleted && 'text-primary',
                    isCurrent && 'text-foreground',
                    !isCompleted && !isCurrent && 'text-muted-foreground'
                  )}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-muted/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
