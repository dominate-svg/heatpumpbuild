import { useState } from 'react';
import { AddressLookup } from '@/components/AddressLookup';
import { ManualEntryForm } from '@/components/ManualEntryForm';
import { CosyBadge } from '@/components/CosyBadge';
import { Star, Check, ShieldCheck } from 'lucide-react';
import type { EPCData } from '@/lib/calculations';
import { useNavigate, Link } from 'react-router-dom';
import heroImage from '@/assets/hero-home.jpg';
import octopusPartner from '@/assets/octopus-partner.png';
import logo from '@/assets/logo.png';

export default function Index() {
  const [showManualEntry, setShowManualEntry] = useState(false);
  const navigate = useNavigate();

  const handleAddressSelect = (epcData: EPCData) => {
    sessionStorage.setItem('epcData', JSON.stringify(epcData));
    navigate('/estimate');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Full width with photo background */}
      <section className="relative min-h-[90vh] flex flex-col">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
        </div>

        {/* Header - Over hero */}
        <header className="relative z-10 w-full py-6 px-6">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link to="/" className="flex items-center">
              <img src={logo} alt="Smart Energy Homes" className="h-12 w-auto" />
            </Link>
          </div>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12">
          {/* Trust Line */}
          <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
            <span>Trusted Octopus Partner</span>
            <span className="text-white/40">•</span>
            <span className="flex items-center gap-1">
              Rated Excellent on Trustpilot
              <Star className="w-4 h-4 fill-current text-yellow-400" />
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white text-center max-w-4xl leading-tight mb-6">
            Join the Octopus Cosy<br className="hidden sm:block" />
            <span className="sm:hidden"> </span>heat pump revolution.
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-white/80 text-center max-w-2xl mb-10">
            Get a personalised heat pump estimate in under 30 seconds — powered by your home's EPC data.
          </p>

          {/* Primary Action Card */}
          <div className="w-full max-w-md bg-white rounded-lg p-6 sm:p-8 shadow-elevated">
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
            
            <p className="text-center text-sm text-muted-foreground mt-4">
              No sales calls. No obligation.
            </p>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <div className="flex">
                {[1,2,3,4,5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-current text-green-500" />
                ))}
              </div>
              <span className="text-white text-sm font-medium">Trustpilot</span>
            </div>
            <img 
              src={octopusPartner} 
              alt="Octopus Trusted Partner" 
              className="h-10 w-auto brightness-0 invert opacity-90"
            />
          </div>
        </div>
      </section>

      {/* Social Proof Strip */}
      <section className="bg-foreground text-white py-6">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-sm sm:text-base">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-current text-green-500" />
              <span>Rated Excellent on Trustpilot (200+ reviews)</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <span>Trusted Octopus Partner</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-primary" />
              <span>£7,500 government grant available</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-primary" />
              <span>Installed from £1,995</span>
            </div>
          </div>
        </div>
      </section>

      {/* Why Cosy is Different */}
      <section className="py-20 md:py-28 bg-background">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground text-center mb-16">
            Why Cosy is different
          </h2>

          <div className="grid md:grid-cols-3 gap-12 md:gap-8">
            <div className="text-center">
              <h3 className="text-xl font-bold text-foreground mb-4">Smarter heating</h3>
              <p className="text-muted-foreground leading-relaxed">
                Cosy learns how your home holds heat and shifts heating into cheaper hours automatically.
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-foreground mb-4">Cheaper to run</h3>
              <p className="text-muted-foreground leading-relaxed">
                Octopus Cosy gives you 8 hours of half-price electricity every day.
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-foreground mb-4">Feels better</h3>
              <p className="text-muted-foreground leading-relaxed">
                Steady, gentle warmth — no cold swings, no sudden spikes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How Savings Work */}
      <section className="py-20 md:py-28 bg-muted">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-8">
            How you save money
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
            Cosy stores heat when electricity is cheap and releases it slowly through the day — including during peak price hours — keeping your home warm without chasing prices.
          </p>
        </div>
      </section>

      {/* Grant Section */}
      <section className="py-20 md:py-28 bg-background">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground text-center mb-12">
            The £7,500 government grant
          </h2>

          <div className="space-y-4 max-w-md mx-auto">
            {[
              'Not means tested',
              'Almost all homes qualify',
              'We handle all paperwork',
              'Currently scheduled until April 2026'
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 md:py-28 bg-foreground text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-12">
            In safe hands
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-8 mb-12">
            <CosyBadge size="lg" className="brightness-0 invert" />
            <img 
              src={octopusPartner} 
              alt="Octopus Trusted Partner" 
              className="h-16 w-auto brightness-0 invert"
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-lg">
            <span>One of only 3 Cosy-accredited installers</span>
            <span className="hidden md:block text-white/30">•</span>
            <span>Trusted Octopus Partner</span>
            <span className="hidden md:block text-white/30">•</span>
            <span className="flex items-center gap-2">
              5★ Trustpilot rating
              <Star className="w-5 h-5 fill-current text-yellow-400" />
            </span>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-28 bg-background">
        <div className="max-w-xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-8">
            See if your home is a good fit for Cosy
          </h2>

          <div className="bg-white rounded-lg p-6 sm:p-8 shadow-card border border-border">
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
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-muted border-t border-border">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            Digital estimate only. Final system design and pricing confirmed after a home survey.
          </p>
        </div>
      </footer>
    </div>
  );
}
