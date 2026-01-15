import { Home, Thermometer, Flame, Zap, Check, Pencil, Info, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { EPCData } from '@/lib/calculations';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface HomeDataSectionProps {
  epcData: EPCData;
  heatLossKw: number;
  currentFuel: string;
  onEditFuel: () => void;
  onContinue: () => void;
  onBack: () => void;
}

const FUEL_LABELS: Record<string, string> = {
  gas: 'Mains gas boiler',
  oil: 'Oil boiler',
  lpg: 'LPG boiler',
  electric: 'Electric heating',
};

const EPC_COLORS: Record<string, { bg: string; text: string }> = {
  A: { bg: 'bg-green-500', text: 'text-white' },
  B: { bg: 'bg-green-400', text: 'text-white' },
  C: { bg: 'bg-lime-400', text: 'text-foreground' },
  D: { bg: 'bg-yellow-400', text: 'text-foreground' },
  E: { bg: 'bg-orange-400', text: 'text-white' },
  F: { bg: 'bg-orange-500', text: 'text-white' },
  G: { bg: 'bg-red-500', text: 'text-white' },
};

interface DataTileProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  tooltip?: string;
  onEdit?: () => void;
  highlight?: boolean;
}

function DataTile({ icon, label, value, tooltip, onEdit, highlight }: DataTileProps) {
  return (
    <div className={cn(
      'relative p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border transition-all animate-scale-in',
      highlight ? 'bg-primary/5 border-primary/20' : 'bg-card border-border'
    )}>
      <div className="flex items-start gap-3">
        <div className={cn(
          'w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0',
          highlight ? 'bg-primary/10' : 'bg-muted/50'
        )}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-xs sm:text-sm text-muted-foreground">{label}</span>
            {tooltip && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-muted-foreground/50 hover:text-muted-foreground">
                      <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[260px] sm:max-w-xs">
                    <p className="text-xs sm:text-sm">{tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <p className="font-semibold text-foreground text-sm sm:text-base">{value}</p>
        </div>
        {onEdit && (
          <button 
            onClick={onEdit}
            className="text-primary text-xs sm:text-sm hover:underline flex items-center gap-1 active:opacity-70 py-1 px-2 -mr-2 rounded-lg"
          >
            <Pencil className="w-3 h-3" />
            Edit
          </button>
        )}
      </div>
      {/* Checkmark */}
      <div className="absolute -right-0.5 -top-0.5 sm:-right-1 sm:-top-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary flex items-center justify-center">
        <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary-foreground" />
      </div>
    </div>
  );
}

export function HomeDataSection({ 
  epcData, 
  heatLossKw, 
  currentFuel, 
  onEditFuel, 
  onContinue,
  onBack,
}: HomeDataSectionProps) {
  const epcBand = (epcData.epcBand?.toUpperCase() || 'D') as keyof typeof EPC_COLORS;
  const floorArea = epcData.totalFloorArea || 100;
  const epcColor = EPC_COLORS[epcBand] || EPC_COLORS.D;

  return (
    <section className="py-6 sm:py-10 animate-fade-in">
      {/* Back button */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-primary/10 mb-3 sm:mb-4">
          <Home className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
          Here's what we already know
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground px-2">
          This comes from your EPC — you can change anything if it's wrong.
        </p>
      </div>

      {/* Data tiles - animated stack */}
      <div className="space-y-2.5 sm:space-y-3 mb-6 sm:mb-8">
        <DataTile
          icon={
            <div className={cn(
              'w-5 h-5 sm:w-6 sm:h-6 rounded font-bold text-[10px] sm:text-xs flex items-center justify-center',
              epcColor.bg, epcColor.text
            )}>
              {epcBand}
            </div>
          }
          label="Energy rating"
          value={`EPC ${epcBand}`}
          tooltip="Your Energy Performance Certificate shows how efficient your home is. E-G rated homes often see the biggest savings."
          highlight
        />

        <DataTile
          icon={<Home className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />}
          label="Home size"
          value={`${floorArea} m²`}
          tooltip="Floor area helps us estimate your heating needs."
        />

        <DataTile
          icon={<Flame className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />}
          label="Current heating"
          value={FUEL_LABELS[currentFuel] || 'Gas boiler'}
          tooltip="We use this to calculate your current costs and potential savings."
          onEdit={onEditFuel}
        />

        <DataTile
          icon={<Thermometer className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />}
          label="Heat loss estimate"
          value={`${heatLossKw.toFixed(1)} kW`}
          tooltip="How much heat escapes on a cold day — this determines the size of heat pump you need."
        />
      </div>

      {/* Trust note */}
      <div className="bg-muted/30 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-6 sm:mb-8">
        <p className="text-xs sm:text-sm text-muted-foreground text-center">
          ✓ This data is from your official EPC record
        </p>
      </div>

      {/* CTA */}
      <Button 
        onClick={onContinue}
        size="lg"
        className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold active:scale-[0.98] transition-all cta-hover-lift"
      >
        Looks right →
      </Button>
    </section>
  );
}
