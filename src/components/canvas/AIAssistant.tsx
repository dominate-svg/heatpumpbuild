import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface AIAssistantProps {
  message?: string;
  isVisible?: boolean;
}

export function AIAssistant({ message, isVisible = true }: AIAssistantProps) {
  const [displayedMessage, setDisplayedMessage] = useState(message);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (message !== displayedMessage) {
      setIsAnimating(true);
      const timeout = setTimeout(() => {
        setDisplayedMessage(message);
        setIsAnimating(false);
      }, 150);
      return () => clearTimeout(timeout);
    }
  }, [message, displayedMessage]);

  if (!isVisible) return null;

  return (
    <div 
      className={cn(
        'fixed bottom-6 left-6 z-50 flex items-end gap-3 transition-all duration-300',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      )}
      role="status"
      aria-live="polite"
    >
      {/* Avatar */}
      <div className="relative">
        <div 
          className="w-11 h-11 rounded-full bg-primary flex items-center justify-center shadow-lg animate-pulse-slow"
          aria-hidden="true"
        >
          <span className="text-primary-foreground text-base font-semibold">C</span>
        </div>
        {/* Subtle ping */}
        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping-slow" />
      </div>

      {/* Message bubble */}
      {displayedMessage && (
        <div 
          className={cn(
            'max-w-[280px] bg-card rounded-2xl rounded-bl-lg px-4 py-3 shadow-soft border border-border transition-all duration-200',
            isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          )}
        >
          <p className="text-sm text-foreground leading-relaxed">{displayedMessage}</p>
        </div>
      )}
    </div>
  );
}
