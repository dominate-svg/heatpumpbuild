import { Home, MapPin, Ruler, Flame } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { EPCData, EstimateResults } from '@/lib/calculations';
import { getFuelDisplayName } from '@/lib/calculations';

interface YourHomeStepProps {
  epcData: EPCData;
  results: EstimateResults;
  onContinue: () => void;
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
  
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-0.5">
        {EPC_BANDS.map((b, index) => {
          const isActive = b === normalizedBand;
          const width = 100 - (index * 8);
          
          return (
            <div
              key={b}
              className="relative flex items-center"
              style={{ width: `${width}%`, maxWidth: isActive ? '100%' : `${width}%` }}
            >
              <div
                className={`h-6 flex items-center justify-start pl-2 text-xs font-bold text-white transition-all ${EPC_COLORS[b]} ${
                  isActive ? 'ring-2 ring-foreground ring-offset-2 scale-105 z-10' : 'opacity-60'
                }`}
                style={{ 
                  width: '100%',
                  clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 50%, calc(100% - 8px) 100%, 0 100%)'
                }}
              >
                {b}
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-sm text-muted-foreground">
        Your home: <span className="font-semibold text-foreground">EPC {normalizedBand}</span>
      </p>
    </div>
  );
}

export function YourHomeStep({ epcData, results, onContinue }: YourHomeStepProps) {
  const epcBand = results.epcBand || epcData.epcBand || 'D';
  const floorArea = results.floorArea;
  const currentFuel = epcData.mainFuel ? getFuelDisplayName(epcData.mainFuel.toLowerCase()) : 'Gas boiler';

  return (
    <div className="w-full max-w-lg mx-auto px-4 animate-fade-in">
      <Card className="border border-border shadow-card bg-card overflow-hidden">
        <CardContent className="p-6 sm:p-8 space-y-6">
          {/* Address */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Property</p>
              <p className="font-semibold text-foreground">{epcData.address}</p>
            </div>
          </div>

          {/* EPC Rating */}
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">Energy rating</p>
            <EPCScale band={epcBand} />
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center">
                <Ruler className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Floor area</p>
                <p className="font-semibold text-foreground">{floorArea} m²</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center">
                <Flame className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Current heating</p>
                <p className="font-semibold text-foreground">{currentFuel}</p>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground text-center">
            We use EPC data and national averages to generate a quick estimate. Your survey confirms final design.
          </p>

          {/* CTA */}
          <Button 
            onClick={onContinue} 
            className="w-full h-12 text-base font-semibold"
          >
            See your estimate
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
