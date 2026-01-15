import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssumptions } from '@/hooks/useAssumptions';
import { useTariffs, type Tariff } from '@/hooks/useTariffs';
import { calculateEstimate } from '@/lib/calculations';
import type { EPCData } from '@/lib/calculations';
import { Loader2 } from 'lucide-react';

// Section components
import { StickyEstimatePanel } from '@/components/estimate/StickyEstimatePanel';
import { EducationSection } from '@/components/estimate/sections/EducationSection';
import { InitialEstimateSection } from '@/components/estimate/sections/InitialEstimateSection';
import { EfficiencySection } from '@/components/estimate/sections/EfficiencySection';
import { FineTuneSection } from '@/components/estimate/sections/FineTuneSection';
import { FinalEstimateSection } from '@/components/estimate/sections/FinalEstimateSection';
import { ContactStep } from '@/components/wizard/steps/ContactStep';

function detectFuelType(mainFuel?: string): string {
  if (!mainFuel) return 'gas';
  const fuel = mainFuel.toLowerCase();
  if (fuel.includes('oil')) return 'oil';
  if (fuel.includes('lpg') || fuel.includes('bottled')) return 'lpg';
  if (fuel.includes('electric')) return 'electric';
  return 'gas';
}

// Simplified 6-step flow: education → initial-estimate → efficiency → finetune → final-estimate → booking
const STEPS = ['education', 'initial-estimate', 'efficiency', 'finetune', 'final-estimate', 'booking'];

export default function Estimate() {
  const navigate = useNavigate();
  const { data: assumptions, isLoading: assumptionsLoading } = useAssumptions();
  const { data: tariffs, isLoading: tariffsLoading } = useTariffs();
  const contentRef = useRef<HTMLDivElement>(null);
  
  const [epcData, setEpcData] = useState<EPCData | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  
  // Config state - start with lowest cost defaults
  const [selectedTariff, setSelectedTariff] = useState<Tariff | null>(null);
  const [locationAdder, setLocationAdder] = useState<'included' | '6m' | '9m'>('included');
  const [cylinderOption, setCylinderOption] = useState<'existing' | '150l' | '210l'>('existing');
  const [currentFuel, setCurrentFuel] = useState<string>('gas');
  const [scop, setScop] = useState(3.4);

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

  const baseResults = useMemo(() => {
    if (!epcData || !assumptions) return null;
    return calculateEstimate({
      floorArea: epcData.totalFloorArea || 100,
      heatingCostCurrent: epcData.heatingCostCurrent,
      spaceHeatingDemand: epcData.spaceHeatingDemand,
      currentFuel,
      propertyType: epcData.propertyType,
      region: epcData.region || 'England',
      epcBand: epcData.epcBand,
      scop: 3.4,
      tariff: selectedTariff,
      locationAdder,
      cylinderOption,
    }, assumptions);
  }, [epcData, assumptions, selectedTariff, locationAdder, cylinderOption, currentFuel]);

  const goNext = useCallback(() => {
    setCurrentStep(s => Math.min(s + 1, STEPS.length - 1));
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const goBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(s => s - 1);
      contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);

  const isLoading = assumptionsLoading || tariffsLoading;

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

  // Show sticky panel after initial estimate (step 2+)
  const showStickyPanel = currentStep >= 2 && currentStep < STEPS.length - 1;

  const guideContext = { 
    epcBand: epcData.epcBand, 
    floorArea: epcData.totalFloorArea, 
    currentFuel, 
    installCost: results?.customerContribution, 
    savings: results?.estimatedSavings 
  };

  const renderSection = () => {
    switch (STEPS[currentStep]) {
      case 'education': 
        return <EducationSection onContinue={goNext} />;
      case 'initial-estimate': 
        return results ? <InitialEstimateSection results={results} currentFuel={currentFuel} onContinue={goNext} onBack={goBack} /> : null;
      case 'efficiency': 
        return assumptions ? <EfficiencySection scop={scop} onScopChange={setScop} results={results} baseResults={baseResults} assumptions={assumptions} onContinue={goNext} onBack={goBack} /> : null;
      case 'finetune': 
        return assumptions ? <FineTuneSection locationAdder={locationAdder} cylinderOption={cylinderOption} onLocationChange={setLocationAdder} onCylinderChange={setCylinderOption} onContinue={goNext} onBack={goBack} assumptions={assumptions} /> : null;
      case 'final-estimate': 
        return results ? <FinalEstimateSection results={results} currentFuel={currentFuel} context={guideContext} onContinue={goNext} onBack={goBack} /> : null;
      case 'booking': 
        return results && assumptions ? <ContactStep epcData={epcData} results={results} assumptions={assumptions} scop={scop} selectedTariff={selectedTariff} currentFuel={currentFuel} locationAdder={locationAdder} cylinderOption={cylinderOption} onBack={goBack} /> : null;
      default: 
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="overflow-y-auto min-h-screen" ref={contentRef}>
        <div className="max-w-lg mx-auto px-4 sm:px-6 pb-32 lg:pb-6">
          {renderSection()}
        </div>
      </div>

      {showStickyPanel && results && (
        <StickyEstimatePanel results={results} currentFuel={currentFuel} />
      )}
    </div>
  );
}
