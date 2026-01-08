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
    <div className="space-y-6">
      {/* Pulsing CTA Search Box */}
      <div className="relative">
        <div className="absolute -inset-2 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 rounded-3xl animate-pulse-glow blur-xl" />
        <div className="relative flex gap-3 p-2 bg-background/80 backdrop-blur-sm rounded-2xl border-2 border-primary/30 shadow-elevated animate-bounce-in">
          <div className="relative flex-1">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-primary animate-float" />
            <Input
              type="text"
              placeholder="Enter your postcode"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value.toUpperCase())}
              onKeyDown={handleKeyDown}
              className="pl-14 h-16 text-xl bg-white border-2 border-muted focus:border-primary rounded-xl font-semibold placeholder:text-muted-foreground/60"
            />
            <Sparkles className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-accent animate-pulse" />
          </div>
          <Button 
            onClick={handleSearch} 
            disabled={loading || !postcode.trim()}
            size="lg"
            className="h-16 px-10 rounded-xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 hover:scale-105"
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

      {/* Trust Badges & Pump Image */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <CosyBadge size="lg" className="animate-float" />
          <img 
            src={octopusPartner} 
            alt="Octopus Trusted Partner" 
            className="h-16 w-auto object-contain animate-float"
            style={{ animationDelay: '0.5s' }}
          />
        </div>
        <div className="relative group">
          <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-lg group-hover:blur-xl transition-all" />
          <img 
            src={cosyPump} 
            alt="Cosy Heat Pump" 
            className="relative h-32 md:h-40 w-auto object-cover rounded-xl shadow-card group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute -bottom-2 -right-2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-bounce-in">
            Cosy Heat Pump
          </div>
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
