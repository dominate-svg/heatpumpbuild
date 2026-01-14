import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssumptions } from '@/hooks/useAssumptions';
import { useTariffs, type Tariff } from '@/hooks/useTariffs';
import { calculateEstimate, getRadiatorsForEfficiency } from '@/lib/calculations';
import type { EPCData } from '@/lib/calculations';
import { Loader2 } from 'lucide-react';

// Wizard components
import { WizardProgress } from '@/components/wizard/WizardProgress';
import { HomeDataStep } from '@/components/wizard/steps/HomeDataStep';
import { WhatChangesStep } from '@/components/wizard/steps/WhatChangesStep';
import { PreferenceStep, preferenceToScop } from '@/components/wizard/steps/PreferenceStep';
import { FineTuneStep, peopleToCylinder } from '@/components/wizard/steps/FineTuneStep';
import { YourEstimateStep } from '@/components/wizard/steps/YourEstimateStep';
import { AIAssistantStep } from '@/components/wizard/steps/AIAssistantStep';
import { ContactStep } from '@/components/wizard/steps/ContactStep';
import { HeatingTypeStep } from '@/components/wizard/steps/HeatingTypeStep';

// Fuel detection
function detectFuelType(mainFuel?: string): string {
  if (!mainFuel) return 'gas';
  const fuel = mainFuel.toLowerCase();
  if (fuel.includes('oil')) return 'oil';
  if (fuel.includes('lpg') || fuel.includes('bottled')) return 'lpg';
  if (fuel.includes('electric')) return 'electric';
  return 'gas';
}

const STEP_LABELS = [
  'Your home',
  'How it works',
  'Preferences',
  'Fine-tune',
  'Estimate',
  'Questions',
  'Book survey',
];

// Sub-step for fuel editing
type SubStep = 'main' | 'edit-fuel';

export default function Estimate() {
  const navigate = useNavigate();
  const { data: assumptions, isLoading: assumptionsLoading } = useAssumptions();
  const { data: tariffs, isLoading: tariffsLoading } = useTariffs();
  
  const [epcData, setEpcData] = useState<EPCData | null>(null);
  const [step, setStep] = useState(1);
  const [subStep, setSubStep] = useState<SubStep>('main');
  
  // Configuration state
  const [preference, setPreference] = useState<'upfront' | 'running' | 'future' | null>('running');
  const [selectedTariff, setSelectedTariff] = useState<Tariff | null>(null);
  const [locationAdder, setLocationAdder] = useState<'included' | '6m' | '9m'>('included');
  const [people, setPeople] = useState<'1-2' | '3-4' | '5+'>('3-4');
  const [currentFuel, setCurrentFuel] = useState<string>('gas');

  // Derived values
  const scop = preferenceToScop(preference);
  const cylinderOption = peopleToCylinder(people);

  useEffect(() => {
    const stored = sessionStorage.getItem('epcData');
    if (!stored) { navigate('/'); return; }
    try {
      const parsed = JSON.parse(stored) as EPCData;
      setEpcData(parsed);
      setCurrentFuel(detectFuelType(parsed.mainFuel));
    } catch { 
      sessionStorage.removeItem('epcData'); 
      navigate('/'); 
    }
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
  const goNext = useCallback(() => setStep(s => Math.min(s + 1, 7)), []);
  const goBack = useCallback(() => {
    if (subStep !== 'main') {
      setSubStep('main');
    } else if (step > 1) {
      setStep(s => s - 1);
    } else {
      navigate('/');
    }
  }, [step, subStep, navigate]);

  const handleEditFuel = () => setSubStep('edit-fuel');
  const handleFuelSelected = (fuel: string) => {
    setCurrentFuel(fuel);
    setSubStep('main');
  };

  if (isLoading || !epcData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your estimate...</p>
        </div>
      </div>
    );
  }

  // Calculate heat loss and radiators for display
  const heatLossKw = results?.heatLossKw || 8;
  const likelyRadiators = getRadiatorsForEfficiency(scop);

  // Render sub-step if active
  if (subStep === 'edit-fuel') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
          <div className="max-w-lg mx-auto">
            <WizardProgress
              currentStep={step}
              totalSteps={7}
              stepLabel="Edit heating type"
            />
          </div>
        </div>
        <div className="flex items-start justify-center px-4 py-6">
          <div className="w-full max-w-lg">
            <HeatingTypeStep
              detectedFuel={detectFuelType(epcData.mainFuel)}
              selectedFuel={currentFuel}
              onSelect={handleFuelSelected}
              onContinue={() => setSubStep('main')}
              onBack={() => setSubStep('main')}
            />
          </div>
        </div>
      </div>
    );
  }

  // Step content renderer
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <HomeDataStep
            epcData={epcData}
            heatLossKw={heatLossKw}
            likelyRadiators={likelyRadiators}
            currentFuel={currentFuel}
            onEditFuel={handleEditFuel}
            onContinue={goNext}
            onBack={goBack}
          />
        );
      case 2:
        return <WhatChangesStep onContinue={goNext} onBack={goBack} />;
      case 3:
        return (
          <PreferenceStep
            selectedPreference={preference}
            onSelect={setPreference}
            onContinue={goNext}
            onBack={goBack}
          />
        );
      case 4:
        return (
          <FineTuneStep
            selectedLocation={locationAdder}
            selectedPeople={people}
            onSelectLocation={setLocationAdder}
            onSelectPeople={setPeople}
            onContinue={goNext}
            onBack={goBack}
          />
        );
      case 5:
        return results && assumptions ? (
          <YourEstimateStep
            results={results}
            assumptions={assumptions}
            currentFuel={currentFuel}
            onContinue={goNext}
            onBack={goBack}
          />
        ) : null;
      case 6:
        return results ? (
          <AIAssistantStep
            results={results}
            currentFuel={currentFuel}
            epcBand={epcData.epcBand}
            onContinue={goNext}
            onBack={goBack}
          />
        ) : null;
      case 7:
        return results && assumptions ? (
          <ContactStep
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
      {/* Progress bar - fixed at top */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="max-w-lg mx-auto">
          <WizardProgress
            currentStep={step}
            totalSteps={7}
            stepLabel={STEP_LABELS[step - 1]}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="flex items-start justify-center px-4 py-6">
        <div className="w-full max-w-lg">
          {renderStep()}
        </div>
      </div>
    </div>
  );
}
