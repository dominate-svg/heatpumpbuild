import { useState } from 'react';
import { Check, ChevronDown, ChevronUp, Award, Sparkles } from 'lucide-react';
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

interface CostCardProps {
  results: EstimateResults;
}

const INCLUDED_ITEMS = [
  'Survey & design',
  'Supply & install',
  'Radiator allowance',
  'System commissioning',
];

export function CostCard({ results }: CostCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="border-0 shadow-warm overflow-hidden animate-fade-in" style={{ animationDelay: '0.2s' }}>
      {/* Warm gradient header */}
      <div className="gradient-warm p-6 border-b border-primary/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">Estimated installation cost</span>
          </div>
          <Badge className="bg-success/10 text-success border-success/30 hover:bg-success/20">
            0% VAT
          </Badge>
        </div>
        
        <div className="flex items-baseline gap-2">
          <span className="text-5xl md:text-6xl font-bold text-foreground animate-count-up">
            {formatCurrency(results.netInstallPrice)}
          </span>
        </div>

        {results.grantApplied > 0 && (
          <div className="flex items-center gap-2 mt-4 text-muted-foreground">
            <Award className="w-5 h-5 text-success" />
            <span className="text-sm">
              after {formatCurrency(results.grantApplied)} grant · 0% VAT
              {!results.grantEligible && ' (eligibility confirmed at survey)'}
            </span>
          </div>
        )}
      </div>

      <CardContent className="p-6 bg-card">
        <div className="space-y-3 mb-4">
          <p className="text-sm font-medium text-muted-foreground">
            What's included
          </p>
          <ul className="grid grid-cols-2 gap-3">
            {INCLUDED_ITEMS.map((item, index) => (
              <li key={index} className="flex items-center gap-2 text-foreground text-sm">
                <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-success" />
                </div>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between text-primary hover:text-primary hover:bg-primary/5">
              What could change this price?
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4">
            <div className="bg-muted/50 rounded-xl p-4 text-sm space-y-2">
              <div className="flex justify-between text-foreground">
                <span>Base installation ({results.heatLossKw}kW system)</span>
                <span className="font-medium">{formatCurrency(results.installBase)}</span>
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
              <div className="border-t border-border pt-2 flex justify-between text-foreground">
                <span>Gross price</span>
                <span className="font-medium">{formatCurrency(results.grossInstallPrice)}</span>
              </div>
              {results.grantApplied > 0 && (
                <div className="flex justify-between text-success font-medium">
                  <span>BUS Grant</span>
                  <span>-{formatCurrency(results.grantApplied)}</span>
                </div>
              )}
              <div className="border-t border-border pt-2 flex justify-between font-bold text-foreground">
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
