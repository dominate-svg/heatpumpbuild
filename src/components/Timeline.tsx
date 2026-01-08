import { Calendar, ClipboardCheck, PenLine, Wrench, Smile } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TIMELINE_STEPS = [
  { icon: Calendar, label: 'Book survey' },
  { icon: ClipboardCheck, label: 'Home visit' },
  { icon: PenLine, label: 'Final design' },
  { icon: Wrench, label: 'Install' },
  { icon: Smile, label: 'Enjoy!' },
];

export function Timeline() {
  return (
    <Card className="border border-border shadow-soft bg-card animate-fade-in" style={{ animationDelay: '0.5s' }}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">What happens next</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start justify-between overflow-x-auto pb-2">
          {TIMELINE_STEPS.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center min-w-[70px] relative">
              {/* Connector line */}
              {index < TIMELINE_STEPS.length - 1 && (
                <div className="absolute top-5 left-[60%] w-[80%] h-0.5 bg-border" />
              )}
              
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2 relative z-10">
                <step.icon className="w-5 h-5 text-primary" />
              </div>
              <p className="text-xs font-medium text-foreground">{step.label}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground mt-4">
          Most installs completed within 4–6 weeks
        </p>
      </CardContent>
    </Card>
  );
}
