import { useState } from 'react';
import { Phone, X, Loader2, Shield } from 'lucide-react';
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
        description: 'Please try again or contact us directly.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg p-4 z-40">
      <div className="max-w-lg mx-auto flex items-center gap-4">
        <div className="flex-1">
          <p className="font-medium text-foreground text-sm">Ready for the next step?</p>
          <p className="text-xs text-muted-foreground">No obligation · Takes 2 minutes</p>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button className="gradient-primary text-white hover-lift">
              <Phone className="w-4 h-4 mr-2" />
              Book survey
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto max-h-[90vh] rounded-t-2xl">
            <SheetHeader className="pb-4">
              <SheetTitle>Book your free home survey</SheetTitle>
            </SheetHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mobile-name" className="text-foreground">Full name</Label>
                <Input
                  id="mobile-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Smith"
                  className="h-12 bg-background border-2 focus:border-primary"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile-email" className="text-foreground">Email</Label>
                <Input
                  id="mobile-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="h-12 bg-background border-2 focus:border-primary"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile-phone" className="text-foreground">Phone</Label>
                <Input
                  id="mobile-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="07xxx xxxxxx"
                  className="h-12 bg-background border-2 focus:border-primary"
                  required
                />
              </div>
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <Checkbox
                  id="mobile-consent"
                  checked={consent}
                  onCheckedChange={(c) => setConsent(c === true)}
                  className="mt-0.5"
                />
                <Label htmlFor="mobile-consent" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                  I consent to Smart Energy Homes contacting me
                </Label>
              </div>
              <Button 
                type="submit" 
                className="w-full h-14 text-lg font-semibold gradient-primary hover:opacity-90"
                disabled={!isValid || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Phone className="w-5 h-5 mr-2" />
                    Book my home survey
                  </>
                )}
              </Button>
              
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Shield className="w-4 h-4" />
                <span>Your details are secure and never shared</span>
              </div>
            </form>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
