import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssumptions } from '@/hooks/useAssumptions';
import { useTariffs, type Tariff } from '@/hooks/useTariffs';
import { calculateEstimate } from '@/lib/calculations';
import type { EPCData } from '@/lib/calculations';
import { Loader2 } from 'lucide-react';

// Wizard components
import { WizardProgress } from '@/components/wizard/WizardProgress';
import { GuidePanel } from '@/components/wizard/GuidePanel';
import { WelcomeStep } from '@/components/wizard/steps/WelcomeStep';
import { InsulationStep } from '@/components/wizard/steps/InsulationStep';
import { HeatingTypeStep } from '@/components/wizard/steps/HeatingTypeStep';
import { HeatPumpExplainerStep } from '@/components/wizard/steps/HeatPumpExplainerStep';
import { ComfortStep } from '@/components/wizard/steps/ComfortStep';
import { LocationStep } from '@/components/wizard/steps/LocationStep';
import { HotWaterStep } from '@/components/wizard/steps/HotWaterStep';
import { EstimateResultStep } from '@/components/wizard/steps/EstimateResultStep';
import { SocialProofStep } from '@/components/wizard/steps/SocialProofStep';
import { BookingStep } from '@/components/wizard/steps/BookingStep';

function detectFuelType(mainFuel?: string): string {
  if (!mainFuel) return 'gas';
  const fuel = mainFuel.toLowerCase();
  if (fuel.includes('oil')) return 'oil';
  if (fuel.includes('lpg') || fuel.includes('bottled')) return 'lpg';
  if (fuel.includes('electric')) return 'electric';
  return 'gas';
}

const STEP_LABELS = [
  'Welcome',
  'Insulation',
  'Heating',
  'How it works',
  'Preference',
  'Location',
  'Hot water',
  'Your estimate',
  'Trust',
  'Book',
];

export default function Estimate() {
  const navigate = useNavigate();
  const { data: assumptions, isLoading: assumptionsLoading } = useAssumptions();
  const { data: tariffs, isLoading: tariffsLoading } = useTariffs();
  
  const [epcData, setEpcData] = useState<EPCData | null>(null);
  const [step, setStep] = useState(1);
  
  // Configuration state
  const [scop, setScop] = useState(3.7); // Default to balanced
  const [selectedTariff, setSelectedTariff] = useState<Tariff | null>(null);
  const [locationAdder, setLocationAdder] = useState<'included' | '6m' | '9m'>('included');
  const [cylinderOption, setCylinderOption] = useState<'existing' | '150l' | '210l'>('existing');
  const [currentFuel, setCurrentFuel] = useState<string>('gas');
  const [selectedInsulation, setSelectedInsulation] = useState<string>('');

  useEffect(() => {
    const stored = sessionStorage.getItem('epcData');
    if (!stored) { navigate('/'); return; }
    try {
      const parsed = JSON.parse(stored) as EPCData;
      setEpcData(parsed);
      setCurrentFuel(detectFuelType(parsed.mainFuel));
    } catch { sessionStorage.removeItem('epcData'); navigate('/'); }
  }, [navigate]);

  useEffect(() => {
    if (tariffs && tariffs.length > 0 && !selectedTariff) {
      setSelectedTariff(tariffs.find(t => t.name.toLowerCase().includes('cosy')) || tariffs[0]);
    }
  }, [tariffs, selectedTariff]);

  const results = useMemo(() => {
    if (!epcData || !assumptions) return null;
    return calculateEstimate({
      floorArea: epcData.totalFloorArea || 100,
      heatingCostCurrent: epcData.heatingCostCurrent,
      spaceHeatingDemand: epcData.spaceHeatingDemand,
      currentFuel,
      propertyType: epcData.propertyType,
      region: epcData.region || 'England',
      epcBand: epcData.epcBand,
      scop,
      tariff: selectedTariff,
      locationAdder,
      cylinderOption,
    }, assumptions);
  }, [epcData, assumptions, scop, selectedTariff, locationAdder, cylinderOption, currentFuel]);

  const isLoading = assumptionsLoading || tariffsLoading;

  // Navigation
  const goNext = useCallback(() => setStep(s => Math.min(s + 1, 10)), []);
  const goBack = useCallback(() => setStep(s => Math.max(s - 1, 1)), []);

  if (isLoading || !epcData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Step content renderer
  const renderStep = () => {
    switch (step) {
      case 1:
        return <WelcomeStep onContinue={goNext} />;
      case 2:
        return (
          <InsulationStep
            epcBand={epcData.epcBand}
            selectedInsulation={selectedInsulation}
            onSelect={setSelectedInsulation}
            onContinue={goNext}
            onBack={goBack}
          />
        );
      case 3:
        return (
          <HeatingTypeStep
            detectedFuel={detectFuelType(epcData.mainFuel)}
            selectedFuel={currentFuel}
            onSelect={setCurrentFuel}
            onContinue={goNext}
            onBack={goBack}
          />
        );
      case 4:
        return <HeatPumpExplainerStep onContinue={goNext} onBack={goBack} />;
      case 5:
        return (
          <ComfortStep
            selectedComfort={scop}
            onSelect={setScop}
            onContinue={goNext}
            onBack={goBack}
          />
        );
      case 6:
        return (
          <LocationStep
            selectedLocation={locationAdder}
            onSelect={setLocationAdder}
            onContinue={goNext}
            onBack={goBack}
          />
        );
      case 7:
        return (
          <HotWaterStep
            selectedCylinder={cylinderOption}
            onSelect={setCylinderOption}
            onContinue={goNext}
            onBack={goBack}
          />
        );
      case 8:
        return results && assumptions ? (
          <EstimateResultStep
            results={results}
            assumptions={assumptions}
            onContinue={goNext}
            onBack={goBack}
          />
        ) : null;
      case 9:
        return <SocialProofStep onContinue={goNext} onBack={goBack} />;
      case 10:
        return results && assumptions ? (
          <BookingStep
            epcData={epcData}
            results={results}
            assumptions={assumptions}
            scop={scop}
            selectedTariff={selectedTariff}
            currentFuel={currentFuel}
            locationAdder={locationAdder}
            cylinderOption={cylinderOption}
            onBack={goBack}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Main content area */}
        <div className="flex-1 flex flex-col">
          {/* Progress bar - fixed at top */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
            <div className="max-w-lg mx-auto">
              <WizardProgress
                currentStep={step}
                totalSteps={10}
                stepLabel={STEP_LABELS[step - 1]}
              />
            </div>
          </div>

          {/* Step content */}
          <div className="flex-1 flex items-start justify-center px-4 py-6 lg:py-8">
            <div className="w-full max-w-lg">
              {renderStep()}
            </div>
          </div>
        </div>

        {/* Guide panel - right side on desktop, bottom sheet on mobile */}
        <div className="hidden lg:block w-80 xl:w-96 border-l border-border bg-card">
          <div className="sticky top-0 h-screen overflow-hidden">
            <GuidePanel
              currentStep={step}
              stepLabel={STEP_LABELS[step - 1]}
              epcBand={epcData.epcBand}
              currentFuel={currentFuel}
              selectedTariff={selectedTariff?.name}
              efficiency={scop}
              estimateContext={results || undefined}
            />
          </div>
        </div>

        {/* Mobile guide panel trigger */}
        <MobileGuidePanel
          currentStep={step}
          stepLabel={STEP_LABELS[step - 1]}
          epcBand={epcData.epcBand}
          currentFuel={currentFuel}
          selectedTariff={selectedTariff?.name}
          efficiency={scop}
          estimateContext={results || undefined}
        />
      </div>
    </div>
  );
}

// Mobile guide panel component
import { MessageCircle, X } from 'lucide-react';

function MobileGuidePanel(props: React.ComponentProps<typeof GuidePanel>) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden">
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-40 w-14 h-14 rounded-full bg-primary shadow-lg flex items-center justify-center active:scale-95 transition-transform"
      >
        <MessageCircle className="w-6 h-6 text-primary-foreground" />
        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping-slow pointer-events-none" />
      </button>

      {/* Bottom sheet */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-x-0 bottom-0 z-50 h-[80vh] bg-card rounded-t-3xl shadow-elevated animate-slide-up">
            {/* Drag handle */}
            <div className="flex justify-center py-2">
              <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
            </div>
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
            <div className="h-full overflow-hidden">
              <GuidePanel {...props} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
