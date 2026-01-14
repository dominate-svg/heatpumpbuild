import { ArrowLeft, MapPin, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { IllustrationPlaceholder } from '../IllustrationPlaceholder';

interface FineTuneStepProps {
  selectedLocation: 'included' | '6m' | '9m';
  selectedPeople: '1-2' | '3-4' | '5+';
  onSelectLocation: (value: 'included' | '6m' | '9m') => void;
  onSelectPeople: (value: '1-2' | '3-4' | '5+') => void;
  onContinue: () => void;
  onBack: () => void;
}

const LOCATION_OPTIONS = [
  { value: 'included' as const, label: 'Within 3m of boiler', description: 'Shortest pipe run' },
  { value: '6m' as const, label: '3–6m away', description: 'Some extra piping' },
  { value: '9m' as const, label: 'Further away', description: 'Longest run' },
];

const PEOPLE_OPTIONS = [
  { value: '1-2' as const, label: '1–2 people', cylinder: 'existing' },
  { value: '3-4' as const, label: '3–4 people', cylinder: '150l' },
  { value: '5+' as const, label: '5+ people', cylinder: '210l' },
];

export function FineTuneStep({ 
  selectedLocation,
  selectedPeople,
  onSelectLocation,
  onSelectPeople,
  onContinue, 
  onBack 
}: FineTuneStepProps) {
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
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          Fine-tune your estimate
        </h1>
        <p className="text-muted-foreground text-sm">
          These details help us be more accurate about costs.
        </p>
      </div>

      {/* Location section */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-primary" />
          <h3 className="font-medium text-foreground">Where can the heat pump go?</h3>
        </div>
        
        <IllustrationPlaceholder 
          label="Diagram: House showing pipe distances" 
          className="mb-3 h-20"
        />
        
        <p className="text-sm text-muted-foreground mb-3">
          The unit sits outside. Longer pipes mean a bit more install work.
        </p>
        
        <div className="grid grid-cols-3 gap-2">
          {LOCATION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSelectLocation(opt.value)}
              className={cn(
                'p-3 rounded-xl border-2 text-center transition-all',
                selectedLocation === opt.value 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border bg-card hover:border-primary/30'
              )}
            >
              <p className="text-sm font-medium text-foreground">{opt.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* People section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-primary" />
          <h3 className="font-medium text-foreground">How many people live in your home?</h3>
        </div>
        
        <p className="text-sm text-muted-foreground mb-3">
          This helps size your hot water cylinder. Bigger households need more stored hot water.
        </p>
        
        <div className="grid grid-cols-3 gap-2">
          {PEOPLE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSelectPeople(opt.value)}
              className={cn(
                'p-3 rounded-xl border-2 text-center transition-all',
                selectedPeople === opt.value 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border bg-card hover:border-primary/30'
              )}
            >
              <p className="text-sm font-medium text-foreground">{opt.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* CTA */}
      <Button 
        onClick={onContinue} 
        className="w-full h-12 text-base"
        size="lg"
      >
        See my estimate →
      </Button>
    </div>
  );
}

// Helper to convert people to cylinder option
export function peopleToCylinder(people: '1-2' | '3-4' | '5+'): 'existing' | '150l' | '210l' {
  switch (people) {
    case '1-2': return 'existing';
    case '3-4': return '150l';
    case '5+': return '210l';
    default: return 'existing';
  }
}
