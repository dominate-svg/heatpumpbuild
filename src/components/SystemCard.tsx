import { Volume2, Calendar, ThermometerSun, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { EstimateResults } from '@/lib/calculations';

interface SystemCardProps {
  results: EstimateResults;
}

const FEATURES = [
  { icon: Volume2, text: 'Quiet outdoor unit' },
  { icon: Calendar, text: 'Smart scheduling with Cosy tariff' },
  { icon: ThermometerSun, text: 'Works with existing radiators in most homes' },
];

export function SystemCard({ results }: SystemCardProps) {
  return (
    <Card className="border border-border shadow-soft bg-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-success" />
          </div>
          Your recommended Cosy system
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Sized for your home's heating needs
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-6">
          {/* System illustration */}
          <div className="flex-shrink-0 w-full md:w-40 h-32 bg-gradient-to-br from-accent/10 to-success/10 rounded-xl flex items-center justify-center border border-accent/20">
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">{results.heatLossKw}kW</div>
              <div className="text-sm text-muted-foreground">Heat pump</div>
            </div>
          </div>
          
          {/* Features list */}
          <div className="flex-1 space-y-3">
            {FEATURES.map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-4 h-4 text-success" />
                </div>
                <span className="text-foreground">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
