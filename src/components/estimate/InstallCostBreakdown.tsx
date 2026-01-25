import { useState } from 'react';
import { ChevronDown, ChevronUp, Info, AlertCircle, CheckCircle, HelpCircle, Wrench, Home, Droplets, Heater, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { 
  InstallCostResult, 
  CostRange, 
  CylinderOverride, 
  RadiatorOverride,
  ConfidenceLevel 
} from '@/lib/estimateInstallCost';
import { formatCostRange, formatTypicalCost } from '@/lib/estimateInstallCost';

interface InstallCostBreakdownProps {
  result: InstallCostResult;
  onCylinderChange: (value: CylinderOverride) => void;
  onRadiatorChange: (value: RadiatorOverride) => void;
  cylinderValue: CylinderOverride;
  radiatorValue: RadiatorOverride;
  className?: string;
}

const CONFIDENCE_CONFIG: Record<ConfidenceLevel, { label: string; color: string; icon: React.ElementType }> = {
  high: { label: 'High confidence', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
  medium: { label: 'Medium confidence', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: AlertCircle },
  low: { label: 'Low confidence', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: HelpCircle },
};

const BREAKDOWN_ICONS: Record<string, React.ElementType> = {
  base: Home,
  builtForm: Home,
  cylinder: Droplets,
  cylinderUpsizing: Droplets,
  radiators: Heater,
  complexity: Settings,
};

function BreakdownLine({ 
  label, 
  range, 
  description,
  iconKey,
}: { 
  label: string; 
  range: CostRange; 
  description?: string;
  iconKey: string;
}) {
  const Icon = BREAKDOWN_ICONS[iconKey] || Wrench;
  const isZero = range.low === 0 && range.mid === 0 && range.high === 0;
  const isNegative = range.mid < 0;
  
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-border/30 last:border-0">
      <div className="flex items-start gap-2.5 flex-1 min-w-0">
        <div className="w-7 h-7 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Icon className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">{label}</p>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
      </div>
      <div className="text-right flex-shrink-0 ml-3">
        <p className={cn(
          "text-sm font-medium",
          isNegative ? "text-green-600" : isZero ? "text-muted-foreground" : "text-foreground"
        )}>
          {isNegative ? '-' : isZero ? '' : '+'}
          {isZero ? 'Included' : `£${Math.abs(range.mid).toLocaleString()}`}
        </p>
        {!isZero && range.low !== range.high && (
          <p className="text-xs text-muted-foreground">
            £{Math.abs(range.low).toLocaleString()}–£{Math.abs(range.high).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}

export function InstallCostBreakdown({
  result,
  onCylinderChange,
  onRadiatorChange,
  cylinderValue,
  radiatorValue,
  className,
}: InstallCostBreakdownProps) {
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const [isRefineOpen, setIsRefineOpen] = useState(false);
  
  const confidenceConfig = CONFIDENCE_CONFIG[result.confidence];
  const ConfidenceIcon = confidenceConfig.icon;
  
  const busGrant = 7500;
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Main cost card */}
      <Card className="border-2 border-primary/20 shadow-lg overflow-hidden">
        <CardHeader className="pb-3 pt-5 px-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Estimated customer contribution</p>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-3xl sm:text-4xl font-bold text-foreground">
                  {formatCostRange(result.contribution)}
                </span>
                {result.contribution.low !== result.contribution.high && (
                  <span className="text-sm text-muted-foreground">
                    (typical {formatTypicalCost(result.contribution)})
                  </span>
                )}
              </div>
            </div>
            <Badge 
              variant="outline" 
              className={cn("flex items-center gap-1.5 px-2.5 py-1", confidenceConfig.color)}
            >
              <ConfidenceIcon className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">{confidenceConfig.label}</span>
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="px-5 pb-5 pt-0">
          {/* Before grant line */}
          <div className="bg-muted/30 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total install (before grant)</span>
              <span className="font-medium">{formatCostRange(result.totalBeforeGrant)}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-green-600">BUS Grant</span>
              <span className="font-medium text-green-600">−£{busGrant.toLocaleString()}</span>
            </div>
          </div>
          
          {/* Breakdown collapsible */}
          <Collapsible open={isBreakdownOpen} onOpenChange={setIsBreakdownOpen}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-between text-muted-foreground hover:text-foreground h-9"
              >
                <span className="text-sm">How we calculated this</span>
                {isBreakdownOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3">
              <div className="bg-muted/20 rounded-xl p-4">
                <BreakdownLine 
                  label={result.breakdown.base.label}
                  range={result.breakdown.base.range}
                  description={result.breakdown.base.description}
                  iconKey="base"
                />
                <BreakdownLine 
                  label={result.breakdown.builtForm.label}
                  range={result.breakdown.builtForm.range}
                  description={result.breakdown.builtForm.description}
                  iconKey="builtForm"
                />
                <BreakdownLine 
                  label={result.breakdown.cylinder.label}
                  range={result.breakdown.cylinder.range}
                  description={result.breakdown.cylinder.description}
                  iconKey="cylinder"
                />
                {result.breakdown.cylinderUpsizing && (
                  <BreakdownLine 
                    label={result.breakdown.cylinderUpsizing.label}
                    range={result.breakdown.cylinderUpsizing.range}
                    description={result.breakdown.cylinderUpsizing.description}
                    iconKey="cylinderUpsizing"
                  />
                )}
                <BreakdownLine 
                  label={result.breakdown.radiators.label}
                  range={result.breakdown.radiators.range}
                  description={result.breakdown.radiators.description}
                  iconKey="radiators"
                />
                <BreakdownLine 
                  label={result.breakdown.complexity.label}
                  range={result.breakdown.complexity.range}
                  description={result.breakdown.complexity.description}
                  iconKey="complexity"
                />
                
                {/* Total line */}
                <div className="flex items-center justify-between pt-3 mt-2 border-t border-border">
                  <span className="font-semibold text-foreground">Subtotal</span>
                  <span className="font-semibold text-foreground">{formatTypicalCost(result.totalBeforeGrant)}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-green-600 font-medium">BUS Grant</span>
                  <span className="text-green-600 font-medium">−£{busGrant.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between pt-2 mt-2 border-t border-border">
                  <span className="font-bold text-foreground">You pay</span>
                  <span className="font-bold text-foreground text-lg">{formatTypicalCost(result.contribution)}</span>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
      
      {/* Assumptions card */}
      {result.assumptions.length > 0 && (
        <Card className="border border-border/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-2.5 mb-3">
              <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-sm font-medium text-foreground">Assumptions based on your EPC</p>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {result.assumptions.map((assumption, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>{assumption}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      
      {/* Refinement options */}
      <Collapsible open={isRefineOpen} onOpenChange={setIsRefineOpen}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-between h-11"
          >
            <span className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span>Refine your estimate</span>
            </span>
            {isRefineOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4">
          <Card className="border border-border/50">
            <CardContent className="p-4 space-y-5">
              {/* Cylinder question */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Droplets className="w-4 h-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">Do you have a hot water cylinder?</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-muted-foreground/60 hover:text-muted-foreground">
                          <Info className="w-3.5 h-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs">If you have a combi boiler, you likely don't have a cylinder and will need a new one for a heat pump.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <RadioGroup 
                  value={cylinderValue} 
                  onValueChange={(v) => onCylinderChange(v as CylinderOverride)}
                  className="flex flex-wrap gap-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="cylinder-yes" />
                    <Label htmlFor="cylinder-yes" className="text-sm cursor-pointer">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="cylinder-no" />
                    <Label htmlFor="cylinder-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="unknown" id="cylinder-unknown" />
                    <Label htmlFor="cylinder-unknown" className="text-sm cursor-pointer">Not sure</Label>
                  </div>
                </RadioGroup>
              </div>
              
              {/* Radiator question */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Heater className="w-4 h-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">Will radiators need upgrading?</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-muted-foreground/60 hover:text-muted-foreground">
                          <Info className="w-3.5 h-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs">Older or undersized radiators may need upgrading to work efficiently with a heat pump's lower flow temperatures.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <RadioGroup 
                  value={radiatorValue} 
                  onValueChange={(v) => onRadiatorChange(v as RadiatorOverride)}
                  className="flex flex-wrap gap-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="none" id="rad-none" />
                    <Label htmlFor="rad-none" className="text-sm cursor-pointer">None</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="some" id="rad-some" />
                    <Label htmlFor="rad-some" className="text-sm cursor-pointer">Some</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="many" id="rad-many" />
                    <Label htmlFor="rad-many" className="text-sm cursor-pointer">Many</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="unknown" id="rad-unknown" />
                    <Label htmlFor="rad-unknown" className="text-sm cursor-pointer">Not sure</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
