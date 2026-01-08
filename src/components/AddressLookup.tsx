import { useState } from 'react';
import { Search, MapPin, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useEPCLookup } from '@/hooks/useEPCLookup';
import type { EPCData } from '@/lib/calculations';

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
    <div className="space-y-4">
      {/* Clean Search Input */}
      <div className="space-y-3">
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Enter your postcode"
            value={postcode}
            onChange={(e) => setPostcode(e.target.value.toUpperCase())}
            onKeyDown={handleKeyDown}
            className="pl-12 h-14 text-lg rounded-lg font-medium placeholder:text-muted-foreground border-2 border-border bg-background focus:border-primary focus:ring-0"
          />
        </div>
        <Button 
          onClick={handleSearch} 
          disabled={loading || !postcode.trim()}
          size="lg"
          className="w-full h-14 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold text-lg transition-all disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Get my estimate'
          )}
        </Button>
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
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4 space-y-3">
            <p className="text-sm text-foreground">
              No EPC data found for this postcode. You can still get an estimate.
            </p>
            <Button onClick={onManualEntry} className="bg-primary hover:bg-primary/90 text-white">
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
                className="cursor-pointer border border-border hover:border-primary hover:shadow-soft transition-all duration-200 group"
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
