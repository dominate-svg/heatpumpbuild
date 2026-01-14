import { ArrowLeft, Check, ThermometerSnowflake, Volume2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IllustrationPlaceholder } from '../IllustrationPlaceholder';

interface HeatPumpExplainerStepProps {
  onContinue: () => void;
  onBack: () => void;
}

const BENEFITS = [
  {
    icon: ThermometerSnowflake,
    title: 'Steady, even warmth',
    description: 'Runs gently for longer, keeping temperature stable',
  },
  {
    icon: Check,
    title: 'Works in winter',
    description: 'Finland uses them everywhere — they handle cold',
  },
  {
    icon: Volume2,
    title: 'Very quiet',
    description: 'Modern units are quieter than a fridge',
  },
  {
    icon: Clock,
    title: 'Lasts ~20 years',
    description: 'Longer lifespan than a typical boiler',
  },
];

export function HeatPumpExplainerStep({ onContinue, onBack }: HeatPumpExplainerStepProps) {
  return (
    <div className="animate-fade-in">
      {/* Back button */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Illustration - larger for this educational step */}
      <IllustrationPlaceholder 
        label="Animated diagram: Air → Heat → Home (how heat is moved)" 
        className="mb-6"
        aspectRatio="wide"
      />

      {/* Main explanation */}
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground mb-3">
          What is a heat pump?
        </h1>
        <p className="text-muted-foreground text-base">
          A heat pump doesn't "make" heat — it <span className="font-medium text-foreground">moves</span> it.
        </p>
      </div>

      {/* Simple explanation */}
      <div className="bg-muted/20 rounded-xl p-5 mb-6 border border-border/50">
        <p className="text-foreground leading-relaxed">
          It takes warmth from the air outside and gently moves it into your home using electricity. Because it moves heat instead of creating it, it's <span className="font-semibold text-primary">3–4× more efficient</span> than a boiler.
        </p>
      </div>

      {/* Benefits grid */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {BENEFITS.map((benefit) => {
          const Icon = benefit.icon;
          return (
            <div 
              key={benefit.title}
              className="bg-card rounded-xl p-4 border border-border"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <p className="font-medium text-sm text-foreground mb-0.5">{benefit.title}</p>
              <p className="text-xs text-muted-foreground">{benefit.description}</p>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <Button 
        onClick={onContinue} 
        className="w-full h-12 text-base cta-hover-lift"
        size="lg"
      >
        That makes sense →
      </Button>
    </div>
  );
}
