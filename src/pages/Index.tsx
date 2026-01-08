import { useState } from 'react';
import { AddressLookup } from '@/components/AddressLookup';
import { ManualEntryForm } from '@/components/ManualEntryForm';
import { Star, Zap, Clock, Home, ClipboardCheck, CalendarCheck } from 'lucide-react';
import type { EPCData } from '@/lib/calculations';
import { useNavigate } from 'react-router-dom';
import octopusPartner from '@/assets/octopus-partner.png';
import cosyBadge from '@/assets/cosy-badge.png';
import logo from '@/assets/logo.png';

const SOCIAL_PROOF = [
  { label: '500+ installs', icon: Home },
  { label: '4.9★ Trustpilot', icon: Star },
  { label: 'Octopus Trusted Partner', icon: null, isImage: true },
  { label: 'MCS Certified', icon: null },
];

const COSY_BENEFITS = [
  'Half-price off-peak electricity',
  'Designed for heat pumps',
  'Automatically scheduled',
];

const STEPS = [
  { num: 1, label: 'Find your home', icon: Home },
  { num: 2, label: 'See your estimate', icon: ClipboardCheck },
  { num: 3, label: 'Book your survey', icon: CalendarCheck },
];

export default function Index() {
  const [showManualEntry, setShowManualEntry] = useState(false);
  const navigate = useNavigate();

  const handleAddressSelect = (epcData: EPCData) => {
    sessionStorage.setItem('epcData', JSON.stringify(epcData));
    navigate('/estimate');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal Header */}
      <header className="py-6">
        <div className="max-w-4xl mx-auto px-4 flex justify-center">
          <img src={logo} alt="Smart Energy Homes" className="h-10 md:h-12" />
        </div>
      </header>

      {/* Hero Section - Centered Vertical Stack */}
      <section className="py-8 md:py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          
          {/* Hook Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-foreground leading-[1.05] tracking-tight mb-6">
            Join the Octopus Cosy<br />
            <span className="text-primary">heat pump revolution.</span>
          </h1>
          
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-4">
            Get your heat pump estimate in under 30 seconds.
          </p>
          
          <p className="text-base md:text-lg text-muted-foreground mb-10 md:mb-14">
            Powered by your EPC data. No sales pressure. No obligation.
          </p>

          {/* Postcode CTA Module */}
          <div className="bg-card rounded-2xl p-6 sm:p-8 md:p-10 shadow-xl border border-border mb-8 animate-card-entrance">
            <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold uppercase tracking-wide mb-5">
              Free EPC Check
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-6">
              Find your home
            </h2>
            
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

          {/* Social Proof Badges */}
          <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-16 md:mb-20">
            <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-full border border-border shadow-sm">
              <Home className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">500+ installs</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-full border border-border shadow-sm">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-sm font-semibold text-foreground">4.9★ Trustpilot</span>
            </div>
            <div className="px-4 py-2 bg-card rounded-full border border-border shadow-sm">
              <img src={octopusPartner} alt="Octopus Trusted Partner" className="h-6" />
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-full border border-border shadow-sm">
              <span className="text-sm font-semibold text-foreground">MCS Certified</span>
            </div>
          </div>
        </div>
      </section>

      {/* Cosy Tariff Section */}
      <section className="py-12 md:py-20 bg-foreground text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-6">
            Why Cosy makes heat pumps<br />
            <span className="text-primary">cheaper to run</span>
          </h2>
          
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white/90 mb-10">
            8 hours of half-price electricity every day
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6 mb-10">
            {COSY_BENEFITS.map((benefit, i) => (
              <div 
                key={i}
                className="flex items-center justify-center gap-3 px-5 py-4 bg-white/10 rounded-xl backdrop-blur-sm"
              >
                <Zap className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-base md:text-lg font-semibold">{benefit}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-4">
            <img src={cosyBadge} alt="Cosy Accredited" className="h-14 md:h-16" />
            <img src={octopusPartner} alt="Octopus Partner" className="h-14 md:h-16" />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 md:py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground mb-12 md:mb-16">
            How it works
          </h2>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-4">
            {STEPS.map((step, i) => (
              <div key={i} className="flex items-center gap-4 md:gap-0">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-primary flex items-center justify-center mb-4">
                    <step.icon className="w-8 h-8 md:w-10 md:h-10 text-white" />
                  </div>
                  <span className="text-sm font-bold text-primary mb-1">Step {step.num}</span>
                  <span className="text-base md:text-lg font-semibold text-foreground">{step.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block w-16 lg:w-24 h-0.5 bg-border mx-4" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            Digital estimate only. Final system design and pricing confirmed after a home survey.
          </p>
        </div>
      </footer>
    </div>
  );
}
