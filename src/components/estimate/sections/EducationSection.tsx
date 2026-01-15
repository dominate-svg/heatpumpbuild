import { Home, Zap, Thermometer } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EducationSectionProps {
  onContinue: () => void;
}

const BENEFITS = [
  {
    icon: Home,
    title: 'Replaces your boiler',
    description: 'An electric heat pump sits outside and heats your home using your existing radiators.',
  },
  {
    icon: Zap,
    title: 'Uses cheaper electricity',
    description: 'Smart tariffs heat your home when electricity is cheapest — often overnight.',
  },
  {
    icon: Thermometer,
    title: 'Steadier comfort',
    description: 'Gentle, continuous heat means no cold spikes or overheating.',
  },
];

export function EducationSection({ onContinue }: EducationSectionProps) {
  return (
    <section className="py-6 sm:py-10 animate-fade-in">
      {/* Title */}
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          How a heat pump works
        </h1>
        <p className="text-muted-foreground">
          A simple, cleaner way to heat your home
        </p>
      </div>

      {/* House illustration */}
      <div className="relative mb-8 p-6 rounded-2xl bg-gradient-to-b from-sky-50 to-white border border-border">
        <div className="flex items-end justify-center gap-4">
          {/* Outside unit */}
          <div className="text-center">
            <div className="w-16 h-20 rounded-lg bg-white border-2 border-muted flex flex-col items-center justify-center shadow-sm">
              <div className="w-10 h-8 bg-muted rounded mb-1" />
              <div className="flex gap-0.5">
                <div className="w-2 h-4 bg-muted-foreground/20 rounded-sm" />
                <div className="w-2 h-4 bg-muted-foreground/20 rounded-sm" />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Heat pump</p>
          </div>

          {/* Arrow */}
          <div className="flex flex-col items-center pb-6">
            <div className="w-12 h-0.5 bg-primary/30" />
            <p className="text-[9px] text-primary mt-0.5">heat flows in</p>
          </div>

          {/* House */}
          <div className="text-center">
            <div className="relative">
              {/* Roof */}
              <div className="w-0 h-0 border-l-[40px] border-r-[40px] border-b-[24px] border-l-transparent border-r-transparent border-b-muted mx-auto" />
              {/* House body */}
              <div className="w-20 h-16 bg-white border-2 border-muted rounded-b-lg flex items-center justify-center">
                {/* Radiator glow */}
                <div className="flex gap-1">
                  <div className="w-3 h-8 bg-gradient-to-t from-orange-200 to-orange-100 rounded-sm animate-pulse" />
                  <div className="w-3 h-8 bg-gradient-to-t from-orange-200 to-orange-100 rounded-sm animate-pulse" style={{ animationDelay: '150ms' }} />
                  <div className="w-3 h-8 bg-gradient-to-t from-orange-200 to-orange-100 rounded-sm animate-pulse" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Your home</p>
          </div>
        </div>
      </div>

      {/* Benefit cards */}
      <div className="space-y-3 mb-8">
        {BENEFITS.map((benefit, index) => (
          <div 
            key={benefit.title}
            className="flex gap-4 p-4 rounded-xl bg-white border border-border"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <benefit.icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm mb-0.5">
                {benefit.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {benefit.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <Button 
        onClick={onContinue}
        size="lg"
        className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold rounded-xl active:scale-[0.98] transition-transform"
      >
        That makes sense →
      </Button>
    </section>
  );
}
