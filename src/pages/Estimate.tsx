import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssumptions } from '@/hooks/useAssumptions';
import { useTariffs, type Tariff } from '@/hooks/useTariffs';
import { calculateEstimate } from '@/lib/calculations';
import type { EPCData } from '@/lib/calculations';
import { estimateContributionFromEpc } from '@/lib/estimateInstallCost';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Section components
import { EstimateProgress } from '@/components/estimate/EstimateProgress';
import { StickyEstimateBar } from '@/components/estimate/StickyEstimateBar';
import { EducationSection } from '@/components/estimate/sections/EducationSection';
import { HomeDataSection } from '@/components/estimate/sections/HomeDataSection';
import { OptimisationSection } from '@/components/estimate/sections/OptimisationSection';
import { LocationSection2 } from '@/components/estimate/sections/LocationSection2';
import { CylinderSection } from '@/components/estimate/sections/CylinderSection';
import { TariffSection } from '@/components/estimate/sections/TariffSection';
import { InstallCostSection } from '@/components/estimate/sections/InstallCostSection';
import { QuoteSection } from '@/components/estimate/sections/QuoteSection';
import { ContactStep } from '@/components/wizard/steps/ContactStep';

function detectFuelType(mainFuel?: string): string {
  if (!mainFuel) return 'gas';
  const fuel = mainFuel.toLowerCase();
  if (fuel.includes('oil')) return 'oil';
  if (fuel.includes('lpg') || fuel.includes('bottled')) return 'lpg';
  if (fuel.includes('electric')) return 'electric';
  return 'gas';
}

// 9-step flow:
// 1. education - How a heat pump works
// 2. home-data - We found this about your home
// 3. optimisation - How optimised should your system be
// 4. location - Where can the heat pump go
// 5. cylinder - Hot water cylinder
// 6. tariff - Electricity tariff
// 7. install-cost - Detailed install cost breakdown
// 8. quote - Your personalised quote (full breakdown + AI)
// 9. booking - Contact form
const STEPS = [
  'education',
  'home-data', 
  'optimisation',
  'location',
  'cylinder',
  'tariff',
  'install-cost',
  'quote',
  'booking',
];

export default function Estimate() {
  const navigate = useNavigate();
  const { data: assumptions, isLoading: assumptionsLoading } = useAssumptions();
  const { data: tariffs, isLoading: tariffsLoading } = useTariffs();
  const contentRef = useRef<HTMLDivElement>(null);
  
  const [epcData, setEpcData] = useState<EPCData | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  
  // Config state
  const [selectedTariff, setSelectedTariff] = useState<Tariff | null>(null);
  const [locationAdder, setLocationAdder] = useState<'included' | '6m' | '9m'>('included');
  const [cylinderOption, setCylinderOption] = useState<'existing' | '150l' | '210l'>('existing');
  const [currentFuel, setCurrentFuel] = useState<string>('gas');
  const [scop, setScop] = useState(3.7); // Default to balanced

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
      // Default to Cosy tariff if available
      setSelectedTariff(tariffs.find(t => t.name.toLowerCase().includes('cosy')) || tariffs[0]);
    }
  }, [tariffs, selectedTariff]);

  // Current results with all selections
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

  // EPC-based install cost contribution (single source of truth)
  const epcContribution = useMemo(() => {
    if (!epcData) return null;
    const result = estimateContributionFromEpc(epcData);
    if ('error' in result) return null;
    return result.contribution;
  }, [epcData]);


  // Exact results for each optimisation option (so all UI numbers match exactly)
  const optimisationOptionResults = useMemo(() => {
    if (!epcData || !assumptions) return null;

    const make = (scopValue: number) =>
      calculateEstimate(
        {
          floorArea: epcData.totalFloorArea || 100,
          heatingCostCurrent: epcData.heatingCostCurrent,
          spaceHeatingDemand: epcData.spaceHeatingDemand,
          currentFuel,
          propertyType: epcData.propertyType,
          region: epcData.region || 'England',
          epcBand: epcData.epcBand,
          scop: scopValue,
          tariff: selectedTariff,
          locationAdder,
          cylinderOption,
        },
        assumptions
      );

    return {
      simple: make(3.4),
      balanced: make(3.7),
      optimised: make(4.0),
    };
  }, [epcData, assumptions, selectedTariff, locationAdder, cylinderOption, currentFuel]);


  const goNext = useCallback(() => {
    setCurrentStep(s => Math.min(s + 1, STEPS.length - 1));
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const goBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(s => s - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // Show sticky panel from optimisation step (step 2) until tariff (step 5)
  // Not shown on education, home-data, install-cost, quote, or booking
  const showStickyBar = currentStep >= 2 && currentStep <= 5;

  // Calculate heat loss for display
  const heatLossKw = results?.heatLossKw || 8;

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
      
      case 'home-data':
        return (
          <HomeDataSection 
            epcData={epcData} 
            heatLossKw={heatLossKw} 
            currentFuel={currentFuel} 
            onEditFuel={() => {}} 
            onContinue={goNext} 
            onBack={goBack} 
          />
        );
      
      case 'optimisation': 
        return assumptions ? (
          <OptimisationSection 
            scop={scop} 
            onScopChange={setScop} 
            optionResults={optimisationOptionResults}
            onContinue={goNext} 
            onBack={goBack} 
          />
        ) : null;

      case 'location': 
        return assumptions ? (
          <LocationSection2 
            locationAdder={locationAdder} 
            onLocationChange={setLocationAdder} 
            onContinue={goNext} 
            onBack={goBack} 
            assumptions={assumptions} 
          />
        ) : null;
      
      case 'cylinder': 
        return assumptions ? (
          <CylinderSection 
            cylinderOption={cylinderOption} 
            onCylinderChange={setCylinderOption} 
            onContinue={goNext} 
            onBack={goBack} 
            assumptions={assumptions} 
          />
        ) : null;
      
      case 'tariff':
        return assumptions ? (
          <TariffSection
            selectedTariff={selectedTariff}
            onTariffChange={setSelectedTariff}
            onContinue={goNext}
            onBack={goBack}
            epcData={epcData}
            assumptions={assumptions}
            scop={scop}
            currentFuel={currentFuel}
            locationAdder={locationAdder}
            cylinderOption={cylinderOption}
          />
        ) : null;
      
      case 'install-cost':
        return (
          <InstallCostSection
            epcData={epcData}
            onContinue={goNext}
            onBack={goBack}
          />
        );
      
      case 'quote': 
        return results ? (
          <QuoteSection 
            results={results} 
            currentFuel={currentFuel} 
            epcContribution={epcContribution}
            radiatorAdder={results.radiatorAdder}
            context={guideContext} 
            onContinue={goNext} 
            onBack={goBack} 
          />
        ) : null;
      
      case 'booking': 
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
    <div className="min-h-screen bg-background">
      {/* Progress indicator - fixed at top */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50 px-4 py-3">
        <div className="max-w-lg mx-auto">
          <EstimateProgress currentStep={currentStep} totalSteps={STEPS.length} />
        </div>
      </div>

      {/* Main content area */}
      <div className="overflow-y-auto" ref={contentRef}>
        <div className={cn(
          'max-w-lg mx-auto px-4 sm:px-6',
          // Add bottom padding for sticky bar on mobile (with safe area)
          showStickyBar ? 'pb-28 sm:pb-24' : 'pb-6'
        )}>
          {renderSection()}
        </div>
      </div>

      {/* Sticky estimate bar - mobile bottom / desktop right side */}
      {showStickyBar && results && (
        <StickyEstimateBar 
          results={results} 
          currentFuel={currentFuel} 
          epcContribution={epcContribution}
          radiatorAdder={results.radiatorAdder}
        />
      )}
    </div>
  );
}
