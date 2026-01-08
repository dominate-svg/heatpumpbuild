import { useState } from 'react';
import { Header } from '@/components/Header';
import { AddressLookup } from '@/components/AddressLookup';
import { ManualEntryForm } from '@/components/ManualEntryForm';
import { CosyBadge } from '@/components/CosyBadge';
import { Award, BadgeCheck, Percent, Search, ClipboardCheck, CalendarCheck, Lock, ShieldCheck } from 'lucide-react';
import type { EPCData } from '@/lib/calculations';
import { useNavigate } from 'react-router-dom';
import octopusPartner from '@/assets/octopus-partner.png';

const TRUST_BADGES = [
  { icon: Award, label: '£7,500 grant available' },
  { icon: Percent, label: '0% VAT on installation' },
  { icon: BadgeCheck, label: 'Octopus-accredited installer' },
];

const STEPS = [
  { icon: Search, label: 'Find your home', num: 1, active: true },
  { icon: ClipboardCheck, label: 'See your estimate', num: 2 },
  { icon: CalendarCheck, label: 'Book your survey', num: 3 },
];

const STATS = [
  { value: '500+', label: 'Installs', bg: 'bg-primary/10' },
  { value: '4.9★', label: 'Rating', bg: 'bg-accent/10' },
  { value: '~£1,200', label: 'Avg savings', bg: 'bg-success/10' },
];

const ACCREDITATIONS = [
  { name: 'MCS Certified', text: 'MCS' },
  { name: 'TrustMark', text: 'TrustMark' },
  { name: 'RECC', text: 'RECC' },
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
      
      {/* Hero Section */}
      <section className="bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 pt-10 pb-16 md:pt-16 md:pb-20">
          
          {/* Headline */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-5">
              See what a{' '}
              <span className="text-primary">Cosy</span> heat pump<br />
              could do for your home
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto mb-8">
              Powered by your EPC data. Instant estimate. No obligation.
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-3">
              {TRUST_BADGES.map((badge, i) => (
                <div 
                  key={i} 
                  className="flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-border"
                >
                  <badge.icon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{badge.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Search Card */}
          <div className="max-w-xl mx-auto">
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-lg border border-border">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
                  <Search className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Find your home</h2>
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

            {/* Trust line below */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>No sales calls. No obligation.</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                <span>We respect your privacy.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Row */}
      <section className="py-10 bg-white border-y border-border">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center justify-center gap-4 md:gap-8">
            {STEPS.map((step, i) => (
              <div key={i} className="flex items-center gap-4 md:gap-6">
                <div className="flex flex-col items-center text-center">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-2 ${
                    step.active 
                      ? 'bg-primary' 
                      : 'bg-muted border-2 border-border'
                  }`}>
                    <step.icon className={`w-6 h-6 ${step.active ? 'text-white' : 'text-primary'}`} />
                  </div>
                  <span className="text-xs font-bold text-primary">Step {step.num}</span>
                  <span className="text-xs text-muted-foreground">{step.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="w-8 md:w-16 h-0.5 bg-border rounded-full" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-14">
        <div className="max-w-3xl mx-auto px-4">
          <h3 className="text-center text-xl font-bold text-foreground mb-8">
            Trusted by homeowners across the UK
          </h3>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            {STATS.map((stat, i) => (
              <div 
                key={i} 
                className="text-center p-5 rounded-2xl bg-muted border border-border"
              >
                <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Accreditation Strip */}
      <section className="py-10 bg-white border-y border-primary/5">
        <div className="max-w-3xl mx-auto px-4">
          <h3 className="text-center text-sm font-bold text-muted-foreground uppercase tracking-wide mb-6">
            Trusted & Accredited
          </h3>
          
          <div className="flex flex-wrap items-center justify-center gap-4">
            <CosyBadge size="md" />
            <img 
              src={octopusPartner} 
              alt="Octopus Trusted Partner" 
              className="h-12 w-auto object-contain"
            />
            {ACCREDITATIONS.map((acc, i) => (
              <div 
                key={i} 
                className="px-5 py-2.5 bg-muted/50 rounded-full border border-primary/10 text-sm font-semibold text-muted-foreground"
              >
                {acc.text}
              </div>
            ))}
          </div>
          
          <p className="text-center text-sm text-muted-foreground mt-6">
            Installed by certified professionals.
          </p>
        </div>
      </section>

      {/* Footer Reassurance */}
      <section className="py-8">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground/70">
            Digital estimate only. Final system design and pricing confirmed after a home survey.
          </p>
        </div>
      </section>
    </div>
  );
}
