import { Link } from '@tanstack/react-router';
import { User, Package, Users, Settings, MessageCircle } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

export default function LeftSidebar() {
  const { t } = useTranslation();
  
  const navItems = [
    { to: '/profile', label: t('nav.profile'), icon: User },
    { to: '/social', label: t('nav.social'), icon: MessageCircle },
    { to: '/inventory', label: t('nav.inventory'), icon: Package },
    { to: '/groups', label: t('nav.groups'), icon: Users },
    { to: '/settings', label: t('nav.settings'), icon: Settings },
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
