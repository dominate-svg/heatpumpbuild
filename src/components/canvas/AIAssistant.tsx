import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface AIAssistantProps {
  message?: string;
  isVisible?: boolean;
  position?: 'left' | 'right';
}

export function AIAssistant({ message, isVisible = true, position = 'left' }: AIAssistantProps) {
  const [displayedMessage, setDisplayedMessage] = useState(message);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (message !== displayedMessage) {
      setIsAnimating(true);
      const timeout = setTimeout(() => {
        setDisplayedMessage(message);
        setIsAnimating(false);
      }, 200);
      return () => clearTimeout(timeout);
    }
  }, [message, displayedMessage]);

  if (!isVisible) return null;

  return (
    <div className={cn(
      'fixed bottom-6 z-50 flex items-end gap-3 transition-all duration-500',
      position === 'left' ? 'left-6' : 'right-6',
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    )}>
      {/* Avatar */}
      <div className="relative">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25 animate-pulse-slow">
          <span className="text-white text-lg font-semibold">C</span>
        </div>
        {/* Pulse ring */}
        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping-slow" />
      </div>

      {/* Message bubble */}
      {displayedMessage && (
        <div className={cn(
          'max-w-xs bg-card rounded-2xl rounded-bl-md px-4 py-3 shadow-elevated transition-all duration-300',
          isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        )}>
          <p className="text-sm text-foreground leading-relaxed">{displayedMessage}</p>
        </div>
      )}
    </div>
  );
}
