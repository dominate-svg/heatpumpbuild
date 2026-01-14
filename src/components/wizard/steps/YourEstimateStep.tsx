import { ArrowLeft, PoundSterling, Gift, TrendingDown, Zap, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCountUp } from '@/hooks/useCountUp';
import type { EstimateResults, Assumptions } from '@/lib/calculations';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface YourEstimateStepProps {
  results: EstimateResults;
  assumptions: Assumptions;
  currentFuel: string;
  onContinue: () => void;
  onBack: () => void;
}

const FUEL_LABELS: Record<string, string> = {
  gas: 'gas',
  oil: 'oil',
  lpg: 'LPG',
  electric: 'electric',
};

interface EstimateCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  description: string;
  variant?: 'default' | 'success' | 'highlight';
  tooltip?: string;
}

function EstimateCard({ 
  icon, 
  label, 
  value, 
  prefix = '£', 
  suffix = '',
  description, 
  variant = 'default',
  tooltip 
}: EstimateCardProps) {
  const { value: displayValue } = useCountUp(value, { duration: 1200 });
  
  return (
    <div className={cn(
      'rounded-xl border p-5',
      variant === 'success' && 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900',
      variant === 'highlight' && 'bg-primary/5 border-primary/20',
      variant === 'default' && 'bg-card border-border'
    )}>
      <div className="flex items-start gap-3 mb-3">
        <div className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
          variant === 'success' && 'bg-green-100 dark:bg-green-900/30',
          variant === 'highlight' && 'bg-primary/10',
          variant === 'default' && 'bg-muted'
        )}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">{label}</span>
            {tooltip && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-muted-foreground/60 hover:text-muted-foreground">
                      <Info className="w-3.5 h-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm">{tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </div>
      
      <p className={cn(
        'text-3xl font-bold mb-1',
        variant === 'success' && 'text-green-700 dark:text-green-400',
        variant === 'highlight' && 'text-primary',
        variant === 'default' && 'text-foreground'
      )}>
        {prefix}{displayValue.toLocaleString()}{suffix}
      </p>
      
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function YourEstimateStep({ 
  results, 
  assumptions,
  currentFuel,
  onContinue, 
  onBack 
}: YourEstimateStepProps) {
  const savingsPositive = results.estimatedSavings > 0;
  const fuelLabel = FUEL_LABELS[currentFuel] || 'current';
  
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

      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          Your estimate
        </h1>
        <p className="text-muted-foreground text-sm">
          Based on your home and preferences
        </p>
      </div>

      {/* Estimate cards */}
      <div className="space-y-4 mb-6">
        <EstimateCard
          icon={<PoundSterling className="w-5 h-5 text-muted-foreground" />}
          label="Install cost"
          value={results.grossInstallPrice}
          description="Full system including heat pump, cylinder, and installation."
          tooltip="This includes the heat pump unit, hot water cylinder, controls, and all installation labour."
        />

        <EstimateCard
          icon={<Gift className="w-5 h-5 text-primary" />}
          label="Government grant"
          value={results.grantApplied}
          prefix="-£"
          description="Boiler Upgrade Scheme grant applied automatically."
          variant="highlight"
          tooltip="The BUS grant covers up to £7,500 of your installation cost. We handle the paperwork."
        />

        <EstimateCard
          icon={<Zap className="w-5 h-5 text-muted-foreground" />}
          label="Running cost"
          value={Math.round(results.hpCost)}
          suffix="/year"
          description={`Estimated annual electricity cost with Cosy Octopus tariff.`}
          tooltip="This assumes you use a smart tariff that shifts heating to cheaper electricity periods."
        />

        <EstimateCard
          icon={<TrendingDown className={cn(
            'w-5 h-5',
            savingsPositive ? 'text-green-600' : 'text-orange-500'
          )} />}
          label="Annual savings"
          value={Math.abs(results.estimatedSavings)}
          prefix={savingsPositive ? '£' : '-£'}
          suffix="/year"
          description={savingsPositive 
            ? `Compared to your current ${fuelLabel} heating.`
            : `Your ${fuelLabel} is already cheap — savings come from price protection.`
          }
          variant={savingsPositive ? 'success' : 'default'}
          tooltip={savingsPositive
            ? "This is your estimated annual saving compared to your current heating costs."
            : "Even if savings are small now, heat pumps protect you from fossil fuel price rises."
          }
        />
      </div>

      {/* Net cost summary */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-5 mb-6 border border-primary/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Your cost after grant</span>
          <span className="text-2xl font-bold text-foreground">
            £{results.customerContribution.toLocaleString()}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          This is your expected contribution. Final price confirmed at survey.
        </p>
      </div>

      {/* Confidence note */}
      <div className="bg-muted/30 rounded-lg p-4 mb-6">
        <p className="text-sm text-muted-foreground text-center">
          {results.confidenceLabel}
        </p>
      </div>

      {/* CTA */}
      <Button 
        onClick={onContinue} 
        className="w-full h-12 text-base"
        size="lg"
      >
        I have questions →
      </Button>
    </div>
  );
}
