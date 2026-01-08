import { Thermometer, Wind, Zap, Leaf } from 'lucide-react';

interface HeatPumpVisualProps {
  className?: string;
}

export function HeatPumpVisual({ className = '' }: HeatPumpVisualProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Heat pump illustration */}
      <div className="relative w-full aspect-square max-w-[200px] mx-auto">
        {/* Main heat pump body */}
        <div className="absolute inset-4 bg-gradient-to-br from-muted to-secondary rounded-2xl shadow-card border border-border animate-scale-in">
          {/* Fan grille */}
          <div className="absolute inset-6 rounded-full border-4 border-primary/20 flex items-center justify-center">
            <div className="w-3/4 h-3/4 rounded-full border-2 border-primary/30 animate-spin" style={{ animationDuration: '8s' }}>
              <div className="absolute inset-0 flex items-center justify-center">
                <Wind className="w-8 h-8 text-primary animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Floating icons */}
        <div className="absolute -top-2 -right-2 w-10 h-10 bg-success/10 rounded-full flex items-center justify-center animate-float" style={{ animationDelay: '0s' }}>
          <Leaf className="w-5 h-5 text-success" />
        </div>
        <div className="absolute -bottom-2 -left-2 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center animate-float" style={{ animationDelay: '1s' }}>
          <Zap className="w-5 h-5 text-primary" />
        </div>
        <div className="absolute top-1/2 -right-4 w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center animate-float" style={{ animationDelay: '2s' }}>
          <Thermometer className="w-4 h-4 text-accent" />
        </div>
      </div>

      {/* Energy waves */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-full h-full max-w-[240px] max-h-[240px] rounded-full border border-primary/10 animate-ping" style={{ animationDuration: '3s' }} />
      </div>
    </div>
  );
}
