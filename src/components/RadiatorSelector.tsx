import { Minus, Plus, Heater, HelpCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/calculations';
import type { Assumptions } from '@/lib/calculations';

interface RadiatorSelectorProps {
  selectedRadiators: number;
  onRadiatorChange: (value: number) => void;
  assumptions: Assumptions;
}

export function RadiatorSelector({
  selectedRadiators,
  onRadiatorChange,
  assumptions,
}: RadiatorSelectorProps) {
  const includedRadiators = assumptions.included_radiators;
  const costPerRadiator = assumptions.rad_upgrade_cost;
  const delta = selectedRadiators - includedRadiators;

  const handleDecrement = () => {
    if (selectedRadiators > 0) {
      onRadiatorChange(selectedRadiators - 1);
    }
  };

  const handleIncrement = () => {
    if (selectedRadiators < 12) {
      onRadiatorChange(selectedRadiators + 1);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.25s' }}>
      <div>
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Heater className="w-5 h-5 text-primary" />
          Radiators to upgrade
        </h2>
        <p className="text-sm text-muted-foreground">
          Includes {includedRadiators} in the base estimate. Adjust if you think you need more or fewer.
        </p>
      </div>

      <Card className="border border-border shadow-card">
        <CardContent className="p-6">
          {/* Stepper control */}
          <div className="flex items-center justify-center gap-6">
            <Button
              variant="outline"
              size="icon"
              onClick={handleDecrement}
              disabled={selectedRadiators <= 0}
              className="h-12 w-12 rounded-full border-2 hover:border-primary hover:bg-primary/5"
            >
              <Minus className="w-5 h-5" />
            </Button>
            
            <div className="text-center min-w-[100px]">
              <span className="text-5xl font-bold text-foreground">{selectedRadiators}</span>
              <p className="text-sm text-muted-foreground mt-1">radiators</p>
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={handleIncrement}
              disabled={selectedRadiators >= 12}
              className="h-12 w-12 rounded-full border-2 hover:border-primary hover:bg-primary/5"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>

          {/* Delta indicator */}
          <div className="text-center mt-4 text-sm">
            {delta > 0 && (
              <span className="text-muted-foreground">
                +{formatCurrency(costPerRadiator)} per radiator above {includedRadiators}
              </span>
            )}
            {delta < 0 && (
              <span className="text-success">
                −{formatCurrency(costPerRadiator)} per radiator below {includedRadiators} (down to minimum price)
              </span>
            )}
            {delta === 0 && (
              <span className="text-muted-foreground">
                {includedRadiators} radiators included in base price
              </span>
            )}
          </div>

          {/* Current adjustment display */}
          {delta !== 0 && (
            <div className={`text-center py-2 px-4 rounded-lg mt-4 ${
              delta > 0 ? 'bg-primary/10 text-primary' : 'bg-success/10 text-success'
            }`}>
              <span className="font-medium">
                {delta > 0 ? '+' : '−'}{formatCurrency(Math.abs(delta * costPerRadiator))} adjustment
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Explainer */}
      <div className="flex items-start gap-3 p-4 bg-muted rounded-xl">
        <HelpCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-foreground mb-1">Do I need to upgrade radiators?</p>
          <p className="text-sm text-muted-foreground">
            Heat pumps run at lower temperatures than boilers, so some radiators may need upsizing to maintain comfort. 
            Our surveyor will confirm the exact requirements during your home visit.
          </p>
        </div>
      </div>
    </div>
  );
}
