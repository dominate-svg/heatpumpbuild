import { Sparkles, PiggyBank, Home, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WelcomeSectionProps {
  onStart: () => void;
}

const BENEFITS = [
  {
    icon: PiggyBank,
    title: 'See your likely costs',
    description: 'Know what you\'d pay after grants',
  },
  {
    icon: Sparkles,
    title: 'Understand your savings',
    description: 'Compare to your current bills',
  },
  {
    icon: Home,
    title: 'Check suitability',
    description: 'See if your home is a good fit',
  },
];

export function WelcomeSection({ onStart }: WelcomeSectionProps) {
  return (
    <section className="min-h-[85vh] sm:min-h-[80vh] flex flex-col justify-center py-8 sm:py-12 animate-fade-in">
      {/* Hero */}
      <div className="text-center mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-4 sm:mb-6">
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          Takes about 2 minutes
        </div>
        
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4 leading-tight px-2">
          Let's build your<br />
          <span className="text-primary">heat pump estimate</span>
        </h1>
        
        <p className="text-muted-foreground text-base sm:text-lg max-w-md mx-auto px-4">
          We'll explain everything as we go — no technical knowledge needed.
        </p>
      </div>

      {/* Benefit cards */}
      <div className="grid gap-3 sm:gap-4 mb-8 sm:mb-10">
        {BENEFITS.map((benefit, index) => {
          const Icon = benefit.icon;
          return (
            <div
              key={benefit.title}
              className={cn(
                'flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-card border border-border',
                'animate-fade-in'
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-sm sm:text-base">{benefit.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{benefit.description}</p>
              </div>
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary/40 flex-shrink-0" />
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <Button 
        onClick={onStart}
        size="lg"
        className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold active:scale-[0.98] transition-transform"
      >
        Start →
      </Button>

      {/* Trust note */}
      <p className="text-center text-xs text-muted-foreground mt-3 sm:mt-4">
        No obligation • No spam • Your data stays private
      </p>
    </section>
  );
}
