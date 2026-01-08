import { Home, Thermometer, Flame } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { EPCData, EstimateResults } from '@/lib/calculations';

interface PropertyCardProps {
  epcData: EPCData;
  results: EstimateResults;
}

export function PropertyCard({ epcData, results }: PropertyCardProps) {
  return (
    <Card className="border border-border shadow-soft bg-card animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Home className="w-5 h-5 text-primary" />
          </div>
          Your home
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-muted/50 rounded-xl text-center">
            <p className="text-sm text-muted-foreground mb-1">Address</p>
            <p className="font-semibold text-foreground text-sm leading-tight">
              {epcData.address?.split(',')[0] || 'Your property'}
            </p>
          </div>
          <div className="p-4 bg-muted/50 rounded-xl text-center">
            <p className="text-sm text-muted-foreground mb-1">Home type</p>
            <p className="font-semibold text-foreground capitalize">
              {epcData.propertyType?.toLowerCase() || 'House'}
            </p>
          </div>
          <div className="p-4 bg-muted/50 rounded-xl text-center">
            <p className="text-sm text-muted-foreground mb-1">Floor area</p>
            <p className="font-semibold text-foreground">
              {results.floorArea}m²
            </p>
          </div>
          <div className="p-4 bg-accent/5 rounded-xl text-center border border-accent/20">
            <p className="text-sm text-muted-foreground mb-1">Heat requirement</p>
            <p className="font-semibold text-accent">
              {results.heatLossKw}kW
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
