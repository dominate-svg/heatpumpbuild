import { Card, CardContent } from '@/components/ui/card';
import { Clock, Zap, Leaf, Sun } from 'lucide-react';

export function WhyCosySection() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-foreground">Why Cosy works differently</h2>
      <p className="text-sm text-muted-foreground">
        Heat pumps paired with the Cosy tariff unlock smarter, cheaper heating.
      </p>

      <Card className="border border-border overflow-hidden">
        <CardContent className="p-0">
          {/* Cheap hours visual */}
          <div className="p-5 border-b border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-octopus/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-octopus" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">8 hours of cheaper electricity every day</h3>
                <p className="text-xs text-muted-foreground">Your heat pump runs mostly during these windows</p>
              </div>
            </div>

            {/* Time windows */}
            <div className="flex flex-wrap gap-2">
              {['4–7am', '1–4pm', '10pm–12am'].map((time) => (
                <span 
                  key={time} 
                  className="px-4 py-2 rounded-full border-2 border-octopus text-octopus text-sm font-semibold bg-octopus/5"
                >
                  {time}
                </span>
              ))}
            </div>
          </div>

          {/* How it works */}
          <div className="p-5 bg-muted/30">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-octopus/10 flex items-center justify-center flex-shrink-0">
                  <Sun className="w-3.5 h-3.5 text-octopus" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Load-shifts heat</p>
                  <p className="text-xs text-muted-foreground">Warms your home during cheap hours</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Releases steadily</p>
                  <p className="text-xs text-muted-foreground">Even during expensive 4–7pm peak</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                  <Leaf className="w-3.5 h-3.5 text-success" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Works automatically</p>
                  <p className="text-xs text-muted-foreground">No management needed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Visual placeholder */}
          <div className="p-5 bg-muted/50 border-t border-border">
            <div className="aspect-[16/9] sm:aspect-[21/9] rounded-lg bg-muted flex items-center justify-center border border-border">
              <div className="text-center">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Illustration</p>
                <p className="text-[10px] text-muted-foreground">Smart heating schedule visual</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
