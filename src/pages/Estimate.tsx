import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { LeadCaptureForm } from '@/components/LeadCaptureForm';
import { AIAssistant } from '@/components/canvas/AIAssistant';
import { LearningSection } from '@/components/canvas/LearningSection';
import { HomeAtGlanceSection } from '@/components/canvas/HomeAtGlanceSection';
import { WhyCosySection } from '@/components/canvas/WhyCosySection';
import { WhatItMeansSection } from '@/components/canvas/WhatItMeansSection';
import { ExploreOptionsSection } from '@/components/canvas/ExploreOptionsSection';
import { IsThisRightSection } from '@/components/canvas/IsThisRightSection';
import { FinalEstimateNextSection } from '@/components/canvas/FinalEstimateNextSection';
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

type JourneyPhase = 
  | 'learning' 
  | 'glance' 
  | 'why-cosy' 
  | 'what-means' 
  | 'explore' 
  | 'is-right' 
  | 'final' 
  | 'booking';

const AI_MESSAGES: Record<JourneyPhase, string> = {
  learning: "I'm putting your estimate together now.",
  glance: 'This is based on your EPC. Let me know if anything looks off.',
  'why-cosy': 'Cosy is designed specifically for heat pumps — 8 cheap hours every day.',
  'what-means': 'This is a realistic estimate based on homes like yours.',
  explore: 'Higher efficiency costs more upfront, but saves more long-term.',
  'is-right': 'These are the questions I hear most. Honest answers only.',
  final: "Ready when you are. I'll hand you over to a human engineer.",
  booking: 'Almost there! Just a few details to book your survey.',
};

export default function Estimate() {
  const navigate = useNavigate();
  const { data: assumptions, isLoading: assumptionsLoading } = useAssumptions();
  const { data: tariffs, isLoading: tariffsLoading } = useTariffs();
  
  const [epcData, setEpcData] = useState<EPCData | null>(null);
  const [phase, setPhase] = useState<JourneyPhase>('learning');
  
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
  const goToGlance = useCallback(() => setPhase('glance'), []);
  const goToWhyCosy = useCallback(() => setPhase('why-cosy'), []);
  const goToWhatMeans = useCallback(() => setPhase('what-means'), []);
  const goToExplore = useCallback(() => setPhase('explore'), []);
  const goToIsRight = useCallback(() => setPhase('is-right'), []);
  const goToFinal = useCallback(() => setPhase('final'), []);
  const goToBooking = useCallback(() => setPhase('booking'), []);

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
  if (phase === 'booking') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-lg mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => setPhase('final')} className="mb-6">
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
        <AIAssistant message={AI_MESSAGES.booking} isVisible />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Header - hidden during learning phase */}
      <div className={cn(
        'transition-all duration-300',
        phase === 'learning' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      )}>
        <Header />
      </div>
      
      <main>
        {/* Section 1: Learning */}
        {phase === 'learning' && (
          <LearningSection onComplete={goToGlance} />
        )}

        {/* Section 2: Your home at a glance */}
        {phase === 'glance' && (
          <HomeAtGlanceSection
            epcData={epcData}
            results={results}
            onContinue={goToWhyCosy}
          />
        )}

        {/* Section 3: Why Cosy is different */}
        {phase === 'why-cosy' && (
          <WhyCosySection onContinue={goToWhatMeans} />
        )}

        {/* Section 4: What this means for your home */}
        {phase === 'what-means' && (
          <WhatItMeansSection
            results={results}
            assumptions={assumptions}
            onContinue={goToExplore}
          />
        )}

        {/* Section 5: Explore your options */}
        {phase === 'explore' && (
          <ExploreOptionsSection
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
            onContinue={goToIsRight}
          />
        )}

        {/* Section 6: Is this right for you? */}
        {phase === 'is-right' && (
          <IsThisRightSection onContinue={goToFinal} />
        )}

        {/* Section 7: Final estimate & next steps */}
        {phase === 'final' && (
          <FinalEstimateNextSection
            results={results}
            assumptions={assumptions}
            scop={scop}
            selectedTariff={selectedTariff}
            onBook={goToBooking}
          />
        )}
      </main>

      {/* AI Assistant */}
      <AIAssistant
        message={AI_MESSAGES[phase]}
        isVisible={phase !== 'learning'}
      />
    </div>
  );
}
