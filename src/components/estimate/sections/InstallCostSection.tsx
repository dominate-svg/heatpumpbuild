import { useMemo } from 'react';
import { ArrowLeft, PoundSterling, Award, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { EPCData } from '@/lib/calculations';
import { estimateContributionFromEpc, type ContributionResult } from '@/lib/estimateInstallCost';
import { InstallCostBreakdown } from '@/components/estimate/InstallCostBreakdown';

interface InstallCostSectionProps {
  epcData: EPCData;
  onContinue: () => void;
  onBack: () => void;
}

export function InstallCostSection({ 
  epcData, 
  onContinue, 
  onBack 
}: InstallCostSectionProps) {
  const installResult = useMemo(() => {
    return estimateContributionFromEpc(epcData);
  }, [epcData]);
  
  const hasError = 'error' in installResult;
  
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
        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-primary/10 mb-3 sm:mb-4">
          <PoundSterling className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
          Your install cost estimate
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground px-2">
          Based on your property's EPC data
        </p>
      </div>

      {hasError ? (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>{installResult.error}</AlertDescription>
        </Alert>
      ) : (
        <InstallCostBreakdown
          result={installResult as ContributionResult}
          className="mb-6"
        />
      )}

      {/* Grant info */}
      <div className="bg-green-50 dark:bg-green-950/30 rounded-xl p-4 mb-6 border border-green-200 dark:border-green-800">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0">
            <Award className="w-4 h-4 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="font-medium text-green-800 dark:text-green-200 text-sm">
              £7,500 BUS Grant
            </p>
            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
              The Boiler Upgrade Scheme grant covers a standard installation. We handle all the paperwork for you.
            </p>
          </div>
        </div>
      </div>

      {/* Survey note */}
      <div className="bg-muted/30 rounded-xl p-4 mb-6 border border-border/50">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">This is an estimate.</span>{' '}
          Your final price will be confirmed after a home survey, where we assess your specific requirements.
        </p>
      </div>

      {/* CTA */}
      <Button 
        onClick={onContinue}
        size="lg"
        className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold active:scale-[0.98] transition-all cta-hover-lift"
        disabled={hasError}
      >
        Continue →
      </Button>
    </section>
  );
}
