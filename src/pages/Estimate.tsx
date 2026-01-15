import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssumptions } from '@/hooks/useAssumptions';
import { useTariffs, type Tariff } from '@/hooks/useTariffs';
import { calculateEstimate } from '@/lib/calculations';
import type { EPCData } from '@/lib/calculations';
import { Loader2 } from 'lucide-react';

// New section components
import { StickyEstimatePanel } from '@/components/estimate/StickyEstimatePanel';
import { WelcomeSection } from '@/components/estimate/sections/WelcomeSection';
import { ConfirmHomeSection } from '@/components/estimate/sections/ConfirmHomeSection';
import { PrioritySection } from '@/components/estimate/sections/PrioritySection';
import { LocationSection } from '@/components/estimate/sections/LocationSection';
import { HotWaterSection } from '@/components/estimate/sections/HotWaterSection';
import { EfficiencySection } from '@/components/estimate/sections/EfficiencySection';
import { ReviewSection } from '@/components/estimate/sections/ReviewSection';
import { AssistantSection } from '@/components/estimate/sections/AssistantSection';
import { ContactStep } from '@/components/wizard/steps/ContactStep';
import { HeatingTypeStep } from '@/components/wizard/steps/HeatingTypeStep';

function detectFuelType(mainFuel?: string): string {
  if (!mainFuel) return 'gas';
  const fuel = mainFuel.toLowerCase();
  if (fuel.includes('oil')) return 'oil';
  if (fuel.includes('lpg') || fuel.includes('bottled')) return 'lpg';
  if (fuel.includes('electric')) return 'electric';
  return 'gas';
}

function peopleToCylinder(people: '1-2' | '3-4' | '5+'): 'existing' | '150l' | '210l' {
  switch (people) {
    case '1-2': return 'existing';
    case '3-4': return '150l';
    case '5+': return '210l';
  }
}

// Steps: welcome, confirm-home, priority, location, hot-water, efficiency, review, assistant, booking
const STEPS = ['welcome', 'confirm-home', 'priority', 'location', 'hot-water', 'efficiency', 'review', 'assistant', 'booking'];

export default function Estimate() {
  const navigate = useNavigate();
  const { data: assumptions, isLoading: assumptionsLoading } = useAssumptions();
  const { data: tariffs, isLoading: tariffsLoading } = useTariffs();
  const contentRef = useRef<HTMLDivElement>(null);
  
  const [epcData, setEpcData] = useState<EPCData | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [editingFuel, setEditingFuel] = useState(false);
  
  // Config state
  const [priority, setPriority] = useState<'upfront' | 'running' | 'future'>('running');
  const [selectedTariff, setSelectedTariff] = useState<Tariff | null>(null);
  const [locationAdder, setLocationAdder] = useState<'included' | '6m' | '9m'>('included');
  const [cylinderOption, setCylinderOption] = useState<'existing' | '150l' | '210l'>('150l');
  const [currentFuel, setCurrentFuel] = useState<string>('gas');
  const [scop, setScop] = useState(3.7);

  // Base SCOP for comparison
  const baseScop = 3.7;

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

  // Base results for comparison in efficiency section
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
      scop: baseScop,
      tariff: selectedTariff,
      locationAdder,
      cylinderOption,
    }, assumptions);
  }, [epcData, assumptions, baseScop, selectedTariff, locationAdder, cylinderOption, currentFuel]);

  const goNext = useCallback(() => {
    setCurrentStep(s => Math.min(s + 1, STEPS.length - 1));
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const goBack = useCallback(() => {
    if (editingFuel) {
      setEditingFuel(false);
    } else if (currentStep > 0) {
      setCurrentStep(s => s - 1);
      contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep, editingFuel]);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(step);
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

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

  const heatLossKw = results?.heatLossKw || 8;

  // Fuel editing mode
  if (editingFuel) {
    return (
      <div className="min-h-screen bg-background px-4 py-6">
        <div className="max-w-lg mx-auto">
          <HeatingTypeStep
            detectedFuel={detectFuelType(epcData.mainFuel)}
            selectedFuel={currentFuel}
            onSelect={(fuel) => { setCurrentFuel(fuel); setEditingFuel(false); }}
            onContinue={() => setEditingFuel(false)}
            onBack={() => setEditingFuel(false)}
          />
        </div>
      </div>
    );
  }

  // Show sticky panel after step 1
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
      case 'welcome': 
        return <WelcomeSection onStart={goNext} />;
      case 'confirm-home': 
        return <ConfirmHomeSection epcData={epcData} heatLossKw={heatLossKw} currentFuel={currentFuel} onEditFuel={() => setEditingFuel(true)} onContinue={goNext} />;
      case 'priority': 
        return <PrioritySection selectedPriority={priority} onSelect={setPriority} onContinue={goNext} />;
      case 'location': 
        return assumptions ? <LocationSection selectedLocation={locationAdder} onSelect={setLocationAdder} onContinue={goNext} assumptions={assumptions} /> : null;
      case 'hot-water': 
        return assumptions ? <HotWaterSection selectedCylinder={cylinderOption} onSelect={setCylinderOption} onContinue={goNext} assumptions={assumptions} /> : null;
      case 'efficiency': 
        return assumptions ? <EfficiencySection scop={scop} onScopChange={setScop} results={results} baseResults={baseResults} assumptions={assumptions} onContinue={goNext} /> : null;
      case 'review': 
        return results ? <ReviewSection results={results} currentFuel={currentFuel} onAskQuestions={() => goToStep(7)} onContinue={goNext} /> : null;
      case 'assistant': 
        return <AssistantSection context={guideContext} onBack={() => goToStep(6)} onContinue={goNext} />;
      case 'booking': 
        return results && assumptions ? <ContactStep epcData={epcData} results={results} assumptions={assumptions} scop={scop} selectedTariff={selectedTariff} currentFuel={currentFuel} locationAdder={locationAdder} cylinderOption={cylinderOption} onBack={goBack} /> : null;
      default: 
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Main content */}
      <div className="overflow-y-auto min-h-screen" ref={contentRef}>
        <div className="max-w-lg mx-auto px-4 sm:px-6 pb-32 lg:pb-6">
          {renderSection()}
        </div>
      </div>

      {/* Sticky estimate panel */}
      {showStickyPanel && results && (
        <StickyEstimatePanel results={results} currentFuel={currentFuel} />
      )}
    </div>
  );
}
