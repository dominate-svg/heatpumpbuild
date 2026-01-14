import { ArrowLeft, CheckCircle, Clock, Shield, Star } from 'lucide-react';
import { LeadCaptureForm } from '@/components/LeadCaptureForm';
import type { EPCData, EstimateResults, Assumptions } from '@/lib/calculations';
import type { Tariff } from '@/hooks/useTariffs';
import octopusPartnerLogo from '@/assets/octopus-partner.png';

interface ContactStepProps {
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

export function ContactStep({
  epcData,
  results,
  assumptions,
  scop,
  selectedTariff,
  currentFuel,
  locationAdder,
  cylinderOption,
  onBack,
}: ContactStepProps) {
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
          Book your free home survey
        </h1>
        <p className="text-muted-foreground text-sm">
          An expert will visit, measure everything, and confirm your quote.
        </p>
      </div>

      {/* What happens next */}
      <div className="bg-card rounded-xl border border-border p-4 mb-6">
        <h3 className="font-medium text-foreground mb-3">What happens next?</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-medium text-primary">1</span>
            </div>
            <div>
              <p className="text-sm text-foreground">We call to arrange a visit</p>
              <p className="text-xs text-muted-foreground">Usually within 2 working days</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-medium text-primary">2</span>
            </div>
            <div>
              <p className="text-sm text-foreground">Surveyor visits your home</p>
              <p className="text-xs text-muted-foreground">~1 hour to measure and confirm suitability</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-medium text-primary">3</span>
            </div>
            <div>
              <p className="text-sm text-foreground">You get a fixed quote</p>
              <p className="text-xs text-muted-foreground">No surprises — what we quote is what you pay</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trust badges */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Shield className="w-4 h-4" />
          <span>No obligation</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>2 min form</span>
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
          locationAdder,
          cylinderOption,
        }}
      />

      {/* Octopus partner badge */}
      <div className="mt-6 flex flex-col items-center gap-2">
        <img 
          src={octopusPartnerLogo} 
          alt="Octopus Energy Trusted Partner" 
          className="h-10 opacity-80"
        />
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span>4.8 average rating from 5,000+ customers</span>
        </div>
      </div>
    </div>
  );
}
