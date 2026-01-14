import { Home, Ruler, Flame, Thermometer, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getFuelDisplayName } from '@/lib/calculations';
import type { EPCData, EstimateResults } from '@/lib/calculations';
import { cn } from '@/lib/utils';

interface WhatIFoundSectionProps {
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
  'E': 'Below average insulation',
  'F': 'Poor insulation',
  'G': 'Very poor insulation',
};

interface TileProps {
  icon: React.ComponentType<{ className?: string }>;
  value: string | number;
  label: string;
  explanation: string;
  epcBand?: string;
  delay?: number;
}

function Tile({ icon: Icon, value, label, explanation, epcBand, delay = 0 }: TileProps) {
  return (
    <div 
      className="p-5 rounded-2xl bg-muted/20 section-enter"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start gap-4">
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
          epcBand ? EPC_COLORS[epcBand] : 'bg-primary/10'
        )}>
          {epcBand ? (
            <span className="text-white text-xl font-bold">{epcBand}</span>
          ) : (
            <Icon className="w-6 h-6 text-primary" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-card-number text-foreground truncate">{value}</p>
          <p className="text-sm text-foreground font-medium">{label}</p>
          <p className="text-micro text-muted-foreground mt-0.5">{explanation}</p>
        </div>
      </div>
    </div>
  );
}

export function WhatIFoundSection({ epcData, results, onContinue }: WhatIFoundSectionProps) {
  const epcBand = (results.epcBand || epcData.epcBand || 'D').toUpperCase().charAt(0);
  const floorArea = results.floorArea;
  const currentFuel = epcData.mainFuel ? getFuelDisplayName(epcData.mainFuel.toLowerCase()) : 'Gas boiler';
  const heatLoss = results.heatLossKw;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-16">
      <div className="bg-card rounded-3xl shadow-soft border border-border overflow-hidden section-enter">
        {/* Header */}
        <div className="px-8 pt-10 pb-6">
          <h2 className="text-section-title text-foreground mb-2">
            What I found about your home
          </h2>
          <p className="text-muted-foreground flex items-center gap-2">
            <Home className="w-4 h-4" />
            <span className="truncate">{epcData.address}</span>
          </p>
        </div>

        {/* Tiles grid */}
        <div className="px-8 pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Tile
              icon={Home}
              value={`EPC ${epcBand}`}
              label="Energy rating"
              explanation={EPC_LABELS[epcBand] || 'Typical insulation'}
              epcBand={epcBand}
              delay={100}
            />
            <Tile
              icon={Ruler}
              value={`${floorArea} m²`}
              label="Floor area"
              explanation="Total living space"
              delay={150}
            />
            <Tile
              icon={Flame}
              value={currentFuel}
              label="Current heating"
              explanation="Main fuel source"
              delay={200}
            />
            <Tile
              icon={Thermometer}
              value={`${heatLoss} kW`}
              label="Heat loss"
              explanation="At design temperature"
              delay={250}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 pb-10">
          <Button 
            onClick={onContinue}
            size="lg"
            className="w-full h-14 text-base font-semibold rounded-xl shadow-lg cta-hover-lift"
          >
            Looks right — continue
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
