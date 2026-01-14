import { MapPin, Ruler, Flame, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { EPCData, EstimateResults } from '@/lib/calculations';
import { getFuelDisplayName } from '@/lib/calculations';

interface YourHomeStepProps {
  epcData: EPCData;
  results: EstimateResults;
  onContinue: () => void;
}

const EPC_BANDS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'] as const;

const EPC_COLORS: Record<string, { bg: string; text: string }> = {
  'A': { bg: 'bg-[#008054]', text: 'Excellent' },
  'B': { bg: 'bg-[#19b459]', text: 'Very good' },
  'C': { bg: 'bg-[#8dce46]', text: 'Good' },
  'D': { bg: 'bg-[#ffd500]', text: 'Average' },
  'E': { bg: 'bg-[#fcaa65]', text: 'Below average' },
  'F': { bg: 'bg-[#ef8023]', text: 'Poor' },
  'G': { bg: 'bg-[#e9153b]', text: 'Very poor' },
};

function EPCVisual({ band }: { band: string }) {
  const normalizedBand = band.toUpperCase().charAt(0) as typeof EPC_BANDS[number];
  const bandInfo = EPC_COLORS[normalizedBand] || EPC_COLORS['D'];
  
  return (
    <div className="space-y-4">
      {/* Elegant horizontal bar */}
      <div className="relative">
        <div className="flex h-12 rounded-xl overflow-hidden shadow-sm">
          {EPC_BANDS.map((b, index) => {
            const isActive = b === normalizedBand;
            const colors = EPC_COLORS[b];
            
            return (
              <div
                key={b}
                className={`relative flex-1 flex items-center justify-center transition-all duration-300 ${colors.bg} ${
                  isActive 
                    ? 'flex-[1.5] z-10 shadow-lg' 
                    : 'opacity-40'
                }`}
              >
                <span className={`text-white font-bold transition-all duration-300 ${
                  isActive ? 'text-xl' : 'text-sm'
                }`}>
                  {b}
                </span>
                {isActive && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-inherit shadow-lg" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Rating description */}
      <div className="text-center">
        <p className="text-lg font-semibold text-foreground">
          EPC {normalizedBand} — {bandInfo.text}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {normalizedBand <= 'C' 
            ? 'Your home retains heat well'
            : normalizedBand <= 'E'
            ? 'Typical insulation for UK homes'
            : 'A heat pump can still work efficiently here'}
        </p>
      </div>
    </div>
  );
}

export function YourHomeStep({ epcData, results, onContinue }: YourHomeStepProps) {
  const epcBand = results.epcBand || epcData.epcBand || 'D';
  const floorArea = results.floorArea;
  const currentFuel = epcData.mainFuel ? getFuelDisplayName(epcData.mainFuel.toLowerCase()) : 'Gas boiler';

  return (
    <div className="w-full max-w-xl mx-auto px-4">
      <div className="bg-card rounded-3xl shadow-elevated overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="px-8 pt-10 pb-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight mb-2">
            Your home
          </h2>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{epcData.address}</span>
          </div>
        </div>

        {/* EPC Visual */}
        <div className="px-8 pb-8">
          <EPCVisual band={epcBand} />
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mx-8" />

        {/* Details */}
        <div className="px-8 py-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center p-4 rounded-2xl bg-muted/30">
              <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center mx-auto mb-3 shadow-sm">
                <Ruler className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-2xl font-semibold text-foreground">{floorArea}</p>
              <p className="text-sm text-muted-foreground">square metres</p>
            </div>
            <div className="text-center p-4 rounded-2xl bg-muted/30">
              <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center mx-auto mb-3 shadow-sm">
                <Flame className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-2xl font-semibold text-foreground capitalize">{currentFuel.split(' ')[0]}</p>
              <p className="text-sm text-muted-foreground">current heating</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 pb-10">
          <p className="text-center text-sm text-muted-foreground italic mb-6">
            Based on your EPC and typical usage patterns
          </p>
          
          <Button 
            onClick={onContinue} 
            className="w-full h-14 text-base font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
          >
            Continue
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
