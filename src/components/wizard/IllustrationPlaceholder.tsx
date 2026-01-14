import { cn } from '@/lib/utils';

interface IllustrationPlaceholderProps {
  label: string;
  className?: string;
  aspectRatio?: 'square' | 'wide' | 'tall';
}

export function IllustrationPlaceholder({ 
  label, 
  className,
  aspectRatio = 'wide' 
}: IllustrationPlaceholderProps) {
  const aspectClasses = {
    square: 'aspect-square',
    wide: 'aspect-video',
    tall: 'aspect-[3/4]',
  };

  return (
    <div 
      className={cn(
        'w-full bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl border border-border/50 flex items-center justify-center p-6',
        aspectClasses[aspectRatio],
        className
      )}
    >
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
          <svg className="w-6 h-6 text-primary/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
