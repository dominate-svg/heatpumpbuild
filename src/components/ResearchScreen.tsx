import { useState, useEffect, useMemo } from 'react';
import { Progress } from '@/components/ui/progress';
import { Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ResearchScreenProps {
  isDataReady: boolean;
  hasError: boolean;
  onComplete: () => void;
  onManualEstimate: () => void;
  onTryAgain: () => void;
}

const STEPS = [
  'Retrieving EPC certificate',
  'Reading floor area and heating fuel',
  'Estimating heat demand and system size',
  'Applying tariff and savings model',
  'Preparing your results',
];

const MINIMUM_DISPLAY_TIME = 4000; // 4 seconds
const STEP_INTERVAL = 800; // ~1 second per step

export function ResearchScreen({
  isDataReady,
  hasError,
  onComplete,
  onManualEstimate,
  onTryAgain,
}: ResearchScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime] = useState(Date.now());

  // Check for reduced motion preference
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Progress through steps
  useEffect(() => {
    if (hasError) return;

    const stepTimer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, STEP_INTERVAL);

    return () => clearInterval(stepTimer);
  }, [hasError]);

  // Track elapsed time
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Date.now() - startTime);
    }, 100);

    return () => clearInterval(timer);
  }, [startTime]);

  // Navigate when ready
  useEffect(() => {
    if (hasError) return;
    
    const minimumTimePassed = elapsedTime >= MINIMUM_DISPLAY_TIME;
    const allStepsComplete = currentStep >= STEPS.length - 1;
    
    if (isDataReady && minimumTimePassed && allStepsComplete) {
      onComplete();
    }
  }, [isDataReady, elapsedTime, currentStep, hasError, onComplete]);

  // Calculate progress percentage based on steps
  const progressPercent = ((currentStep + 1) / STEPS.length) * 100;

  // Error state
  if (hasError) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <span className="text-2xl">🏠</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              We couldn't find EPC data for this address
            </h1>
            <p className="text-muted-foreground text-base md:text-lg">
              That's okay — we can still create an estimate using typical assumptions.
            </p>
          </div>
          
          <div className="space-y-3">
            <Button
              onClick={onManualEstimate}
              className="w-full bg-primary text-primary-foreground py-6 text-base font-semibold"
            >
              Continue with manual estimate
            </Button>
            <Button
              onClick={onTryAgain}
              variant="outline"
              className="w-full py-6 text-base"
            >
              Try another address
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Main content */}
        <div className="text-center mb-10">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Analysing your home…
          </h1>
          <p className="text-muted-foreground text-base md:text-lg">
            Retrieving EPC data and preparing your personalised estimate.
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <Progress 
            value={prefersReducedMotion ? 50 : progressPercent} 
            className="h-2 bg-muted"
          />
        </div>

        {/* Step checklist */}
        <div className="space-y-4 mb-10">
          {STEPS.map((step, index) => {
            const isComplete = index < currentStep;
            const isCurrent = index === currentStep;
            
            // For reduced motion, show all as in progress
            if (prefersReducedMotion) {
              return (
                <div
                  key={step}
                  className="flex items-center gap-3 text-muted-foreground"
                >
                  <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center flex-shrink-0">
                    <Loader2 className="w-3 h-3 animate-spin" />
                  </div>
                  <span className="text-sm md:text-base">{step}</span>
                </div>
              );
            }

            return (
              <div
                key={step}
                className={`flex items-center gap-3 transition-all duration-300 ${
                  isComplete || isCurrent
                    ? 'opacity-100'
                    : 'opacity-40'
                }`}
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                    isComplete
                      ? 'bg-primary text-primary-foreground'
                      : isCurrent
                      ? 'border-2 border-primary text-primary'
                      : 'border-2 border-muted-foreground/30'
                  }`}
                >
                  {isComplete ? (
                    <Check className="w-3 h-3" />
                  ) : isCurrent ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : null}
                </div>
                <span
                  className={`text-sm md:text-base transition-colors duration-300 ${
                    isComplete
                      ? 'text-foreground'
                      : isCurrent
                      ? 'text-foreground font-medium'
                      : 'text-muted-foreground'
                  }`}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>

        {/* Micro-reassurance */}
        <p className="text-center text-xs md:text-sm text-muted-foreground">
          This is a digital estimate based on public data. A survey confirms the final design.
        </p>
      </div>
    </div>
  );
}
