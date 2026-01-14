import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LookingSectionProps {
  onComplete: () => void;
}

const AI_MESSAGES = [
  'Checking your EPC…',
  'Estimating heat demand…',
  'Matching system size…',
  'Calculating running costs…',
];

export function LookingSection({ onComplete }: LookingSectionProps) {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [completedMessages, setCompletedMessages] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      if (messageIndex < AI_MESSAGES.length - 1) {
        setCompletedMessages(prev => [...prev, messageIndex]);
        messageIndex++;
        setCurrentMessage(messageIndex);
        setProgress(((messageIndex + 1) / AI_MESSAGES.length) * 100);
      } else {
        clearInterval(messageInterval);
        setCompletedMessages(prev => [...prev, messageIndex]);
        setProgress(100);
        setTimeout(onComplete, 600);
      }
    }, 800);

    return () => clearInterval(messageInterval);
  }, [onComplete]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 py-12">
      {/* Subtle animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/3 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 max-w-md w-full text-center">
        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight mb-3">
          Looking at your home…
        </h1>
        <p className="text-muted-foreground text-lg mb-12">
          I'm pulling together your EPC, insulation level, and heating profile.
        </p>

        {/* Progress messages */}
        <div className="space-y-3 mb-10">
          {AI_MESSAGES.map((msg, idx) => {
            const isCompleted = completedMessages.includes(idx);
            const isCurrent = currentMessage === idx && !isCompleted;

            return (
              <div
                key={idx}
                className={cn(
                  'flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-500',
                  isCompleted && 'bg-primary/5',
                  isCurrent && 'bg-muted/50',
                  !isCompleted && !isCurrent && 'opacity-30'
                )}
              >
                <div className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center transition-all duration-500',
                  isCompleted && 'bg-primary text-white',
                  isCurrent && 'bg-primary/20',
                  !isCompleted && !isCurrent && 'bg-muted'
                )}>
                  {isCompleted ? (
                    <Check className="w-4 h-4" strokeWidth={2.5} />
                  ) : isCurrent ? (
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                  )}
                </div>
                <span className={cn(
                  'text-sm font-medium transition-colors duration-300',
                  isCompleted && 'text-primary',
                  isCurrent && 'text-foreground',
                  !isCompleted && !isCurrent && 'text-muted-foreground'
                )}>
                  {msg}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
