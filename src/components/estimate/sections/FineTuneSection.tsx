import { MapPin, Users, Home, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FineTuneSectionProps {
  selectedLocation: 'included' | '6m' | '9m';
  selectedPeople: '1-2' | '3-4' | '5+';
  onSelectLocation: (value: 'included' | '6m' | '9m') => void;
  onSelectPeople: (value: '1-2' | '3-4' | '5+') => void;
  onContinue: () => void;
}

const LOCATION_OPTIONS = [
  { value: 'included' as const, label: 'Within 3m', icon: '🏠', description: 'Closest to boiler' },
  { value: '6m' as const, label: '3–6m away', icon: '📍', description: 'Some extra piping' },
  { value: '9m' as const, label: 'Further', icon: '🗺️', description: 'Longest run' },
];

const PEOPLE_OPTIONS = [
  { value: '1-2' as const, label: '1–2', icon: '👤', description: 'Compact cylinder' },
  { value: '3-4' as const, label: '3–4', icon: '👥', description: 'Standard cylinder' },
  { value: '5+' as const, label: '5+', icon: '👨‍👩‍👧‍👦', description: 'Large cylinder' },
];

interface OptionButtonProps {
  selected: boolean;
  onClick: () => void;
  icon: string;
  label: string;
  description: string;
}

function OptionButton({ selected, onClick, icon, label, description }: OptionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex-1 p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 text-center transition-all active:scale-[0.97] min-w-0',
        selected 
          ? 'border-primary bg-primary/5 shadow-sm' 
          : 'border-border bg-card hover:border-primary/30'
      )}
    >
      <div className="text-xl sm:text-2xl mb-1 sm:mb-2">{icon}</div>
      <p className="font-semibold text-foreground text-xs sm:text-sm">{label}</p>
      <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">{description}</p>
    </button>
  );
}

export function FineTuneSection({ 
  selectedLocation,
  selectedPeople,
  onSelectLocation,
  onSelectPeople,
  onContinue 
}: FineTuneSectionProps) {
  return (
    <section className="py-8 sm:py-12 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8 sm:mb-10">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
          A few quick details
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          These help us be more accurate — they only take a second
        </p>
      </div>

      {/* Location question */}
      <div className="mb-8 sm:mb-10">
        <div className="flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm sm:text-base">Where can the heat pump go?</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Distance from your boiler</p>
          </div>
        </div>
        
        {/* Visual diagram */}
        <div className="relative mb-3 sm:mb-4 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-muted/30 border border-border">
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-card border border-border flex items-center justify-center mx-auto mb-1">
                <span className="text-base sm:text-lg">🔥</span>
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Boiler</p>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="flex items-center gap-0.5 sm:gap-1">
                <div className="h-0.5 w-4 sm:w-8 bg-border rounded" />
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                <div className="h-0.5 w-4 sm:w-8 bg-border rounded" />
              </div>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-1">
                <span className="text-base sm:text-lg">❄️</span>
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Heat pump</p>
            </div>
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground text-center mt-2 sm:mt-3">
            Longer distance = slightly higher install cost
          </p>
        </div>
        
        <div className="flex gap-2 sm:gap-3">
          {LOCATION_OPTIONS.map((opt) => (
            <OptionButton
              key={opt.value}
              selected={selectedLocation === opt.value}
              onClick={() => onSelectLocation(opt.value)}
              icon={opt.icon}
              label={opt.label}
              description={opt.description}
            />
          ))}
        </div>
      </div>

      {/* People question */}
      <div className="mb-8 sm:mb-10">
        <div className="flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm sm:text-base">How many people live here?</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">This sizes your hot water</p>
          </div>
        </div>
        
        {/* Visual indicator */}
        <div className="relative mb-3 sm:mb-4 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-muted/30 border border-border">
          <div className="flex items-end justify-center gap-1.5 sm:gap-2 h-10 sm:h-12">
            {[1, 2, 3, 4, 5].map((n) => (
              <div 
                key={n}
                className={cn(
                  'w-6 sm:w-8 rounded-t-full transition-all',
                  selectedPeople === '1-2' && n <= 2 && 'bg-primary',
                  selectedPeople === '3-4' && n <= 4 && 'bg-primary',
                  selectedPeople === '5+' && 'bg-primary',
                  !(
                    (selectedPeople === '1-2' && n <= 2) ||
                    (selectedPeople === '3-4' && n <= 4) ||
                    selectedPeople === '5+'
                  ) && 'bg-muted'
                )}
                style={{ height: `${16 + n * 6}px` }}
              />
            ))}
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground text-center mt-2 sm:mt-3">
            More people = larger hot water cylinder
          </p>
        </div>
        
        <div className="flex gap-2 sm:gap-3">
          {PEOPLE_OPTIONS.map((opt) => (
            <OptionButton
              key={opt.value}
              selected={selectedPeople === opt.value}
              onClick={() => onSelectPeople(opt.value)}
              icon={opt.icon}
              label={opt.label}
              description={opt.description}
            />
          ))}
        </div>
      </div>

      {/* CTA */}
      <Button 
        onClick={onContinue}
        size="lg"
        className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold active:scale-[0.98] transition-transform"
      >
        Continue →
      </Button>
    </section>
  );
}
