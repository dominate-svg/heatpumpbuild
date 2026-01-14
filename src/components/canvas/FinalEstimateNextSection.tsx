import { Award, Gauge, Zap, Calendar, Check, Phone, Wrench, Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/calculations';
import type { EstimateResults, Assumptions } from '@/lib/calculations';
import type { Tariff } from '@/hooks/useTariffs';
import { cn } from '@/lib/utils';

interface FinalEstimateNextSectionProps {
  results: EstimateResults;
  assumptions: Assumptions;
  scop: number;
  selectedTariff: Tariff | null;
  onBook: () => void;
  onBack: () => void;
}

const NEXT_STEPS = [
  {
    icon: Phone,
    title: 'Book your survey',
    description: 'A quick call to arrange a convenient time.',
  },
  {
    icon: Wrench,
    title: 'Home assessment',
    description: 'Our engineer visits to finalise the design.',
  },
  {
    icon: Calendar,
    title: 'Installation day',
    description: 'Usually 1-2 days for a complete install.',
  },
  {
    icon: Sparkles,
    title: 'Cosy comfort',
    description: 'Start enjoying efficient, steady warmth.',
  },
];

export function FinalEstimateNextSection({
  results,
  assumptions,
  scop,
  selectedTariff,
  onBook,
  onBack,
}: FinalEstimateNextSectionProps) {
  const { estimatedSavings, customerContribution } = results;
  const isNegativeSavings = estimatedSavings < 0;
  const displaySavings = Math.abs(estimatedSavings);
  const efficiencyPercent = Math.round(scop * 100);

  return (
    <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
      <div className="max-w-2xl mx-auto">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 section-enter"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>

        {/* Header */}
        <div className="text-center mb-10 section-enter">
          <h2 className="text-section-title font-semibold text-foreground tracking-tight mb-3">
            Your final estimate
          </h2>
          <p className="text-body text-muted-foreground">
            Here's everything you've configured.
          </p>
        </div>

        {/* Summary card */}
        <div className="bg-card rounded-3xl border border-border shadow-elevated overflow-hidden mb-8 section-enter" style={{ animationDelay: '100ms' }}>
          {/* Hero price */}
          <div className="p-8 text-center border-b border-border">
            <p className="text-micro text-muted-foreground mb-2">Install price</p>
            <p className="text-hero font-bold text-foreground tracking-tight">
              {formatCurrency(customerContribution)}
            </p>
          </div>

          {/* Details */}
          <div className="p-6 space-y-4">
            {/* Grant */}
            <div className="flex items-center justify-between py-3 px-4 bg-success/5 rounded-xl">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-success" />
                <span className="font-medium text-foreground">Government grant included</span>
              </div>
              <span className="font-bold text-success">{formatCurrency(assumptions.bus_grant_value)}</span>
            </div>

            {/* Efficiency & Tariff */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted/30 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Gauge className="w-4 h-4 text-muted-foreground" />
                  <span className="text-micro text-muted-foreground">Efficiency</span>
                </div>
                <span className="font-semibold text-foreground">{efficiencyPercent}%</span>
              </div>
              <div className="p-4 bg-muted/30 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-muted-foreground" />
                  <span className="text-micro text-muted-foreground">Tariff</span>
                </div>
                <span className="font-semibold text-foreground truncate">{selectedTariff?.name || 'Cosy'}</span>
              </div>
            </div>

            {/* Savings */}
            <div className={cn(
              'p-4 rounded-xl',
              isNegativeSavings ? 'bg-amber-50' : 'bg-success/5'
            )}>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Estimated annual savings</span>
                <span className={cn(
                  'text-xl font-bold',
                  isNegativeSavings ? 'text-amber-600' : 'text-success'
                )}>
                  {isNegativeSavings ? '-' : ''}£{displaySavings}/year
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mb-12 section-enter" style={{ animationDelay: '200ms' }}>
          <Button
            onClick={onBook}
            size="lg"
            className="h-16 px-12 text-lg font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
          >
            <Calendar className="w-5 h-5 mr-3" />
            Book free home survey
          </Button>
          <p className="text-micro text-muted-foreground mt-4">
            No obligation. This just confirms the design.
          </p>
        </div>

        {/* What happens next */}
        <div className="section-enter" style={{ animationDelay: '300ms' }}>
          <h3 className="text-lg font-semibold text-foreground text-center mb-6">
            What happens next
          </h3>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-7 top-8 bottom-8 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-primary/20" />

            <div className="space-y-4">
              {NEXT_STEPS.map((step, index) => (
                <div
                  key={step.title}
                  className="flex items-start gap-4 section-enter"
                  style={{ animationDelay: `${400 + index * 100}ms` }}
                >
                  <div className="relative z-10 w-14 h-14 rounded-2xl bg-card border border-border shadow-soft flex items-center justify-center flex-shrink-0">
                    <step.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="pt-2">
                    <p className="font-semibold text-foreground">{step.title}</p>
                    <p className="text-micro text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
