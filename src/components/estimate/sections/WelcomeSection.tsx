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
    <section className="min-h-[80vh] flex flex-col justify-center py-12 animate-fade-in">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4" />
          Takes about 2 minutes
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 leading-tight">
          Let's build your<br />
          <span className="text-primary">heat pump estimate</span>
        </h1>
        
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          We'll explain everything as we go — no technical knowledge needed.
        </p>
      </div>

      {/* Benefit cards */}
      <div className="grid gap-4 mb-10">
        {BENEFITS.map((benefit, index) => {
          const Icon = benefit.icon;
          return (
            <div
              key={benefit.title}
              className={cn(
                'flex items-center gap-4 p-4 rounded-2xl bg-card border border-border',
                'animate-fade-in'
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
              <CheckCircle className="w-5 h-5 text-primary/40 ml-auto" />
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <Button 
        onClick={onStart}
        size="lg"
        className="w-full h-14 text-lg font-semibold"
      >
        Start →
      </Button>

      {/* Trust note */}
      <p className="text-center text-xs text-muted-foreground mt-4">
        No obligation • No spam • Your data stays private
      </p>
    </section>
  );
}
