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
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Home className="w-5 h-5 text-primary" />
            Property Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Address</p>
            <p className="font-medium text-foreground">{epcData.address}</p>
            <p className="text-sm text-muted-foreground">{epcData.postcode}</p>
          </div>
          
          <div className="grid grid-cols-3 gap-4 pt-3 border-t border-border">
            <div>
              <p className="text-sm text-muted-foreground">Floor area</p>
              <p className="text-xl font-semibold text-foreground">{results.floorArea}m²</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Heat loss</p>
              <p className="text-xl font-semibold text-foreground">{results.heatLossKw}kW</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Fuel className="w-4 h-4" />
                Current fuel
              </p>
              <p className="text-xl font-semibold text-foreground capitalize">
                {epcData.mainFuel || 'Gas'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-sm text-foreground">
            <span className="font-medium">Estimated plan</span> — Figures may change after a home survey to verify property details.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
