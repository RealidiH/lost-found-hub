import { Link, useLocation } from 'react-router-dom';
import { Package, Search, FileText, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navLinks = [
  { path: '/', label: 'Home', icon: Package },
  { path: '/report-lost', label: 'Report Lost', icon: FileText },
  { path: '/report-found', label: 'Report Found', icon: FileText },
  { path: '/search', label: 'Search Items', icon: Search },
];

export function Header() {
  const location = useLocation();
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">Lost & Found</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ path, label, icon: Icon }) => (
            <Link key={path} to={path}>
              <Button 
                variant={location.pathname === path ? 'secondary' : 'ghost'}
                size="sm"
                className={cn(
                  'gap-2',
                  location.pathname === path && 'bg-secondary'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            </Link>
          ))}
        </nav>
        
        <Link to="/admin">
          <Button variant="outline" size="sm" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Admin</span>
          </Button>
        </Link>
      </div>
    </header>
  );
}
