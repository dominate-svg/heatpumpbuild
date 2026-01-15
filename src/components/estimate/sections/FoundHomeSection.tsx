import { Home, Thermometer, Flame, Zap, Check, Info, ArrowLeft, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { EPCData } from '@/lib/calculations';
import { getRadiatorsForEfficiency } from '@/lib/calculations';
import { PropertyMap } from '@/components/estimate/PropertyMap';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface FoundHomeSectionProps {
  epcData: EPCData;
  heatLossKw: number;
  currentFuel: string;
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

interface DataCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  helpText?: string;
  delay?: number;
}

function DataCard({ icon, label, value, helpText, delay = 0 }: DataCardProps) {
  return (
    <div 
      className="relative p-3.5 rounded-xl border bg-card border-border animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-xs text-muted-foreground">{label}</span>
            {helpText && (
              <Sheet>
                <SheetTrigger asChild>
                  <button className="text-muted-foreground/50 hover:text-primary transition-colors">
                    <HelpCircle className="w-3.5 h-3.5" />
                  </button>
                </SheetTrigger>
                <SheetContent side="bottom" className="rounded-t-2xl">
                  <SheetHeader>
                    <SheetTitle className="text-left">Why we use this</SheetTitle>
                    <SheetDescription className="text-left">
                      {helpText}
                    </SheetDescription>
                  </SheetHeader>
                </SheetContent>
              </Sheet>
            )}
          </div>
          <p className="font-semibold text-foreground text-sm">{value}</p>
        </div>
        {/* Checkmark */}
        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
          <Check className="w-3 h-3 text-white" />
        </div>
      </div>
    </div>
  );
}

export function FoundHomeSection({ 
  epcData, 
  heatLossKw, 
  currentFuel, 
  onContinue,
  onBack,
}: FoundHomeSectionProps) {
  const epcBand = (epcData.epcBand?.toUpperCase() || 'D') as keyof typeof EPC_COLORS;
  const floorArea = epcData.totalFloorArea || 100;
  const epcColor = EPC_COLORS[epcBand] || EPC_COLORS.D;
  
  // Estimate likely radiator changes based on balanced efficiency
  const likelyRadiators = getRadiatorsForEfficiency(3.7);

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
      <div className="text-center mb-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-green-100 mb-3">
          <Check className="w-7 h-7 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          We found your home
        </h1>
        <p className="text-sm text-muted-foreground px-2">
          Based on your EPC record — you can change anything if it looks wrong.
        </p>
      </div>

      {/* Property map */}
      <PropertyMap 
        postcode={epcData.postcode || ''} 
        address={epcData.address}
        className="h-36 mb-4"
      />

      {/* Data cards - stacked */}
      <div className="space-y-2.5 mb-6">
        <DataCard
          icon={
            <div className={cn(
              'w-6 h-6 rounded font-bold text-xs flex items-center justify-center',
              epcColor.bg, epcColor.text
            )}>
              {epcBand}
            </div>
          }
          label="Energy rating"
          value={`EPC ${epcBand}`}
          helpText="Your Energy Performance Certificate shows how efficient your home is. We use this to estimate heat demand and potential savings."
          delay={0}
        />

        <DataCard
          icon={<Home className="w-5 h-5 text-muted-foreground" />}
          label="Home size"
          value={`${floorArea} m²`}
          helpText="Floor area helps us estimate your total heating needs and size the right heat pump."
          delay={50}
        />

        <DataCard
          icon={<Flame className="w-5 h-5 text-muted-foreground" />}
          label="Current heating"
          value={FUEL_LABELS[currentFuel] || 'Gas boiler'}
          helpText="We compare your current fuel costs to heat pump running costs to calculate potential savings."
          delay={100}
        />

        <DataCard
          icon={<Thermometer className="w-5 h-5 text-muted-foreground" />}
          label="Heat loss estimate"
          value={`${heatLossKw.toFixed(1)} kW`}
          helpText="This is how much heat escapes on a cold day. It determines the size of heat pump you need."
          delay={150}
        />

        <DataCard
          icon={<Zap className="w-5 h-5 text-muted-foreground" />}
          label="Likely radiator upgrades"
          value={likelyRadiators > 2 ? `~${likelyRadiators} radiators` : 'Minimal changes'}
          helpText="For efficient heat pump operation, some radiators may need upgrading. We'll confirm exact requirements at survey."
          delay={200}
        />
      </div>

      {/* Trust note */}
      <div className="bg-muted/30 rounded-xl p-3 mb-6">
        <p className="text-xs text-muted-foreground text-center">
          ✓ This data comes from your official EPC record
        </p>
      </div>

      {/* CTA */}
      <Button 
        onClick={onContinue}
        size="lg"
        className="w-full h-14 text-base font-semibold rounded-xl active:scale-[0.98] transition-all"
      >
        Looks right →
      </Button>
    </section>
  );
}