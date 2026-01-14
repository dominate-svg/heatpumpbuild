import { ThermometerSun, TrendingDown, PoundSterling, ArrowRight, Snowflake, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HeatPumpPrimerStepProps {
  onContinue: () => void;
}

const BENEFITS = [
  {
    icon: ThermometerSun,
    title: 'Steady warmth',
    description: 'Heat pumps run gently for longer, keeping temperature stable.',
  },
  {
    icon: TrendingDown,
    title: 'Lower running costs (often)',
    description: 'They can be 3–4× more efficient than a boiler, but tariffs matter.',
  },
  {
    icon: PoundSterling,
    title: 'Grant available',
    description: '£7,500 government support reduces upfront cost.',
  },
];

const MYTHS = [
  {
    myth: "They don't work in winter",
    truth: "They do — Finland uses them everywhere.",
  },
  {
    myth: "They only work in new builds",
    truth: "Many work in older homes too, with the right design.",
  },
];

export function HeatPumpPrimerStep({ onContinue }: HeatPumpPrimerStepProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/3 to-background">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12 section-enter">
          <h1 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight mb-4">
            Heat pumps, in 30 seconds
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            They're like a fridge in reverse — moving heat into your home instead of making heat by burning fuel.
          </p>
        </div>

        {/* Two-column visual block */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Left - Illustration placeholder */}
          <div className="section-enter" style={{ animationDelay: '100ms' }}>
            <div className="bg-muted/50 rounded-3xl border-2 border-dashed border-border p-8 h-full flex flex-col justify-center">
              <div className="text-center text-muted-foreground mb-6">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Home className="w-10 h-10 text-primary" />
                </div>
                <p className="text-sm font-medium mb-4">How it works</p>
              </div>
              <div className="space-y-4 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  <p>Outside unit pulls heat from outdoor air</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                  <p>Heat is moved into water for radiators and hot water</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">3</span>
                  </div>
                  <p>It runs on electricity</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Benefits */}
          <div className="space-y-4">
            {BENEFITS.map((benefit, index) => (
              <div
                key={benefit.title}
                className="flex items-start gap-4 p-5 bg-card rounded-2xl border border-border shadow-soft section-enter"
                style={{ animationDelay: `${200 + index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">{benefit.title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Common myths strip */}
        <div className="bg-card rounded-2xl border border-border shadow-soft p-6 mb-12 section-enter" style={{ animationDelay: '500ms' }}>
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Snowflake className="w-4 h-4 text-primary" />
            Common myths
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {MYTHS.map((item, idx) => (
              <div key={idx} className="flex flex-col">
                <p className="text-sm text-muted-foreground line-through mb-1">
                  "{item.myth}"
                </p>
                <p className="text-sm text-foreground font-medium">
                  → {item.truth}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center section-enter" style={{ animationDelay: '600ms' }}>
          <Button
            onClick={onContinue}
            size="lg"
            className="h-14 px-10 text-base font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
          >
            Got it — show my home details
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
