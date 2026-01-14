import { Card, CardContent } from '@/components/ui/card';
import { ShieldCheck, Award, Star } from 'lucide-react';
import octopusPartner from '@/assets/octopus-partner.png';

export function TrustSection() {
  const trustPoints = [
    { icon: ShieldCheck, text: 'MCS Certified Installation' },
    { icon: Award, text: 'TrustMark Registered' },
    { icon: Star, text: 'RECC Member' },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-foreground">Trusted & accredited</h2>

      <Card className="border border-border">
        <CardContent className="p-5">
          {/* Logo row */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-5 pb-5 border-b border-border">
            <img 
              src={octopusPartner} 
              alt="Octopus Energy Partner" 
              className="h-10 md:h-12 w-auto"
            />
            <div className="flex items-center gap-2">
              <span className="text-green-500 text-xl">★★★★★</span>
              <div>
                <span className="text-sm font-semibold text-foreground">5.0</span>
                <span className="text-xs text-muted-foreground ml-1">Trustpilot</span>
              </div>
            </div>
          </div>

          {/* Trust points */}
          <div className="grid gap-3 sm:grid-cols-3">
            {trustPoints.map((point, index) => (
              <div 
                key={index}
                className="flex items-center gap-2 p-3 rounded-lg bg-muted/50"
              >
                <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                  <point.icon className="w-4 h-4 text-success" />
                </div>
                <span className="text-sm font-medium text-foreground">{point.text}</span>
              </div>
            ))}
          </div>

          {/* Additional info */}
          <p className="text-xs text-muted-foreground text-center mt-4">
            One of only three companies accredited to install Octopus Cosy heat pumps.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
