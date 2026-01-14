import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssumptions } from '@/hooks/useAssumptions';
import { useTariffs, type Tariff } from '@/hooks/useTariffs';
import { calculateEstimate } from '@/lib/calculations';
import type { EPCData } from '@/lib/calculations';
import { Loader2 } from 'lucide-react';

// Section components
import { GuidePanel, MobileGuideDrawer } from '@/components/estimate/GuidePanel';
import { WelcomeSection } from '@/components/estimate/sections/WelcomeSection';
import { HeatPumpExplainerSection } from '@/components/estimate/sections/HeatPumpExplainerSection';
import { HomeDataSection } from '@/components/estimate/sections/HomeDataSection';
import { InitialEstimateSection } from '@/components/estimate/sections/InitialEstimateSection';
import { PreferencesSection } from '@/components/estimate/sections/PreferencesSection';
import { FineTuneSection } from '@/components/estimate/sections/FineTuneSection';
import { BenefitsSection } from '@/components/estimate/sections/BenefitsSection';
import { FinalEstimateSection } from '@/components/estimate/sections/FinalEstimateSection';
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

function preferenceToScop(pref: 'upfront' | 'running' | 'future'): number {
  switch (pref) {
    case 'upfront': return 3.4;
    case 'running': return 3.7;
    case 'future': return 4.0;
  }
}

const SECTION_NAMES = ['welcome', 'explainer', 'home-data', 'initial-estimate', 'preferences', 'fine-tune', 'benefits', 'final-estimate', 'booking'];

export default function Estimate() {
  const navigate = useNavigate();
  const { data: assumptions, isLoading: assumptionsLoading } = useAssumptions();
  const { data: tariffs, isLoading: tariffsLoading } = useTariffs();
  const contentRef = useRef<HTMLDivElement>(null);
  
  const [epcData, setEpcData] = useState<EPCData | null>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [editingFuel, setEditingFuel] = useState(false);
  
  // Config state
  const [preference, setPreference] = useState<'upfront' | 'running' | 'future'>('running');
  const [selectedTariff, setSelectedTariff] = useState<Tariff | null>(null);
  const [locationAdder, setLocationAdder] = useState<'included' | '6m' | '9m'>('included');
  const [people, setPeople] = useState<'1-2' | '3-4' | '5+'>('3-4');
  const [currentFuel, setCurrentFuel] = useState<string>('gas');

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

  const goNext = useCallback(() => {
    setCurrentSection(s => Math.min(s + 1, SECTION_NAMES.length - 1));
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const goBack = useCallback(() => {
    if (editingFuel) {
      setEditingFuel(false);
    } else if (currentSection > 0) {
      setCurrentSection(s => s - 1);
      contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentSection, editingFuel]);

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
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 px-4 py-6">
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

  const renderSection = () => {
    switch (currentSection) {
      case 0: return <WelcomeSection onStart={goNext} />;
      case 1: return <HeatPumpExplainerSection onContinue={goNext} />;
      case 2: return <HomeDataSection epcData={epcData} heatLossKw={heatLossKw} currentFuel={currentFuel} onEditFuel={() => setEditingFuel(true)} onContinue={goNext} />;
      case 3: return results ? <InitialEstimateSection results={results} currentFuel={currentFuel} onPersonalise={goNext} /> : null;
      case 4: return <PreferencesSection selectedPreference={preference} onSelect={setPreference} onContinue={goNext} />;
      case 5: return <FineTuneSection selectedLocation={locationAdder} selectedPeople={people} onSelectLocation={setLocationAdder} onSelectPeople={setPeople} onContinue={goNext} />;
      case 6: return <BenefitsSection onContinue={goNext} />;
      case 7: return results ? <FinalEstimateSection results={results} currentFuel={currentFuel} onBook={goNext} /> : null;
      case 8: return results && assumptions ? <ContactStep epcData={epcData} results={results} assumptions={assumptions} scop={scop} selectedTariff={selectedTariff} currentFuel={currentFuel} locationAdder={locationAdder} cylinderOption={cylinderOption} onBack={goBack} /> : null;
      default: return null;
    }
  };

  const guideContext = { epcBand: epcData.epcBand, floorArea: epcData.totalFloorArea, currentFuel, installCost: results?.customerContribution, savings: results?.estimatedSavings };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="flex min-h-screen">
        {/* Main content */}
        <div className="flex-1 overflow-y-auto" ref={contentRef}>
          <div className="max-w-lg mx-auto px-4">
            {renderSection()}
          </div>
        </div>

        {/* Desktop guide panel */}
        <div className="hidden lg:block w-80 xl:w-96 border-l border-border bg-card">
          <div className="sticky top-0 h-screen overflow-hidden">
            <GuidePanel currentSection={SECTION_NAMES[currentSection]} context={guideContext} />
          </div>
        </div>

        {/* Mobile guide drawer */}
        <div className="lg:hidden">
          <MobileGuideDrawer currentSection={SECTION_NAMES[currentSection]} context={guideContext} />
        </div>
      </div>
    </div>
  );
}
