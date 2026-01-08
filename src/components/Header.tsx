import { Link } from 'react-router-dom';
import { Phone } from 'lucide-react';
import logo from '@/assets/logo.png';

export function Header() {
  return (
    <header className="w-full py-4 px-6 bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <img src={logo} alt="Smart Energy Homes" className="h-10 w-auto" />
        </Link>
        <div className="flex items-center gap-3 text-muted-foreground text-sm">
          <span className="hidden md:block">Questions?</span>
          <a 
            href="tel:01onal234567" 
            className="flex items-center gap-2 font-semibold text-foreground hover:text-primary transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span className="hidden sm:inline">0800 123 4567</span>
          </a>
        </div>
      </div>
    </header>
  );
}
