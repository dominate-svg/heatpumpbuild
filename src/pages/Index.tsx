import { useState } from 'react';
import { Header } from '@/components/Header';
import { AddressLookup } from '@/components/AddressLookup';
import { ManualEntryForm } from '@/components/ManualEntryForm';
import { CosyBadge } from '@/components/CosyBadge';
import { Award, BadgeCheck, Percent, Search, ClipboardCheck, CalendarCheck, Sparkles, ArrowDown } from 'lucide-react';
import type { EPCData } from '@/lib/calculations';
import { useNavigate } from 'react-router-dom';

const TRUST_BADGES = [
  { icon: Award, label: '£7,500 grant available', color: 'text-success', delay: '0s' },
  { icon: Percent, label: '0% VAT on installation', color: 'text-accent', delay: '0.1s' },
  { icon: BadgeCheck, label: 'Octopus-accredited installer', color: 'text-primary', delay: '0.2s' },
];

const STEPS = [
  { icon: Search, label: 'Find your home', num: 1 },
  { icon: ClipboardCheck, label: 'See your estimate', num: 2 },
  { icon: CalendarCheck, label: 'Book your survey', num: 3 },
];

const STATS = [
  { value: '500+', label: 'Installations', color: 'text-foreground' },
  { value: '4.9★', label: 'Average rating', color: 'text-foreground' },
  { value: '~£1,200', label: 'Avg. annual savings', color: 'text-success' },
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
      
      {/* Hero Section - Centered */}
      <section className="relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="relative max-w-4xl mx-auto px-4 py-12 md:py-16">
          {/* Main headline - centered */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-6 animate-bounce-in">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Get your free estimate in 30 seconds</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-4">
              See what a{' '}
              <span className="text-gradient">Cosy heat pump</span>{' '}
              could do for your home
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
              Powered by your EPC data. Instant savings estimate. No obligation.
            </p>

            {/* Trust badges - animated */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {TRUST_BADGES.map((badge, i) => (
                <div 
                  key={i} 
                  className="flex items-center gap-2 bg-card rounded-full px-4 py-2 shadow-soft border border-border animate-slide-up hover:scale-105 transition-transform cursor-default"
                  style={{ animationDelay: badge.delay }}
                >
                  <badge.icon className={`w-4 h-4 ${badge.color}`} />
                  <span className="text-sm font-medium text-foreground">{badge.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Big centered CTA */}
          <div className="max-w-xl mx-auto animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="relative">
              {/* Animated glow ring */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-primary rounded-3xl blur-md opacity-40 animate-pulse" />
              <div className="absolute -inset-3 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-[2rem] blur-xl opacity-60" style={{ animation: 'pulse 3s ease-in-out infinite' }} />
              
              {/* Main CTA Card */}
              <div className="relative bg-card rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-elevated border-2 border-primary/30">
                <div className="text-center mb-5">
                  <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 mb-4 shadow-lg animate-float">
                    <Search className="w-7 h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1">Find your home</h2>
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

          {/* Scroll indicator */}
          <div className="flex justify-center mt-8 animate-bounce">
            <ArrowDown className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
      </section>

      {/* Steps indicator - animated */}
      <section className="py-10 border-t border-border bg-gradient-to-b from-card to-background">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center gap-2 md:gap-6">
            {STEPS.map((step, i) => (
              <div key={i} className="flex items-center gap-2 md:gap-4 animate-fade-in" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="flex items-center gap-2 md:gap-3 group">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform shadow-soft">
                    <step.icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                  </div>
                  <div className="hidden sm:block">
                    <span className="text-xs text-muted-foreground">Step {i + 1}</span>
                    <p className="text-sm font-medium text-foreground">{step.label}</p>
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="w-6 md:w-12 h-0.5 bg-gradient-to-r from-primary/30 to-transparent rounded-full" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof - animated stats */}
      <section className="py-12 md:py-16 bg-background">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-center text-muted-foreground text-sm mb-8 animate-fade-in">
            Trusted by homeowners across the UK
          </p>
          
          <div className="grid grid-cols-3 gap-4 md:gap-8 stagger-children">
            {STATS.map((stat, i) => (
              <div 
                key={i} 
                className="text-center p-4 md:p-6 rounded-2xl bg-card border border-border shadow-soft hover:shadow-card hover:-translate-y-1 transition-all cursor-default"
              >
                <div className={`text-2xl md:text-4xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                <div className="text-xs md:text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Cosy badge */}
          <div className="flex justify-center mt-10 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <CosyBadge size="lg" />
          </div>
        </div>
      </section>
    </div>
  );
}
