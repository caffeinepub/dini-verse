import { Link } from '@tanstack/react-router';
import { User, Package, Users, Settings } from 'lucide-react';

export default function LeftSidebar() {
  const navItems = [
    { to: '/profile', label: 'Profile', icon: User },
    { to: '/inventory', label: 'Inventory', icon: Package },
    { to: '/groups', label: 'Groups', icon: Users },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex w-64 border-r border-border/40 bg-background/95 backdrop-blur">
      <nav className="flex flex-col gap-2 p-4 w-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              activeProps={{
                className: 'bg-accent text-accent-foreground',
              }}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
