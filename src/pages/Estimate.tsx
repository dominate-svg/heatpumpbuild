import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { EstimateSummary } from '@/components/estimate/EstimateSummary';
import { AdjustEstimateSection } from '@/components/estimate/AdjustEstimateSection';
import { CalculationDetails } from '@/components/estimate/CalculationDetails';
import { WhyCosySection } from '@/components/estimate/WhyCosySection';
import { TrustSection } from '@/components/estimate/TrustSection';
import { Timeline } from '@/components/Timeline';
import { StickyCTA } from '@/components/StickyCTA';
import { EstimateChat } from '@/components/EstimateChat';
import { useAssumptions } from '@/hooks/useAssumptions';
import { useTariffs, type Tariff } from '@/hooks/useTariffs';
import { calculateEstimate } from '@/lib/calculations';
import type { EPCData } from '@/lib/calculations';
import { Loader2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { LeadCaptureForm } from '@/components/LeadCaptureForm';

// Helper to detect fuel type from EPC data
function detectFuelType(mainFuel?: string): string {
  if (!mainFuel) return 'gas';
  const fuel = mainFuel.toLowerCase();
  if (fuel.includes('oil')) return 'oil';
  if (fuel.includes('lpg') || fuel.includes('bottled')) return 'lpg';
  if (fuel.includes('electric')) return 'electric';
  return 'gas';
}

export default function Estimate() {
  const navigate = useNavigate();
  const { data: assumptions, isLoading: assumptionsLoading } = useAssumptions();
  const { data: tariffs, isLoading: tariffsLoading } = useTariffs();
  
  const [epcData, setEpcData] = useState<EPCData | null>(null);
  const [scop, setScop] = useState(3.4);
  const [selectedTariff, setSelectedTariff] = useState<Tariff | null>(null);
  const [locationAdder, setLocationAdder] = useState<'included' | '6m' | '9m'>('included');
  const [cylinderOption, setCylinderOption] = useState<'existing' | '150l' | '210l'>('existing');
  const [currentFuel, setCurrentFuel] = useState<string>('gas');
  const [showBookingSheet, setShowBookingSheet] = useState(false);

  const calculationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('epcData');
    if (!stored) {
      navigate('/');
      return;
    }

    try {
      const parsed = JSON.parse(stored) as EPCData;
      setEpcData(parsed);
      // Set initial fuel from EPC data
      setCurrentFuel(detectFuelType(parsed.mainFuel));
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

  const handleScrollToCalculations = () => {
    calculationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleBookSurvey = () => {
    setShowBookingSheet(true);
  };

  if (isLoading || !epcData || !results || !assumptions) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
          <p className="text-muted-foreground">Loading your estimate...</p>
        </div>
      </div>
    );
  }

  const epcBand = results.epcBand || epcData.epcBand || 'D';

  const inputs = {
    scop,
    tariff: selectedTariff,
    currentFuel: currentFuel,
    propertyType: epcData.propertyType,
    region: epcData.region,
    locationAdder,
    cylinderOption,
  };

  return (
    <div className="min-h-screen bg-background pb-28 sm:pb-24 lg:pb-28">
      <Header />
      
      <main className="max-w-3xl mx-auto px-4 py-6 md:py-10 space-y-10">
        {/* Section 1: Summary */}
        <section className="animate-fade-in">
          <EstimateSummary
            results={results}
            assumptions={assumptions}
            epcBand={epcBand}
            onBookSurvey={handleBookSurvey}
            onSeeCalculations={handleScrollToCalculations}
          />
        </section>

        {/* Section 2: Adjust Your Estimate */}
        <section className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <AdjustEstimateSection
            scop={scop}
            selectedTariff={selectedTariff}
            locationAdder={locationAdder}
            cylinderOption={cylinderOption}
            onScopChange={setScop}
            onTariffChange={setSelectedTariff}
            onLocationChange={setLocationAdder}
            onCylinderChange={setCylinderOption}
            assumptions={assumptions}
          />
        </section>

        {/* Section 3: How We Calculated This */}
        <section className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
          <CalculationDetails
            ref={calculationRef}
            results={results}
            epcBand={epcBand}
            scop={scop}
          />
        </section>

        {/* Section 4: Why Cosy Works */}
        <section className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <WhyCosySection />
        </section>

        {/* Section 5: Trust & Accreditation */}
        <section className="animate-fade-in" style={{ animationDelay: '0.25s' }}>
          <TrustSection />
        </section>

        {/* Section 6: Journey Timeline */}
        <section className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <Timeline />
        </section>

        {/* Section 7: AI Chat */}
        <section className="animate-fade-in" style={{ animationDelay: '0.35s' }}>
          <EstimateChat
            epcData={epcData}
            results={results}
            selectedTariff={selectedTariff}
            currentFuel={currentFuel}
            scop={scop}
          />
        </section>
      </main>
      
      {/* Sticky CTA */}
      <StickyCTA 
        epcData={epcData}
        results={results}
        assumptions={assumptions}
        inputs={inputs}
      />

      {/* Booking Sheet */}
      <Sheet open={showBookingSheet} onOpenChange={setShowBookingSheet}>
        <SheetContent side="right" className="w-full sm:w-[400px]">
          <SheetHeader className="mb-6">
            <SheetTitle>Book your free home survey</SheetTitle>
          </SheetHeader>
          <LeadCaptureForm
            epcData={epcData}
            results={results}
            assumptions={assumptions}
            inputs={inputs}
            onSuccess={() => setShowBookingSheet(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
