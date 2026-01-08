import { useState } from 'react';
import { Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
      {/* Postcode Input */}
      <div className="space-y-3">
        <div className="relative">
          <Input
            type="text"
            placeholder="Enter your postcode (e.g. SW1A 1AA)"
            value={postcode}
            onChange={(e) => setPostcode(e.target.value.toUpperCase())}
            onKeyDown={handleKeyDown}
            className="h-14 text-base rounded-lg font-medium placeholder:text-muted-foreground border-2 border-border bg-background input-focus-glow text-center"
          />
        </div>
        <Button 
          onClick={handleSearch} 
          disabled={loading || !postcode.trim()}
          size="lg"
          className="w-full h-14 rounded-lg bg-primary hover:bg-primary text-primary-foreground font-bold text-base transition-all disabled:opacity-100 disabled:bg-primary disabled:text-primary-foreground disabled:cursor-not-allowed cta-hover-lift"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Get my estimate'
          )}
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
          <p className="text-sm text-foreground">{error}</p>
        </div>
      )}

      {results !== null && results.length === 0 && (
        <div className="p-4 rounded-lg border border-border bg-muted space-y-3">
          <p className="text-sm text-foreground">
            No EPC data found for this postcode. You can still get an estimate.
          </p>
          <Button 
            onClick={onManualEntry} 
            className="bg-primary hover:bg-primary text-primary-foreground disabled:opacity-100"
          >
            Enter details manually
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      {results && results.length > 0 && (
        <div className="space-y-3 animate-fade-in">
          <p className="text-sm text-muted-foreground font-medium">
            Select your address:
          </p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {results.map((result, index) => (
              <div 
                key={index}
                className="cursor-pointer border border-border hover:border-primary rounded-lg p-4 transition-all duration-200 group bg-background"
                onClick={() => onAddressSelect(result)}
              >
                <div className="flex items-center justify-between">
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
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
              </div>
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
