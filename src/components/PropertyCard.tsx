import { useState } from 'react';
import { Home, Flame, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { EPCData, EstimateResults } from '@/lib/calculations';

interface PropertyCardProps {
  epcData: EPCData;
  results: EstimateResults;
}

const EPC_BANDS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'] as const;

const EPC_COLORS: Record<string, string> = {
  'A': 'bg-[#008054]',
  'B': 'bg-[#19b459]',
  'C': 'bg-[#8dce46]',
  'D': 'bg-[#ffd500]',
  'E': 'bg-[#fcaa65]',
  'F': 'bg-[#ef8023]',
  'G': 'bg-[#e9153b]',
};

function EPCScale({ band }: { band: string }) {
  const normalizedBand = band.toUpperCase().charAt(0);
  const activeBandIndex = EPC_BANDS.indexOf(normalizedBand as typeof EPC_BANDS[number]);
  
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-0.5">
        {EPC_BANDS.map((b, index) => {
          const isActive = b === normalizedBand;
          const width = 100 - (index * 8); // A is widest, G is narrowest
          
          return (
            <div
              key={b}
              className="relative flex items-center"
              style={{ width: `${width}%`, maxWidth: isActive ? '100%' : `${width}%` }}
            >
              <div
                className={`h-5 flex items-center justify-start pl-1.5 text-[10px] font-bold text-white transition-all ${EPC_COLORS[b]} ${
                  isActive ? 'ring-2 ring-foreground ring-offset-1 scale-105 z-10' : 'opacity-70'
                }`}
                style={{ 
                  width: '100%',
                  clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 50%, calc(100% - 6px) 100%, 0 100%)'
                }}
              >
                {b}
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-muted-foreground mt-1">
        Your home: <span className="font-semibold text-foreground">EPC {normalizedBand}</span>
      </p>
    </div>
  );
}

export function PropertyCard({ epcData, results }: PropertyCardProps) {
  const [unit, setUnit] = useState<'m2' | 'ft2'>('m2');
  const floorAreaDisplay = unit === 'm2' 
    ? `${results.floorArea} m²` 
    : `${Math.round(results.floorArea * 10.764)} ft²`;

  const epcBand = results.epcBand || epcData.epcBand || 'D';

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

      {/* EPC Rating card */}
      <Card className="border border-border shadow-card bg-card animate-fade-in" style={{ animationDelay: '0.05s' }}>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-2">Energy rating</p>
          <EPCScale band={epcBand} />
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
