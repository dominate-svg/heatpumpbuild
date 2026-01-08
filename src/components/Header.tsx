import { Link } from 'react-router-dom';
import logo from '@/assets/logo.png';

export function Header() {
  return (
    <header className="w-full py-4 px-6 bg-primary/95 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <img src={logo} alt="Smart Energy Homes" className="h-10 w-auto" />
        </Link>
        <div className="hidden md:flex items-center gap-4 text-white/80 text-sm">
          <span>Questions? Call us</span>
          <a href="tel:01onal234567" className="font-semibold text-white hover:text-accent transition-colors">
            01onal 234567
          </a>
        </div>
      </div>
    </header>
  );
}
