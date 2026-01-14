import { Leaf, Volume2, Shield, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BenefitsSectionProps {
  onContinue: () => void;
}

const BENEFITS = [
  {
    icon: Leaf,
    title: 'Lower carbon footprint',
    description: 'Heat pumps produce 3x less CO₂ than gas boilers',
    color: 'bg-green-100 text-green-600',
  },
  {
    icon: Volume2,
    title: 'Quieter than a boiler',
    description: 'Modern units are as quiet as a fridge humming',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Shield,
    title: 'Future energy price protection',
    description: 'Less exposed to volatile fossil fuel prices',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: TrendingDown,
    title: '20+ year lifespan',
    description: 'Longer lasting than traditional boilers',
    color: 'bg-orange-100 text-orange-600',
  },
];

export function BenefitsSection({ onContinue }: BenefitsSectionProps) {
  return (
    <section className="py-8 sm:py-12 animate-fade-in">
      {/* Visual - warm home illustration placeholder */}
      <div className="aspect-[4/3] sm:aspect-video rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-50 to-purple-50 border border-border mb-6 sm:mb-8 flex items-center justify-center overflow-hidden">
        <div className="text-center p-6 sm:p-8">
          <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">🏡</div>
          <p className="text-base sm:text-lg font-semibold text-foreground mb-1">A warmer, smarter home</p>
          <p className="text-xs sm:text-sm text-muted-foreground">Future-proof heating that saves you money</p>
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
          Beyond the savings
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Here's why thousands of UK homes are making the switch
        </p>
      </div>

      {/* Benefit cards */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mb-8 sm:mb-10">
        {BENEFITS.map((benefit, index) => {
          const Icon = benefit.icon;
          return (
            <div
              key={benefit.title}
              className={cn(
                'p-3 sm:p-4 rounded-lg sm:rounded-xl bg-card border border-border animate-scale-in'
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={cn(
                'w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3',
                benefit.color
              )}>
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h3 className="font-semibold text-foreground text-xs sm:text-sm mb-0.5 sm:mb-1">{benefit.title}</h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">{benefit.description}</p>
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
        Show my final estimate →
      </Button>
    </section>
  );
}
