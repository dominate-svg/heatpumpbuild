import { useState } from 'react';
import { Check, ChevronDown, ChevronUp, Award, Sparkles, ExternalLink, ThermometerSun, Droplets, Heater, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { formatCurrency } from '@/lib/calculations';
import type { EstimateResults, Assumptions } from '@/lib/calculations';
import { CosyBadge } from './CosyBadge';
import { HeatPumpVisual } from './HeatPumpVisual';

interface CostCardProps {
  results: EstimateResults;
  assumptions: Assumptions;
  scop: number;
  cylinderOption: 'existing' | '150l' | '210l';
}

export function CostCard({ results, assumptions, scop, cylinderOption }: CostCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const efficiencyPercent = Math.round(scop * 100);
  const cylinderText = cylinderOption === 'existing' ? 'Re-use existing cylinder' : `New ${cylinderOption.toUpperCase()} cylinder`;
  
  const features = [
    { icon: Award, text: `${formatCurrency(assumptions.bus_grant_value)} BUS Grant included`, highlight: true },
    { icon: ThermometerSun, text: `${efficiencyPercent}% guaranteed efficiency` },
    { icon: Sparkles, text: 'Cosy heat pump sized for you' },
    { icon: Droplets, text: cylinderText },
    { icon: Heater, text: `${results.radiatorsUpgraded} radiators upgraded` },
    { icon: ShieldCheck, text: 'MCS certified installation' },
  ];

  return (
    <Card className="border-2 border-primary/20 shadow-card overflow-hidden animate-slide-up bg-gradient-to-br from-card to-primary-light/30" style={{ animationDelay: '0.1s' }}>
      {/* Header with price */}
      <div className="p-4 md:p-6 border-b border-border/50">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-foreground mb-1">Estimated install</h3>
            <p className="text-sm text-muted-foreground">Your complete heat pump package</p>
          </div>
          <div className="text-right">
            <div className="text-3xl md:text-4xl font-bold text-foreground animate-count-up">
              {formatCurrency(results.customerContribution)}
            </div>
            <span className="text-xs text-success font-medium">0% VAT</span>
          </div>
        </div>
      </div>

      <CardContent className="p-4 md:p-6">
        {/* Heat pump visual - compact */}
        <div className="mb-4 hidden md:block">
          <HeatPumpVisual className="max-w-[120px] mx-auto" />
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          {features.map((item, index) => (
            <div 
              key={index} 
              className={`flex items-center gap-2 p-2 rounded-lg transition-all ${
                item.highlight ? 'bg-success/10' : 'bg-muted/50'
              }`}
              style={{ animationDelay: `${0.1 * index}s` }}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                item.highlight ? 'bg-success/20' : 'bg-primary/10'
              }`}>
                <item.icon className={`w-3 h-3 ${item.highlight ? 'text-success' : 'text-primary'}`} />
              </div>
              <span className={`text-xs ${item.highlight ? 'text-success font-medium' : 'text-muted-foreground'}`}>
                {item.text}
              </span>
            </div>
          ))}
        </div>

        {/* Cosy badge */}
        <div className="flex justify-center mb-4">
          <CosyBadge size="sm" />
        </div>

        {/* Expandable breakdown */}
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between text-primary hover:text-primary hover:bg-primary/5">
              <span className="text-xs">Price breakdown</span>
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3">
            <div className="bg-muted/50 rounded-xl p-3 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base contribution</span>
                <span className="font-medium">{formatCurrency(assumptions.base_customer_contribution)}</span>
              </div>
              {results.adders.location > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location</span>
                  <span>+{formatCurrency(results.adders.location)}</span>
                </div>
              )}
              {results.adders.cylinder > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cylinder</span>
                  <span>+{formatCurrency(results.adders.cylinder)}</span>
                </div>
              )}
              {results.radiatorAdder > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Radiators ({results.radiatorsUpgraded})</span>
                  <span>+{formatCurrency(results.radiatorAdder)}</span>
                </div>
              )}
              <div className="border-t border-border pt-2 flex justify-between font-medium">
                <span>Total</span>
                <span>{formatCurrency(results.customerContribution)}</span>
              </div>
              <div className="flex justify-between text-success">
                <span>Grant (if eligible)</span>
                <span>{formatCurrency(assumptions.bus_grant_value)}</span>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
