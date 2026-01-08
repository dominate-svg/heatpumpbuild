import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useCreateLead, useCreateEstimate } from '@/hooks/useLeads';
import type { EPCData, EstimateResults, Assumptions } from '@/lib/calculations';

interface LeadCaptureFormProps {
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

// Placeholder booking URL
const BOOKING_URL = 'https://example.com/book-survey';

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

      // Redirect to booking URL
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
    <Card className="border-primary bg-gradient-to-br from-card to-primary/5 sticky top-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-foreground">Book your survey</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="bg-secondary"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="bg-secondary"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="07xxx xxxxxx"
              className="bg-secondary"
              required
            />
          </div>
          <div className="flex items-start gap-2">
            <Checkbox
              id="consent"
              checked={consent}
              onCheckedChange={(c) => setConsent(c === true)}
            />
            <Label htmlFor="consent" className="text-sm text-muted-foreground leading-tight cursor-pointer">
              I consent to Smart Energy Homes contacting me about my heat pump enquiry
            </Label>
          </div>
          <Button 
            type="submit" 
            className="w-full h-12 text-lg"
            disabled={!isValid || isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Book a survey'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
