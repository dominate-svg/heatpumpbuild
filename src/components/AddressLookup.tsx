import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Loader2, AlertCircle } from 'lucide-react';
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
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Enter your postcode (e.g. SW1A 1AA)"
            value={postcode}
            onChange={(e) => setPostcode(e.target.value.toUpperCase())}
            onKeyDown={handleKeyDown}
            className="pl-10 h-12 text-lg bg-secondary border-border"
          />
        </div>
        <Button 
          onClick={handleSearch} 
          disabled={loading || !postcode.trim()}
          size="lg"
          className="h-12 px-6"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Search className="w-5 h-5 mr-2" />
              Search
            </>
          )}
        </Button>
      </div>

      {error && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <p className="text-sm text-foreground">{error}</p>
          </CardContent>
        </Card>
      )}

      {results !== null && results.length === 0 && (
        <Card className="border-warning/50 bg-warning/10">
          <CardContent className="p-4 space-y-3">
            <p className="text-sm text-foreground">
              No EPC data found for this postcode. You can still get an estimate by entering your details manually.
            </p>
            <Button variant="secondary" onClick={onManualEntry}>
              Enter details manually
            </Button>
          </CardContent>
        </Card>
      )}

      {results && results.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Select your address from the list below:
          </p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {results.map((result, index) => (
              <Card 
                key={index}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => onAddressSelect(result)}
              >
                <CardContent className="p-4">
                  <p className="font-medium text-foreground">{result.address}</p>
                  <p className="text-sm text-muted-foreground">{result.postcode}</p>
                  {result.totalFloorArea && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Floor area: {result.totalFloorArea}m²
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          <Button 
            variant="ghost" 
            onClick={onManualEntry}
            className="text-muted-foreground hover:text-foreground"
          >
            My address isn't listed
          </Button>
        </div>
      )}
    </div>
  );
}
