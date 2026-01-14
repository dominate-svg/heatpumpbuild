import { ArrowLeft, Zap, Clock, ThermometerSun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IllustrationPlaceholder } from '../IllustrationPlaceholder';

interface WhatChangesStepProps {
  onContinue: () => void;
  onBack: () => void;
}

const CHANGES = [
  {
    icon: Zap,
    title: 'Replaces your boiler',
    description: 'An electric heat pump sits outside and heats your home using the same radiators.',
  },
  {
    icon: Clock,
    title: 'Uses cheaper electricity',
    description: 'With smart tariffs, you heat your home when electricity is cheapest — often at night.',
  },
  {
    icon: ThermometerSun,
    title: 'Steadier, more comfortable',
    description: 'Heat pumps run gently for longer, giving even warmth without temperature swings.',
  },
];

export function WhatChangesStep({ onContinue, onBack }: WhatChangesStepProps) {
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

      {/* Illustration */}
      <IllustrationPlaceholder 
        label="Illustration: Home with heat pump outside, warm glow inside" 
        className="mb-6"
        aspectRatio="wide"
      />

      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          What a heat pump would change
        </h1>
        <p className="text-muted-foreground text-sm">
          Here's how your home heating would work differently.
        </p>
      </div>

      {/* Change tiles */}
      <div className="space-y-4 mb-8">
        {CHANGES.map((change) => {
          const Icon = change.icon;
          return (
            <div 
              key={change.title}
              className="bg-card rounded-xl border border-border p-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-1">{change.title}</h3>
                  <p className="text-sm text-muted-foreground">{change.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <Button 
        onClick={onContinue} 
        className="w-full h-12 text-base"
        size="lg"
      >
        That makes sense →
      </Button>
    </div>
  );
}
