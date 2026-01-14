import { ArrowLeft, Check, Calendar, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { EstimateResults, Assumptions, EPCData } from '@/lib/calculations';
import type { Tariff } from '@/hooks/useTariffs';
import { LeadCaptureForm } from '@/components/LeadCaptureForm';

interface BookingStepProps {
  epcData: EPCData;
  results: EstimateResults;
  assumptions: Assumptions;
  scop: number;
  selectedTariff: Tariff | null;
  currentFuel: string;
  locationAdder: 'included' | '6m' | '9m';
  cylinderOption: 'existing' | '150l' | '210l';
  onBack: () => void;
}

export function BookingStep({ 
  epcData,
  results, 
  assumptions,
  scop,
  selectedTariff,
  currentFuel,
  locationAdder,
  cylinderOption,
  onBack 
}: BookingStepProps) {
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
          Ready to take the next step?
        </h1>
        <p className="text-muted-foreground">
          Book a free home assessment — no obligation, no pressure
        </p>
      </div>

      {/* What happens next */}
      <div className="bg-muted/20 rounded-xl p-5 mb-6 border border-border/50">
        <h3 className="font-medium text-foreground mb-3">What happens next?</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">We visit your home</p>
              <p className="text-xs text-muted-foreground">Takes about 45 minutes</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">We measure and confirm</p>
              <p className="text-xs text-muted-foreground">Final design and price</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Shield className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">You decide</p>
              <p className="text-xs text-muted-foreground">No pressure to proceed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Estimate summary */}
      <div className="bg-card rounded-xl p-4 border border-border mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground">Your estimate</span>
          <span className="text-sm font-medium text-foreground">
            £{results.customerContribution.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground">Grant included</span>
          <span className="text-sm font-medium text-success">
            −£{results.grantApplied.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <span className="text-sm text-muted-foreground">Est. annual savings</span>
          <span className="text-sm font-medium text-foreground">
            £{Math.max(0, results.estimatedSavings).toLocaleString()}/year
          </span>
        </div>
      </div>

      {/* Lead capture form */}
      <LeadCaptureForm
        epcData={epcData}
        results={results}
        assumptions={assumptions}
        inputs={{
          scop,
          tariff: selectedTariff,
          currentFuel,
          propertyType: epcData.propertyType,
          region: epcData.region,
          locationAdder,
          cylinderOption,
        }}
      />

      {/* Trust note */}
      <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
        <Clock className="w-3.5 h-3.5" />
        <span>Takes 2 minutes • No spam • No obligation</span>
      </div>
    </div>
  );
}
