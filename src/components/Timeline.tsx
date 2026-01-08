import { useState } from 'react';
import { Calendar, ClipboardCheck, Home, FileSignature, Wrench } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TIMELINE_STEPS = [
  { icon: Calendar, label: 'Pay deposit', description: 'Secure your booking' },
  { icon: ClipboardCheck, label: 'Book survey', description: 'Schedule home visit' },
  { icon: Home, label: 'Home survey', description: 'Detailed assessment' },
  { icon: FileSignature, label: 'Sign proposal', description: 'Confirm final quote' },
  { icon: Wrench, label: 'Installation', description: '~1 month after deposit' },
];

export function Timeline() {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-foreground">What happens next</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-start">
          {TIMELINE_STEPS.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center flex-1">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                <step.icon className="w-5 h-5 text-primary" />
              </div>
              <p className="text-xs font-medium text-foreground">{step.label}</p>
              <p className="text-xs text-muted-foreground hidden sm:block">{step.description}</p>
              {index < TIMELINE_STEPS.length - 1 && (
                <div className="absolute h-0.5 bg-border w-full top-5 left-1/2 -z-10" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
