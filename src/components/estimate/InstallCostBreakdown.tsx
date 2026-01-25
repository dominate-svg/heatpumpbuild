import { Info, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { ContributionResult, ContributionExplanation } from '@/lib/estimateInstallCost';
import { formatContribution } from '@/lib/estimateInstallCost';

interface InstallCostBreakdownProps {
  result: ContributionResult;
  className?: string;
}

export function InstallCostBreakdown({ result, className }: InstallCostBreakdownProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  const isZeroContribution = result.contribution === 0;
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Main contribution display */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-5 sm:p-6 border border-primary/20">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">Estimated customer contribution</p>
          <p className="text-3xl sm:text-4xl font-bold text-foreground">
            {formatContribution(result.contribution)}
          </p>
          {isZeroContribution && (
            <div className="flex items-center justify-center gap-2 mt-2 text-green-600 dark:text-green-400">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm font-medium">Covered by BUS grant</span>
            </div>
          )}
        </div>
      </div>

      {/* How we calculated this */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" />
            <span className="font-medium text-sm">How we calculated this</span>
          </div>
          {showDetails ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
        
        {showDetails && (
          <div className="px-4 pb-4 space-y-4 animate-fade-in">
            {/* Intro text */}
            <div className="text-sm text-muted-foreground space-y-2 pt-2 border-t border-border">
              <p>
                We start from <span className="font-semibold text-foreground">£0</span>, because the £7,500 Boiler Upgrade Scheme grant usually covers a standard heat pump installation.
              </p>
              {result.explanations.length > 0 && (
                <p>
                  We then add a contribution only where your Energy Performance Certificate (EPC) suggests extra work may be required:
                </p>
              )}
            </div>
            
            {/* Breakdown items */}
            {result.explanations.length > 0 ? (
              <div className="space-y-3">
                {result.explanations.map((item: ContributionExplanation) => (
                  <ExplanationItem key={item.key} item={item} />
                ))}
                
                {/* Total */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="font-semibold text-foreground">Total contribution</span>
                  <span className="font-bold text-lg text-primary">
                    {formatContribution(result.contribution)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3 border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-700 dark:text-green-300">
                  Your property's EPC data suggests a straightforward installation that should be fully covered by the BUS grant.
                </p>
              </div>
            )}
            
            {/* Disclaimer */}
            <p className="text-xs text-muted-foreground pt-2 border-t border-border">
              This is an estimate based on EPC data. Your final price will be confirmed after a home survey.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ExplanationItem({ item }: { item: ContributionExplanation }) {
  return (
    <div className="flex items-start justify-between gap-3 bg-muted/30 rounded-lg p-3">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-foreground">{item.label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
      </div>
      <span className="text-sm font-semibold text-foreground whitespace-nowrap">
        +{formatContribution(item.amount)}
      </span>
    </div>
  );
}
