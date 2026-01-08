import { useState } from 'react';
import { AddressLookup } from '@/components/AddressLookup';
import { ManualEntryForm } from '@/components/ManualEntryForm';
import type { EPCData } from '@/lib/calculations';
import { useNavigate, Link } from 'react-router-dom';
import logo from '@/assets/logo.png';
import octopusPartner from '@/assets/octopus-partner.png';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function Index() {
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [showManualEntryBottom, setShowManualEntryBottom] = useState(false);
  const navigate = useNavigate();

  const handleAddressSelect = (epcData: EPCData) => {
    sessionStorage.setItem('epcData', JSON.stringify(epcData));
    navigate('/estimate');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Minimal, confident */}
      <header className="w-full py-5 px-6 border-b border-border bg-background sticky top-0 z-50">
        <div className="max-w-[1120px] mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Smart Energy Homes" className="h-8 w-auto" />
          </Link>
          <nav className="flex items-center gap-6">
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Help
            </a>
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              About
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section - Clean, no background image */}
      <section className="pt-12 pb-16 md:pt-20 md:pb-24 px-4">
        <div className="max-w-[1120px] mx-auto flex flex-col items-center text-center">
          {/* Eyebrow trust line */}
          <p className="text-octopus text-sm font-medium mb-6">
            Trusted Octopus Partner • Rated Excellent on Trustpilot
          </p>

          {/* Main headline */}
          <h1 className="text-[34px] sm:text-[44px] md:text-[56px] font-bold text-foreground leading-[1.1] max-w-3xl mb-5">
            Join the Octopus <span className="text-octopus">Cosy</span> heat pump revolution
            <br className="hidden sm:block" />
            <span className="block mt-2">Get a heat pump estimate in <span className="text-primary">under 30 seconds</span></span>
          </h1>

          {/* Subheadline */}
          <p className="text-muted-foreground text-lg max-w-xl mb-10">
            Powered by your home's EPC data. No obligation, no pushy sales calls.
          </p>

          {/* Postcode Module - Main conversion element */}
          <div className="w-full max-w-md bg-card rounded-2xl p-6 sm:p-8 shadow-elevated border border-border animate-halo-pulse">
            <p className="text-octopus text-xs font-semibold tracking-wide mb-2">
              FREE EPC CHECK
            </p>
            <h2 className="text-xl font-bold text-foreground mb-5">
              Check your home
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
            
            <p className="text-center text-xs text-muted-foreground mt-4">
              Takes ~30 seconds • No spam • We don't sell your data
            </p>
          </div>

          {/* Social proof strip - directly under postcode module */}
          <div className="mt-10 w-full max-w-3xl">
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1,2,3,4,5].map((i) => (
                    <svg key={i} className="w-4 h-4 text-green-500 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                    </svg>
                  ))}
                </div>
                <span>Rated Excellent (200+ reviews)</span>
              </div>
              <span className="hidden sm:inline text-border">|</span>
              <div className="flex items-center gap-2">
                <img src={octopusPartner} alt="" className="h-5 w-auto opacity-60" />
                <span>Trusted Octopus Partner</span>
              </div>
              <span className="hidden md:inline text-border">|</span>
              <span>£7,500 grant available</span>
              <span className="hidden md:inline text-border">|</span>
              <span>Installed from £1,995</span>
            </div>
          </div>
        </div>
      </section>

      {/* Why this is worth checking */}
      <section className="py-14 md:py-20 px-4 bg-card border-y border-border">
        <div className="max-w-[1120px] mx-auto">
          <h2 className="text-[22px] sm:text-[28px] md:text-[34px] font-bold text-foreground text-center mb-12 md:mb-16">
            Why this is worth checking
          </h2>

          <div className="grid md:grid-cols-3 gap-10 md:gap-8">
            <div>
              <h3 className="text-lg font-bold text-foreground mb-3 border-b-2 border-primary pb-2 inline-block">
                Built for today's energy prices
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Cosy is designed around variable electricity prices — not fixed-rate boiler thinking. It heats when power is cheaper and coasts when it isn't.
              </p>
              <p className="text-sm font-semibold text-foreground">
                Smart timing, lower running costs
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-3 border-b-2 border-primary pb-2 inline-block">
                Steady warmth, not hot bursts
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Heat pumps run gently and consistently. Many people notice the comfort first — bills often follow.
              </p>
              <p className="text-sm font-semibold text-foreground">
                Comfort first
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-3 border-b-2 border-primary pb-2 inline-block">
                We handle everything
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Survey, design, grant paperwork, install. You get clarity and a system that works.
              </p>
              <p className="text-sm font-semibold text-foreground">
                Paperwork included
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cosy Tariff Section */}
      <section className="py-14 md:py-20 px-4">
        <div className="max-w-[1120px] mx-auto">
          <h2 className="text-[22px] sm:text-[28px] md:text-[34px] font-bold text-foreground text-center mb-8">
            <span className="text-octopus">8 hours</span> of half-price electricity. Every day.
          </h2>

          {/* Time windows */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            {['4–7am', '1–4pm', '10pm–midnight'].map((time) => (
              <span 
                key={time} 
                className="px-4 py-2 rounded-full border-2 border-octopus text-octopus text-sm font-medium"
              >
                {time}
              </span>
            ))}
          </div>

          <div className="max-w-2xl mx-auto text-center space-y-4 mb-10">
            <p className="text-muted-foreground leading-relaxed">
              Cosy shifts heating into cheaper windows automatically. You don't need to watch prices or micromanage settings.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              That's why Cosy can cost meaningfully less to run than a boiler — especially when set up properly.
            </p>
          </div>

          {/* Mini diagram - text-based horizontal bar */}
          <div className="max-w-xl mx-auto mb-10">
            <div className="relative h-10 rounded-lg overflow-hidden flex">
              <div className="flex-1 bg-octopus/20 flex items-center justify-center">
                <span className="text-xs font-medium text-octopus">Cheap</span>
              </div>
              <div className="w-16 bg-muted flex items-center justify-center">
                <span className="text-xs font-medium text-muted-foreground">Peak</span>
              </div>
              <div className="flex-1 bg-octopus/20 flex items-center justify-center">
                <span className="text-xs font-medium text-octopus">Cheap</span>
              </div>
              <div className="w-20 bg-muted flex items-center justify-center">
                <span className="text-xs font-medium text-muted-foreground">4–7pm</span>
              </div>
              <div className="flex-1 bg-octopus/20 flex items-center justify-center">
                <span className="text-xs font-medium text-octopus">Cheap</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Expensive 4–7pm peak avoided automatically
            </p>
          </div>

          <p className="text-center text-muted-foreground">
            Want to see what that means for your home?{' '}
            <button 
              onClick={scrollToTop}
              className="text-primary font-medium hover:underline"
            >
              Check your postcode above
            </button>
          </p>
        </div>
      </section>

      {/* How the estimate works */}
      <section className="py-14 md:py-20 px-4 bg-card border-y border-border">
        <div className="max-w-[1120px] mx-auto">
          <h2 className="text-[22px] sm:text-[28px] md:text-[34px] font-bold text-foreground text-center mb-12 md:mb-16">
            How the estimate works
          </h2>

          <div className="grid md:grid-cols-2 gap-10 md:gap-16">
            {/* Left: Simple steps */}
            <div className="space-y-5">
              {[
                "We pull your home's EPC data",
                'We estimate heat demand and system size',
                'We show likely install contribution and running cost impact',
                'Survey confirms everything'
              ].map((step, i) => (
                <div key={i} className="flex gap-4">
                  <span className="text-sm font-bold text-muted-foreground w-5 flex-shrink-0">
                    {i + 1})
                  </span>
                  <span className="text-foreground">{step}</span>
                </div>
              ))}
            </div>

            {/* Right: Data sources card */}
            <div className="bg-background rounded-xl p-6 border border-border">
              <h3 className="text-lg font-bold text-foreground mb-4">
                What we use
              </h3>
              <ul className="space-y-3 text-muted-foreground mb-5">
                <li>• EPC floor area & fuel type</li>
                <li>• Typical heat pump efficiency ranges</li>
                <li>• Tariff rates you choose</li>
                <li>• Conservative assumptions (shown transparently)</li>
              </ul>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="assumptions" className="border-none">
                  <AccordionTrigger className="text-sm text-primary hover:no-underline py-0">
                    See assumptions
                  </AccordionTrigger>
                  <AccordionContent className="pt-3 text-sm text-muted-foreground space-y-2">
                    <p>• Heat pump efficiency (SCOP): 2.8 – 3.6</p>
                    <p>• Off-peak electricity share: 30% – 70%</p>
                    <p>• Heat intensity: 110 kWh/m² (if EPC unavailable)</p>
                    <p>• Boiler efficiency: 85–88%</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
      </section>

      {/* Grant Section */}
      <section className="py-14 md:py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-[22px] sm:text-[28px] md:text-[34px] font-bold text-foreground mb-8">
            The £7,500 government grant (BUS)
          </h2>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-muted-foreground mb-8">
            <span>Not means tested</span>
            <span className="hidden sm:inline text-border">•</span>
            <span>We handle the paperwork</span>
            <span className="hidden sm:inline text-border">•</span>
            <span>Available for many UK homes</span>
          </div>

          <p className="text-sm text-muted-foreground mb-6">
            Currently scheduled until April 2026 (subject to change)
          </p>

          <p className="text-muted-foreground">
            Many homeowners qualify — we'll confirm during the survey.
          </p>

          <p className="mt-6 text-foreground">
            Installed from <span className="text-primary font-bold text-xl">£1,995</span> for eligible homes (survey confirms)
          </p>
        </div>
      </section>

      {/* Credibility Section */}
      <section className="py-14 md:py-20 px-4 bg-foreground text-card">
        <div className="max-w-[1120px] mx-auto text-center">
          <h2 className="text-[22px] sm:text-[28px] md:text-[34px] font-bold mb-10">
            In safe hands
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 mb-10">
            <img src={octopusPartner} alt="Octopus Partner" className="h-12 w-auto brightness-0 invert opacity-90" />
            <div className="flex items-center gap-2">
              {[1,2,3,4,5].map((i) => (
                <svg key={i} className="w-5 h-5 text-green-400 fill-current" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                </svg>
              ))}
              <span className="text-sm font-medium ml-1">Trustpilot</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm sm:text-base opacity-90 mb-12">
            <span>One of a small number of Cosy-accredited installers</span>
            <span className="hidden md:inline opacity-40">•</span>
            <span>Trusted Octopus Partner</span>
            <span className="hidden md:inline opacity-40">•</span>
            <span>5★ Trustpilot rating (200+ reviews)</span>
          </div>

          <blockquote className="max-w-xl mx-auto">
            <p className="text-lg italic opacity-90 mb-3">
              "Clear advice, tidy install, and the house feels warm all day."
            </p>
            <cite className="text-sm opacity-70 not-italic">— Homeowner, Surrey</cite>
          </blockquote>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-14 md:py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-[22px] sm:text-[28px] md:text-[34px] font-bold text-foreground text-center mb-10">
            Common questions
          </h2>

          <Accordion type="single" collapsible className="w-full space-y-3">
            <AccordionItem value="q1" className="border border-border rounded-lg px-5">
              <AccordionTrigger className="text-left font-medium hover:no-underline">
                Do heat pumps work in winter?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes. Modern heat pumps work efficiently down to -15°C or lower. They're widely used in Scandinavia. The key is proper sizing and installation — which we handle during the survey.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q2" className="border border-border rounded-lg px-5">
              <AccordionTrigger className="text-left font-medium hover:no-underline">
                Will my radiators need changing?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Not always. We assess your radiators during the survey. Some may need upgrading for optimal efficiency, but many homes keep most of their existing radiators.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q3" className="border border-border rounded-lg px-5">
              <AccordionTrigger className="text-left font-medium hover:no-underline">
                Is the Cosy tariff required?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                No, but it significantly improves savings. Cosy gives you 8 hours of half-price electricity daily, which makes running a heat pump much cheaper. You can switch tariffs anytime.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q4" className="border border-border rounded-lg px-5">
              <AccordionTrigger className="text-left font-medium hover:no-underline">
                Is it noisy?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Modern heat pumps are quieter than you'd expect — typically 40–45dB, similar to a refrigerator. We position the outdoor unit carefully to minimise any impact.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q5" className="border border-border rounded-lg px-5">
              <AccordionTrigger className="text-left font-medium hover:no-underline">
                How long does installation take?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Usually 2–3 days for most homes. We'll confirm the timeline during your survey. Our team handles everything including connecting to your existing heating system.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q6" className="border border-border rounded-lg px-5">
              <AccordionTrigger className="text-left font-medium hover:no-underline">
                What happens after I check my postcode?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                You'll see an estimate based on your EPC data. If it looks promising, you can request a free home survey. There's no obligation — we only proceed if you're happy with the plan.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-14 md:py-20 px-4 bg-card border-t border-border">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-background rounded-2xl p-6 sm:p-8 shadow-elevated border border-border">
            <p className="text-octopus text-xs font-semibold tracking-wide mb-2">
              READY TO CHECK?
            </p>
            <h2 className="text-xl font-bold text-foreground mb-5">
              See your estimate in 30 seconds
            </h2>
            
            {showManualEntryBottom ? (
              <ManualEntryForm
                onSubmit={handleAddressSelect}
                onBack={() => setShowManualEntryBottom(false)}
              />
            ) : (
              <AddressLookup
                onAddressSelect={handleAddressSelect}
                onManualEntry={() => setShowManualEntryBottom(true)}
              />
            )}
            
            <p className="text-center text-xs text-muted-foreground mt-4">
              No obligation. Book a survey only if it looks good.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-[1120px] mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            Digital estimate only. Final system design and pricing confirmed after a home survey.
          </p>
        </div>
      </footer>
    </div>
  );
}