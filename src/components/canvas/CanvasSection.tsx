import { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface CanvasSectionProps {
  children: React.ReactNode;
  isActive: boolean;
  isCompleted?: boolean;
  className?: string;
  delay?: number;
}

export function CanvasSection({ 
  children, 
  isActive, 
  isCompleted = false,
  className,
  delay = 0 
}: CanvasSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    if (isActive && !hasEntered) {
      const timeout = setTimeout(() => {
        setHasEntered(true);
        ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [isActive, hasEntered, delay]);

  return (
    <section
      ref={ref}
      className={cn(
        'transition-all duration-700 ease-out',
        hasEntered || isCompleted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12',
        isCompleted && !isActive && 'opacity-50 scale-[0.98] pointer-events-none',
        className
      )}
    >
      {children}
    </section>
  );
}
