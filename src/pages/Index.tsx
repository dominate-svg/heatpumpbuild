import { useState } from 'react';
import { Header } from '@/components/Header';
import { AddressLookup } from '@/components/AddressLookup';
import { ManualEntryForm } from '@/components/ManualEntryForm';
import { Flame, Shield, Clock, Award } from 'lucide-react';
import type { EPCData } from '@/lib/calculations';
import { useNavigate } from 'react-router-dom';

const TRUST_BADGES = [
  { icon: Shield, label: 'MCS Certified' },
  { icon: Award, label: 'Octopus Trusted Partner' },
  { icon: Clock, label: '5-Year Warranty' },
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
      <section className="relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/20 via-transparent to-transparent" />
        
        <div className="relative max-w-4xl mx-auto px-4 py-16 md:py-24">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
              <Flame className="w-4 h-4 text-accent" />
              <span className="text-sm text-white/90">Cosy Heat Pump Estimate Tool</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Get an instant estimate for a{' '}
              <span className="text-gradient">Cosy heat pump</span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8">
              See your potential savings in 60 seconds. Digital estimate based on EPC data — final quote after survey.
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-6 mb-10">
              {TRUST_BADGES.map((badge, i) => (
                <div key={i} className="flex items-center gap-2 text-white/70">
                  <badge.icon className="w-5 h-5 text-accent" />
                  <span className="text-sm font-medium">{badge.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Form Card */}
          <div className="glass rounded-2xl p-6 md:p-8 shadow-glow max-w-2xl mx-auto">
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

      {/* Social proof section */}
      <section className="py-12 bg-card border-t border-border">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm mb-4">
            Trusted by homeowners across the UK
          </p>
          <div className="flex flex-wrap justify-center gap-8 items-center opacity-60">
            <div className="text-2xl font-bold text-foreground">500+</div>
            <div className="text-sm text-muted-foreground">Installations completed</div>
            <div className="text-2xl font-bold text-foreground">4.9★</div>
            <div className="text-sm text-muted-foreground">Average rating</div>
            <div className="text-2xl font-bold text-foreground">£1,200</div>
            <div className="text-sm text-muted-foreground">Avg. annual savings</div>
          </div>
        </div>
      </section>
    </div>
  );
}
