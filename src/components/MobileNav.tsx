import { Link, useLocation } from 'react-router-dom';
import { Package, Search, FileText, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

const navLinks = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/report-lost', label: 'Lost', icon: FileText },
  { path: '/report-found', label: 'Found', icon: FileText },
  { path: '/search', label: 'Search', icon: Search },
];

export function MobileNav() {
  const location = useLocation();
  
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background">
      <div className="flex items-center justify-around py-2">
        {navLinks.map(({ path, label, icon: Icon }) => (
          <Link
            key={path}
            to={path}
            className={cn(
              'flex flex-col items-center gap-1 px-3 py-2 text-xs',
              location.pathname === path
                ? 'text-primary'
                : 'text-muted-foreground'
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
