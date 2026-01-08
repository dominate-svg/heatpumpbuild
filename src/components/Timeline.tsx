import { Calendar, ClipboardCheck, Home, FileSignature, Wrench, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TIMELINE_STEPS = [
  { icon: Calendar, label: 'Pay deposit', description: 'Secure booking' },
  { icon: ClipboardCheck, label: 'Book survey', description: 'Schedule visit' },
  { icon: Home, label: 'Home survey', description: 'Assessment' },
  { icon: FileSignature, label: 'Sign proposal', description: 'Final quote' },
  { icon: Wrench, label: 'Installation', description: '~1 month' },
];

export function Timeline() {
  return (
    <Card className="border shadow-sm bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">What happens next</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start justify-between overflow-x-auto pb-2">
          {TIMELINE_STEPS.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center min-w-[80px] relative">
              {/* Connector line */}
              {index < TIMELINE_STEPS.length - 1 && (
                <div className="absolute top-5 left-[60%] w-[80%] h-0.5 bg-border" />
              )}
              
              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center mb-2 relative z-10">
                <step.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-xs font-semibold text-foreground">{step.label}</p>
              <p className="text-xs text-muted-foreground hidden sm:block">{step.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
