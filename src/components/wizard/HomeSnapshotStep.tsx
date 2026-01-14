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
    <div className="bg-card rounded-xl sm:rounded-2xl border border-border shadow-soft p-3 sm:p-4">
      <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-2 sm:gap-3">
        <div className={cn(
          'w-10 h-10 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0',
          epcInfo ? epcInfo.color : 'bg-muted'
        )}>
          {epcBand ? (
            <span className="text-lg sm:text-xl font-bold text-white">{epcBand}</span>
          ) : (
            <Icon className="w-5 h-5 sm:w-5 sm:h-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
          <p className="text-base sm:text-lg font-semibold text-foreground mb-1">{value}</p>
          <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">{explanation}</p>
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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 pb-24 sm:pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 sm:mb-6 section-enter active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>

        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 section-enter">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground tracking-tight mb-3 sm:mb-4">
            Your home snapshot
          </h1>
          <p className="text-sm sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            This comes from your EPC and helps us estimate how much heat your home needs.
          </p>
        </div>

        {/* EPC explainer callout */}
        <div className="bg-primary/5 rounded-xl sm:rounded-2xl border border-primary/20 p-4 sm:p-5 mb-6 sm:mb-8 section-enter" style={{ animationDelay: '100ms' }}>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Info className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm sm:text-base mb-0.5 sm:mb-1">What's an EPC?</p>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                A government-backed energy rating (A–G). It's not perfect, but it's a useful starting point.
              </p>
            </div>
          </div>
        </div>

        {/* Home facts grid - 2x2 on mobile, still 2x2 on desktop */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="section-enter" style={{ animationDelay: '200ms' }}>
            <Tile
              icon={FileText}
              value={epcInfo.label}
              label="EPC rating"
              explanation="Lower letters mean more heat leaks out."
              epcBand={epcBand}
            />
          </div>
          <div className="section-enter" style={{ animationDelay: '250ms' }}>
            <Tile
              icon={Ruler}
              value={`${Math.round(floorArea)}m²`}
              label="Floor area"
              explanation="Bigger homes need more heat."
            />
          </div>
          <div className="section-enter" style={{ animationDelay: '300ms' }}>
            <Tile
              icon={Flame}
              value={currentFuel}
              label="Current heating"
              explanation="We compare this to estimate savings."
            />
          </div>
          <div className="section-enter" style={{ animationDelay: '350ms' }}>
            <Tile
              icon={Thermometer}
              value={`${heatLoss.toFixed(1)}kW`}
              label="Heat loss"
              explanation="Helps size the system correctly."
            />
          </div>
        </div>

        {/* Reassurance line */}
        <div className="bg-muted/50 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-6 sm:mb-10 text-center section-enter" style={{ animationDelay: '400ms' }}>
          <p className="text-xs sm:text-sm text-muted-foreground flex items-center justify-center gap-2">
            <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span>Don't worry if this isn't perfect — the survey confirms everything.</span>
          </p>
        </div>

        {/* CTA - sticky on mobile */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border sm:relative sm:p-0 sm:bg-transparent sm:border-0 sm:text-center section-enter z-40" style={{ animationDelay: '450ms' }}>
          <Button
            onClick={onContinue}
            size="lg"
            className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-10 text-sm sm:text-base font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
          >
            Continue to my estimate
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
          </Button>
        </div>

        {/* AI prompt chips */}
        <div className="mt-6 sm:mt-8 section-enter hidden sm:block" style={{ animationDelay: '500ms' }}>
          <p className="text-center text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">Ask the AI assistant:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {['What does EPC mean for me?', 'Will this work in an older home?'].map((chip) => (
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