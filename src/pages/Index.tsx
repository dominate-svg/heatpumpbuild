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
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-primary/15 via-accent/15 to-primary/15 rounded-3xl blur-lg animate-pulse opacity-70" />
                  <div className="relative bg-card rounded-2xl p-5 shadow-elevated border-2 border-primary/20 animate-scale-in">
                    <div className="text-center mb-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 mb-3 animate-float shadow-md">
                        <Search className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-lg font-bold text-foreground mb-1">Find your home</h2>
                      <p className="text-sm text-muted-foreground">Enter your postcode to get started</p>
                    </div>
                    
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

            {/* Right Column - Big CTA Form on desktop */}
            <div className="hidden lg:block">
              <div className="relative">
                {/* Animated glow behind */}
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-[2rem] blur-xl animate-pulse opacity-60" />
                
                {/* Main CTA Card */}
                <div className="relative bg-card rounded-3xl p-8 shadow-elevated border-2 border-primary/20 animate-scale-in">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 mb-4 animate-float shadow-lg">
                      <Search className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Find your home</h2>
                    <p className="text-muted-foreground">We'll fetch your property details automatically</p>
                  </div>
                  
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
