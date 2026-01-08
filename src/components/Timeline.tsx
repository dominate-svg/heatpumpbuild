import { CreditCard, Calendar, ClipboardCheck, FileSignature, Wrench, ChevronRight } from 'lucide-react';

const TIMELINE_STEPS = [
  { icon: CreditCard, label: 'Book', sublabel: '£250 fee', active: true },
  { icon: Calendar, label: 'Schedule', sublabel: 'Design visit' },
  { icon: ClipboardCheck, label: 'Consult', sublabel: 'Home survey' },
  { icon: FileSignature, label: 'Confirm', sublabel: 'Deposit' },
  { icon: Wrench, label: 'Install', sublabel: '~1 month' },
];

export function Timeline() {
  return (
    <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Your journey</h2>
          <p className="text-xs text-muted-foreground">Steps to your new heat pump</p>
        </div>
      </div>

      {/* Horizontal timeline - mobile friendly */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-card overflow-x-auto">
        <div className="flex items-start gap-1 min-w-max md:min-w-0 md:justify-between">
          {TIMELINE_STEPS.map((step, index) => (
            <div key={index} className="flex items-center">
              <div className="flex flex-col items-center text-center w-16 md:w-auto md:flex-1">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-all ${
                  step.active 
                    ? 'bg-primary text-white animate-pulse-glow' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  <step.icon className="w-5 h-5" />
                </div>
                <p className="text-xs font-medium text-foreground">{step.label}</p>
                <p className="text-[10px] text-muted-foreground">{step.sublabel}</p>
              </div>
              {index < TIMELINE_STEPS.length - 1 && (
                <ChevronRight className="w-4 h-4 text-border mx-1 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
