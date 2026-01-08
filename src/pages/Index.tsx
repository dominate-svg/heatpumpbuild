import { useState } from 'react';
import { Header } from '@/components/Header';
import { AddressLookup } from '@/components/AddressLookup';
import { ManualEntryForm } from '@/components/ManualEntryForm';
import { CosyBadge } from '@/components/CosyBadge';
import { Award, BadgeCheck, Percent, Search, ClipboardCheck, CalendarCheck, Lock, ShieldCheck, Zap, Star } from 'lucide-react';
import type { EPCData } from '@/lib/calculations';
import { useNavigate } from 'react-router-dom';
import octopusPartner from '@/assets/octopus-partner.png';
import cosyPump from '@/assets/cosy-pump.jpeg';

const TRUST_BADGES = [
  { icon: Award, label: '£7,500 grant' },
  { icon: Percent, label: '0% VAT' },
  { icon: BadgeCheck, label: 'Octopus accredited' },
];

const STEPS = [
  { icon: Search, label: 'Find your home', num: 1, active: true },
  { icon: ClipboardCheck, label: 'See your estimate', num: 2 },
  { icon: CalendarCheck, label: 'Book your survey', num: 3 },
];

const STATS = [
  { value: '500+', label: 'Installs completed', icon: Zap },
  { value: '4.9', label: 'Star rating', icon: Star },
  { value: '£1,200', label: 'Avg. yearly savings', icon: Award },
];

const TESTIMONIALS = [
  { text: "Everything was explained clearly and the install was brilliant.", author: "Sarah", location: "Leeds" },
  { text: "Our bills dropped immediately. Highly recommend.", author: "Mark", location: "Bristol" },
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
      
      {/* Hero Section - Bold & Impactful */}
      <section className="relative bg-primary overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 translate-y-1/2" />
        
        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            
            {/* Left - Text */}
            <div className="text-white">
              <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 mb-6">
                <Zap className="w-4 h-4" />
                <span className="text-sm font-semibold">Free instant estimate</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                See what a Cosy heat pump could do for your home
              </h1>
              
              <p className="text-xl text-white/80 mb-8">
                Powered by your EPC data. No sales call. No obligation.
              </p>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-3">
                {TRUST_BADGES.map((badge, i) => (
                  <div 
                    key={i} 
                    className="flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-2"
                  >
                    <badge.icon className="w-4 h-4 text-white" />
                    <span className="text-sm font-medium text-white">{badge.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Search Card */}
            <div className="relative">
              <div className="bg-white rounded-3xl p-8 shadow-2xl">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary mb-4">
                    <Search className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">Find your home</h2>
                  <p className="text-muted-foreground mt-1">Enter your postcode to get started</p>
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

                {/* Trust indicators */}
                <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-border">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <span>No sales calls</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Lock className="w-4 h-4 text-primary" />
                    <span>Privacy protected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Row */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between">
            {STEPS.map((step, i) => (
              <div key={i} className="flex items-center flex-1">
                <div className="flex flex-col items-center text-center flex-1">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
                    step.active 
                      ? 'bg-primary text-white' 
                      : 'bg-muted text-primary'
                  }`}>
                    <step.icon className="w-7 h-7" />
                  </div>
                  <span className="text-sm font-bold text-foreground">{step.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="flex-shrink-0 w-12 md:w-24 h-1 bg-muted rounded-full mx-2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof - Big Numbers */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-4xl mx-auto px-4">
          <h3 className="text-center text-2xl font-bold text-foreground mb-10">
            Trusted by homeowners across the UK
          </h3>
          
          {/* Stats - Bold & Colorful */}
          <div className="grid grid-cols-3 gap-6 mb-12">
            {STATS.map((stat, i) => (
              <div 
                key={i} 
                className="text-center p-6 rounded-2xl bg-white border-2 border-primary/10 hover:border-primary/30 transition-colors"
              >
                <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="grid md:grid-cols-2 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-border">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-foreground mb-4">"{t.text}"</p>
                <p className="text-sm text-muted-foreground font-medium">— {t.author}, {t.location}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Heat Pump Showcase */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h3 className="text-3xl font-bold text-foreground mb-4">
                The Cosy Heat Pump
              </h3>
              <p className="text-lg text-muted-foreground mb-6">
                Quiet, efficient, and designed to fit seamlessly into UK homes. 
                Eligible for the £7,500 Boiler Upgrade Scheme grant.
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="bg-primary/10 text-primary font-semibold px-4 py-2 rounded-full text-sm">
                  A+++ rated
                </div>
                <div className="bg-primary/10 text-primary font-semibold px-4 py-2 rounded-full text-sm">
                  Ultra quiet
                </div>
                <div className="bg-primary/10 text-primary font-semibold px-4 py-2 rounded-full text-sm">
                  7-year warranty
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src={cosyPump} 
                alt="Cosy Heat Pump" 
                className="rounded-2xl shadow-xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Accreditation Strip */}
      <section className="py-12 bg-muted/30 border-y border-border">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">
            Trusted & Accredited
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-6">
            <CosyBadge size="lg" />
            <img 
              src={octopusPartner} 
              alt="Octopus Trusted Partner" 
              className="h-14 w-auto object-contain"
            />
            <div className="px-6 py-3 bg-white rounded-xl border border-border text-sm font-bold text-foreground">
              MCS Certified
            </div>
            <div className="px-6 py-3 bg-white rounded-xl border border-border text-sm font-bold text-foreground">
              TrustMark
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="py-8 bg-background">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            Digital estimate only. Final system design and pricing confirmed after a home survey.
          </p>
        </div>
      </section>
    </div>
  );
}
