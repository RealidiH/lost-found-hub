import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { MobileNav } from './MobileNav';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-6 pb-24 md:pb-6">
        <Outlet />
      </main>
      <MobileNav />
    </div>
  );
}
