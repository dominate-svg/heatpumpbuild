import { useState } from 'react';
import { ArrowRight, Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
  onSuccess?: () => void;
}

const BOOKING_URL = 'https://example.com/book-survey';

export function LeadCaptureForm({ epcData, results, assumptions, inputs, onSuccess }: LeadCaptureFormProps) {
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

      onSuccess?.();

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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-sm">Full name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Smith"
          required
          className="h-11"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-sm">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="john@example.com"
          required
          className="h-11"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="phone" className="text-sm">Phone</Label>
        <Input
          id="phone"
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
          id="consent"
          checked={consent}
          onCheckedChange={(checked) => setConsent(checked as boolean)}
        />
        <label htmlFor="consent" className="text-xs text-muted-foreground leading-tight">
          I consent to Smart Energy Homes contacting me about my heat pump estimate
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
            Book free survey
            <ArrowRight className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Shield className="w-3 h-3" />
        <span>Your data is secure & never shared</span>
      </div>
    </form>
  );
}
