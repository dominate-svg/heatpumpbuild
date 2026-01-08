import { Link, useLocation } from 'react-router-dom';
import { User } from 'lucide-react';
import logo from '@/assets/logo.png';

export function Header() {
  const location = useLocation();
  const isEstimatePage = location.pathname === '/estimate';

  return (
    <header className="w-full py-4 px-6 bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Smart Energy Homes" className="h-9 w-auto" />
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link 
            to="/estimate" 
            className={`text-sm font-medium transition-colors ${
              isEstimatePage 
                ? 'text-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Your Home
          </Link>
          <a 
            href="#" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Help Centre
          </a>
        </nav>

        {/* Account icon */}
        <button className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors">
          <User className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
