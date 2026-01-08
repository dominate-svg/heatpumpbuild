import { useState } from 'react';
import { Header } from '@/components/Header';
import { AddressLookup } from '@/components/AddressLookup';
import { ManualEntryForm } from '@/components/ManualEntryForm';
import { CosyBadge } from '@/components/CosyBadge';
import { Award, BadgeCheck, Percent, Search, ClipboardCheck, CalendarCheck, Shield, Lock, Star, Quote } from 'lucide-react';
import type { EPCData } from '@/lib/calculations';
import { useNavigate } from 'react-router-dom';
import octopusPartner from '@/assets/octopus-partner.png';

const TRUST_BADGES = [
  { icon: Award, label: '£7,500 grant available' },
  { icon: Percent, label: '0% VAT on installation' },
  { icon: BadgeCheck, label: 'Octopus-accredited installer' },
];

const STEPS = [
  { icon: Search, label: 'Find your home', num: 1 },
  { icon: ClipboardCheck, label: 'See your estimate', num: 2 },
  { icon: CalendarCheck, label: 'Book your survey', num: 3, optional: true },
];

const STATS = [
  { value: '500+', label: 'Installations completed' },
  { value: '4.9★', label: 'Average customer rating' },
  { value: '~£1,200', label: 'Average annual savings' },
];

const TESTIMONIALS = [
  { text: "Everything was explained clearly and the install was brilliant.", author: "Sarah", location: "Leeds" },
  { text: "Our bills dropped immediately. Highly recommend.", author: "Mark", location: "Bristol" },
];

const ACCREDITATIONS = [
  { name: 'Octopus Trusted Partner', logo: octopusPartner },
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
      
      {/* Hero Section - Clean & Focused */}
      <section className="relative bg-gradient-to-b from-muted/30 to-background">
        <div className="max-w-3xl mx-auto px-4 pt-8 pb-12 md:pt-12 md:pb-16">
          
          {/* Headline */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-4">
              Find out if a Cosy heat pump could work for your home.
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-6">
              Instant estimate powered by your EPC data. No sales call. No obligation.
            </p>

            {/* Trust badges - subtle pills */}
            <div className="flex flex-wrap justify-center gap-2 md:gap-3">
              {TRUST_BADGES.map((badge, i) => (
                <div 
                  key={i} 
                  className="flex items-center gap-2 bg-background rounded-full px-3 py-1.5 border border-border text-sm"
                >
                  <badge.icon className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">{badge.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Elevated Search Box - Primary Focus */}
          <div className="max-w-xl mx-auto">
            <div className="relative">
              {/* Subtle glow */}
              <div className="absolute -inset-4 bg-primary/10 rounded-3xl blur-2xl" />
              
              {/* Main Card */}
              <div className="relative bg-white rounded-2xl p-6 md:p-8 shadow-xl border border-border/50">
                <div className="text-center mb-5">
                  <h2 className="text-xl font-bold text-foreground mb-1">Find your home</h2>
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

                <p className="text-center text-xs text-muted-foreground mt-4">
                  Takes about 30 seconds
                </p>
              </div>
            </div>

            {/* Micro-trust below search */}
            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
              <Lock className="w-3 h-3" />
              <span>We only use your address to generate your estimate — no spam, no selling your data.</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Explainer */}
      <section className="py-8 border-y border-border bg-background">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center justify-between md:justify-center md:gap-12">
            {STEPS.map((step, i) => (
              <div key={i} className="flex items-center gap-2 md:gap-8">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <step.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-foreground">Step {step.num}</span>
                  <span className="text-xs text-muted-foreground">{step.label}</span>
                  {step.optional && <span className="text-[10px] text-muted-foreground/70">(optional)</span>}
                </div>
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block w-16 h-px bg-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 bg-background">
        <div className="max-w-3xl mx-auto px-4">
          <h3 className="text-center text-lg font-semibold text-foreground mb-8">
            Trusted by homeowners across the UK
          </h3>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            {STATS.map((stat, i) => (
              <div 
                key={i} 
                className="text-center p-4 rounded-xl bg-muted/30"
              >
                <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="grid md:grid-cols-2 gap-4">
            {TESTIMONIALS.map((testimonial, i) => (
              <div key={i} className="bg-muted/20 rounded-xl p-5 border border-border/50">
                <Quote className="w-5 h-5 text-primary/40 mb-2" />
                <p className="text-sm text-foreground mb-3">"{testimonial.text}"</p>
                <p className="text-xs text-muted-foreground">— {testimonial.author}, {testimonial.location}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Accreditation & Trust Logos */}
      <section className="py-10 bg-muted/20 border-y border-border">
        <div className="max-w-3xl mx-auto px-4">
          <h3 className="text-center text-sm font-medium text-muted-foreground mb-6">
            Accredited and trusted
          </h3>
          
          <div className="flex flex-wrap items-center justify-center gap-6 mb-4">
            <CosyBadge size="md" className="opacity-80 hover:opacity-100 transition-opacity" />
            {ACCREDITATIONS.map((acc, i) => (
              acc.logo ? (
                <img 
                  key={i} 
                  src={acc.logo} 
                  alt={acc.name} 
                  className="h-10 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
                />
              ) : (
                <div 
                  key={i} 
                  className="px-4 py-2 bg-background rounded-lg border border-border text-xs font-medium text-muted-foreground opacity-70 hover:opacity-100 transition-opacity"
                >
                  {acc.text}
                </div>
              )
            ))}
          </div>
          
          <p className="text-center text-xs text-muted-foreground">
            All installs completed by certified professionals.
          </p>
        </div>
      </section>

      {/* Footer Reassurance */}
      <section className="py-8 bg-background">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground/70">
            Digital estimate only. Final system design and pricing confirmed after a home survey.
          </p>
        </div>
      </section>
    </div>
  );
}
