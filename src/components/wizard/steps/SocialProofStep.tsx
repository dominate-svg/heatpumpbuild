import { ArrowLeft, Star, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import octopusPartner from '@/assets/octopus-partner.png';

interface SocialProofStepProps {
  onContinue: () => void;
  onBack: () => void;
}

const TESTIMONIALS = [
  {
    quote: "The whole process was so much simpler than I expected. Really happy with the result.",
    author: "Sarah M.",
    location: "Bristol",
  },
  {
    quote: "Our bills are genuinely lower, and the house feels more comfortable too.",
    author: "James T.",
    location: "Manchester",
  },
];

export function SocialProofStep({ onContinue, onBack }: SocialProofStepProps) {
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

      {/* Heading */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground mb-2">
          You're in good company
        </h1>
        <p className="text-muted-foreground">
          Thousands of UK homeowners have already made the switch
        </p>
      </div>

      {/* Trust badges */}
      <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
        {/* Trustpilot-style rating */}
        <div className="flex flex-col items-center">
          <div className="flex gap-1 mb-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="w-5 h-5 fill-success text-success" />
            ))}
          </div>
          <p className="text-sm font-medium text-foreground">Excellent</p>
          <p className="text-xs text-muted-foreground">Based on 500+ reviews</p>
        </div>

        {/* Octopus partner */}
        <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-xl border border-border">
          <img 
            src={octopusPartner} 
            alt="Octopus Energy Partner" 
            className="h-8 w-auto"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-card rounded-xl p-4 border border-border text-center">
          <p className="text-2xl font-semibold text-primary mb-1">5,000+</p>
          <p className="text-xs text-muted-foreground">UK homes switched</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border text-center">
          <p className="text-2xl font-semibold text-primary mb-1">£7,500</p>
          <p className="text-xs text-muted-foreground">Grant handled for you</p>
        </div>
      </div>

      {/* Testimonials */}
      <div className="space-y-4 mb-8">
        {TESTIMONIALS.map((testimonial, idx) => (
          <div key={idx} className="bg-card rounded-xl p-4 border border-border">
            <Quote className="w-5 h-5 text-primary/30 mb-2" />
            <p className="text-sm text-foreground mb-2">"{testimonial.quote}"</p>
            <p className="text-xs text-muted-foreground">
              — {testimonial.author}, {testimonial.location}
            </p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <Button 
        onClick={onContinue} 
        className="w-full h-12 text-base cta-hover-lift"
        size="lg"
      >
        Continue →
      </Button>
    </div>
  );
}
