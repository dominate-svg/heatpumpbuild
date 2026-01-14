import { useState } from 'react';
import { Loader2, Calendar, Phone, Shield, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useCreateLead, useCreateEstimate } from '@/hooks/useLeads';
import type { EPCData, EstimateResults, Assumptions } from '@/lib/calculations';
import type { Tariff } from '@/hooks/useTariffs';

interface LeadCaptureFormProps {
  epcData: EPCData;
  results: EstimateResults;
  assumptions: Assumptions;
  inputs: {
    scop: number;
    tariff: Tariff | null;
    currentFuel: string;
    propertyType?: string;
    region?: string;
    locationAdder: string;
    cylinderOption: string;
  };
}

const BOOKING_URL = 'https://example.com/book-survey';

const BENEFITS = [
  'No obligation',
  'Fully refundable',
  'Takes 2 minutes',
];

export function LeadCaptureForm({ epcData, results, assumptions, inputs }: LeadCaptureFormProps) {
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
    <Card className="border border-border shadow-soft overflow-hidden bg-card">
      <CardHeader className="bg-primary/5 border-b border-primary/10 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg text-foreground">
          <Calendar className="w-5 h-5 text-primary" />
          Ready for the next step?
        </CardTitle>
        <p className="text-muted-foreground text-sm mt-1">
          Book your free home survey
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">Full name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Smith"
              className="h-12 bg-background border-2 focus:border-primary"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              className="h-12 bg-background border-2 focus:border-primary"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-foreground">Phone</Label>
            <Input
              id="phone"
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
              id="consent"
              checked={consent}
              onCheckedChange={(c) => setConsent(c === true)}
              className="mt-0.5"
            />
            <Label htmlFor="consent" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
              I consent to Smart Energy Homes contacting me about my heat pump enquiry
            </Label>
          </div>
          <Button 
            type="submit" 
            className="w-full h-14 text-lg font-semibold gradient-primary hover:opacity-90 hover-lift transition-all"
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
          
          {/* Benefits */}
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-2">
            {BENEFITS.map((benefit, i) => (
              <span key={i} className="flex items-center gap-1">
                <Check className="w-3 h-3 text-success" />
                {benefit}
              </span>
            ))}
          </div>
          
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span>Your details are secure and never shared</span>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
