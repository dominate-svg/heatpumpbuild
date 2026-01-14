import { ClipboardCheck, Home, Wrench, ThumbsUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const TIMELINE_STEPS = [
  {
    icon: ClipboardCheck,
    title: 'Book your survey',
    description: 'A qualified engineer visits your home to take measurements and confirm the design.',
  },
  {
    icon: Home,
    title: 'Receive your quote',
    description: 'Within a few days, you will get a detailed fixed-price quote based on the survey.',
  },
  {
    icon: Wrench,
    title: 'Installation',
    description: 'Our MCS-certified team installs your system, typically in 2-3 days.',
  },
  {
    icon: ThumbsUp,
    title: 'Enjoy Cosy',
    description: 'Start saving on your energy bills and enjoy a warmer, greener home.',
  },
];

export function WhatHappensNextSection() {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-16 pb-32">
      {/* Header */}
      <div className="text-center mb-12 section-enter">
        <h2 className="text-section-title text-foreground mb-2">
          What happens next
        </h2>
        <p className="text-muted-foreground">
          From survey to savings in four simple steps
        </p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-border hidden sm:block" />

        <div className="space-y-6">
          {TIMELINE_STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div 
                key={idx}
                className="flex gap-5 section-enter"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Icon */}
                <div className="relative z-10 flex-shrink-0">
                  <div className={cn(
                    'w-12 h-12 rounded-2xl flex items-center justify-center',
                    idx === 0 ? 'bg-primary text-primary-foreground shadow-lg' : 'bg-muted/30 text-muted-foreground'
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 pt-1">
                  <p className="font-semibold text-foreground mb-1">{step.title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
