import { useEffect, useState } from 'react';
import { Check, Database, Home, Thermometer, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LearningSectionProps {
  onComplete: () => void;
}

const STAGES = [
  { label: 'EPC data', icon: Database, duration: 600 },
  { label: 'Insulation', icon: Home, duration: 700 },
  { label: 'Heat loss', icon: Thermometer, duration: 600 },
  { label: 'Energy costs', icon: Zap, duration: 700 },
];

export function LearningSection({ onComplete }: LearningSectionProps) {
  const [completedStages, setCompletedStages] = useState<number[]>([]);
  const [currentStage, setCurrentStage] = useState(-1);
  const [progressWidth, setProgressWidth] = useState(0);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const runStage = (index: number) => {
      if (index >= STAGES.length) {
        setProgressWidth(100);
        timeout = setTimeout(onComplete, 400);
        return;
      }

      setCurrentStage(index);
      setProgressWidth(((index + 0.5) / STAGES.length) * 100);

      timeout = setTimeout(() => {
        setCompletedStages(prev => [...prev, index]);
        setProgressWidth(((index + 1) / STAGES.length) * 100);
        setTimeout(() => runStage(index + 1), 100);
      }, STAGES[index].duration);
    };

    timeout = setTimeout(() => runStage(0), 300);
    return () => clearTimeout(timeout);
  }, [onComplete]);

  return (
    <section className="min-h-[80vh] flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Soft animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/3" />
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 max-w-lg w-full text-center">
        {/* Title */}
        <h1 className="text-hero font-semibold text-foreground tracking-tight mb-3 section-enter">
          We're learning about your home
        </h1>
        <p className="text-body text-muted-foreground mb-12 section-enter" style={{ animationDelay: '100ms' }}>
          Combining EPC data, insulation assumptions, and heating behaviour.
        </p>

        {/* Horizontal timeline */}
        <div className="flex items-center justify-between mb-10">
          {STAGES.map((stage, index) => {
            const isCompleted = completedStages.includes(index);
            const isActive = currentStage === index && !isCompleted;
            const Icon = stage.icon;

            return (
              <div key={index} className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    'w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 mb-3',
                    isCompleted && 'bg-primary text-primary-foreground shadow-md',
                    isActive && 'bg-primary/20 text-primary scale-110',
                    !isCompleted && !isActive && 'bg-muted text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-6 h-6" strokeWidth={2.5} />
                  ) : (
                    <Icon className={cn('w-6 h-6', isActive && 'animate-pulse')} />
                  )}
                </div>
                <span
                  className={cn(
                    'text-micro font-medium transition-all duration-300',
                    isCompleted && 'text-primary',
                    isActive && 'text-foreground',
                    !isCompleted && !isActive && 'text-muted-foreground/60'
                  )}
                >
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressWidth}%` }}
          />
        </div>
      </div>
    </section>
  );
}
