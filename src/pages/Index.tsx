import { useState, useEffect } from 'react';
import { AddressLookup } from '@/components/AddressLookup';
import { ManualEntryForm } from '@/components/ManualEntryForm';
import type { EPCData } from '@/lib/calculations';
import { useNavigate, Link } from 'react-router-dom';
import logo from '@/assets/logo.png';
import octopusPartner from '@/assets/octopus-partner.png';
import cosyPump from '@/assets/cosy-pump.jpeg';
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
  const navigate = useNavigate();

  const handleAddressSelect = (epcData: EPCData) => {
    sessionStorage.setItem('epcData', JSON.stringify(epcData));
    navigate('/estimate');
  };

  const scrollToPostcode = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Show mobile sticky bar after scrolling past hero
  useEffect(() => {
    const handleScroll = () => {
      setShowMobileBar(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Minimal */}
      <header className="w-full py-4 px-6 md:px-12 border-b border-border bg-background sticky top-0 z-50">
        <div className="max-w-[1140px] mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Smart Energy Homes" className="h-8 w-auto" />
          </Link>
          <nav className="flex items-center gap-6">
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Help
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              How it works
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-10 pb-14 md:pt-16 md:pb-20 px-6 md:px-12">
        <div className="max-w-[1140px] mx-auto flex flex-col items-center text-center">
          {/* Eyebrow trust line */}
          <p className="text-octopus text-[13px] font-semibold tracking-wide uppercase mb-5">
            Trusted Octopus Partner • Rated 5 stars on Trustpilot
          </p>

          {/* Main headline */}
          <h1 className="text-[42px] sm:text-[52px] md:text-[60px] font-extrabold text-foreground leading-[1.08] max-w-4xl mb-4">
            Join the Octopus <span className="text-octopus">Cosy</span> heat pump revolution
          </h1>
          <p className="text-[26px] sm:text-[32px] md:text-[38px] font-bold text-foreground leading-[1.15] max-w-3xl mb-5">
            Get a heat pump estimate in <span className="text-primary">less than 30 seconds</span>
          </p>

          {/* Support line */}
          <p className="text-muted-foreground text-lg max-w-xl mb-10">
            Powered by your home's EPC data. No sales calls. No obligation.
          </p>

          {/* Postcode Module */}
          <div className="w-full max-w-[560px] bg-card rounded-[20px] p-6 sm:p-8 shadow-elevated border border-border animate-halo-pulse">
            <p className="text-octopus text-xs font-semibold tracking-wider uppercase mb-2">
              Free EPC Check
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

          {/* Social proof strip */}
          <div className="mt-8 w-full max-w-3xl">
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-sm text-foreground font-medium">
              <div className="flex items-center gap-1.5">
                <img src={octopusPartner} alt="" className="h-5 w-auto" />
                <span>Trusted Octopus Partner</span>
              </div>
              <span className="text-border">·</span>
              <div className="flex items-center gap-1">
                <span className="text-green-600">★</span>
                <span>5★ Trustpilot</span>
              </div>
              <span className="text-border">·</span>
              <span><span className="text-primary font-bold">£7,500</span> grant available</span>
              <span className="hidden sm:inline text-border">·</span>
              <span className="hidden sm:inline">Installed from <span className="text-primary font-bold">£1995</span></span>
            </div>
          </div>
        </div>
      </section>

      {/* Section: If you have a boiler */}
      <section className="py-16 md:py-20 px-6 md:px-12 bg-card border-y border-border">
        <div className="max-w-[1140px] mx-auto">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            {/* Text - Left */}
            <div>
              <h2 className="text-[30px] sm:text-[36px] md:text-[42px] font-bold text-foreground leading-[1.12] mb-6">
                If you have a boiler, this is your chance to upgrade.
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                The Cosy Heat Pump is built for today's energy prices — not yesterday's heating systems.
              </p>
            </div>
            {/* Image Placeholder - Right */}
            <div className="bg-muted rounded-2xl aspect-[4/3] flex items-center justify-center p-6 border border-border">
              <img 
                src={cosyPump} 
                alt="Cosy heat pump installed at a UK home exterior" 
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section: Cosy Tariff */}
      <section className="py-16 md:py-20 px-6 md:px-12">
        <div className="max-w-[1140px] mx-auto">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-start">
            {/* Text */}
            <div>
              <p className="text-lg md:text-xl text-foreground leading-relaxed mb-6">
                Paired with Octopus Energy's Cosy tariff 🐙, it gives you <span className="text-octopus font-bold">8 hours</span> of electricity at roughly <span className="text-octopus font-bold">half price</span>, every day ⏱️:
              </p>
              
              {/* Time windows */}
              <div className="flex flex-wrap gap-3 mb-8">
                {['4–7am', '1–4pm', '10pm–midnight'].map((time) => (
                  <span 
                    key={time} 
                    className="px-5 py-2.5 rounded-full border-2 border-octopus text-octopus text-base font-semibold"
                  >
                    {time}
                  </span>
                ))}
              </div>

              <p className="text-lg text-foreground leading-relaxed mb-4">
                Your home heats when electricity is cheap — not when it's expensive.
              </p>
              <p className="text-lg text-foreground font-semibold border-b-2 border-primary inline-block pb-1">
                That's the difference.
              </p>
            </div>

            {/* Graphic Placeholder - Schedule Bar */}
            <div className="bg-muted rounded-2xl p-6 border border-border">
              <p className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">Daily half-price windows</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-20 text-sm text-muted-foreground">12am</div>
                  <div className="flex-1 h-8 rounded bg-muted-foreground/10 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-[29%] bg-octopus/30 border-l-2 border-r-2 border-octopus flex items-center justify-center">
                      <span className="text-xs font-medium text-octopus">4–7am</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-20 text-sm text-muted-foreground">12pm</div>
                  <div className="flex-1 h-8 rounded bg-muted-foreground/10 relative overflow-hidden">
                    <div className="absolute left-[8%] top-0 bottom-0 w-[25%] bg-octopus/30 border-l-2 border-r-2 border-octopus flex items-center justify-center">
                      <span className="text-xs font-medium text-octopus">1–4pm</span>
                    </div>
                    <div className="absolute left-[33%] top-0 bottom-0 w-[25%] bg-muted-foreground/30 flex items-center justify-center">
                      <span className="text-xs font-medium text-muted-foreground">4–7pm peak</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-20 text-sm text-muted-foreground">Evening</div>
                  <div className="flex-1 h-8 rounded bg-muted-foreground/10 relative overflow-hidden">
                    <div className="absolute right-0 top-0 bottom-0 w-[33%] bg-octopus/30 border-l-2 border-r-2 border-octopus flex items-center justify-center">
                      <span className="text-xs font-medium text-octopus">10pm–12am</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                <span className="inline-block w-3 h-3 bg-octopus/30 border border-octopus rounded mr-1.5"></span>
                Half-price hours
                <span className="inline-block w-3 h-3 bg-muted-foreground/30 rounded ml-4 mr-1.5"></span>
                Expensive 4–7pm peak
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Objection handling */}
      <section className="py-16 md:py-20 px-6 md:px-12 bg-card border-y border-border">
        <div className="max-w-[1140px] mx-auto">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            {/* Image Placeholder - Left */}
            <div className="bg-muted rounded-2xl aspect-[4/3] flex items-center justify-center p-8 border border-border order-2 md:order-1">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">Image Placeholder</p>
                <p className="text-xs text-muted-foreground">Confident-looking Cosy unit close-up OR tidy install detail shot</p>
                <p className="text-xs text-muted-foreground mt-1">Aspect: 4:3 • Mood: premium, confident</p>
              </div>
            </div>
            {/* Text - Right */}
            <div className="order-1 md:order-2">
              <p className="text-lg md:text-xl text-foreground leading-relaxed mb-4">
                You might have heard people say heat pumps don't work.
              </p>
              <p className="text-lg md:text-xl text-foreground leading-relaxed font-medium">
                You just haven't seen one like this — it works brilliantly, and it looks like it knows it 😏
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section: What sets Cosy apart - Intelligence story */}
      <section className="py-16 md:py-20 px-6 md:px-12">
        <div className="max-w-[1140px] mx-auto">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-start">
            {/* Text - Left */}
            <div>
              <h2 className="text-[28px] sm:text-[34px] md:text-[40px] font-bold text-foreground leading-[1.12] mb-6">
                What really sets Cosy apart is how smart it is.
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Instead of simply turning on when you ask for heat, Cosy learns how your home holds warmth, plans ahead, and decides when it's smartest to generate heat.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                It gently loads heat into your home during cheaper hours, then releases it steadily through the day — including during the <span className="border-b-2 border-octopus">costly 4–7pm peak</span> — so your home stays warm without chasing prices.
              </p>
              
              {/* Statement block - high-performing copy */}
              <div className="space-y-3 text-lg md:text-xl text-foreground font-medium pl-4 border-l-4 border-primary">
                <p>You don't see this happening.</p>
                <p>You don't manage it.</p>
                <p>It just works in the background.</p>
              </div>
            </div>

            {/* Graphic Placeholder - Right */}
            <div className="bg-muted rounded-2xl p-8 border border-border">
              <p className="text-sm font-semibold text-foreground mb-6 uppercase tracking-wide">How Cosy thinks</p>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-octopus/20 text-octopus flex items-center justify-center font-bold text-sm flex-shrink-0">1</div>
                  <div>
                    <p className="font-semibold text-foreground">Learns</p>
                    <p className="text-sm text-muted-foreground">How your home holds heat</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-octopus/20 text-octopus flex items-center justify-center font-bold text-sm flex-shrink-0">2</div>
                  <div>
                    <p className="font-semibold text-foreground">Plans</p>
                    <p className="text-sm text-muted-foreground">Ahead based on weather + prices</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">3</div>
                  <div>
                    <p className="font-semibold text-foreground">Shifts</p>
                    <p className="text-sm text-muted-foreground">Heating into cheaper hours automatically</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Comfort + savings */}
      <section className="py-16 md:py-20 px-6 md:px-12 bg-card border-y border-border">
        <div className="max-w-[1140px] mx-auto">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            {/* Text - Left */}
            <div>
              <p className="text-lg md:text-xl text-foreground leading-relaxed mb-6">
                What most people notice first is how steady the warmth feels 🏡.
              </p>
              
              {/* Large typographic callout */}
              <div className="my-8">
                <p className="text-[32px] sm:text-[40px] md:text-[48px] font-bold text-primary leading-[1.1]">
                  Up to £370
                </p>
                <p className="text-xl md:text-2xl font-semibold text-foreground">
                  a year less than gas 💷
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Estimate varies by home
                </p>
              </div>

              <p className="text-lg text-muted-foreground leading-relaxed">
                It uses far less energy than a boiler and is built to last around 20 years.
              </p>
            </div>

            {/* Image Placeholder - Right */}
            <div className="bg-muted rounded-2xl aspect-[4/3] flex items-center justify-center p-8 border border-border">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">Image Placeholder</p>
                <p className="text-xs text-muted-foreground">Warm, cosy living room evening scene</p>
                <p className="text-xs text-muted-foreground mt-1">Aspect: 4:3 • Mood: warm, inviting, premium</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Grant + urgency */}
      <section className="py-16 md:py-20 px-6 md:px-12">
        <div className="max-w-[1140px] mx-auto">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            {/* Badge Graphic - Left */}
            <div className="flex flex-col items-center md:items-start gap-6">
              <div className="bg-primary/10 border-2 border-primary rounded-2xl p-8 text-center">
                <p className="text-[48px] sm:text-[56px] md:text-[64px] font-extrabold text-primary leading-none">
                  £7,500
                </p>
                <p className="text-lg font-semibold text-foreground mt-2">
                  Government <span className="text-octopus">Grant</span>
                </p>
              </div>
              <div className="bg-muted rounded-xl px-5 py-3 border border-border">
                <p className="text-sm font-medium text-foreground">✔️ We handle all paperwork</p>
              </div>
            </div>

            {/* Text - Right */}
            <div>
              <p className="text-lg md:text-xl text-foreground leading-relaxed mb-6">
                <span className="text-primary font-bold">Right now</span>, there's a £7,500 government grant available.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                It's not means-tested, almost all homeowners qualify, and we handle all the paperwork for you 📄✔️.
              </p>
              <p className="text-lg text-foreground leading-relaxed mb-6">
                That's why Cosy can be fully installed from just <span className="text-primary font-bold text-2xl">£1995</span> — but the grant is currently scheduled to run until <span className="text-primary font-bold">April 2026</span> ⏳. After that, costs are likely to rise.
              </p>
              <p className="text-sm text-muted-foreground border-l-2 border-border pl-4">
                Eligibility confirmed at survey. This is a digital estimate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Partnership + trust proof */}
      <section className="py-16 md:py-20 px-6 md:px-12 bg-foreground text-card">
        <div className="max-w-[1140px] mx-auto">
          {/* Logo strip */}
          <div className="flex flex-wrap items-center justify-center gap-8 mb-12">
            <img src={octopusPartner} alt="Octopus Partner" className="h-14 w-auto brightness-0 invert opacity-90" />
            <div className="flex items-center gap-2">
              <span className="text-green-400 text-2xl">★★★★★</span>
              <span className="font-medium">Trustpilot</span>
            </div>
          </div>

          {/* Text block */}
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <p className="text-lg md:text-xl leading-relaxed opacity-95">
              We're a <span className="bg-octopus/30 text-white px-2 py-0.5 rounded font-medium">Trusted Octopus Partner</span> 🐙, and one of only three companies accredited to install the Cosy Heat Pump, so you know you're in safe, experienced hands.
            </p>
            <p className="text-lg md:text-xl leading-relaxed opacity-95">
              We're also rated <span className="font-bold">5 stars on Trustpilot</span> ⭐️⭐️⭐️⭐️⭐️, with 200+ reviews from homeowners like you.
            </p>
          </div>
        </div>
      </section>

      {/* Section: How it works */}
      <section id="how-it-works" className="py-16 md:py-20 px-6 md:px-12 bg-card border-y border-border">
        <div className="max-w-[1140px] mx-auto">
          <h2 className="text-[28px] sm:text-[34px] md:text-[40px] font-bold text-foreground text-center mb-12">
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
                  <span className="text-base font-bold text-primary w-6 flex-shrink-0">
                    {i + 1})
                  </span>
                  <span className="text-foreground text-lg">{step}</span>
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

      {/* FAQ Section */}
      <section className="py-16 md:py-20 px-6 md:px-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-[28px] sm:text-[34px] md:text-[40px] font-bold text-foreground text-center mb-10">
            Common questions
          </h2>

          <Accordion type="single" collapsible className="w-full space-y-3">
            <AccordionItem value="q1" className="border border-border rounded-lg px-5 bg-card">
              <AccordionTrigger className="text-left font-medium hover:no-underline">
                Do heat pumps work in winter?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes. Modern heat pumps work efficiently down to -15°C or lower. They're widely used in Scandinavia. The key is proper sizing and installation — which we handle during the survey.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q2" className="border border-border rounded-lg px-5 bg-card">
              <AccordionTrigger className="text-left font-medium hover:no-underline">
                Will my radiators need changing?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Not always. We assess your radiators during the survey. Some may need upgrading for optimal efficiency, but many homes keep most of their existing radiators.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q3" className="border border-border rounded-lg px-5 bg-card">
              <AccordionTrigger className="text-left font-medium hover:no-underline">
                Is the Cosy tariff required?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                No, but it significantly improves savings. Cosy gives you 8 hours of half-price electricity daily, which makes running a heat pump much cheaper. You can switch tariffs anytime.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q4" className="border border-border rounded-lg px-5 bg-card">
              <AccordionTrigger className="text-left font-medium hover:no-underline">
                Is it noisy?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Modern heat pumps are quieter than you'd expect — typically 40–45dB, similar to a refrigerator. We position the outdoor unit carefully to minimise any impact.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q5" className="border border-border rounded-lg px-5 bg-card">
              <AccordionTrigger className="text-left font-medium hover:no-underline">
                How long does installation take?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Usually 2–3 days for most homes. We'll confirm the timeline during your survey. Our team handles everything including connecting to your existing heating system.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q6" className="border border-border rounded-lg px-5 bg-card">
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
      <section className="py-16 md:py-20 px-6 md:px-12 bg-card border-t border-border">
        <div className="max-w-[560px] mx-auto text-center">
          <h2 className="text-[24px] sm:text-[28px] md:text-[32px] font-bold text-foreground leading-[1.2] mb-8">
            To see if your home is a good fit for the Cosy Heat Pump, check your postcode now.
          </h2>

          <div className="bg-background rounded-[20px] p-6 sm:p-8 shadow-elevated border border-border">
            <p className="text-octopus text-xs font-semibold tracking-wider uppercase mb-2">
              Ready to check?
            </p>
            <h3 className="text-xl font-bold text-foreground mb-5">
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
            
            <p className="text-center text-xs text-muted-foreground mt-4">
              Takes ~30 seconds. No obligation.
            </p>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            Grant currently scheduled until <span className="text-primary font-medium">April 2026</span>.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 md:px-12 border-t border-border">
        <div className="max-w-[1140px] mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            Digital estimate only. Final system design and pricing confirmed after a home survey.
          </p>
        </div>
      </footer>

      {/* Mobile Sticky CTA */}
      {showMobileBar && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-3 flex items-center justify-between z-50 md:hidden shadow-elevated">
          <span className="text-sm font-medium text-foreground">Free EPC check</span>
          <button
            onClick={scrollToPostcode}
            className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-bold cta-hover-lift"
          >
            Check postcode
          </button>
        </div>
      )}
    </div>
  );
}
