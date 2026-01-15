import { Check, ArrowLeft, Droplets, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Assumptions } from '@/lib/calculations';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CylinderSectionProps {
  cylinderOption: 'existing' | '150l' | '210l';
  onCylinderChange: (value: 'existing' | '150l' | '210l') => void;
  onContinue: () => void;
  onBack: () => void;
  assumptions: Assumptions;
}

export function CylinderSection({
  cylinderOption,
  onCylinderChange,
  onContinue,
  onBack,
  assumptions,
}: CylinderSectionProps) {
  const cylinderOptions = [
    { 
      value: 'existing' as const, 
      label: 'Keep existing', 
      description: 'Your current cylinder is suitable',
      priceImpact: 0,
    },
    { 
      value: '150l' as const, 
      label: 'Replace with 150L', 
      description: 'Suitable for 1–3 people',
      priceImpact: assumptions.adder_cylinder_150l,
    },
    { 
      value: '210l' as const, 
      label: 'Replace with 210L', 
      description: 'Suitable for 4+ people',
      priceImpact: assumptions.adder_cylinder_210l,
    },
  ];

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

      {/* Icon */}
      <div className="flex justify-center mb-4">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Droplets className="w-7 h-7 text-primary" />
        </div>
      </div>

      {/* Title with tooltip */}
      <div className="text-center mb-2">
        <div className="flex items-center justify-center gap-2">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            Hot water cylinder
          </h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-muted-foreground/50 hover:text-muted-foreground">
                  <Info className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <div className="space-y-2 text-xs">
                  <p className="font-semibold">Why we ask this</p>
                  <p>Heat pumps work best with a properly sized hot water cylinder. We only replace it if your current one isn't suitable.</p>
                  <p className="font-semibold pt-1">How this affects your quote</p>
                  <p>A new cylinder adds to your install cost but ensures reliable hot water.</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Explanation */}
      <p className="text-center text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
        Do you want to keep your existing hot water cylinder or upgrade to a new one?
      </p>

      {/* Cylinder visual */}
      <div className="p-4 rounded-xl bg-muted/30 mb-6">
        <div className="flex items-end justify-center gap-6">
          {[
            { size: 'Keep', height: 32, label: 'Existing', value: 'existing' },
            { size: '150L', height: 44, label: '150L', value: '150l' },
            { size: '210L', height: 56, label: '210L', value: '210l' },
          ].map((cyl) => (
            <div key={cyl.size} className="text-center">
              <div 
                className={cn(
                  'w-10 rounded-t-xl mx-auto transition-all duration-300',
                  cylinderOption === cyl.value 
                    ? 'bg-primary shadow-lg scale-110' 
                    : 'bg-muted-foreground/20'
                )}
                style={{ height: cyl.height }}
              />
              <p className={cn(
                'text-[10px] mt-1.5 font-medium transition-colors',
                cylinderOption === cyl.value ? 'text-primary' : 'text-muted-foreground'
              )}>
                {cyl.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Options with exact price impacts */}
      <div className="space-y-2 mb-6">
        {cylinderOptions.map((option) => {
          const isSelected = cylinderOption === option.value;
          
          return (
            <button
              key={option.value}
              onClick={() => onCylinderChange(option.value)}
              className={cn(
                'w-full p-4 rounded-xl border-2 text-left transition-all duration-150 active:scale-[0.99]',
                'bg-card',
                isSelected 
                  ? 'border-primary shadow-md ring-1 ring-primary/20' 
                  : 'border-border hover:border-muted-foreground/30'
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                    isSelected 
                      ? 'border-primary bg-primary scale-110' 
                      : 'border-muted-foreground/30'
                  )}>
                    {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">{option.label}</h3>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                </div>
                
                <span className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-bold tabular-nums',
                  option.priceImpact === 0 
                    ? 'bg-green-50 text-green-700' 
                    : 'bg-amber-50 text-amber-700'
                )}>
                  {option.priceImpact === 0 ? '+£0' : `+£${option.priceImpact.toLocaleString()}`}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* CTA */}
      <Button 
        onClick={onContinue}
        size="lg"
        className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold rounded-xl active:scale-[0.98] transition-all cta-hover-lift"
      >
        Continue →
      </Button>
    </section>
  );
}
