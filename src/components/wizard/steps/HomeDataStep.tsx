import { ArrowLeft, Home, Thermometer, Flame, Zap, Wrench, Info, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { EPCData } from '@/lib/calculations';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface HomeDataStepProps {
  epcData: EPCData;
  heatLossKw: number;
  likelyRadiators: number;
  currentFuel: string;
  onEditFuel: () => void;
  onContinue: () => void;
  onBack: () => void;
}

const FUEL_LABELS: Record<string, string> = {
  gas: 'Mains gas',
  oil: 'Heating oil',
  lpg: 'LPG',
  electric: 'Electric heating',
};

const EPC_COLORS: Record<string, string> = {
  A: 'bg-green-500',
  B: 'bg-green-400',
  C: 'bg-lime-400',
  D: 'bg-yellow-400',
  E: 'bg-orange-400',
  F: 'bg-orange-500',
  G: 'bg-red-500',
};

interface DataCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  tooltip: string;
  onEdit?: () => void;
}

function DataCard({ icon, label, value, tooltip, onEdit }: DataCardProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-4 flex items-start gap-3">
      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-sm text-muted-foreground">{label}</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-muted-foreground/60 hover:text-muted-foreground">
                  <Info className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <p className="font-semibold text-foreground truncate">{value}</p>
      </div>
      {onEdit && (
        <button 
          onClick={onEdit}
          className="text-primary text-sm hover:underline flex items-center gap-1"
        >
          <Pencil className="w-3 h-3" />
          Change
        </button>
      )}
    </div>
  );
}

export function HomeDataStep({ 
  epcData, 
  heatLossKw,
  likelyRadiators,
  currentFuel,
  onEditFuel,
  onContinue, 
  onBack 
}: HomeDataStepProps) {
  const epcBand = epcData.epcBand?.toUpperCase() || 'D';
  const floorArea = epcData.totalFloorArea || 100;
  
  return (
    <div className="animate-fade-in">
      {/* Back button */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
          <Home className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          We found this about your home
        </h1>
        <p className="text-muted-foreground text-sm">
          Based on your EPC and address — you can change anything if it's wrong.
        </p>
      </div>

      {/* Data cards */}
      <div className="space-y-3 mb-8">
        <DataCard
          icon={
            <div className={cn(
              'w-6 h-6 rounded font-bold text-white text-xs flex items-center justify-center',
              EPC_COLORS[epcBand] || 'bg-yellow-400'
            )}>
              {epcBand}
            </div>
          }
          label="Energy rating"
          value={`EPC ${epcBand}`}
          tooltip="Your Energy Performance Certificate rating shows how efficient your home is. Lower ratings (E-G) often benefit most from heat pumps."
        />

        <DataCard
          icon={<Home className="w-5 h-5 text-muted-foreground" />}
          label="Home size"
          value={`${floorArea} m²`}
          tooltip="Your total floor area helps us estimate how much heat your home needs."
        />

        <DataCard
          icon={<Flame className="w-5 h-5 text-muted-foreground" />}
          label="Current heating"
          value={FUEL_LABELS[currentFuel] || 'Gas boiler'}
          tooltip="Knowing your current fuel helps us calculate your potential savings compared to today."
          onEdit={onEditFuel}
        />

        <DataCard
          icon={<Thermometer className="w-5 h-5 text-muted-foreground" />}
          label="Heat loss"
          value={`${heatLossKw.toFixed(1)} kW`}
          tooltip="This is how much heat escapes from your home on a cold day. It determines the size of heat pump you need."
        />

        <DataCard
          icon={<Wrench className="w-5 h-5 text-muted-foreground" />}
          label="Likely radiator upgrades"
          value={likelyRadiators === 0 ? 'None expected' : `${likelyRadiators} radiators`}
          tooltip="Heat pumps work best with larger radiators. Based on your home, we estimate how many might need upgrading."
        />
      </div>

      {/* Trust note */}
      <p className="text-xs text-muted-foreground text-center mb-6">
        This data comes from your official EPC record and helps us give you an accurate estimate.
      </p>

      {/* CTA */}
      <Button 
        onClick={onContinue} 
        className="w-full h-12 text-base"
        size="lg"
      >
        Looks right →
      </Button>
    </div>
  );
}
