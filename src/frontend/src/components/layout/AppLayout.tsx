import { Outlet } from '@tanstack/react-router';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import LeftSidebar from './LeftSidebar';
import AuthChangeBanner from './AuthChangeBanner';

export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <AuthChangeBanner />
      <div className="flex-1 flex">
        <LeftSidebar />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
      <SiteFooter />
    </div>
  );
}
