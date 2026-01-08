import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { EstimateBanner } from '@/components/EstimateBanner';
import { PropertyCard } from '@/components/PropertyCard';
import { CostCard } from '@/components/CostCard';
import { SavingsCard } from '@/components/SavingsCard';
import { InstallOptions } from '@/components/InstallOptions';
import { Timeline } from '@/components/Timeline';
import { StickyCTA } from '@/components/StickyCTA';
import { useAssumptions } from '@/hooks/useAssumptions';
import { useTariffs, type Tariff } from '@/hooks/useTariffs';
import { calculateEstimate } from '@/lib/calculations';
import type { EPCData } from '@/lib/calculations';
import { Loader2, Sparkles } from 'lucide-react';

export default function Estimate() {
  const navigate = useNavigate();
  const { data: assumptions, isLoading: assumptionsLoading } = useAssumptions();
  const { data: tariffs, isLoading: tariffsLoading } = useTariffs();
  
  const [epcData, setEpcData] = useState<EPCData | null>(null);
  const [scop, setScop] = useState(3.4);
  const [selectedTariff, setSelectedTariff] = useState<Tariff | null>(null);
  const [locationAdder, setLocationAdder] = useState<'included' | '6m' | '9m'>('included');
  const [cylinderOption, setCylinderOption] = useState<'existing' | '150l' | '210l'>('existing');

  useEffect(() => {
    const stored = sessionStorage.getItem('epcData');
    if (!stored) {
      navigate('/');
      return;
    }

    try {
      const parsed = JSON.parse(stored) as EPCData;
      setEpcData(parsed);
    } catch {
      sessionStorage.removeItem('epcData');
      navigate('/');
    }
  }, [navigate]);

  // Set default tariff when tariffs load
  useEffect(() => {
    if (tariffs && tariffs.length > 0 && !selectedTariff) {
      // Default to first tariff (usually Octopus Cosy based on sort order)
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
      currentFuel: epcData.mainFuel || 'gas',
      propertyType: epcData.propertyType,
      region: epcData.region || 'England',
      scop,
      tariff: selectedTariff,
      locationAdder,
      cylinderOption,
    }, assumptions);
  }, [epcData, assumptions, scop, selectedTariff, locationAdder, cylinderOption]);

  const isLoading = assumptionsLoading || tariffsLoading;

  if (isLoading || !epcData || !results || !assumptions) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
          <p className="text-muted-foreground">Calculating your estimate...</p>
        </div>
      </div>
    );
  }

  const inputs = {
    scop,
    tariff: selectedTariff,
    currentFuel: epcData.mainFuel || 'gas',
    propertyType: epcData.propertyType,
    region: epcData.region,
    locationAdder,
    cylinderOption,
  };

  return (
    <div className="min-h-screen bg-background pb-28 sm:pb-24 lg:pb-28">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-4 py-8 sm:py-6 md:py-8">
        {/* Page title - compact */}
        <div className="mb-8 sm:mb-5 animate-fade-in">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
              Your heat pump estimate
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Based on analysing your home digitally
          </p>
        </div>

        {/* Estimate banner */}
        <div className="mb-10 sm:mb-6">
          <EstimateBanner />
        </div>

        {/* Main content - stack on mobile, 2 column on desktop */}
        <div className="space-y-8 sm:space-y-0 sm:grid sm:gap-5 lg:grid-cols-5 mb-10 sm:mb-6">
          {/* Left: Property info */}
          <div className="lg:col-span-2">
            <PropertyCard epcData={epcData} results={results} />
          </div>
          
          {/* Right: Cost card */}
          <div className="lg:col-span-3">
            <CostCard 
              results={results} 
              assumptions={assumptions}
              scop={scop}
              cylinderOption={cylinderOption}
            />
          </div>
        </div>

        {/* Savings section */}
        <div className="mb-10 sm:mb-6">
          <SavingsCard 
            results={results}
            assumptions={assumptions}
            scop={scop}
            selectedTariff={selectedTariff}
            onScopChange={setScop}
            onTariffChange={setSelectedTariff}
          />
        </div>

        {/* Options section */}
        <div className="mb-10 sm:mb-6">
          <InstallOptions
            locationAdder={locationAdder}
            cylinderOption={cylinderOption}
            onLocationChange={setLocationAdder}
            onCylinderChange={setCylinderOption}
            assumptions={assumptions}
          />
        </div>

        {/* Timeline */}
        <Timeline />
      </main>
      
      {/* Sticky CTA */}
      <StickyCTA 
        epcData={epcData}
        results={results}
        assumptions={assumptions}
        inputs={inputs}
      />
    </div>
  );
}
