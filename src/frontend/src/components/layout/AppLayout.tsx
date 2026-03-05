import { Outlet } from "@tanstack/react-router";
import LeftSidebar from "./LeftSidebar";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";

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
