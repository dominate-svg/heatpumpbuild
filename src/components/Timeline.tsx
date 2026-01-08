import { CreditCard, Calendar, ClipboardCheck, FileSignature, Wrench } from 'lucide-react';

const TIMELINE_STEPS = [
  { icon: CreditCard, label: 'Prior to booking', sublabel: '£250 fee' },
  { icon: Calendar, label: 'Soon after fee payment', sublabel: 'Design Consultation booking' },
  { icon: ClipboardCheck, label: 'Within a month', sublabel: 'Design Consultation' },
  { icon: FileSignature, label: 'After proposal signing', sublabel: 'Deposit payment' },
  { icon: Wrench, label: 'Usually a month after deposit', sublabel: 'Installation' },
];

export function Timeline() {
  return (
    <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
      <div>
        <h2 className="text-xl font-semibold text-foreground">Timeline</h2>
        <p className="text-sm text-muted-foreground">Here is an overview of the steps required to complete your upgrade</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-card">
        {/* Desktop horizontal timeline */}
        <div className="hidden md:block">
          <div className="flex justify-between relative">
            {/* Progress line */}
            <div className="absolute top-5 left-[10%] right-[10%] h-0.5 bg-border" />
            <div className="absolute top-5 left-[10%] w-4 h-0.5 bg-primary" />
            
            {TIMELINE_STEPS.map((step, index) => (
              <div key={index} className="flex flex-col items-center text-center relative z-10" style={{ width: '18%' }}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${
                  index === 0 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                }`}>
                  <step.icon className="w-5 h-5" />
                </div>
                <p className="text-xs font-medium text-foreground leading-tight">{step.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{step.sublabel}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile vertical timeline */}
        <div className="md:hidden space-y-4">
          {TIMELINE_STEPS.map((step, index) => (
            <div key={index} className="flex items-start gap-4 relative">
              {/* Vertical line */}
              {index < TIMELINE_STEPS.length - 1 && (
                <div className="absolute top-10 left-5 w-0.5 h-full bg-border -translate-x-1/2" />
              )}
              
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 relative z-10 ${
                index === 0 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
              }`}>
                <step.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{step.label}</p>
                <p className="text-sm text-muted-foreground">{step.sublabel}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
