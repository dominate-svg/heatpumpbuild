import { useState } from 'react';
import { ArrowRight, X, Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { useCreateLead, useCreateEstimate } from '@/hooks/useLeads';
import { formatCurrency } from '@/lib/calculations';
import type { EPCData, EstimateResults, Assumptions } from '@/lib/calculations';

interface StickyCTAProps {
  epcData: EPCData;
  results: EstimateResults;
  assumptions: Assumptions;
  inputs: {
    scop: number;
    tariff: string;
    currentFuel: string;
    propertyType?: string;
    region?: string;
    locationAdder: string;
    cylinderOption: string;
  };
}

const BOOKING_URL = 'https://example.com/book-survey';

export function StickyCTA({ epcData, results, assumptions, inputs }: StickyCTAProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(false);
  const { toast } = useToast();
  
  const createLead = useCreateLead();
  const createEstimate = useCreateEstimate();
  
  const isValid = name && email && phone && consent;
  const isLoading = createLead.isPending || createEstimate.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    try {
      const lead = await createLead.mutateAsync({
        name,
        email,
        phone,
        consent,
        address: epcData.address,
        postcode: epcData.postcode,
        uprn: epcData.uprn,
        epcLmkKey: epcData.lmkKey,
      });

      await createEstimate.mutateAsync({
        leadId: lead.id,
        results,
        assumptions,
        inputs,
      });

      toast({
        title: 'Thank you!',
        description: 'Redirecting you to book your survey...',
      });

      setOpen(false);

      setTimeout(() => {
        window.open(BOOKING_URL, '_blank');
      }, 1500);
    } catch (error) {
      toast({
        title: 'Something went wrong',
        description: 'Please try again or call us.',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 lg:hidden z-50 shadow-elevated">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div>
            <p className="text-xs text-muted-foreground">Estimated price</p>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(results.customerContribution)}</p>
            <p className="text-xs text-muted-foreground">0% VAT</p>
          </div>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-full px-6">
                Book £250 design consultation
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-auto max-h-[90vh] overflow-y-auto rounded-t-2xl">
              <SheetHeader className="mb-6">
                <SheetTitle className="text-xl">Book your design consultation</SheetTitle>
              </SheetHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name-mobile">Full name</Label>
                  <Input
                    id="name-mobile"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Smith"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-mobile">Email address</Label>
                  <Input
                    id="email-mobile"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone-mobile">Phone number</Label>
                  <Input
                    id="phone-mobile"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="07700 900123"
                    required
                  />
                </div>
                <div className="flex items-start gap-3 py-2">
                  <Checkbox
                    id="consent-mobile"
                    checked={consent}
                    onCheckedChange={(checked) => setConsent(checked as boolean)}
                  />
                  <label htmlFor="consent-mobile" className="text-sm text-muted-foreground leading-tight">
                    I consent to Smart Energy Homes contacting me about my heat pump quote
                  </label>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-white rounded-full"
                  disabled={!isValid || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Book £250 design consultation
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
                  <Shield className="w-4 h-4" />
                  <span>Your data is secure and never shared</span>
                </div>
              </form>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop sticky bar at bottom of page */}
      <div className="hidden lg:block fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 z-50 shadow-elevated">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Estimated price</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground">{formatCurrency(results.customerContribution)}</span>
                <span className="text-sm text-muted-foreground">0% VAT</span>
              </div>
            </div>
          </div>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-full px-8">
                Book £250 design consultation
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[400px]">
              <SheetHeader className="mb-6">
                <SheetTitle className="text-xl">Book your design consultation</SheetTitle>
              </SheetHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name-desktop">Full name</Label>
                  <Input
                    id="name-desktop"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Smith"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-desktop">Email address</Label>
                  <Input
                    id="email-desktop"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone-desktop">Phone number</Label>
                  <Input
                    id="phone-desktop"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="07700 900123"
                    required
                  />
                </div>
                <div className="flex items-start gap-3 py-2">
                  <Checkbox
                    id="consent-desktop"
                    checked={consent}
                    onCheckedChange={(checked) => setConsent(checked as boolean)}
                  />
                  <label htmlFor="consent-desktop" className="text-sm text-muted-foreground leading-tight">
                    I consent to Smart Energy Homes contacting me about my heat pump quote
                  </label>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-white rounded-full"
                  disabled={!isValid || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Book £250 design consultation
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
                  <Shield className="w-4 h-4" />
                  <span>Your data is secure and never shared</span>
                </div>
              </form>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  );
}
