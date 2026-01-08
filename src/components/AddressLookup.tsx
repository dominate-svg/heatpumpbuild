import { useState } from 'react';
import { Search, MapPin, Loader2, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useEPCLookup } from '@/hooks/useEPCLookup';
import type { EPCData } from '@/lib/calculations';
import cosyPump from '@/assets/cosy-pump.jpeg';
import octopusPartner from '@/assets/octopus-partner.png';
import { CosyBadge } from './CosyBadge';

interface AddressLookupProps {
  onAddressSelect: (epcData: EPCData) => void;
  onManualEntry: () => void;
}

export function AddressLookup({ onAddressSelect, onManualEntry }: AddressLookupProps) {
  const [postcode, setPostcode] = useState('');
  const [results, setResults] = useState<EPCData[] | null>(null);
  const { lookupAddress, loading, error } = useEPCLookup();

  const handleSearch = async () => {
    if (!postcode.trim()) return;
    const data = await lookupAddress(postcode.trim());
    setResults(data);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="space-y-8">
      {/* Pulsing CTA Search Box */}
      <div className="relative">
        <div className="absolute -inset-3 bg-gradient-to-r from-primary/40 via-accent/40 to-primary/40 rounded-3xl animate-pulse blur-2xl" />
        <div className="relative flex gap-3 p-1.5 bg-white rounded-2xl shadow-elevated">
          <div className="relative flex-1">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-primary" />
            <Input
              type="text"
              placeholder="Enter your postcode"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value.toUpperCase())}
              onKeyDown={handleKeyDown}
              className="pl-14 h-16 text-xl bg-transparent border-0 focus-visible:ring-0 font-semibold placeholder:text-muted-foreground/50"
            />
          </div>
          <Button 
            onClick={handleSearch} 
            disabled={loading || !postcode.trim()}
            size="lg"
            className="h-16 px-10 rounded-xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 animate-pulse-glow"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <Search className="w-6 h-6 mr-2" />
                Search
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Social Proof Section - Clean & Professional */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="flex flex-col items-center text-center p-4 rounded-xl bg-muted/30">
          <CosyBadge size="lg" />
          <p className="mt-3 text-sm font-medium text-muted-foreground">Cosy Accredited Installer</p>
        </div>
        <div className="flex flex-col items-center text-center p-4 rounded-xl bg-muted/30">
          <img 
            src={octopusPartner} 
            alt="Octopus Trusted Partner" 
            className="h-14 w-auto object-contain"
          />
          <p className="mt-3 text-sm font-medium text-muted-foreground">Official Octopus Partner</p>
        </div>
        <div className="flex flex-col items-center text-center p-4 rounded-xl bg-muted/30">
          <img 
            src={cosyPump} 
            alt="Cosy Heat Pump" 
            className="h-14 w-auto object-contain rounded-lg"
          />
          <p className="mt-3 text-sm font-medium text-muted-foreground">Premium Heat Pumps</p>
        </div>
      </div>

      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <p className="text-sm text-foreground">{error}</p>
          </CardContent>
        </Card>
      )}

      {results !== null && results.length === 0 && (
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="p-4 space-y-3">
            <p className="text-sm text-foreground">
              No EPC data found for this postcode. You can still get an estimate.
            </p>
            <Button onClick={onManualEntry} className="gradient-primary text-white hover-lift">
              Enter details manually
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}

      {results && results.length > 0 && (
        <div className="space-y-3 animate-fade-in">
          <p className="text-sm text-muted-foreground font-medium">
            Select your address:
          </p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {results.map((result, index) => (
              <Card 
                key={index}
                className="cursor-pointer border-2 border-transparent hover:border-primary hover:shadow-warm transition-all duration-200 group card-selectable"
                onClick={() => onAddressSelect(result)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {result.address}
                    </p>
                    <p className="text-sm text-muted-foreground">{result.postcode}</p>
                    {result.totalFloorArea && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Floor area: {result.totalFloorArea}m²
                      </p>
                    )}
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Button 
            variant="ghost" 
            onClick={onManualEntry}
            className="text-muted-foreground hover:text-foreground w-full"
          >
            My address isn't listed
          </Button>
        </div>
      )}
    </div>
  );
}
