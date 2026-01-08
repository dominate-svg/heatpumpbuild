import { FileText } from 'lucide-react';

export function EstimateBanner() {
  return (
    <div className="bg-primary-light border border-primary/20 rounded-xl p-4 flex items-start gap-4">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        <FileText className="w-5 h-5 text-primary" />
      </div>
      <div>
        <h3 className="font-semibold text-foreground mb-1">Estimated plan</h3>
        <p className="text-sm text-muted-foreground">
          The details below are based on a digital estimate, and may change after we visit your home
        </p>
      </div>
    </div>
  );
}
