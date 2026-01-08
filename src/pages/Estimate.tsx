import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { EstimateOverview } from '@/components/EstimateOverview';
import { InstallPriceCard } from '@/components/InstallPriceCard';
import { SavingsCalculator } from '@/components/SavingsCalculator';
import { InstallOptions } from '@/components/InstallOptions';
import { Timeline } from '@/components/Timeline';
import { LeadCaptureForm } from '@/components/LeadCaptureForm';
import { useAssumptions } from '@/hooks/useAssumptions';
import { calculateEstimate } from '@/lib/calculations';
import type { EPCData } from '@/lib/calculations';
import { Loader2 } from 'lucide-react';

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
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <EstimateOverview epcData={epcData} results={results} />
            <InstallPriceCard results={results} />
            <SavingsCalculator
              results={results}
              assumptions={assumptions}
              scop={scop}
              tariff={tariff}
              onScopChange={setScop}
              onTariffChange={setTariff}
            />
            <InstallOptions
              locationAdder={locationAdder}
              cylinderOption={cylinderOption}
              onLocationChange={setLocationAdder}
              onCylinderChange={setCylinderOption}
              assumptions={assumptions}
            />
            <Timeline />
          </div>
          <div className="lg:col-span-1">
            <LeadCaptureForm
              epcData={epcData}
              results={results}
              assumptions={assumptions}
              inputs={inputs}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
