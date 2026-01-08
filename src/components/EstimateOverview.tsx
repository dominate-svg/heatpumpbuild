import { Home, Flame, Fuel, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { EPCData } from '@/lib/calculations';
import type { EstimateResults } from '@/lib/calculations';

interface EstimateOverviewProps {
  epcData: EPCData;
  results: EstimateResults;
}

export function EstimateOverview({ epcData, results }: EstimateOverviewProps) {
  return (
    <div className="space-y-4">
      <Card className="border shadow-sm bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Home className="w-4 h-4 text-white" />
            </div>
            Property Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-xl">
              <p className="text-sm text-muted-foreground mb-1">Floor area</p>
              <p className="text-2xl font-bold text-foreground">{results.floorArea}</p>
              <p className="text-xs text-muted-foreground">m²</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-xl">
              <p className="text-sm text-muted-foreground mb-1">Heat loss</p>
              <p className="text-2xl font-bold text-foreground">{results.heatLossKw}</p>
              <p className="text-xs text-muted-foreground">kW</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-xl">
              <p className="text-sm text-muted-foreground mb-1">Current fuel</p>
              <p className="text-2xl font-bold text-foreground capitalize">
                {(epcData.mainFuel || 'Gas').split(' ')[0]}
              </p>
              <p className="text-xs text-muted-foreground">heating</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-accent/30 bg-accent/5">
        <CardContent className="p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-4 h-4 text-accent" />
          </div>
          <div>
            <p className="font-medium text-foreground">Estimated plan</p>
            <p className="text-sm text-muted-foreground">
              Figures may change after a home survey to verify property details.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
