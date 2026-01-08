import { useState } from 'react';
import { Home, Flame, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
    <div className="space-y-3">
      {/* Your home card */}
      <Card className="border border-border shadow-card bg-card overflow-hidden animate-fade-in">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Home className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground mb-2">Your home</h3>
              <p className="text-sm text-muted-foreground truncate mb-3">
                {epcData.address}
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Floor area</p>
                  <p className="font-semibold text-foreground">{floorAreaDisplay}</p>
                </div>
                <div className="flex rounded-lg border border-border overflow-hidden">
                  <button 
                    onClick={() => setUnit('m2')}
                    className={`px-2.5 py-1 text-xs font-medium transition-all ${
                      unit === 'm2' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-background text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    m²
                  </button>
                  <button 
                    onClick={() => setUnit('ft2')}
                    className={`px-2.5 py-1 text-xs font-medium transition-all ${
                      unit === 'ft2' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-background text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    ft²
                  </button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Energy info - horizontal on mobile */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border border-border shadow-card bg-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <Zap className="w-4 h-4 text-accent" />
              </div>
              <span className="text-xs text-muted-foreground">Heat loss</span>
            </div>
            <p className="font-bold text-xl text-foreground">{results.heatLossKw} <span className="text-sm font-normal text-muted-foreground">kW</span></p>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-card bg-card animate-fade-in" style={{ animationDelay: '0.15s' }}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
                <Flame className="w-4 h-4 text-warning" />
              </div>
              <span className="text-xs text-muted-foreground">Current fuel</span>
            </div>
            <p className="font-bold text-xl text-foreground capitalize">{epcData.mainFuel?.toLowerCase() || 'Gas'}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
