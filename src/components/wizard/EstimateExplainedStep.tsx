import { useState, useEffect } from 'react';
import { PoundSterling, Gift, TrendingUp, TrendingDown, Clock, Info, ArrowRight, ArrowLeft, Sparkles, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCurrency } from '@/lib/calculations';
import { useCountUp } from '@/hooks/useCountUp';
import { useTariffs, formatTariffLabel, type Tariff } from '@/hooks/useTariffs';
import type { EstimateResults, Assumptions } from '@/lib/calculations';
import { cn } from '@/lib/utils';

interface EstimateExplainedStepProps {
  results: EstimateResults;
  assumptions: Assumptions;
  selectedTariff: Tariff | null;
  onTariffChange: (tariff: Tariff) => void;
  onContinue: () => void;
  onBack: () => void;
}

interface MetricCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  description: string;
  variant?: 'default' | 'success' | 'warning' | 'grant';
  delay?: number;
}

function MetricCard({ icon: Icon, label, value, prefix = '£', suffix = '', description, variant = 'default', delay = 0 }: MetricCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { value: displayValue } = useCountUp(isVisible ? value : 0, { duration: 600 });

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const variantStyles = {
    default: 'border-border',
    success: 'border-green-200 bg-green-50/50',
    warning: 'border-amber-200 bg-amber-50/50',
    grant: 'border-primary/20 bg-primary/5',
  };

  const valueStyles = {
    default: 'text-foreground',
    success: 'text-green-600',
    warning: 'text-amber-600',
    grant: 'text-primary',
  };

  return (
    <div className={cn(
      'bg-card rounded-2xl border shadow-soft p-6 transition-all duration-500',
      variantStyles[variant],
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    )}>
      <div className="flex items-start gap-4">
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
          variant === 'grant' ? 'bg-primary/10' : 'bg-muted'
        )}>
          <Icon className={cn(
            'w-6 h-6',
            variant === 'grant' ? 'text-primary' : 'text-muted-foreground'
          )} />
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <p className={cn('text-3xl font-bold mb-2', valueStyles[variant])}>
            {prefix}{displayValue.toLocaleString()}{suffix}
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}

export function EstimateExplainedStep({
  results,
  assumptions,
  selectedTariff,
  onTariffChange,
  onContinue,
  onBack,
}: EstimateExplainedStepProps) {
  const { data: tariffs, isLoading: tariffsLoading } = useTariffs();
  const [showTariffExplainer, setShowTariffExplainer] = useState(false);

  const { customerContribution, grantApplied, estimatedSavings } = results;
  const isNegativeSavings = estimatedSavings < 0;
  const displaySavings = Math.abs(estimatedSavings);

  const handleTariffChange = (tariffId: string) => {
    const tariff = tariffs?.find(t => t.id === tariffId);
    if (tariff) onTariffChange(tariff);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-3xl mx-auto px-6 py-12">
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
          <h1 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight mb-4">
            Your estimate
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Here's a realistic estimate based on your EPC and typical usage.
          </p>
        </div>

        {/* Metric cards */}
        <div className="space-y-4 mb-8">
          <MetricCard
            icon={PoundSterling}
            label="Estimated install cost"
            value={customerContribution}
            description="This includes the heat pump, installation, and commissioning."
            delay={100}
          />

          <MetricCard
            icon={Gift}
            label="Government grant included"
            value={grantApplied}
            description="£7,500 Boiler Upgrade Scheme support. We handle the paperwork."
            variant="grant"
            delay={250}
          />

          <MetricCard
            icon={isNegativeSavings ? TrendingDown : TrendingUp}
            label="Estimated annual savings"
            value={displaySavings}
            prefix={isNegativeSavings ? '-£' : '£'}
            suffix="/yr"
            description="We compare your current fuel cost to heat pump running costs on your chosen tariff."
            variant={isNegativeSavings ? 'warning' : 'success'}
            delay={400}
          />
        </div>

        {/* Confidence note */}
        <div className="bg-muted/50 rounded-xl p-4 mb-10 section-enter" style={{ animationDelay: '550ms' }}>
          <p className="text-sm text-muted-foreground text-center">
            Estimates vary by how warm you like your home, insulation, and tariff. Survey confirms.
          </p>
        </div>

        {/* Why tariffs matter - explainer */}
        <div className="bg-card rounded-2xl border border-border shadow-soft p-6 mb-8 section-enter" style={{ animationDelay: '600ms' }}>
          <div className="flex items-start gap-4 mb-6">
            {/* Illustration placeholder */}
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Clock className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Why tariffs matter</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A heat pump uses electricity. On Cosy tariff, you get 8 hours of cheaper electricity each day, which can lower running costs.
              </p>
            </div>
          </div>

          {/* Tariff selector */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-foreground">
              Choose the electricity tariff for your estimate
            </label>
            <Select
              value={selectedTariff?.id || ''}
              onValueChange={handleTariffChange}
              disabled={tariffsLoading}
            >
              <SelectTrigger className="w-full h-12 rounded-xl">
                <SelectValue placeholder="Select tariff..." />
              </SelectTrigger>
              <SelectContent>
                {tariffs?.map((tariff) => (
                  <SelectItem key={tariff.id} value={tariff.id}>
                    <div className="flex items-center gap-2">
                      {tariff.name.toLowerCase().includes('cosy') && (
                        <Sparkles className="w-3 h-3 text-primary" />
                      )}
                      {formatTariffLabel(tariff)}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              If you're not sure, leave it on Cosy — it's designed for heat pumps.
            </p>

            {/* Inline explainer (not accordion) */}
            <button
              onClick={() => setShowTariffExplainer(!showTariffExplainer)}
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
            >
              What's this?
              <ChevronDown className={cn('w-3 h-3 transition-transform', showTariffExplainer && 'rotate-180')} />
            </button>

            {showTariffExplainer && (
              <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground space-y-2 animate-fade-in">
                <p>• Cosy has cheaper electricity at set times each day.</p>
                <p>• The heat pump can pre-heat your home during cheap hours.</p>
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center section-enter" style={{ animationDelay: '700ms' }}>
          <Button
            onClick={onContinue}
            size="lg"
            className="h-14 px-10 text-base font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
          >
            Personalise my estimate
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
