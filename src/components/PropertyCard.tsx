import { useState } from 'react';
import { Home, Flame } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { EPCData, EstimateResults } from '@/lib/calculations';

interface PropertyCardProps {
  epcData: EPCData;
  results: EstimateResults;
}

export function PropertyCard({ epcData, results }: PropertyCardProps) {
  const [unit, setUnit] = useState<'m2' | 'ft2'>('m2');
  const floorAreaDisplay = unit === 'm2' 
    ? `${results.floorArea} m²` 
    : `${Math.round(results.floorArea * 10.764)} ft²`;

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* Your home card */}
      <Card className="border border-border shadow-card bg-card animate-fade-in">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3 text-base font-semibold">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Home className="w-4 h-4 text-primary" />
            </div>
            Your home
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Address</p>
            <p className="font-medium text-foreground text-sm">
              {epcData.address}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Estimated floor area</p>
              <p className="font-semibold text-foreground">{floorAreaDisplay}</p>
            </div>
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button 
                onClick={() => setUnit('m2')}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  unit === 'm2' 
                    ? 'bg-primary text-white' 
                    : 'bg-background text-muted-foreground hover:text-foreground'
                }`}
              >
                m²
              </button>
              <button 
                onClick={() => setUnit('ft2')}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  unit === 'ft2' 
                    ? 'bg-primary text-white' 
                    : 'bg-background text-muted-foreground hover:text-foreground'
                }`}
              >
                ft²
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Energy information card */}
      <Card className="border border-border shadow-card bg-card animate-fade-in" style={{ animationDelay: '0.05s' }}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3 text-base font-semibold">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Flame className="w-4 h-4 text-primary" />
            </div>
            Energy information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Estimated heat loss</p>
            <p className="font-semibold text-foreground">{results.heatLossKw} kW</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Expected current heating fuel</p>
            <p className="font-semibold text-foreground capitalize">
              {epcData.mainFuel?.toLowerCase() || 'Gas'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
