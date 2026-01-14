import { useState, useCallback } from 'react';
import { AddressLookup } from '@/components/AddressLookup';
import { ManualEntryForm } from '@/components/ManualEntryForm';
import { ResearchScreen } from '@/components/ResearchScreen';
import type { EPCData } from '@/lib/calculations';
import { useNavigate, Link } from 'react-router-dom';
import logo from '@/assets/logo.png';
import { CosyBadge } from '@/components/CosyBadge';
import { Shield, Star, Award } from 'lucide-react';

export default function Index() {
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [showResearchScreen, setShowResearchScreen] = useState(false);
  const [isDataReady, setIsDataReady] = useState(false);
  const [hasEpcError, setHasEpcError] = useState(false);
  const [pendingEpcData, setPendingEpcData] = useState<EPCData | null>(null);
  const navigate = useNavigate();

  const handleAddressSelect = (epcData: EPCData) => {
    // Store EPC data and show research screen
    setPendingEpcData(epcData);
    setShowResearchScreen(true);
    setIsDataReady(true);
    setHasEpcError(false);
  };

  const handleResearchComplete = useCallback(() => {
    if (pendingEpcData) {
      sessionStorage.setItem('epcData', JSON.stringify(pendingEpcData));
      navigate('/estimate');
    }
  }, [pendingEpcData, navigate]);

  const handleManualEstimateFromError = useCallback(() => {
    setShowResearchScreen(false);
    setHasEpcError(false);
    setShowManualEntry(true);
  }, []);

  const handleTryAgain = useCallback(() => {
    setShowResearchScreen(false);
    setHasEpcError(false);
    setPendingEpcData(null);
    setIsDataReady(false);
  }, []);

  // Show research screen overlay
  if (showResearchScreen) {
    return (
      <ResearchScreen
        isDataReady={isDataReady}
        hasError={hasEpcError}
        onComplete={handleResearchComplete}
        onManualEstimate={handleManualEstimateFromError}
        onTryAgain={handleTryAgain}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Minimal Header */}
      <header className="w-full py-4 px-4 md:px-12 border-b border-border bg-background">
        <div className="max-w-[1140px] mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Smart Energy Homes" className="h-7 md:h-8 w-auto" />
          </Link>
          <a 
            href="tel:08001234567" 
            className="text-xs md:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Need help?
          </a>
        </div>
      </header>

      {/* Hero - Centered, minimal */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 md:py-16">
        <div className="w-full max-w-[520px] text-center">
          {/* Headline */}
          <h1 className="text-[26px] sm:text-[34px] md:text-[44px] font-extrabold text-foreground leading-[1.1] mb-3 md:mb-4">
            Get a Cosy heat pump estimate in under{' '}
            <span className="text-primary">30 seconds</span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-base md:text-lg text-muted-foreground mb-8 md:mb-10 max-w-md mx-auto">
            We use EPC + home data to build a personalised estimate. No obligation.
          </p>

          {/* Postcode Module - with animated halo */}
          <div className="bg-card rounded-2xl p-5 md:p-8 shadow-elevated border border-border animate-halo-pulse mb-6">
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

          {/* Trust strip */}
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-5 mb-5">
            <div className="flex items-center gap-1.5 text-xs md:text-sm text-foreground">
              <Award className="w-4 h-4 text-primary" />
              <span><span className="font-semibold text-primary">£7,500</span> grant available</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs md:text-sm text-foreground">
              <span className="text-octopus">🐙</span>
              <span>Octopus-accredited</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs md:text-sm text-foreground">
              <Star className="w-4 h-4 text-green-500" />
              <span>5★ Trustpilot</span>
            </div>
          </div>

          {/* Privacy microcopy */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-3.5 h-3.5" />
            <span>No sales calls. No obligation. We respect your privacy.</span>
          </div>

          {/* Cosy Badge */}
          <div className="mt-8">
            <CosyBadge size="md" />
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="py-4 px-4 border-t border-border">
        <p className="text-center text-xs text-muted-foreground">
          Digital estimate only. Final pricing confirmed after survey.
        </p>
      </footer>
    </div>
  );
}
