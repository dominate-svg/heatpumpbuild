import { Clock, Zap, ThermometerSun, Home, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import cosyPump from '@/assets/cosy-pump.jpeg';

interface WhyCosySectionProps {
  onContinue: () => void;
  onBack: () => void;
}

const BENEFITS = [
  {
    icon: Clock,
    title: '8 hours of cheap electricity',
    description: 'Your heat pump runs when energy costs less.',
  },
  {
    icon: Zap,
    title: 'Smart load shifting',
    description: 'Pre-heats your home before expensive hours.',
  },
  {
    icon: ThermometerSun,
    title: 'Steady, comfortable warmth',
    description: 'Low-and-slow heating feels cosy, not blasting.',
  },
  {
    icon: Home,
    title: 'Designed for UK homes',
    description: 'Works with your radiators and hot water.',
  },
];

export function WhyCosySection({ onContinue, onBack }: WhyCosySectionProps) {
  return (
    <section className="py-16 px-6 bg-gradient-to-b from-background via-primary/5 to-background">
      <div className="max-w-5xl mx-auto">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 section-enter"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>

        {/* Header */}
        <div className="text-center mb-12 section-enter">
          <h2 className="text-section-title font-semibold text-foreground tracking-tight mb-3">
            Why Cosy is different
          </h2>
          <p className="text-body text-muted-foreground max-w-lg mx-auto">
            Cosy heats when electricity is cheap — not when it's expensive.
          </p>
        </div>

        {/* Split layout */}
        <div className="grid lg:grid-cols-2 gap-10 items-center mb-12">
          {/* Left - Illustration */}
          <div className="section-enter" style={{ animationDelay: '100ms' }}>
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 shadow-elevated">
              <img
                src={cosyPump}
                alt="Cosy heat pump installation"
                className="w-full h-full object-cover"
              />
              {/* Overlay with key stat */}
              <div className="absolute bottom-4 left-4 right-4 bg-card/95 backdrop-blur-sm rounded-2xl p-4 border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground">~12p/kWh</p>
                    <p className="text-micro text-muted-foreground">During cheap windows</p>
                  </div>
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
                  <p className="text-micro text-muted-foreground leading-relaxed">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center section-enter" style={{ animationDelay: '700ms' }}>
          <Button
            onClick={onContinue}
            size="lg"
            className="h-14 px-10 text-base font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
          >
            See what this means for you
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
}
