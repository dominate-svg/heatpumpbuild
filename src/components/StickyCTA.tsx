import { useState } from 'react';
import { ArrowRight, Loader2, Shield, Sparkles } from 'lucide-react';
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
import { CosyBadge } from './CosyBadge';

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

  const FormContent = ({ idPrefix }: { idPrefix: string }) => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-name`} className="text-sm">Full name</Label>
        <Input
          id={`${idPrefix}-name`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Smith"
          required
          className="h-11"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-email`} className="text-sm">Email</Label>
        <Input
          id={`${idPrefix}-email`}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="john@example.com"
          required
          className="h-11"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-phone`} className="text-sm">Phone</Label>
        <Input
          id={`${idPrefix}-phone`}
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="07700 900123"
          required
          className="h-11"
        />
      </div>
      <div className="flex items-start gap-3 py-2">
        <Checkbox
          id={`${idPrefix}-consent`}
          checked={consent}
          onCheckedChange={(checked) => setConsent(checked as boolean)}
        />
        <label htmlFor={`${idPrefix}-consent`} className="text-xs text-muted-foreground leading-tight">
          I consent to Smart Energy Homes contacting me
        </label>
      </div>
      <Button 
        type="submit" 
        className="w-full bg-primary hover:bg-primary/90 text-white rounded-full h-12"
        disabled={!isValid || isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            Book design consultation
            <ArrowRight className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Shield className="w-3 h-3" />
        <span>Secure & never shared</span>
      </div>
    </form>
  );

  return (
    <>
      {/* Mobile sticky bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border p-3 lg:hidden z-50 shadow-elevated">
        <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground">Your price</p>
            <p className="text-xl font-bold text-foreground truncate">{formatCurrency(results.customerContribution)}</p>
          </div>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-full px-5 h-11 animate-pulse-glow">
                <Sparkles className="w-4 h-4 mr-2" />
                Book now
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-auto max-h-[85vh] overflow-y-auto rounded-t-3xl px-5 pb-8">
              <SheetHeader className="mb-4 pt-2">
                <div className="flex items-center justify-between">
                  <SheetTitle className="text-lg">Book your consultation</SheetTitle>
                  <CosyBadge size="sm" />
                </div>
              </SheetHeader>
              <FormContent idPrefix="mobile" />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop sticky bar */}
      <div className="hidden lg:block fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border p-4 z-50 shadow-elevated">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <CosyBadge size="sm" />
            <div>
              <p className="text-xs text-muted-foreground">Estimated price</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground">{formatCurrency(results.customerContribution)}</span>
                <span className="text-xs text-success">0% VAT</span>
              </div>
            </div>
          </div>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 h-12 animate-pulse-glow">
                <Sparkles className="w-4 h-4 mr-2" />
                Book £250 design consultation
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[380px]">
              <SheetHeader className="mb-4">
                <SheetTitle className="text-lg">Book your design consultation</SheetTitle>
              </SheetHeader>
              <div className="mb-6 flex justify-center">
                <CosyBadge size="md" />
              </div>
              <FormContent idPrefix="desktop" />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  );
}
