import { ArrowLeft, PoundSterling, Gift, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCountUp } from '@/hooks/useCountUp';
import type { EstimateResults, Assumptions } from '@/lib/calculations';

interface EstimateResultStepProps {
  results: EstimateResults;
  assumptions: Assumptions;
  onContinue: () => void;
  onBack: () => void;
}

function MetricCard({ 
  icon: Icon, 
  label, 
  value, 
  prefix = '£',
  suffix = '',
  description,
  highlight = false,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  description: string;
  highlight?: boolean;
}) {
  const { value: displayValue } = useCountUp(value, { duration: 800 });

  return (
    <div className={`bg-card rounded-2xl p-5 border ${highlight ? 'border-primary/30 bg-primary/5' : 'border-border'}`}>
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${highlight ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground'}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <p className="text-2xl font-semibold text-foreground">
            {prefix}{displayValue.toLocaleString()}{suffix}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
}

export function EstimateResultStep({ 
  results, 
  assumptions, 
  onContinue, 
  onBack 
}: EstimateResultStepProps) {
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
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground mb-2">
          Your estimate
        </h1>
        <p className="text-muted-foreground">
          Based on your EPC and the choices you made
        </p>
      </div>

      {/* Metric cards */}
      <div className="space-y-4 mb-6">
        <MetricCard
          icon={PoundSterling}
          label="Estimated install cost"
          value={results.customerContribution}
          description="Includes heat pump, installation, and commissioning"
        />
        
        <MetricCard
          icon={Gift}
          label="Government grant included"
          value={results.grantApplied}
          description="Boiler Upgrade Scheme — we handle the paperwork"
          highlight
        />
        
        <MetricCard
          icon={TrendingDown}
          label="Estimated annual savings"
          value={Math.max(0, results.estimatedSavings)}
          suffix="/year"
          description={`Compared to your current ${results.currentFuelType} heating`}
        />
      </div>

      {/* Confidence note */}
      <div className="bg-muted/20 rounded-xl p-4 mb-6 border border-border/50">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">This is a balanced estimate.</span>{' '}
          Your actual costs depend on how warm you like your home, insulation quality, and your tariff. 
          The home survey confirms the final price.
        </p>
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
