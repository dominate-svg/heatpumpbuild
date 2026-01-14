import { useState, useEffect, useRef } from 'react';

interface UseCountUpOptions {
  duration?: number;
  delay?: number;
  startOnMount?: boolean;
}

export function useCountUp(
  endValue: number,
  options: UseCountUpOptions = {}
) {
  const { duration = 1200, delay = 0, startOnMount = true } = options;
  const [value, setValue] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);

  const start = () => {
    setHasStarted(true);
  };

  useEffect(() => {
    if (startOnMount) {
      const timeout = setTimeout(() => setHasStarted(true), delay);
      return () => clearTimeout(timeout);
    }
  }, [startOnMount, delay]);

  useEffect(() => {
    if (!hasStarted) return;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
      
      // Easing function for smooth deceleration
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      setValue(Math.round(easeOutQuart * endValue));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [hasStarted, endValue, duration]);

  // Reset when endValue changes
  useEffect(() => {
    startTimeRef.current = null;
    if (hasStarted) {
      setValue(0);
      const timeout = setTimeout(() => {
        startTimeRef.current = null;
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [endValue]);

  return { value, start, hasStarted };
}
