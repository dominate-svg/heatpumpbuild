import { useState } from 'react';
import { Header } from '@/components/Header';
import { AddressLookup } from '@/components/AddressLookup';
import { ManualEntryForm } from '@/components/ManualEntryForm';
import { Flame } from 'lucide-react';
import type { EPCData } from '@/lib/calculations';
import { useNavigate } from 'react-router-dom';

export default function Index() {
  const [showManualEntry, setShowManualEntry] = useState(false);
  const navigate = useNavigate();

  const handleAddressSelect = (epcData: EPCData) => {
    // Store in sessionStorage and navigate to results
    sessionStorage.setItem('epcData', JSON.stringify(epcData));
    navigate('/estimate');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 mb-6">
            <Flame className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Get an instant estimate for a Cosy heat pump
          </h1>
          <p className="text-lg text-muted-foreground">
            Digital estimate based on EPC data. Final quote after survey.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          {showManualEntry ? (
            <ManualEntryForm
              onSubmit={handleAddressSelect}
              onBack={() => setShowManualEntry(false)}
            />
          ) : (
            <AddressLookup
              onAddressSelect={handleAddressSelect}
              onManualEntry={() => setShowManualEntry(true)}
            />
          )}
        </div>
      </main>
    </div>
  );
}
