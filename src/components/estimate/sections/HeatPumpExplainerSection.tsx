import { Zap, Flame, ThermometerSun, ArrowRight, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HeatPumpExplainerSectionProps {
  onContinue: () => void;
}

const EXPLAINER_CARDS = [
  {
    icon: Flame,
    title: 'It replaces your boiler',
    description: 'A quiet unit sits outside and heats your home through your existing radiators.',
    color: 'bg-orange-100 text-orange-600',
  },
  {
    icon: Zap,
    title: 'It uses electricity, not gas or oil',
    description: 'Electricity is cleaner and prices are more stable than fossil fuels.',
    color: 'bg-yellow-100 text-yellow-600',
  },
  {
    icon: ThermometerSun,
    title: 'It runs gently for steady warmth',
    description: 'Instead of blasting heat, it keeps your home at a consistent, comfortable temperature.',
    color: 'bg-green-100 text-green-600',
  },
];

export function HeatPumpExplainerSection({ onContinue }: HeatPumpExplainerSectionProps) {
  return (
    <section className="py-8 sm:py-12 animate-fade-in">
      {/* Visual diagram - mobile optimized */}
      <div className="relative mb-6 sm:mb-8">
        <div className="aspect-[4/3] sm:aspect-video rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden p-4">
          {/* Simple animated illustration - stacked on mobile */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
            {/* Outside air */}
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-blue-100 flex items-center justify-center mb-1 sm:mb-2 animate-pulse">
                <span className="text-xl sm:text-2xl">🌬️</span>
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Outside air</p>
            </div>
            
            {/* Arrow */}
            <ArrowDown className="w-5 h-5 sm:hidden text-primary animate-pulse" />
            <ArrowRight className="hidden sm:block w-6 h-6 sm:w-8 sm:h-8 text-primary animate-pulse" />
            
            {/* Heat pump */}
            <div className="text-center">
              <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl bg-primary/20 flex items-center justify-center mb-1 sm:mb-2">
                <span className="text-2xl sm:text-3xl">⚡</span>
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Heat pump</p>
            </div>
            
            {/* Arrow */}
            <ArrowDown className="w-5 h-5 sm:hidden text-primary animate-pulse" />
            <ArrowRight className="hidden sm:block w-6 h-6 sm:w-8 sm:h-8 text-primary animate-pulse" />
            
            {/* Warm home */}
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-orange-100 flex items-center justify-center mb-1 sm:mb-2">
                <span className="text-xl sm:text-2xl">🏠</span>
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Warm home</p>
            </div>
          </div>
        </div>
        
        {/* Caption */}
        <p className="text-center text-xs sm:text-sm text-muted-foreground mt-2 sm:mt-3 px-2">
          Heat pumps move warmth from outside air into your home — even in winter!
        </p>
      </div>

      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
          What a heat pump actually does
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          It's simpler than you might think
        </p>
      </div>

      {/* Explainer cards */}
      <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-10">
        {EXPLAINER_CARDS.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className={cn(
                'flex items-start gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-card border border-border',
                'animate-fade-in'
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={cn(
                'w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0',
                card.color
              )}>
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm sm:text-base mb-0.5 sm:mb-1">{card.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{card.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <Button 
        onClick={onContinue}
        size="lg"
        className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold active:scale-[0.98] transition-transform"
      >
        That makes sense →
      </Button>
    </section>
  );
}
