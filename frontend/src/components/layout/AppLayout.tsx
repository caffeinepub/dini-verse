import { Outlet } from '@tanstack/react-router';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import LeftSidebar from './LeftSidebar';

export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <div className="flex flex-1">
        <LeftSidebar />
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
      <SiteFooter />
    </div>
  );
}
