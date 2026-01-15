import { Home, Zap, Thermometer, ArrowLeft, Play, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ExplainerSectionProps {
  onContinue: () => void;
  onSkip: () => void;
  onBack: () => void;
}

const EXPLAINER_CARDS = [
  {
    icon: Home,
    title: 'A heat pump replaces your boiler',
    description: 'An outdoor unit absorbs heat from the air (even when cold) and transfers it into your home through your existing radiators.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Thermometer,
    title: 'It runs on electricity, steadily',
    description: 'Unlike a boiler that cycles on and off, a heat pump runs gently for longer periods — giving you even, comfortable warmth.',
    color: 'bg-orange-50 text-orange-600',
  },
  {
    icon: Zap,
    title: 'Smart tariffs cut your costs',
    description: 'Tariffs like Cosy give you 8 hours of cheap electricity. Heat your home overnight and stay warm all day.',
    color: 'bg-green-50 text-green-600',
  },
];

export function ExplainerSection({ onContinue, onSkip, onBack }: ExplainerSectionProps) {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <section className="py-6 sm:py-10 animate-fade-in">
      {/* Back button */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Quick heat pump explainer
        </h1>
        <p className="text-sm text-muted-foreground">
          30 seconds to understand the basics
        </p>
      </div>

      {/* Video placeholder */}
      <button
        onClick={() => setShowVideo(true)}
        className="relative w-full aspect-video rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-border mb-6 overflow-hidden group hover:border-primary/30 transition-colors"
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Play className="w-6 h-6 text-primary fill-primary" />
          </div>
          <p className="text-sm font-medium text-foreground">Watch: Why efficiency matters</p>
          <p className="text-xs text-muted-foreground mt-0.5">30 seconds</p>
        </div>
        
        {/* Decorative house */}
        <div className="absolute bottom-4 right-4 opacity-20">
          <Home className="w-20 h-20 text-primary" />
        </div>
      </button>

      {/* Video modal placeholder */}
      {showVideo && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="relative bg-card rounded-2xl w-full max-w-lg p-6">
            <button 
              onClick={() => setShowVideo(false)}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold mb-4">Video coming soon</h3>
            <p className="text-sm text-muted-foreground mb-4">
              We're working on a short video to explain heat pumps. In the meantime, here's the key info:
            </p>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li>• Heat pumps extract heat from outside air</li>
              <li>• They're 3-4x more efficient than boilers</li>
              <li>• Running costs can be lower with the right tariff</li>
              <li>• Government grants cover up to £7,500</li>
            </ul>
            <Button onClick={() => setShowVideo(false)} className="w-full mt-4">
              Got it
            </Button>
          </div>
        </div>
      )}

      {/* Explainer cards */}
      <div className="space-y-3 mb-6">
        {EXPLAINER_CARDS.map((card, index) => {
          const Icon = card.icon;
          return (
            <div 
              key={card.title}
              className="flex gap-4 p-4 rounded-xl bg-card border border-border animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={cn(
                'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0',
                card.color
              )}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm mb-1">
                  {card.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {card.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTAs */}
      <div className="space-y-3">
        <Button 
          onClick={onContinue}
          size="lg"
          className="w-full h-14 text-base font-semibold rounded-xl active:scale-[0.98] transition-all"
        >
          Got it →
        </Button>
        
        <Button 
          onClick={onSkip}
          variant="ghost"
          size="lg"
          className="w-full h-12 text-sm text-muted-foreground hover:text-foreground"
        >
          Skip this step
        </Button>
      </div>
    </section>
  );
}