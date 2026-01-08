import { FileText, Sparkles } from 'lucide-react';
import { CosyBadge } from './CosyBadge';

export function EstimateBanner() {
  return (
    <div className="bg-gradient-to-r from-primary-light to-accent-light border border-primary/10 rounded-2xl p-4 md:p-5 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 animate-pulse-glow">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground">Estimated plan</h3>
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            </div>
            <p className="text-sm text-muted-foreground">
              Based on a digital estimate — may change after our home visit
            </p>
          </div>
        </div>
        <CosyBadge size="sm" className="self-center sm:self-auto" />
      </div>
    </div>
  );
}
