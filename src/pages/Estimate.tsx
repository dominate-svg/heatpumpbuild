import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { LeadCaptureForm } from '@/components/LeadCaptureForm';
import { AIAssistant } from '@/components/canvas/AIAssistant';
import { UnderstandingSection } from '@/components/canvas/UnderstandingSection';
import { WhatIFoundSection } from '@/components/canvas/WhatIFoundSection';
import { WhatThisMeansSection } from '@/components/canvas/WhatThisMeansSection';
import { PersonaliseSection } from '@/components/canvas/PersonaliseSection';
import { FinalEstimateSection } from '@/components/canvas/FinalEstimateSection';
import { WhatHappensNextSection } from '@/components/canvas/WhatHappensNextSection';
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

type CanvasPhase = 'understanding' | 'found' | 'means' | 'personalise' | 'final' | 'booking';

const AI_MESSAGES: Record<CanvasPhase, string> = {
  understanding: "I'm building your estimate now.",
  found: 'This is based on your EPC. Let me know if anything looks off.',
  means: 'This is a realistic estimate based on homes like yours.',
  personalise: 'Higher efficiency costs more upfront, but saves more long-term.',
  final: "I'll hand you over to a human engineer after this.",
  booking: 'Almost there! Just a few details to book your survey.',
};

export default function Estimate() {
  const navigate = useNavigate();
  const { data: assumptions, isLoading: assumptionsLoading } = useAssumptions();
  const { data: tariffs, isLoading: tariffsLoading } = useTariffs();
  
  const [epcData, setEpcData] = useState<EPCData | null>(null);
  const [phase, setPhase] = useState<CanvasPhase>('understanding');
  const [isPersonaliseIdle, setIsPersonaliseIdle] = useState(false);
  
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

  useEffect(() => {
    if (isPersonaliseIdle && phase === 'personalise') {
      const timeout = setTimeout(() => setPhase('final'), 500);
      return () => clearTimeout(timeout);
    }
  }, [isPersonaliseIdle, phase]);

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

  if (phase === 'booking') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-lg mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => setPhase('final')} className="mb-6">← Back</Button>
          <LeadCaptureForm epcData={epcData} results={results} assumptions={assumptions} inputs={{ scop, tariff: selectedTariff, currentFuel, propertyType: epcData.propertyType, region: epcData.region, locationAdder, cylinderOption }} />
        </main>
        <AIAssistant message={AI_MESSAGES.booking} isVisible />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      <div className={cn('transition-all duration-300', phase === 'understanding' ? 'opacity-0' : 'opacity-100')}>
        <Header />
      </div>
      
      <main>
        {phase === 'understanding' && <UnderstandingSection onComplete={() => setPhase('found')} />}
        {phase === 'found' && <WhatIFoundSection epcData={epcData} results={results} onContinue={() => setPhase('means')} />}
        {phase === 'means' && <WhatThisMeansSection results={results} assumptions={assumptions} onContinue={() => setPhase('personalise')} />}
        {(phase === 'personalise' || phase === 'final') && (
          <div className={cn(phase === 'final' && 'section-past')}>
            <PersonaliseSection results={results} assumptions={assumptions} scop={scop} selectedTariff={selectedTariff} locationAdder={locationAdder} cylinderOption={cylinderOption} onScopChange={setScop} onTariffChange={setSelectedTariff} onLocationChange={setLocationAdder} onCylinderChange={setCylinderOption} onIdleChange={setIsPersonaliseIdle} />
          </div>
        )}
        {phase === 'final' && (
          <>
            <FinalEstimateSection results={results} assumptions={assumptions} scop={scop} selectedTariff={selectedTariff} onBook={() => setPhase('booking')} />
            <WhatHappensNextSection />
          </>
        )}
      </main>

      <AIAssistant message={AI_MESSAGES[phase]} isVisible={phase !== 'understanding'} />
    </div>
  );
}
