import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { LeadCaptureForm } from '@/components/LeadCaptureForm';
import { WizardProgress } from '@/components/wizard/WizardProgress';
import { PreparingEstimate } from '@/components/wizard/PreparingEstimate';
import { YourHomeStep } from '@/components/wizard/YourHomeStep';
import { YourEstimateStep } from '@/components/wizard/YourEstimateStep';
import { FineTuneStep } from '@/components/wizard/FineTuneStep';
import { useAssumptions } from '@/hooks/useAssumptions';
import { useTariffs, type Tariff } from '@/hooks/useTariffs';
import { calculateEstimate } from '@/lib/calculations';
import type { EPCData } from '@/lib/calculations';
import { Loader2 } from 'lucide-react';

// Helper to detect fuel type from EPC data
function detectFuelType(mainFuel?: string): string {
  if (!mainFuel) return 'gas';
  const fuel = mainFuel.toLowerCase();
  if (fuel.includes('oil')) return 'oil';
  if (fuel.includes('lpg') || fuel.includes('bottled')) return 'lpg';
  if (fuel.includes('electric')) return 'electric';
  return 'gas';
}

type WizardStep = 'preparing' | 'home' | 'estimate' | 'finetune';

const WIZARD_STEPS = [
  { label: 'Your home' },
  { label: 'Your estimate' },
  { label: 'Fine-tune & book' },
];

export default function Estimate() {
  const navigate = useNavigate();
  const { data: assumptions, isLoading: assumptionsLoading } = useAssumptions();
  const { data: tariffs, isLoading: tariffsLoading } = useTariffs();
  
  const [epcData, setEpcData] = useState<EPCData | null>(null);
  const [wizardStep, setWizardStep] = useState<WizardStep>('preparing');
  const [showLeadForm, setShowLeadForm] = useState(false);
  
  // Estimate configuration state
  const [scop, setScop] = useState(3.4);
  const [selectedTariff, setSelectedTariff] = useState<Tariff | null>(null);
  const [locationAdder, setLocationAdder] = useState<'included' | '6m' | '9m'>('included');
  const [cylinderOption, setCylinderOption] = useState<'existing' | '150l' | '210l'>('existing');
  const [currentFuel, setCurrentFuel] = useState<string>('gas');

  useEffect(() => {
    const stored = sessionStorage.getItem('epcData');
    if (!stored) {
      navigate('/');
      return;
    }

    try {
      const parsed = JSON.parse(stored) as EPCData;
      setEpcData(parsed);
      setCurrentFuel(detectFuelType(parsed.mainFuel));
    } catch {
      sessionStorage.removeItem('epcData');
      navigate('/');
    }
  }, [navigate]);

  // Set default tariff when tariffs load
  useEffect(() => {
    if (tariffs && tariffs.length > 0 && !selectedTariff) {
      const defaultTariff = tariffs.find(t => t.name.toLowerCase().includes('cosy')) || tariffs[0];
      setSelectedTariff(defaultTariff);
    }
  }, [tariffs, selectedTariff]);

  const results = useMemo(() => {
    if (!epcData || !assumptions) return null;
    
    return calculateEstimate({
      floorArea: epcData.totalFloorArea || 100,
      heatingCostCurrent: epcData.heatingCostCurrent,
      spaceHeatingDemand: epcData.spaceHeatingDemand,
      currentFuel: currentFuel,
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

  // Navigation handlers
  const handlePreparingComplete = useCallback(() => {
    setWizardStep('home');
  }, []);

  const handleHomeComplete = useCallback(() => {
    setWizardStep('estimate');
  }, []);

  const handleEstimateComplete = useCallback(() => {
    setWizardStep('finetune');
  }, []);

  const handleBackToHome = useCallback(() => {
    setWizardStep('home');
  }, []);

  const handleBook = useCallback(() => {
    setShowLeadForm(true);
  }, []);

  const handleLeadSuccess = useCallback(() => {
    setShowLeadForm(false);
    // Could navigate to thank you page or show success state
  }, []);

  // Get current step number for progress indicator
  const getCurrentStepNumber = () => {
    switch (wizardStep) {
      case 'home': return 1;
      case 'estimate': return 2;
      case 'finetune': return 3;
      default: return 0;
    }
  };

  // Show loading while data loads
  if (isLoading || !epcData || !results || !assumptions) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show preparing screen
  if (wizardStep === 'preparing') {
    return <PreparingEstimate onComplete={handlePreparingComplete} />;
  }

  // Lead capture modal
  if (showLeadForm) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-lg mx-auto px-4 py-8">
          <div className="mb-4">
            <Button 
              variant="ghost" 
              onClick={() => setShowLeadForm(false)}
              className="text-muted-foreground"
            >
              ← Back to estimate
            </Button>
          </div>
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-4xl mx-auto py-6 sm:py-8">
        {/* Progress indicator */}
        <WizardProgress currentStep={getCurrentStepNumber()} steps={WIZARD_STEPS} />

        {/* Step content with transitions */}
        <div className="transition-all duration-300">
          {wizardStep === 'home' && (
            <YourHomeStep
              epcData={epcData}
              results={results}
              onContinue={handleHomeComplete}
            />
          )}

          {wizardStep === 'estimate' && (
            <YourEstimateStep
              results={results}
              assumptions={assumptions}
              onContinue={handleEstimateComplete}
            />
          )}

          {wizardStep === 'finetune' && (
            <FineTuneStep
              results={results}
              assumptions={assumptions}
              scop={scop}
              selectedTariff={selectedTariff}
              locationAdder={locationAdder}
              cylinderOption={cylinderOption}
              onScopChange={setScop}
              onTariffChange={setSelectedTariff}
              onLocationChange={setLocationAdder}
              onCylinderChange={setCylinderOption}
              onBack={handleBackToHome}
              onBook={handleBook}
            />
          )}
        </div>
      </main>
    </div>
  );
}
