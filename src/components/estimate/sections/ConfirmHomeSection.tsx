import { Home, Zap, Flame, Thermometer, Check, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { EPCData } from '@/lib/calculations';

interface ConfirmHomeSectionProps {
  epcData: EPCData;
  heatLossKw: number;
  currentFuel: string;
  onEditFuel: () => void;
  onContinue: () => void;
}

const FUEL_LABELS: Record<string, string> = {
  gas: 'Gas boiler',
  oil: 'Oil boiler',
  lpg: 'LPG boiler',
  electric: 'Electric heating',
};

const EPC_COLORS: Record<string, string> = {
  A: 'bg-green-500 text-white',
  B: 'bg-green-400 text-white',
  C: 'bg-lime-400 text-foreground',
  D: 'bg-yellow-400 text-foreground',
  E: 'bg-orange-400 text-white',
  F: 'bg-orange-500 text-white',
  G: 'bg-red-500 text-white',
};

export function ConfirmHomeSection({ 
  epcData, 
  heatLossKw, 
  currentFuel, 
  onEditFuel, 
  onContinue 
}: ConfirmHomeSectionProps) {
  const epcBand = epcData.epcBand?.toUpperCase() || 'D';
  const floorArea = epcData.totalFloorArea || 100;

  return (
    <section className="py-6 sm:py-10 animate-fade-in">
      {/* Simple house illustration */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 flex items-center justify-center">
            <Home className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
          </div>
          <div className={cn(
            'absolute -top-2 -right-2 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm',
            EPC_COLORS[epcBand] || EPC_COLORS.D
          )}>
            {epcBand}
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1">
          We found this about your home
        </h2>
        <p className="text-sm text-muted-foreground">
          Check it's correct, or tap to edit
        </p>
      </div>

      {/* Data cards - clean white cards */}
      <div className="space-y-2 mb-6">
        <DataRow 
          icon={<div className={cn('w-6 h-6 rounded text-xs font-bold flex items-center justify-center', EPC_COLORS[epcBand] || EPC_COLORS.D)}>{epcBand}</div>}
          label="Energy rating"
          value={`EPC ${epcBand}`}
        />
        <DataRow 
          icon={<Home className="w-5 h-5 text-muted-foreground" />}
          label="Size"
          value={`${floorArea} m²`}
        />
        <DataRow 
          icon={<Flame className="w-5 h-5 text-muted-foreground" />}
          label="Current heating"
          value={FUEL_LABELS[currentFuel] || 'Gas boiler'}
          onEdit={onEditFuel}
        />
        <DataRow 
          icon={<Thermometer className="w-5 h-5 text-muted-foreground" />}
          label="Heat loss"
          value={`${heatLossKw.toFixed(1)} kW`}
          subtitle="How much heat escapes on cold days"
        />
      </div>

      {/* CTA */}
      <Button 
        onClick={onContinue}
        size="lg"
        className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold rounded-xl active:scale-[0.98] transition-transform"
      >
        Looks right
      </Button>
    </section>
  );
}

interface DataRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
  onEdit?: () => void;
}

function DataRow({ icon, label, value, subtitle, onEdit }: DataRowProps) {
  return (
    <div className="flex items-center gap-3 p-3 sm:p-4 bg-white rounded-xl border border-border shadow-sm">
      <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-semibold text-foreground text-sm sm:text-base">{value}</p>
        {subtitle && <p className="text-[10px] text-muted-foreground">{subtitle}</p>}
      </div>
      {onEdit ? (
        <button 
          onClick={onEdit}
          className="text-primary text-xs font-medium flex items-center gap-1 py-1.5 px-2 rounded-lg hover:bg-primary/5 active:bg-primary/10 transition-colors"
        >
          <Pencil className="w-3 h-3" />
          Edit
        </button>
      ) : (
        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
      )}
    </div>
  );
}
