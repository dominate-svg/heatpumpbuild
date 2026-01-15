import { useState, useEffect } from 'react';
import { Thermometer, TrendingDown, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import type { EstimateResults, Assumptions } from '@/lib/calculations';

interface EfficiencySectionProps {
  scop: number;
  onScopChange: (scop: number) => void;
  results: EstimateResults | null;
  baseResults: EstimateResults | null; // Results at default SCOP for comparison
  assumptions: Assumptions;
  onContinue: () => void;
}

const SCOP_OPTIONS = [
  { value: 3.4, label: 'Standard', radNote: '~2 radiators upgraded' },
  { value: 3.7, label: 'Balanced', radNote: '~6 radiators upgraded' },
  { value: 4.0, label: 'High', radNote: '~11 radiators upgraded' },
];

export function EfficiencySection({ 
  scop, 
  onScopChange,
  results,
  baseResults,
  assumptions,
  onContinue,
}: EfficiencySectionProps) {
  const [sliderValue, setSliderValue] = useState(() => {
    if (scop <= 3.4) return 0;
    if (scop <= 3.7) return 1;
    return 2;
  });

  const currentOption = SCOP_OPTIONS[sliderValue];
  
  useEffect(() => {
    onScopChange(currentOption.value);
  }, [sliderValue, currentOption.value, onScopChange]);

  // Calculate differences from base
  const installDiff = results && baseResults 
    ? results.customerContribution - baseResults.customerContribution 
    : 0;
  const savingsDiff = results && baseResults 
    ? results.estimatedSavings - baseResults.estimatedSavings 
    : 0;

  return (
    <section className="py-6 sm:py-10 animate-fade-in">
      {/* Visual - thermometer with radiators */}
      <div className="mb-6 p-4 rounded-xl bg-white border border-border shadow-sm">
        <div className="flex items-center justify-center gap-6 mb-3">
          <div className="text-center">
            <div className="w-10 h-16 rounded-full bg-gradient-to-t from-orange-500 via-orange-300 to-blue-300 mx-auto mb-1 relative overflow-hidden">
              <div 
                className="absolute bottom-0 left-0 right-0 bg-orange-500 transition-all duration-500"
                style={{ height: `${30 + sliderValue * 25}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground">Efficiency</p>
          </div>
          
          <div className="text-center">
            <div className="flex gap-1 justify-center mb-1">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div 
                  key={i}
                  className={cn(
                    'w-2 h-8 rounded transition-all duration-300',
                    i <= (sliderValue === 0 ? 2 : sliderValue === 1 ? 4 : 6)
                      ? 'bg-primary'
                      : 'bg-muted'
                  )}
                />
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground">Radiators</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Higher efficiency = lower bills, but may need more radiator upgrades
        </p>
      </div>

      {/* Title */}
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1">
          Choose your efficiency level
        </h2>
        <p className="text-sm text-muted-foreground">
          Slide to see how it affects your costs
        </p>
      </div>

      {/* Slider */}
      <div className="mb-6 px-2">
        <Slider
          value={[sliderValue]}
          onValueChange={([v]) => setSliderValue(v)}
          min={0}
          max={2}
          step={1}
          className="mb-4"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Standard</span>
          <span>Balanced</span>
          <span>High</span>
        </div>
      </div>

      {/* Current selection card */}
      <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-foreground">{currentOption.label} efficiency</h3>
            <p className="text-xs text-muted-foreground">{currentOption.radNote}</p>
          </div>
          <Thermometer className="w-5 h-5 text-primary" />
        </div>
        
        {/* Impact indicators */}
        <div className="flex gap-3">
          {installDiff !== 0 && (
            <div className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
              installDiff > 0 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
            )}>
              {installDiff > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {installDiff > 0 ? '+' : ''}£{Math.abs(installDiff).toLocaleString()} install
            </div>
          )}
          {savingsDiff !== 0 && (
            <div className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
              savingsDiff > 0 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
            )}>
              {savingsDiff > 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
              {savingsDiff > 0 ? '+' : ''}£{Math.abs(savingsDiff).toLocaleString()}/yr savings
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      <Button 
        onClick={onContinue}
        size="lg"
        className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold rounded-xl active:scale-[0.98] transition-transform"
      >
        Continue
      </Button>
    </section>
  );
}
