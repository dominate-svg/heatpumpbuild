import { Link } from 'react-router-dom';
import { Flame } from 'lucide-react';

export function Header() {
  return (
    <header className="w-full py-4 px-6 border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Flame className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-foreground">Smart Energy Homes</span>
            <span className="text-xs text-muted-foreground">Cosy Heat Pump Estimate</span>
          </div>
        </Link>
      </div>
    </header>
  );
}
