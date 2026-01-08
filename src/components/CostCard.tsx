import { useState } from 'react';
import { Check, ChevronDown, ChevronUp, Award, Sparkles, ExternalLink, ThermometerSun, Droplets, Heater, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { formatCurrency } from '@/lib/calculations';
import type { EstimateResults, Assumptions } from '@/lib/calculations';

interface CostCardProps {
  results: EstimateResults;
  assumptions: Assumptions;
  scop: number;
  cylinderOption: 'existing' | '150l' | '210l';
}

export function CostCard({ results, assumptions, scop, cylinderOption }: CostCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const efficiencyPercent = Math.round(scop * 100);
  const cylinderText = cylinderOption === 'existing' ? 'Re-use existing cylinder' : `New ${cylinderOption.toUpperCase()} cylinder selected`;
  
  const leftBullets = [
    { icon: Award, text: `Includes ${formatCurrency(assumptions.bus_grant_value)} BUS Grant`, link: true },
    { icon: ThermometerSun, text: `${efficiencyPercent}% guaranteed efficiency` },
    { icon: ShieldCheck, text: 'Octopus-accredited Cosy installer' },
  ];

  const rightBullets = [
    { icon: Sparkles, text: 'Cosy heat pump sized for your home' },
    { icon: Droplets, text: cylinderText },
    { icon: Heater, text: `${results.selectedRadiators} radiators upgraded` },
  ];

  return (
    <Card className="border border-border shadow-card overflow-hidden animate-fade-in" style={{ animationDelay: '0.1s' }}>
      {/* Header with title and price */}
      <div className="p-6 border-b border-border">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          {/* Left: Title & subtitle */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Estimated install</h3>
            <p className="text-sm text-muted-foreground">Our estimated plan and price</p>
          </div>
          
          {/* Right: Big price & badge */}
          <div className="flex flex-col items-start md:items-end gap-1">
            <span className="text-4xl md:text-5xl font-bold text-foreground animate-count-up">
              {formatCurrency(results.customerContribution)}
            </span>
            <span className="text-sm text-muted-foreground">0% VAT</span>
          </div>
        </div>
      </div>

      <CardContent className="p-6 bg-card">
        {/* Two-column bullet list */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* Left column */}
          <ul className="space-y-3">
            {leftBullets.map((item, index) => (
              <li key={index} className="flex items-start gap-3 text-sm">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <item.icon className="w-3 h-3 text-primary" />
                </div>
                {item.link ? (
                  <span className="text-muted-foreground">
                    Includes {formatCurrency(assumptions.bus_grant_value)}{' '}
                    <a 
                      href="https://www.gov.uk/apply-boiler-upgrade-scheme" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      BUS Grant
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </span>
                ) : (
                  <span className="text-muted-foreground">{item.text}</span>
                )}
              </li>
            ))}
          </ul>
          
          {/* Right column */}
          <ul className="space-y-3">
            {rightBullets.map((item, index) => (
              <li key={index} className="flex items-start gap-3 text-sm">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <item.icon className="w-3 h-3 text-primary" />
                </div>
                <span className="text-muted-foreground">{item.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Expandable breakdown */}
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between text-primary hover:text-primary hover:bg-primary/5 -mx-2 px-2">
              How we estimated this
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4">
            <div className="bg-muted rounded-xl p-4 text-sm space-y-2">
              <div className="flex justify-between text-foreground">
                <span>Base contribution</span>
                <span className="font-medium">{formatCurrency(assumptions.base_customer_contribution)}</span>
              </div>
              {results.adders.location > 0 && (
                <div className="flex justify-between text-foreground">
                  <span>Heat pump location</span>
                  <span>+{formatCurrency(results.adders.location)}</span>
                </div>
              )}
              {results.adders.cylinder > 0 && (
                <div className="flex justify-between text-foreground">
                  <span>Hot water cylinder</span>
                  <span>+{formatCurrency(results.adders.cylinder)}</span>
                </div>
              )}
              <div className="flex justify-between text-foreground">
                <span>Radiator adjustments ({results.selectedRadiators} selected)</span>
                <span className={results.radiatorDelta >= 0 ? '' : 'text-success'}>
                  {results.radiatorDelta >= 0 ? '+' : '−'}{formatCurrency(Math.abs(results.radiatorDelta))}
                </span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-medium text-foreground">
                <span>Your contribution</span>
                <span>{formatCurrency(results.customerContribution)}</span>
              </div>
              <div className="flex justify-between text-success">
                <span>Estimated grant (if eligible)</span>
                <span>{formatCurrency(assumptions.bus_grant_value)}</span>
              </div>
              
              <div className="border-t border-border pt-3 mt-3">
                <p className="text-xs text-muted-foreground">
                  Digital estimate only. Final design, radiator requirements and grant eligibility confirmed after survey.
                </p>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
