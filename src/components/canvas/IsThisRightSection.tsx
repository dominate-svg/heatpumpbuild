import { useState } from 'react';
import { Snowflake, ThermometerSun, PiggyBank, Zap, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IsThisRightSectionProps {
  onContinue: () => void;
}

const QUESTIONS = [
  {
    id: 'cold-weather',
    icon: Snowflake,
    question: 'Will it work in cold weather?',
    answer: 'Yes. Modern heat pumps work down to -20°C. UK winters rarely go below -5°C. Your system is sized for our coldest days.',
  },
  {
    id: 'warmth',
    icon: ThermometerSun,
    question: 'Will my home feel warm?',
    answer: 'Absolutely. Heat pumps provide steady, comfortable warmth — like underfloor heating through your radiators. No cold spots, no blasting.',
  },
  {
    id: 'bills',
    icon: PiggyBank,
    question: 'Will my bills really be lower?',
    answer: 'For most homes, yes. With Cosy\'s 8 cheap hours daily and 300-400% efficiency, running costs are typically lower than gas. Your survey confirms this.',
  },
  {
    id: 'power',
    icon: Zap,
    question: 'What about power cuts?',
    answer: 'Heat pumps need electricity, but so do gas boilers (for controls and pumps). Your home retains heat for hours. Power cuts are rare and usually brief.',
  },
];

export function IsThisRightSection({ onContinue }: IsThisRightSectionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <section className="py-16 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 section-enter">
          <h2 className="text-section-title font-semibold text-foreground tracking-tight mb-3">
            Is this right for you?
          </h2>
          <p className="text-body text-muted-foreground">
            Common questions, honest answers.
          </p>
        </div>

        {/* FAQ cards */}
        <div className="space-y-3 mb-10">
          {QUESTIONS.map((q, index) => {
            const isExpanded = expandedId === q.id;
            const Icon = q.icon;

            return (
              <div
                key={q.id}
                className={cn(
                  'bg-card rounded-2xl border border-border shadow-soft overflow-hidden transition-all section-enter',
                  isExpanded && 'ring-2 ring-primary/10 border-primary/30'
                )}
                style={{ animationDelay: `${100 + index * 100}ms` }}
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : q.id)}
                  className="w-full p-5 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
                      isExpanded ? 'bg-primary/10' : 'bg-muted'
                    )}>
                      <Icon className={cn(
                        'w-5 h-5 transition-colors',
                        isExpanded ? 'text-primary' : 'text-muted-foreground'
                      )} />
                    </div>
                    <p className="font-semibold text-foreground">{q.question}</p>
                  </div>
                  <ChevronDown className={cn(
                    'w-5 h-5 text-muted-foreground transition-transform duration-300',
                    isExpanded && 'rotate-180'
                  )} />
                </button>

                <div className={cn(
                  'overflow-hidden transition-all duration-300',
                  isExpanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                )}>
                  <div className="px-5 pb-5 pt-0">
                    <div className="pl-14">
                      <p className="text-body text-muted-foreground leading-relaxed">
                        {q.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Continue hint */}
        <p className="text-center text-micro text-muted-foreground section-enter" style={{ animationDelay: '600ms' }}>
          Scroll down to see your final estimate
        </p>
      </div>
    </section>
  );
}
