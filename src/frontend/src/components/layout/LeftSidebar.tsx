import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "@tanstack/react-router";
import {
  MessageCircle,
  Package,
  Settings,
  UserSearch,
  Users,
} from "lucide-react";
import {
  getCurrentUsername,
  getLocalSettings,
} from "../../hooks/useAccountSettings";
import { useTranslation } from "../../hooks/useTranslation";

export default function LeftSidebar() {
  const { t } = useTranslation();

  const username = getCurrentUsername();
  const localSettings = username ? getLocalSettings(username) : null;
  const avatarDataUrl = localSettings?.avatarDataUrl ?? null;
  const displayName = localSettings?.displayName || username || "User";

  const navItems = [
    { to: "/profile", label: t("nav.profile") },
    { to: "/social", label: t("nav.social"), icon: MessageCircle },
    { to: "/people", label: "People", icon: UserSearch },
    { to: "/inventory", label: t("nav.inventory"), icon: Package },
    { to: "/groups", label: t("nav.groups"), icon: Users },
    { to: "/settings", label: t("nav.settings"), icon: Settings },
  ];

  return (
    <aside className="hidden md:flex w-64 border-r border-border/40 bg-background/95 backdrop-blur">
      <nav className="flex flex-col gap-2 p-4 w-full">
        {/* Profile link with avatar */}
        <Link
          to="/profile"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          activeProps={{
            className: "bg-accent text-accent-foreground",
          }}
        >
          <Avatar className="h-6 w-6 shrink-0">
            {avatarDataUrl && (
              <AvatarImage src={avatarDataUrl} alt={displayName} />
            )}
            <AvatarFallback className="text-xs">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {t("nav.profile")}
        </Link>

        {/* Other nav items */}
        {navItems.slice(1).map((item) => {
          const Icon = item.icon;
          const isPeopleLink = item.to === "/people";
          return (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              activeProps={{
                className: "bg-accent text-accent-foreground",
              }}
              data-ocid={isPeopleLink ? "people.link" : undefined}
            >
              {Icon && <Icon className="h-5 w-5" />}
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
