import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { LeadCaptureForm } from '@/components/LeadCaptureForm';
import { CheckingHomeStep } from '@/components/wizard/CheckingHomeStep';
import { HeatPumpPrimerStep } from '@/components/wizard/HeatPumpPrimerStep';
import { HomeSnapshotStep } from '@/components/wizard/HomeSnapshotStep';
import { EstimateExplainedStep } from '@/components/wizard/EstimateExplainedStep';
import { PersonaliseBookStep } from '@/components/wizard/PersonaliseBookStep';
import { AIAssistantPanel } from '@/components/wizard/AIAssistantPanel';
import { useAssumptions } from '@/hooks/useAssumptions';
import { useTariffs, type Tariff } from '@/hooks/useTariffs';
import { calculateEstimate } from '@/lib/calculations';
import type { EPCData } from '@/lib/calculations';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

function detectFuelType(mainFuel?: string): string {
  if (!mainFuel) return 'gas';
  const fuel = mainFuel.toLowerCase();
  if (fuel.includes('oil')) return 'oil';
  if (fuel.includes('lpg') || fuel.includes('bottled')) return 'lpg';
  if (fuel.includes('electric')) return 'electric';
  return 'gas';
}

type WizardStep = 'checking' | 'primer' | 'snapshot' | 'estimate' | 'personalise' | 'booking';

export default function Estimate() {
  const navigate = useNavigate();
  const { data: assumptions, isLoading: assumptionsLoading } = useAssumptions();
  const { data: tariffs, isLoading: tariffsLoading } = useTariffs();
  
  const [epcData, setEpcData] = useState<EPCData | null>(null);
  const [step, setStep] = useState<WizardStep>('checking');
  
  // Configuration state
  const [scop, setScop] = useState(3.4);
  const [selectedTariff, setSelectedTariff] = useState<Tariff | null>(null);
  const [locationAdder, setLocationAdder] = useState<'included' | '6m' | '9m'>('included');
  const [cylinderOption, setCylinderOption] = useState<'existing' | '150l' | '210l'>('existing');
  const [currentFuel, setCurrentFuel] = useState<string>('gas');

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

  // Navigation callbacks
  const goToPrimer = useCallback(() => setStep('primer'), []);
  const goToSnapshot = useCallback(() => setStep('snapshot'), []);
  const goToEstimate = useCallback(() => setStep('estimate'), []);
  const goToPersonalise = useCallback(() => setStep('personalise'), []);
  const goToBooking = useCallback(() => setStep('booking'), []);

  if (isLoading || !epcData || !results || !assumptions) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center section-enter">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Booking form
  if (step === 'booking') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-lg mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => setStep('personalise')} className="mb-6">
            ← Back
          </Button>
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
        </main>
        <AIAssistantPanel currentStep="booking" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Header - hidden during checking step */}
      <div className={cn(
        'transition-all duration-300',
        step === 'checking' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      )}>
        <Header />
      </div>
      
      <main>
        {/* Step 0: Checking your home */}
        {step === 'checking' && (
          <CheckingHomeStep onComplete={goToPrimer} />
        )}

        {/* Step 1: Heat pump primer */}
        {step === 'primer' && (
          <HeatPumpPrimerStep onContinue={goToSnapshot} />
        )}

        {/* Step 2: Home snapshot */}
        {step === 'snapshot' && (
          <HomeSnapshotStep
            epcData={epcData}
            results={results}
            onContinue={goToEstimate}
            onBack={goToPrimer}
          />
        )}

        {/* Step 3: Estimate explained */}
        {step === 'estimate' && (
          <EstimateExplainedStep
            results={results}
            assumptions={assumptions}
            selectedTariff={selectedTariff}
            onTariffChange={setSelectedTariff}
            onContinue={goToPersonalise}
            onBack={goToSnapshot}
          />
        )}

        {/* Step 4: Personalise + Book */}
        {step === 'personalise' && (
          <PersonaliseBookStep
            results={results}
            assumptions={assumptions}
            scop={scop}
            selectedTariff={selectedTariff}
            locationAdder={locationAdder}
            cylinderOption={cylinderOption}
            onScopChange={setScop}
            onLocationChange={setLocationAdder}
            onCylinderChange={setCylinderOption}
            onBook={goToBooking}
            onBack={goToEstimate}
          />
        )}
      </main>

      {/* AI Assistant - visible on all steps except checking */}
      <AIAssistantPanel
        currentStep={step}
        epcBand={results.epcBand}
        currentFuel={currentFuel}
        selectedTariff={selectedTariff?.name}
        efficiency={scop}
        isVisible={step !== 'checking'}
      />
    </div>
  );
}
