import { Home, Ruler, Flame, Thermometer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { EPCData, EstimateResults } from '@/lib/calculations';
import { getFuelDisplayName } from '@/lib/calculations';
import { cn } from '@/lib/utils';

interface HomeAtGlanceSectionProps {
  epcData: EPCData;
  results: EstimateResults;
  onContinue: () => void;
}

const EPC_INFO: Record<string, { color: string; label: string; explanation: string }> = {
  'A': { color: 'bg-[#008054]', label: 'Excellent', explanation: 'Excellent insulation — heat stays in.' },
  'B': { color: 'bg-[#19b459]', label: 'Very Good', explanation: 'Very good insulation — minimal heat loss.' },
  'C': { color: 'bg-[#8dce46]', label: 'Good', explanation: 'Good insulation — typical for modern homes.' },
  'D': { color: 'bg-[#ffd500]', label: 'Average', explanation: 'Average insulation — some heat escapes.' },
  'E': { color: 'bg-[#fcaa65]', label: 'Below Average', explanation: 'Below average — heat escapes faster.' },
  'F': { color: 'bg-[#ef8023]', label: 'Poor', explanation: 'Below average insulation — heat escapes faster.' },
  'G': { color: 'bg-[#e9153b]', label: 'Very Poor', explanation: 'Poor insulation — but a heat pump still works.' },
};

interface TileProps {
  icon: React.ComponentType<{ className?: string }>;
  value: string | number;
  label: string;
  explanation: string;
  highlight?: string;
  delay?: number;
}

function Tile({ icon: Icon, value, label, explanation, highlight, delay = 0 }: TileProps) {
  return (
    <div
      className="bg-card rounded-xl p-5 border border-border shadow-soft section-enter"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start gap-4">
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
          highlight || 'bg-muted'
        )}>
          <Icon className={cn('w-6 h-6', highlight ? 'text-white' : 'text-muted-foreground')} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-card-number font-semibold text-foreground leading-tight">{value}</p>
          <p className="text-micro text-muted-foreground mt-0.5">{label}</p>
          <p className="text-micro text-muted-foreground/80 mt-2 leading-relaxed">{explanation}</p>
        </div>
      </div>
    </div>
  );
}

export function HomeAtGlanceSection({ epcData, results, onContinue }: HomeAtGlanceSectionProps) {
  const epcBand = (results.epcBand || epcData.epcBand || 'D').toUpperCase().charAt(0);
  const epcInfo = EPC_INFO[epcBand] || EPC_INFO['D'];
  const floorArea = results.floorArea;
  const currentFuel = epcData.mainFuel ? getFuelDisplayName(epcData.mainFuel.toLowerCase()) : 'Gas boiler';
  const heatLoss = results.heatLossKw;

  return (
    <section className="py-16 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 section-enter">
          <h2 className="text-section-title font-semibold text-foreground tracking-tight mb-2">
            Your home, at a glance
          </h2>
          <p className="text-body text-muted-foreground">
            {epcData.address}
          </p>
        </div>

        {/* Tiles grid */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <Tile
            icon={Home}
            value={`EPC ${epcBand}`}
            label={epcInfo.label}
            explanation={epcInfo.explanation}
            highlight={epcInfo.color}
            delay={100}
          />
          <Tile
            icon={Ruler}
            value={`${floorArea}m²`}
            label="Floor area"
            explanation="Total heated space in your home."
            delay={200}
          />
          <Tile
            icon={Flame}
            value={currentFuel}
            label="Current heating"
            explanation="What you're heating with today."
            delay={300}
          />
          <Tile
            icon={Thermometer}
            value={`${heatLoss.toFixed(1)}kW`}
            label="Heat loss"
            explanation="How much heat escapes at coldest temps."
            delay={400}
          />
        </div>

        {/* Microcopy */}
        <p className="text-center text-micro text-muted-foreground mb-8 section-enter" style={{ animationDelay: '500ms' }}>
          This helps us size the right system for comfort and efficiency.
        </p>

        {/* CTA */}
        <div className="text-center section-enter" style={{ animationDelay: '600ms' }}>
          <Button
            onClick={onContinue}
            size="lg"
            className="h-14 px-10 text-base font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
          >
            Continue
          </Button>
        </div>
      </div>
    </section>
  );
}
