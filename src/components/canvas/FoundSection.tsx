import { Home, Ruler, Flame, Thermometer, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getFuelDisplayName } from '@/lib/calculations';
import type { EPCData, EstimateResults } from '@/lib/calculations';
import { cn } from '@/lib/utils';

interface FoundSectionProps {
  epcData: EPCData;
  results: EstimateResults;
  onContinue: () => void;
}

const EPC_COLORS: Record<string, string> = {
  'A': 'bg-[#008054]',
  'B': 'bg-[#19b459]',
  'C': 'bg-[#8dce46]',
  'D': 'bg-[#ffd500]',
  'E': 'bg-[#fcaa65]',
  'F': 'bg-[#ef8023]',
  'G': 'bg-[#e9153b]',
};

const EPC_LABELS: Record<string, string> = {
  'A': 'Excellent insulation',
  'B': 'Very good insulation',
  'C': 'Good insulation',
  'D': 'Average insulation',
  'E': 'Below average',
  'F': 'Poor insulation',
  'G': 'Very poor insulation',
};

interface TileProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  subvalue?: string;
  highlight?: boolean;
  epcBand?: string;
}

function Tile({ icon: Icon, label, value, subvalue, highlight, epcBand }: TileProps) {
  return (
    <div className={cn(
      'p-6 rounded-2xl transition-all duration-300',
      highlight ? 'bg-card shadow-card' : 'bg-muted/30'
    )}>
      <div className="flex items-start gap-4">
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center',
          epcBand ? EPC_COLORS[epcBand] : 'bg-primary/10'
        )}>
          {epcBand ? (
            <span className="text-white text-xl font-bold">{epcBand}</span>
          ) : (
            <Icon className="w-6 h-6 text-primary" />
          )}
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <p className="text-xl font-semibold text-foreground">{value}</p>
          {subvalue && (
            <p className="text-sm text-muted-foreground mt-0.5">{subvalue}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function FoundSection({ epcData, results, onContinue }: FoundSectionProps) {
  const epcBand = (results.epcBand || epcData.epcBand || 'D').toUpperCase().charAt(0);
  const floorArea = results.floorArea;
  const currentFuel = epcData.mainFuel ? getFuelDisplayName(epcData.mainFuel.toLowerCase()) : 'Gas boiler';
  const heatLoss = results.heatLossKw;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-16">
      {/* Card slides up */}
      <div className="bg-card rounded-3xl shadow-elevated overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="px-8 pt-10 pb-6">
          <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight mb-2">
            Here's what I found
          </h2>
          <p className="text-muted-foreground flex items-center gap-2">
            <Home className="w-4 h-4" />
            {epcData.address}
          </p>
        </div>

        {/* Tiles grid */}
        <div className="px-8 pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Tile
              icon={Home}
              label="EPC rating"
              value={`EPC ${epcBand}`}
              subvalue={EPC_LABELS[epcBand]}
              highlight
              epcBand={epcBand}
            />
            <Tile
              icon={Ruler}
              label="Home size"
              value={`${floorArea} m²`}
              subvalue="Total floor area"
            />
            <Tile
              icon={Flame}
              label="Current heating"
              value={currentFuel}
              subvalue="Main fuel type"
            />
            <Tile
              icon={Thermometer}
              label="Heat loss"
              value={`${heatLoss} kW`}
              subvalue="At design temperature"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 pb-10">
          <p className="text-center text-sm text-muted-foreground italic mb-6">
            Does this look right? If not, you can change it later.
          </p>
          
          <Button 
            onClick={onContinue}
            size="lg"
            className="w-full h-14 text-base font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
          >
            Looks good — continue
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
