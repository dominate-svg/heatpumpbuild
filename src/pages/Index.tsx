import { useState, useEffect, useCallback } from 'react';
import { AddressLookup } from '@/components/AddressLookup';
import { ManualEntryForm } from '@/components/ManualEntryForm';
import { ResearchScreen } from '@/components/ResearchScreen';
import type { EPCData } from '@/lib/calculations';
import { useNavigate, Link } from 'react-router-dom';
import logo from '@/assets/logo.png';
import octopusPartner from '@/assets/octopus-partner.png';
import cosyPump from '@/assets/cosy-pump.jpeg';
import { CosyBadge } from '@/components/CosyBadge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function Index() {
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [showManualEntryBottom, setShowManualEntryBottom] = useState(false);
  const [showMobileBar, setShowMobileBar] = useState(false);
  const [showResearchScreen, setShowResearchScreen] = useState(false);
  const [isDataReady, setIsDataReady] = useState(false);
  const [hasEpcError, setHasEpcError] = useState(false);
  const [pendingEpcData, setPendingEpcData] = useState<EPCData | null>(null);
  const navigate = useNavigate();

  const handleAddressSelect = (epcData: EPCData) => {
    // Store EPC data and show research screen
    setPendingEpcData(epcData);
    setShowResearchScreen(true);
    setIsDataReady(true);
    setHasEpcError(false);
  };

  const handleResearchComplete = useCallback(() => {
    if (pendingEpcData) {
      sessionStorage.setItem('epcData', JSON.stringify(pendingEpcData));
      navigate('/estimate');
    }
  }, [pendingEpcData, navigate]);

  const handleManualEstimateFromError = useCallback(() => {
    setShowResearchScreen(false);
    setHasEpcError(false);
    setShowManualEntry(true);
  }, []);

  const handleTryAgain = useCallback(() => {
    setShowResearchScreen(false);
    setHasEpcError(false);
    setPendingEpcData(null);
    setIsDataReady(false);
  }, []);

  const scrollToPostcode = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Show mobile sticky bar after scrolling past hero
  useEffect(() => {
    const handleScroll = () => {
      setShowMobileBar(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Show research screen overlay
  if (showResearchScreen) {
    return (
      <ResearchScreen
        isDataReady={isDataReady}
        hasError={hasEpcError}
        onComplete={handleResearchComplete}
        onManualEstimate={handleManualEstimateFromError}
        onTryAgain={handleTryAgain}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Minimal */}
      <header className="w-full py-3 px-4 md:py-4 md:px-12 border-b border-border bg-background sticky top-0 z-50">
        <div className="max-w-[1140px] mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Smart Energy Homes" className="h-7 md:h-8 w-auto" />
          </Link>
          <nav className="flex items-center gap-4 md:gap-6">
            <a href="#" className="text-xs md:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Help
            </a>
            <a href="#how-it-works" className="text-xs md:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              How it works
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-8 pb-10 px-4 md:pt-16 md:pb-20 md:px-12">
        <div className="max-w-[1140px] mx-auto flex flex-col items-center text-center">
          {/* Eyebrow trust line */}
          <p className="text-octopus text-[11px] md:text-[13px] font-semibold tracking-wide uppercase mb-4 md:mb-5">
            Trusted Octopus Partner • 5★ Trustpilot
          </p>

          {/* Main headline */}
          <h1 className="text-[28px] sm:text-[38px] md:text-[56px] font-extrabold text-foreground leading-[1.1] max-w-4xl mb-3 md:mb-4">
            Join the Octopus <span className="text-octopus">Cosy</span> heat pump revolution
          </h1>
          <p className="text-[18px] sm:text-[24px] md:text-[34px] font-bold text-foreground leading-[1.2] max-w-3xl mb-4 md:mb-5">
            Get an estimate in <span className="text-primary">less than 30 seconds</span>
          </p>

          {/* Support line */}
          <p className="text-muted-foreground text-sm md:text-lg max-w-xl mb-6 md:mb-10 px-2">
            Powered by your home's EPC data. No sales calls. No obligation.
          </p>

          {/* Postcode Module */}
          <div className="w-full max-w-[480px] md:max-w-[560px] bg-card rounded-2xl md:rounded-[20px] p-5 md:p-8 shadow-elevated border border-border animate-halo-pulse">
            <p className="text-octopus text-[10px] md:text-xs font-semibold tracking-wider uppercase mb-1.5 md:mb-2">
              Free EPC Check
            </p>
            <h2 className="text-lg md:text-xl font-bold text-foreground mb-4 md:mb-5">
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
            
            <p className="text-center text-[10px] md:text-xs text-muted-foreground mt-3 md:mt-4">
              Takes ~30 seconds • No spam • We don't sell your data
            </p>
          </div>

          {/* Cosy Badge */}
          <div className="mt-6 md:mt-8">
            <CosyBadge size="lg" />
          </div>

          {/* Social proof strip */}
          <div className="mt-4 md:mt-6 w-full max-w-3xl px-2">
            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-2 md:gap-x-3 text-xs md:text-sm text-foreground font-medium">
              <div className="flex items-center gap-1">
                <span className="text-green-600">★</span>
                <span>5★ Trustpilot</span>
              </div>
              <span className="hidden sm:inline text-border">·</span>
              <div className="flex items-center gap-2 mt-1 sm:mt-0">
                <span><span className="text-primary font-bold">£7,500</span> grant</span>
                <span className="text-border">·</span>
                <span>From <span className="text-primary font-bold">£1995</span></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: If you have a boiler */}
      <section className="py-10 md:py-20 px-4 md:px-12 bg-card border-y border-border">
        <div className="max-w-[1140px] mx-auto">
          <div className="grid md:grid-cols-2 gap-6 md:gap-16 items-center">
            {/* Text - Left */}
            <div>
              <h2 className="text-[24px] sm:text-[30px] md:text-[42px] font-bold text-foreground leading-[1.15] mb-4 md:mb-6">
                If you have a boiler, this is your chance to upgrade.
              </h2>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-5 md:mb-6">
                The Cosy Heat Pump is built for today's energy prices — not yesterday's heating systems.
              </p>
              <button
                onClick={scrollToPostcode}
                className="w-full sm:w-auto bg-primary text-primary-foreground px-6 py-3.5 md:py-3 rounded-lg font-bold text-sm md:text-base cta-hover-lift"
              >
                Check your postcode
              </button>
            </div>
            {/* Image - Right */}
            <div className="bg-muted rounded-xl md:rounded-2xl aspect-[4/3] flex items-center justify-center border border-border overflow-hidden">
              <img 
                src={cosyPump} 
                alt="Cosy heat pump installed at a UK home exterior" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section: Cosy Tariff */}
      <section className="py-10 md:py-20 px-4 md:px-12">
        <div className="max-w-[1140px] mx-auto">
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-start">
            {/* Text */}
            <div>
              <p className="text-base md:text-xl text-foreground leading-relaxed mb-5 md:mb-6">
                Paired with Octopus Energy's Cosy tariff 🐙, it gives you <span className="text-octopus font-bold">8 hours</span> of electricity at roughly <span className="text-octopus font-bold">half price</span>, every day ⏱️:
              </p>
              
              {/* Time windows */}
              <div className="flex flex-wrap gap-2 md:gap-3 mb-6 md:mb-8">
                {['4–7am', '1–4pm', '10pm–12am'].map((time) => (
                  <span 
                    key={time} 
                    className="px-3 md:px-5 py-2 md:py-2.5 rounded-full border-2 border-octopus text-octopus text-sm md:text-base font-semibold"
                  >
                    {time}
                  </span>
                ))}
              </div>

              <p className="text-base md:text-lg text-foreground leading-relaxed mb-3 md:mb-4">
                Your home heats when electricity is cheap — not when it's expensive.
              </p>
              <p className="text-base md:text-lg text-foreground font-semibold border-b-2 border-primary inline-block pb-1 mb-5 md:mb-6">
                That's the difference.
              </p>
              <div>
                <button
                  onClick={scrollToPostcode}
                  className="w-full sm:w-auto bg-primary text-primary-foreground px-6 py-3.5 md:py-3 rounded-lg font-bold text-sm md:text-base cta-hover-lift"
                >
                  Check your postcode
                </button>
              </div>
            </div>

            {/* Graphic - Schedule Bar */}
            <div className="bg-muted rounded-xl md:rounded-2xl p-4 md:p-6 border border-border">
              <p className="text-xs md:text-sm font-semibold text-foreground mb-3 md:mb-4 uppercase tracking-wide">Daily half-price windows</p>
              <div className="space-y-2 md:space-y-3">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-14 md:w-20 text-xs md:text-sm text-muted-foreground">12am</div>
                  <div className="flex-1 h-7 md:h-8 rounded bg-muted-foreground/10 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-[29%] bg-octopus/30 border-l-2 border-r-2 border-octopus flex items-center justify-center">
                      <span className="text-[10px] md:text-xs font-medium text-octopus">4–7am</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-14 md:w-20 text-xs md:text-sm text-muted-foreground">12pm</div>
                  <div className="flex-1 h-7 md:h-8 rounded bg-muted-foreground/10 relative overflow-hidden">
                    <div className="absolute left-[8%] top-0 bottom-0 w-[25%] bg-octopus/30 border-l-2 border-r-2 border-octopus flex items-center justify-center">
                      <span className="text-[10px] md:text-xs font-medium text-octopus">1–4pm</span>
                    </div>
                    <div className="absolute left-[33%] top-0 bottom-0 w-[25%] bg-muted-foreground/30 flex items-center justify-center">
                      <span className="text-[10px] md:text-xs font-medium text-muted-foreground">Peak</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-14 md:w-20 text-xs md:text-sm text-muted-foreground">Evening</div>
                  <div className="flex-1 h-7 md:h-8 rounded bg-muted-foreground/10 relative overflow-hidden">
                    <div className="absolute right-0 top-0 bottom-0 w-[33%] bg-octopus/30 border-l-2 border-r-2 border-octopus flex items-center justify-center">
                      <span className="text-[10px] md:text-xs font-medium text-octopus">10pm+</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 mt-3 md:mt-4 text-[10px] md:text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <span className="inline-block w-2.5 h-2.5 md:w-3 md:h-3 bg-octopus/30 border border-octopus rounded"></span>
                  <span>Half-price</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="inline-block w-2.5 h-2.5 md:w-3 md:h-3 bg-muted-foreground/30 rounded"></span>
                  <span>Peak (4–7pm)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Objection handling */}
      <section className="py-10 md:py-20 px-4 md:px-12 bg-card border-y border-border">
        <div className="max-w-[1140px] mx-auto">
          <div className="grid md:grid-cols-2 gap-6 md:gap-16 items-center">
            {/* Image Placeholder - Left (shows second on mobile) */}
            <div className="bg-muted rounded-xl md:rounded-2xl aspect-[4/3] flex items-center justify-center p-6 md:p-8 border border-border order-2 md:order-1">
              <div className="text-center">
                <p className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">Image Placeholder</p>
                <p className="text-[10px] md:text-xs text-muted-foreground">Cosy unit close-up</p>
              </div>
            </div>
            {/* Text - Right (shows first on mobile) */}
            <div className="order-1 md:order-2">
              <p className="text-base md:text-xl text-foreground leading-relaxed mb-3 md:mb-4">
                You might have heard people say heat pumps don't work.
              </p>
              <p className="text-base md:text-xl text-foreground leading-relaxed font-medium mb-5 md:mb-6">
                You just haven't seen one like this — it works brilliantly, and it looks like it knows it 😏
              </p>
              <button
                onClick={scrollToPostcode}
                className="w-full sm:w-auto bg-primary text-primary-foreground px-6 py-3.5 md:py-3 rounded-lg font-bold text-sm md:text-base cta-hover-lift"
              >
                Check your postcode
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section: What sets Cosy apart */}
      <section className="py-10 md:py-20 px-4 md:px-12">
        <div className="max-w-[1140px] mx-auto">
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-start">
            {/* Text - Left */}
            <div>
              <h2 className="text-[22px] sm:text-[28px] md:text-[40px] font-bold text-foreground leading-[1.15] mb-4 md:mb-6">
                What really sets Cosy apart is how smart it is.
              </h2>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-4 md:mb-6">
                Instead of simply turning on when you ask for heat, Cosy learns how your home holds warmth, plans ahead, and decides when it's smartest to generate heat.
              </p>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-6 md:mb-8">
                It gently loads heat into your home during cheaper hours, then releases it steadily through the day — including during the <span className="border-b-2 border-octopus">costly 4–7pm peak</span> — so your home stays warm without chasing prices.
              </p>
              
              {/* Statement block */}
              <div className="space-y-2 md:space-y-3 text-base md:text-xl text-foreground font-medium pl-3 md:pl-4 border-l-4 border-primary mb-6 md:mb-8">
                <p>You don't see this happening.</p>
                <p>You don't manage it.</p>
                <p>It just works in the background.</p>
              </div>
              <button
                onClick={scrollToPostcode}
                className="w-full sm:w-auto bg-primary text-primary-foreground px-6 py-3.5 md:py-3 rounded-lg font-bold text-sm md:text-base cta-hover-lift"
              >
                Check your postcode
              </button>
            </div>

            {/* Graphic - How Cosy thinks */}
            <div className="bg-muted rounded-xl md:rounded-2xl p-5 md:p-8 border border-border">
              <p className="text-xs md:text-sm font-semibold text-foreground mb-4 md:mb-6 uppercase tracking-wide">How Cosy thinks</p>
              <div className="space-y-4 md:space-y-6">
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-octopus/20 text-octopus flex items-center justify-center font-bold text-xs md:text-sm flex-shrink-0">1</div>
                  <div>
                    <p className="font-semibold text-foreground text-sm md:text-base">Learns</p>
                    <p className="text-xs md:text-sm text-muted-foreground">How your home holds heat</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-octopus/20 text-octopus flex items-center justify-center font-bold text-xs md:text-sm flex-shrink-0">2</div>
                  <div>
                    <p className="font-semibold text-foreground text-sm md:text-base">Plans</p>
                    <p className="text-xs md:text-sm text-muted-foreground">Ahead based on weather + prices</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs md:text-sm flex-shrink-0">3</div>
                  <div>
                    <p className="font-semibold text-foreground text-sm md:text-base">Shifts</p>
                    <p className="text-xs md:text-sm text-muted-foreground">Heating into cheaper hours automatically</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Comfort + savings */}
      <section className="py-10 md:py-20 px-4 md:px-12 bg-card border-y border-border">
        <div className="max-w-[1140px] mx-auto">
          <div className="grid md:grid-cols-2 gap-6 md:gap-16 items-center">
            {/* Text - Left */}
            <div>
              <p className="text-base md:text-xl text-foreground leading-relaxed mb-4 md:mb-6">
                What most people notice first is how steady the warmth feels 🏡.
              </p>
              
              {/* Large typographic callout */}
              <div className="my-6 md:my-8">
                <p className="text-[28px] sm:text-[36px] md:text-[48px] font-bold text-primary leading-[1.1]">
                  Up to £370
                </p>
                <p className="text-lg md:text-2xl font-semibold text-foreground">
                  a year less than gas 💷
                </p>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-1.5 md:mt-2">
                  Estimate varies by home
                </p>
              </div>

              <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-5 md:mb-6">
                It uses far less energy than a boiler and is built to last around 20 years.
              </p>
              <button
                onClick={scrollToPostcode}
                className="w-full sm:w-auto bg-primary text-primary-foreground px-6 py-3.5 md:py-3 rounded-lg font-bold text-sm md:text-base cta-hover-lift"
              >
                Check your postcode
              </button>
            </div>

            {/* Image Placeholder - Right */}
            <div className="bg-muted rounded-xl md:rounded-2xl aspect-[4/3] flex items-center justify-center p-6 md:p-8 border border-border">
              <div className="text-center">
                <p className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">Image Placeholder</p>
                <p className="text-[10px] md:text-xs text-muted-foreground">Warm, cosy living room</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Grant + urgency */}
      <section className="py-10 md:py-20 px-4 md:px-12">
        <div className="max-w-[1140px] mx-auto">
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
            {/* Badge Graphic - Left */}
            <div className="flex flex-col items-center gap-4 md:gap-6">
              <div className="bg-primary/10 border-2 border-primary rounded-xl md:rounded-2xl p-6 md:p-8 text-center w-full max-w-[280px]">
                <p className="text-[40px] sm:text-[48px] md:text-[64px] font-extrabold text-primary leading-none">
                  £7,500
                </p>
                <p className="text-base md:text-lg font-semibold text-foreground mt-2">
                  Government <span className="text-octopus">Grant</span>
                </p>
              </div>
              <div className="bg-muted rounded-lg md:rounded-xl px-4 md:px-5 py-2.5 md:py-3 border border-border">
                <p className="text-xs md:text-sm font-medium text-foreground">✔️ We handle all paperwork</p>
              </div>
            </div>

            {/* Text - Right */}
            <div>
              <p className="text-base md:text-xl text-foreground leading-relaxed mb-4 md:mb-6">
                <span className="text-primary font-bold">Right now</span>, there's a £7,500 government grant available.
              </p>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-4 md:mb-6">
                It's not means-tested, almost all homeowners qualify, and we handle all the paperwork for you 📄✔️.
              </p>
              <p className="text-base md:text-lg text-foreground leading-relaxed mb-4 md:mb-6">
                That's why Cosy can be fully installed from just <span className="text-primary font-bold text-xl md:text-2xl">£1995</span> — but the grant is scheduled until <span className="text-primary font-bold">April 2026</span> ⏳.
              </p>
              <p className="text-xs md:text-sm text-muted-foreground border-l-2 border-border pl-3 md:pl-4 mb-5 md:mb-6">
                Eligibility confirmed at survey. This is a digital estimate.
              </p>
              <button
                onClick={scrollToPostcode}
                className="w-full sm:w-auto bg-primary text-primary-foreground px-6 py-3.5 md:py-3 rounded-lg font-bold text-sm md:text-base cta-hover-lift"
              >
                Check your postcode
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Partnership + trust proof */}
      <section className="py-10 md:py-20 px-4 md:px-12 bg-foreground text-card">
        <div className="max-w-[1140px] mx-auto">
          {/* Logo strip */}
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 mb-8 md:mb-12">
            <img src={octopusPartner} alt="Octopus Partner" className="h-10 md:h-14 w-auto brightness-0 invert opacity-90" />
            <div className="flex items-center gap-2">
              <span className="text-green-400 text-xl md:text-2xl">★★★★★</span>
              <span className="text-sm md:text-base font-medium">Trustpilot</span>
            </div>
          </div>

          {/* Text block */}
          <div className="max-w-3xl mx-auto text-center space-y-4 md:space-y-6">
            <p className="text-sm md:text-xl leading-relaxed opacity-95">
              We're a <span className="bg-octopus/30 text-white px-1.5 md:px-2 py-0.5 rounded font-medium">Trusted Octopus Partner</span> 🐙, one of only three companies accredited to install Cosy.
            </p>
            <p className="text-sm md:text-xl leading-relaxed opacity-95">
              Rated <span className="font-bold">5 stars on Trustpilot</span> ⭐️ with 200+ reviews.
            </p>
          </div>
        </div>
      </section>

      {/* Section: How it works */}
      <section id="how-it-works" className="py-10 md:py-20 px-4 md:px-12 bg-card border-y border-border">
        <div className="max-w-[1140px] mx-auto">
          <h2 className="text-[22px] sm:text-[28px] md:text-[40px] font-bold text-foreground text-center mb-8 md:mb-12">
            How the estimate works
          </h2>

          <div className="grid md:grid-cols-2 gap-8 md:gap-16">
            {/* Left: Simple steps */}
            <div className="space-y-4 md:space-y-5">
              {[
                "We pull your home's EPC data",
                'We estimate heat demand and system size',
                'We show likely install contribution and running cost',
                'Survey confirms everything'
              ].map((step, i) => (
                <div key={i} className="flex gap-3 md:gap-4">
                  <span className="text-sm md:text-base font-bold text-primary w-5 md:w-6 flex-shrink-0">
                    {i + 1})
                  </span>
                  <span className="text-foreground text-sm md:text-lg">{step}</span>
                </div>
              ))}
            </div>

            {/* Right: Data sources card */}
            <div className="bg-background rounded-xl p-5 md:p-6 border border-border">
              <h3 className="text-base md:text-lg font-bold text-foreground mb-3 md:mb-4">
                What we use
              </h3>
              <ul className="space-y-2 md:space-y-3 text-sm md:text-base text-muted-foreground mb-4 md:mb-5">
                <li>• EPC floor area & fuel type</li>
                <li>• Typical heat pump efficiency ranges</li>
                <li>• Tariff rates you choose</li>
                <li>• Conservative assumptions</li>
              </ul>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="assumptions" className="border-none">
                  <AccordionTrigger className="text-xs md:text-sm text-primary hover:no-underline py-0">
                    See assumptions
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 md:pt-3 text-xs md:text-sm text-muted-foreground space-y-1.5 md:space-y-2">
                    <p>• SCOP: 2.8 – 3.6</p>
                    <p>• Off-peak share: 30% – 70%</p>
                    <p>• Heat intensity: 110 kWh/m²</p>
                    <p>• Boiler efficiency: 85–88%</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-10 md:py-20 px-4 md:px-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-[22px] sm:text-[28px] md:text-[40px] font-bold text-foreground text-center mb-6 md:mb-10">
            Common questions
          </h2>

          <Accordion type="single" collapsible className="w-full space-y-2 md:space-y-3">
            <AccordionItem value="q1" className="border border-border rounded-lg px-4 md:px-5 bg-card">
              <AccordionTrigger className="text-left text-sm md:text-base font-medium hover:no-underline py-3 md:py-4">
                Do heat pumps work in winter?
              </AccordionTrigger>
              <AccordionContent className="text-xs md:text-sm text-muted-foreground pb-3 md:pb-4">
                Yes. Modern heat pumps work down to -15°C. They're widely used in Scandinavia.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q2" className="border border-border rounded-lg px-4 md:px-5 bg-card">
              <AccordionTrigger className="text-left text-sm md:text-base font-medium hover:no-underline py-3 md:py-4">
                Will my radiators need changing?
              </AccordionTrigger>
              <AccordionContent className="text-xs md:text-sm text-muted-foreground pb-3 md:pb-4">
                Not always. We assess during the survey. Many homes keep most existing radiators.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q3" className="border border-border rounded-lg px-4 md:px-5 bg-card">
              <AccordionTrigger className="text-left text-sm md:text-base font-medium hover:no-underline py-3 md:py-4">
                Is the Cosy tariff required?
              </AccordionTrigger>
              <AccordionContent className="text-xs md:text-sm text-muted-foreground pb-3 md:pb-4">
                No, but it significantly improves savings with 8 hours of half-price electricity daily.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q4" className="border border-border rounded-lg px-4 md:px-5 bg-card">
              <AccordionTrigger className="text-left text-sm md:text-base font-medium hover:no-underline py-3 md:py-4">
                Is it noisy?
              </AccordionTrigger>
              <AccordionContent className="text-xs md:text-sm text-muted-foreground pb-3 md:pb-4">
                Modern heat pumps are 40–45dB — similar to a refrigerator.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q5" className="border border-border rounded-lg px-4 md:px-5 bg-card">
              <AccordionTrigger className="text-left text-sm md:text-base font-medium hover:no-underline py-3 md:py-4">
                How long does installation take?
              </AccordionTrigger>
              <AccordionContent className="text-xs md:text-sm text-muted-foreground pb-3 md:pb-4">
                Usually 2–3 days. We confirm the timeline during your survey.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q6" className="border border-border rounded-lg px-4 md:px-5 bg-card">
              <AccordionTrigger className="text-left text-sm md:text-base font-medium hover:no-underline py-3 md:py-4">
                What happens after I check my postcode?
              </AccordionTrigger>
              <AccordionContent className="text-xs md:text-sm text-muted-foreground pb-3 md:pb-4">
                You'll see an estimate. If it looks good, you can request a free home survey. No obligation.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-10 md:py-20 px-4 md:px-12 bg-card border-t border-border pb-24 md:pb-20">
        <div className="max-w-[480px] md:max-w-[560px] mx-auto text-center">
          <h2 className="text-[20px] sm:text-[24px] md:text-[32px] font-bold text-foreground leading-[1.25] mb-6 md:mb-8">
            See if your home is a good fit for the Cosy Heat Pump
          </h2>

          <div className="bg-background rounded-2xl md:rounded-[20px] p-5 md:p-8 shadow-elevated border border-border">
            <p className="text-octopus text-[10px] md:text-xs font-semibold tracking-wider uppercase mb-1.5 md:mb-2">
              Ready to check?
            </p>
            <h3 className="text-lg md:text-xl font-bold text-foreground mb-4 md:mb-5">
              See your estimate in 30 seconds
            </h3>
            
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
            
            <p className="text-center text-[10px] md:text-xs text-muted-foreground mt-3 md:mt-4">
              Takes ~30 seconds. No obligation.
            </p>
          </div>

          <p className="text-xs md:text-sm text-muted-foreground mt-4 md:mt-6">
            Grant scheduled until <span className="text-primary font-medium">April 2026</span>.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 md:py-8 px-4 md:px-12 border-t border-border pb-20 md:pb-8">
        <div className="max-w-[1140px] mx-auto text-center">
          <p className="text-xs md:text-sm text-muted-foreground">
            Digital estimate only. Final pricing confirmed after survey.
          </p>
        </div>
      </footer>

      {/* Mobile Sticky CTA */}
      {showMobileBar && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-3 flex items-center justify-between z-50 md:hidden shadow-elevated safe-area-bottom">
          <span className="text-xs font-medium text-foreground">Free EPC check</span>
          <button
            onClick={scrollToPostcode}
            className="bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-xs font-bold"
          >
            Check postcode
          </button>
        </div>
      )}
    </div>
  );
}
