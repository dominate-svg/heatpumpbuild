import { Link } from 'react-router-dom';
import logo from '@/assets/logo.png';

export function Header() {
  return (
    <header className="w-full py-4 px-6 border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <img src={logo} alt="Smart Energy Homes" className="h-12 w-auto" />
        </Link>
      </div>
    </header>
  );
}
