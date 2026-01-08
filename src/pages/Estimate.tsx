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
import { calculateEstimate } from '@/lib/calculations';
import type { EPCData } from '@/lib/calculations';
import { Loader2 } from 'lucide-react';

export default function Estimate() {
  const navigate = useNavigate();
  const { data: assumptions, isLoading } = useAssumptions();
  
  const [epcData, setEpcData] = useState<EPCData | null>(null);
  const [scop, setScop] = useState(3.4); // Default to 340% (2 radiators)
  const [tariff, setTariff] = useState<'cosy' | 'standard'>('cosy');
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
    <div className="min-h-screen bg-background pb-32">
      <Header />
      
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Our estimate to upgrade your home
          </h1>
          <p className="text-muted-foreground">
            Based on analysing your home digitally, here's our estimate for your upgrade
          </p>
        </div>

        {/* Estimate banner */}
        <div className="mb-8">
          <EstimateBanner />
        </div>

        {/* Estimate overview section */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-foreground">Estimate overview</h2>
            <p className="text-sm text-muted-foreground">Here's your estimate at a glance</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left: Property cards */}
            <PropertyCard epcData={epcData} results={results} />
            
            {/* Right: Cost card */}
            <CostCard 
              results={results} 
              assumptions={assumptions}
              scop={scop}
              cylinderOption={cylinderOption}
            />
          </div>
        </section>

        {/* Savings section */}
        <section className="mb-12">
          <SavingsCard 
            results={results}
            assumptions={assumptions}
            scop={scop}
            tariff={tariff}
            onScopChange={setScop}
            onTariffChange={setTariff}
          />
        </section>

        {/* Options sections */}
        <section className="mb-12">
          <InstallOptions
            locationAdder={locationAdder}
            cylinderOption={cylinderOption}
            onLocationChange={setLocationAdder}
            onCylinderChange={setCylinderOption}
            assumptions={assumptions}
          />
        </section>

        {/* Timeline */}
        <section className="mb-12">
          <Timeline />
        </section>
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
