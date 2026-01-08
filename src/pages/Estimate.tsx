import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { PropertyCard } from '@/components/PropertyCard';
import { SystemCard } from '@/components/SystemCard';
import { CostCard } from '@/components/CostCard';
import { SavingsCard } from '@/components/SavingsCard';
import { InstallOptions } from '@/components/InstallOptions';
import { Timeline } from '@/components/Timeline';
import { LeadCaptureForm } from '@/components/LeadCaptureForm';
import { StickyCTA } from '@/components/StickyCTA';
import { useAssumptions } from '@/hooks/useAssumptions';
import { calculateEstimate } from '@/lib/calculations';
import type { EPCData } from '@/lib/calculations';
import { Loader2, ArrowLeft, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Estimate() {
  const navigate = useNavigate();
  const { data: assumptions, isLoading } = useAssumptions();
  
  const [epcData, setEpcData] = useState<EPCData | null>(null);
  const [scop, setScop] = useState(3.7);
  const [tariff, setTariff] = useState<'cosy' | 'standard'>('cosy');
  const [locationAdder, setLocationAdder] = useState<'included' | '6m' | '9m'>('included');
  const [cylinderOption, setCylinderOption] = useState<'existing' | '150l' | '210l'>('existing');

  useEffect(() => {
    const stored = sessionStorage.getItem('epcData');
    if (stored) {
      setEpcData(JSON.parse(stored));
    } else {
      navigate('/');
    }
  }, [navigate]);

  const results = useMemo(() => {
    if (!epcData || !assumptions) return null;
    
    return calculateEstimate({
      floorArea: epcData.totalFloorArea || 100,
      heatingCostCurrent: epcData.heatingCostCurrent,
      currentFuel: epcData.mainFuel || 'gas',
      propertyType: epcData.propertyType,
      region: epcData.region || 'England',
      scop,
      tariff,
      locationAdder,
      cylinderOption,
    }, assumptions);
  }, [epcData, assumptions, scop, tariff, locationAdder, cylinderOption]);

  if (isLoading || !epcData || !results || !assumptions) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Calculating your estimate...</p>
        </div>
      </div>
    );
  }

  const inputs = {
    scop,
    tariff,
    currentFuel: epcData.mainFuel || 'gas',
    propertyType: epcData.propertyType,
    region: epcData.region,
    locationAdder,
    cylinderOption,
  };

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-8">
      <Header />
      
      {/* Hero header */}
      <div className="bg-card border-b border-border py-6">
        <div className="max-w-6xl mx-auto px-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground mb-4 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Start new estimate
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Your Cosy Heat Pump Estimate
          </h1>
          <p className="text-muted-foreground mt-1">{epcData.address}, {epcData.postcode}</p>
        </div>
      </div>
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section A - Your home */}
            <PropertyCard epcData={epcData} results={results} />
            
            {/* Section B - Recommended system */}
            <SystemCard results={results} />
            
            {/* Section C - Cost card */}
            <CostCard results={results} />
            
            {/* Section D - Savings card */}
            <SavingsCard 
              results={results}
              assumptions={assumptions}
              scop={scop}
              tariff={tariff}
              onScopChange={setScop}
              onTariffChange={setTariff}
            />
            
            {/* Section E - Options */}
            <InstallOptions
              locationAdder={locationAdder}
              cylinderOption={cylinderOption}
              onLocationChange={setLocationAdder}
              onCylinderChange={setCylinderOption}
              assumptions={assumptions}
            />
            
            {/* Section F - Timeline */}
            <Timeline />
            
            {/* Disclaimer banner */}
            <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Digital estimate only</span> — final system design and grant eligibility confirmed after survey.
              </p>
            </div>
          </div>
          
          {/* Sticky sidebar - Desktop */}
          <div className="lg:col-span-1 hidden lg:block">
            <div className="lg:sticky lg:top-24">
              <LeadCaptureForm
                epcData={epcData}
                results={results}
                assumptions={assumptions}
                inputs={inputs}
              />
            </div>
          </div>
        </div>
      </main>
      
      {/* Sticky CTA - Mobile */}
      <StickyCTA 
        epcData={epcData}
        results={results}
        assumptions={assumptions}
        inputs={inputs}
      />
    </div>
  );
}
