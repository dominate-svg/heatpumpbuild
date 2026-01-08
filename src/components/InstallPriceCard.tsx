import { useState } from 'react';
import { Check, ChevronDown, ChevronUp, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { formatCurrency } from '@/lib/calculations';
import type { EstimateResults } from '@/lib/calculations';

interface InstallPriceCardProps {
  results: EstimateResults;
}

const INCLUDED_ITEMS = [
  'Cosy heat pump sized for your home',
  'Standard installation',
  'Re-use existing cylinder (if compatible)',
  'Allowance for 2 radiator upgrades',
];

export function InstallPriceCard({ results }: InstallPriceCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="border-2 border-primary bg-gradient-to-br from-card to-primary/10">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-foreground">Estimated Install Price</CardTitle>
          <Badge variant="secondary" className="bg-success/20 text-success border-success/30">
            0% VAT
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-bold text-foreground">
            {formatCurrency(results.netInstallPrice)}
          </span>
        </div>

        {results.grantApplied > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <Award className="w-4 h-4 text-primary" />
            <span className="text-foreground">
              Includes {formatCurrency(results.grantApplied)} BUS grant
              {!results.grantEligible && ' (if eligible)'}
            </span>
            {!results.grantEligible && (
              <span className="text-muted-foreground">— confirmed at survey</span>
            )}
          </div>
        )}

        <div className="space-y-2 pt-2">
          <p className="text-sm font-medium text-muted-foreground">What's included:</p>
          <ul className="space-y-2">
            {INCLUDED_ITEMS.map((item, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-foreground">
                <Check className="w-4 h-4 text-success flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between text-muted-foreground">
              What affects this price?
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <div className="bg-secondary/50 rounded-lg p-4 text-sm space-y-2">
              <div className="flex justify-between text-foreground">
                <span>Base installation ({results.heatLossKw}kW system)</span>
                <span>{formatCurrency(results.installBase)}</span>
              </div>
              {results.adders.location > 0 && (
                <div className="flex justify-between text-foreground">
                  <span>Heat pump location adder</span>
                  <span>+{formatCurrency(results.adders.location)}</span>
                </div>
              )}
              {results.adders.cylinder > 0 && (
                <div className="flex justify-between text-foreground">
                  <span>Hot water cylinder</span>
                  <span>+{formatCurrency(results.adders.cylinder)}</span>
                </div>
              )}
              <div className="border-t border-border pt-2 flex justify-between text-foreground">
                <span>Gross price</span>
                <span>{formatCurrency(results.grossInstallPrice)}</span>
              </div>
              {results.grantApplied > 0 && (
                <div className="flex justify-between text-success">
                  <span>BUS Grant</span>
                  <span>-{formatCurrency(results.grantApplied)}</span>
                </div>
              )}
              <div className="border-t border-border pt-2 flex justify-between font-semibold text-foreground">
                <span>Your price</span>
                <span>{formatCurrency(results.netInstallPrice)}</span>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
