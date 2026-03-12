import { Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { getCurrentUser, updateHeartbeat } from "../../utils/socialStorage";
import LeftSidebar from "./LeftSidebar";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";

export default function AppLayout() {
  useEffect(() => {
    const me = getCurrentUser();
    if (!me) return;
    updateHeartbeat(me);
    const interval = setInterval(() => {
      const user = getCurrentUser();
      if (user) updateHeartbeat(user);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

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
