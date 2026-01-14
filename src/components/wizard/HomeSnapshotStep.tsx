import { FileText, Ruler, Flame, Thermometer, Info, ArrowRight, ArrowLeft, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { EPCData, EstimateResults } from '@/lib/calculations';

interface HomeSnapshotStepProps {
  epcData: EPCData;
  results: EstimateResults;
  onContinue: () => void;
  onBack: () => void;
}

const EPC_INFO: Record<string, { color: string; label: string; explanation: string }> = {
  A: { color: 'bg-green-500', label: 'Excellent', explanation: 'Very well insulated — heat stays in easily.' },
  B: { color: 'bg-green-400', label: 'Good', explanation: 'Good insulation — heat stays in well.' },
  C: { color: 'bg-lime-400', label: 'Fair', explanation: 'Reasonable insulation — some heat escapes.' },
  D: { color: 'bg-yellow-400', label: 'Average', explanation: 'Average insulation — heating works harder.' },
  E: { color: 'bg-orange-400', label: 'Below average', explanation: 'Below average insulation — heat escapes faster.' },
  F: { color: 'bg-orange-500', label: 'Poor', explanation: 'Poor insulation — significant heat loss.' },
  G: { color: 'bg-red-500', label: 'Very poor', explanation: 'Very poor insulation — heat escapes quickly.' },
};

const FUEL_LABELS: Record<string, string> = {
  gas: 'Mains gas',
  oil: 'Oil',
  lpg: 'LPG',
  electric: 'Electric',
};

interface TileProps {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  label: string;
  explanation: string;
  epcBand?: string;
}

function Tile({ icon: Icon, value, label, explanation, epcBand }: TileProps) {
  const epcInfo = epcBand ? EPC_INFO[epcBand] : null;
  
  return (
    <div className="bg-card rounded-2xl border border-border shadow-soft p-5">
      <div className="flex items-start gap-4">
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
          epcInfo ? epcInfo.color : 'bg-muted'
        )}>
          {epcBand ? (
            <span className="text-xl font-bold text-white">{epcBand}</span>
          ) : (
            <Icon className="w-6 h-6 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <p className="text-lg font-semibold text-foreground mb-2">{value}</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{explanation}</p>
        </div>
      </div>
    </div>
  );
}

export function HomeSnapshotStep({ epcData, results, onContinue, onBack }: HomeSnapshotStepProps) {
  const epcBand = results.epcBand || 'D';
  const epcInfo = EPC_INFO[epcBand] || EPC_INFO.D;
  const floorArea = results.floorArea || epcData.totalFloorArea || 100;
  const currentFuel = FUEL_LABELS[results.currentFuelType] || 'Gas';
  const heatLoss = results.heatLossKw;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 section-enter"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>

        {/* Header */}
        <div className="text-center mb-8 section-enter">
          <h1 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight mb-4">
            Your home snapshot
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            This comes from your EPC (Energy Performance Certificate) and helps us estimate how much heat your home needs.
          </p>
        </div>

        {/* EPC explainer callout */}
        <div className="bg-primary/5 rounded-2xl border border-primary/20 p-5 mb-8 section-enter" style={{ animationDelay: '100ms' }}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Info className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1">What's an EPC?</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                An EPC is a government-backed energy rating for your home (A–G). It's not perfect, but it's a useful starting point for estimates.
              </p>
            </div>
          </div>
        </div>

        {/* Home facts grid */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="section-enter" style={{ animationDelay: '200ms' }}>
            <Tile
              icon={FileText}
              value={epcInfo.label}
              label="EPC rating"
              explanation="Lower letters usually mean more heat leaks out, so heating costs can be higher."
              epcBand={epcBand}
            />
          </div>
          <div className="section-enter" style={{ animationDelay: '250ms' }}>
            <Tile
              icon={Ruler}
              value={`${Math.round(floorArea)} m²`}
              label="Floor area"
              explanation="Bigger homes usually need more heat."
            />
          </div>
          <div className="section-enter" style={{ animationDelay: '300ms' }}>
            <Tile
              icon={Flame}
              value={currentFuel}
              label="Current heating"
              explanation="This is what we compare against to estimate savings."
            />
          </div>
          <div className="section-enter" style={{ animationDelay: '350ms' }}>
            <Tile
              icon={Thermometer}
              value={`${heatLoss.toFixed(1)} kW`}
              label="Heat loss estimate"
              explanation="This helps us size the system so your home stays warm."
            />
          </div>
        </div>

        {/* Reassurance line */}
        <div className="bg-muted/50 rounded-xl p-4 mb-10 text-center section-enter" style={{ animationDelay: '400ms' }}>
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
            <HelpCircle className="w-4 h-4" />
            Don't worry if this isn't perfect — the survey confirms the final design.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center section-enter" style={{ animationDelay: '450ms' }}>
          <Button
            onClick={onContinue}
            size="lg"
            className="h-14 px-10 text-base font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
          >
            Continue to my estimate
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        {/* AI prompt chips - positioned below CTA for mobile friendliness */}
        <div className="mt-8 section-enter" style={{ animationDelay: '500ms' }}>
          <p className="text-center text-sm text-muted-foreground mb-3">Ask the AI assistant:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {['What does EPC mean for me?', 'Will this work in an older home?', 'Why do you need heat loss?'].map((chip) => (
              <button
                key={chip}
                className="px-3 py-1.5 text-xs bg-card border border-border rounded-full hover:border-primary/30 hover:bg-primary/5 transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
