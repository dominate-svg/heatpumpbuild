import { useState } from 'react';
import { Header } from '@/components/Header';
import { AddressLookup } from '@/components/AddressLookup';
import { ManualEntryForm } from '@/components/ManualEntryForm';
import { Home, Sun, Leaf, Award, BadgeCheck, Percent, Search, ClipboardCheck, CalendarCheck } from 'lucide-react';
import type { EPCData } from '@/lib/calculations';
import { useNavigate } from 'react-router-dom';

const TRUST_BADGES = [
  { icon: Award, label: '£7,500 grant available', color: 'text-success' },
  { icon: Percent, label: '0% VAT on installation', color: 'text-accent' },
  { icon: BadgeCheck, label: 'Octopus-accredited installer', color: 'text-primary' },
];

const STEPS = [
  { icon: Search, label: 'Find your home', num: 1 },
  { icon: ClipboardCheck, label: 'See your estimate', num: 2 },
  { icon: CalendarCheck, label: 'Book your survey', num: 3 },
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
      <Header />
      
      {/* Hero Section - Two Column */}
      <section className="relative overflow-hidden">
        {/* Soft gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-background to-primary/5" />
        
        <div className="relative max-w-6xl mx-auto px-4 py-12 md:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Copy */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                  See what a{' '}
                  <span className="text-gradient">Cosy heat pump</span>{' '}
                  could do for your home.
                </h1>
                
                <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
                  Get a personalised estimate in under 30 seconds — powered by your EPC data.
                </p>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-4">
                {TRUST_BADGES.map((badge, i) => (
                  <div 
                    key={i} 
                    className="flex items-center gap-2 bg-card rounded-full px-4 py-2 shadow-soft border border-border"
                  >
                    <badge.icon className={`w-5 h-5 ${badge.color}`} />
                    <span className="text-sm font-medium text-foreground">{badge.label}</span>
                  </div>
                ))}
              </div>

              {/* Form Card - Mobile visible */}
              <div className="lg:hidden">
                <div className="bg-card rounded-2xl p-6 shadow-soft border border-border">
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
            </div>

            {/* Right Column - Illustration + Form on desktop */}
            <div className="hidden lg:block space-y-6">
              {/* Illustration */}
              <div className="relative bg-gradient-to-br from-accent/10 to-success/10 rounded-3xl p-8 border border-accent/20">
                <div className="flex items-center justify-center gap-6">
                  <div className="w-24 h-24 rounded-2xl bg-card shadow-soft flex items-center justify-center">
                    <Home className="w-12 h-12 text-foreground" />
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="w-16 h-16 rounded-xl bg-success/20 flex items-center justify-center animate-pulse">
                      <Leaf className="w-8 h-8 text-success" />
                    </div>
                    <div className="w-16 h-16 rounded-xl bg-warning/20 flex items-center justify-center">
                      <Sun className="w-8 h-8 text-warning" />
                    </div>
                  </div>
                </div>
                <p className="text-center text-muted-foreground text-sm mt-6">
                  Warm, efficient, sustainable heating
                </p>
              </div>

              {/* Form Card */}
              <div className="bg-card rounded-2xl p-6 shadow-soft border border-border">
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
          </div>
        </div>
      </section>

      {/* Steps indicator */}
      <section className="py-10 border-t border-border bg-card">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center gap-4 md:gap-8">
            {STEPS.map((step, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <step.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground hidden sm:block">{step.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="w-8 md:w-16 h-0.5 bg-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-12 bg-background">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm mb-6">
            Trusted by homeowners across the UK
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-12 items-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">500+</div>
              <div className="text-sm text-muted-foreground">Installations</div>
            </div>
            <div className="w-px h-10 bg-border hidden md:block" />
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">4.9★</div>
              <div className="text-sm text-muted-foreground">Average rating</div>
            </div>
            <div className="w-px h-10 bg-border hidden md:block" />
            <div className="text-center">
              <div className="text-3xl font-bold text-success">~£1,200</div>
              <div className="text-sm text-muted-foreground">Avg. annual savings</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
