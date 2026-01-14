import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { LeadCaptureForm } from '@/components/LeadCaptureForm';
import { AIAssistant } from '@/components/canvas/AIAssistant';
import { LookingSection } from '@/components/canvas/LookingSection';
import { FoundSection } from '@/components/canvas/FoundSection';
import { MeansSection } from '@/components/canvas/MeansSection';
import { PersonaliseSection } from '@/components/canvas/PersonaliseSection';
import { ReadySection } from '@/components/canvas/ReadySection';
import { useAssumptions } from '@/hooks/useAssumptions';
import { useTariffs, type Tariff } from '@/hooks/useTariffs';
import { calculateEstimate } from '@/lib/calculations';
import type { EPCData } from '@/lib/calculations';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Helper to detect fuel type from EPC data
function detectFuelType(mainFuel?: string): string {
  if (!mainFuel) return 'gas';
  const fuel = mainFuel.toLowerCase();
  if (fuel.includes('oil')) return 'oil';
  if (fuel.includes('lpg') || fuel.includes('bottled')) return 'lpg';
  if (fuel.includes('electric')) return 'electric';
  return 'gas';
}

type CanvasPhase = 'looking' | 'found' | 'means' | 'personalise' | 'ready' | 'booking';

// AI messages for each phase
const AI_MESSAGES: Record<CanvasPhase, string> = {
  looking: '',
  found: 'This is based on your EPC. Let me know if anything looks off.',
  means: 'This is a realistic estimate based on homes like yours.',
  personalise: 'Higher efficiency costs more upfront, but saves more long-term.',
  ready: 'I\'ll hand you over to a human engineer after this.',
  booking: 'Almost there! Just a few details to book your survey.',
};

export default function Estimate() {
  const navigate = useNavigate();
  const { data: assumptions, isLoading: assumptionsLoading } = useAssumptions();
  const { data: tariffs, isLoading: tariffsLoading } = useTariffs();
  
  const [epcData, setEpcData] = useState<EPCData | null>(null);
  const [phase, setPhase] = useState<CanvasPhase>('looking');
  const [isPersonaliseIdle, setIsPersonaliseIdle] = useState(false);
  
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

  // Auto-advance to ready when personalise is idle
  useEffect(() => {
    if (isPersonaliseIdle && phase === 'personalise') {
      const timeout = setTimeout(() => {
        setPhase('ready');
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [isPersonaliseIdle, phase]);

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

  // Phase handlers
  const handleLookingComplete = useCallback(() => {
    setPhase('found');
  }, []);

  const handleFoundComplete = useCallback(() => {
    setPhase('means');
  }, []);

  const handleMeansComplete = useCallback(() => {
    setPhase('personalise');
  }, []);

  const handleBook = useCallback(() => {
    setPhase('booking');
  }, []);

  const handleIdleChange = useCallback((isIdle: boolean) => {
    setIsPersonaliseIdle(isIdle);
  }, []);

  // Get current AI message
  const currentAIMessage = AI_MESSAGES[phase];

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

  // Booking/Lead capture
  if (phase === 'booking') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-lg mx-auto px-4 py-8">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => setPhase('ready')}
              className="text-muted-foreground hover:text-foreground"
            >
              ← Back
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
        <AIAssistant message={currentAIMessage} isVisible position="left" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Header - hidden during looking phase */}
      <div className={cn(
        'transition-all duration-500',
        phase === 'looking' ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'
      )}>
        <Header />
      </div>
      
      {/* Canvas sections */}
      <main className="relative">
        {/* Looking section */}
        {phase === 'looking' && (
          <LookingSection onComplete={handleLookingComplete} />
        )}

        {/* Found section */}
        {phase === 'found' && (
          <FoundSection 
            epcData={epcData} 
            results={results} 
            onContinue={handleFoundComplete} 
          />
        )}

        {/* Means section */}
        {phase === 'means' && (
          <MeansSection 
            results={results} 
            assumptions={assumptions}
            onContinue={handleMeansComplete} 
          />
        )}

        {/* Personalise section */}
        {(phase === 'personalise' || phase === 'ready') && (
          <div className={cn(
            'transition-all duration-500',
            phase === 'ready' ? 'opacity-40 scale-[0.98] pointer-events-none' : ''
          )}>
            <PersonaliseSection
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
              onIdleChange={handleIdleChange}
            />
          </div>
        )}

        {/* Ready section - overlays when active */}
        {phase === 'ready' && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-start justify-center pt-16 animate-fade-in">
            <ReadySection
              results={results}
              assumptions={assumptions}
              scop={scop}
              selectedTariff={selectedTariff}
              onBook={handleBook}
            />
          </div>
        )}
      </main>

      {/* AI Assistant - visible after looking phase */}
      <AIAssistant 
        message={currentAIMessage} 
        isVisible={phase !== 'looking'} 
        position="left" 
      />

      {/* Mobile sticky CTA for ready phase */}
      {phase === 'ready' && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border sm:hidden z-50">
          <Button 
            onClick={handleBook}
            className="w-full h-14 text-base font-semibold rounded-xl"
          >
            Book my free home survey
          </Button>
        </div>
      )}
    </div>
  );
}
