import { Minus, Plus, Heater } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <Card className="border border-border shadow-soft bg-card animate-fade-in" style={{ animationDelay: '0.45s' }}>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2 text-foreground font-medium">
          <Heater className="w-4 h-4 text-primary" />
          <CardTitle className="text-lg">Radiators to upgrade</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Includes {includedRadiators} in the base estimate. Adjust if you think you need more or fewer.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stepper control */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleDecrement}
            disabled={selectedRadiators <= 0}
            className="h-12 w-12 rounded-full border-2 hover:border-primary hover:bg-primary/5"
          >
            <Minus className="w-5 h-5" />
          </Button>
          
          <div className="text-center min-w-[80px]">
            <span className="text-4xl font-bold text-foreground">{selectedRadiators}</span>
            <p className="text-sm text-muted-foreground">radiators</p>
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
        <div className="text-center text-sm">
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
          <div className={`text-center py-2 px-4 rounded-lg ${delta > 0 ? 'bg-primary/10 text-primary' : 'bg-success/10 text-success'}`}>
            <span className="font-medium">
              {delta > 0 ? '+' : '−'}{formatCurrency(Math.abs(delta * costPerRadiator))} adjustment
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
