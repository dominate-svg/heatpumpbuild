import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IllustrationPlaceholder } from '../IllustrationPlaceholder';

interface WelcomeStepProps {
  onContinue: () => void;
}

export function WelcomeStep({ onContinue }: WelcomeStepProps) {
  return (
    <div className="animate-fade-in">
      {/* Illustration */}
      <IllustrationPlaceholder 
        label="Illustration: Friendly home with warmth lines and heat pump" 
        className="mb-8"
      />

      {/* Content */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground mb-3">
          Let's see if a heat pump is right for your home
        </h1>
        <p className="text-muted-foreground">
          This takes about 2 minutes. We'll ask a few simple questions, explain everything as we go, and then show you a realistic estimate.
        </p>
      </div>

      {/* Reassurance checklist */}
      <div className="space-y-3 mb-8">
        {[
          'No obligation',
          'No spam',
          "You're not committing to anything",
        ].map((item) => (
          <div key={item} className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
              <Check className="w-3.5 h-3.5 text-success" />
            </div>
            <span className="text-sm text-foreground">{item}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <Button 
        onClick={onContinue} 
        className="w-full h-12 text-base cta-hover-lift"
        size="lg"
      >
        Start →
      </Button>
    </div>
  );
}
