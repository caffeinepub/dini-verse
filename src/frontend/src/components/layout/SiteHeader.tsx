import { Link, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import AuthButtons from '../auth/AuthButtons';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function SiteHeader() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-header backdrop-blur supports-[backdrop-filter]:bg-header/90">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/assets/generated/screenshot_2026_logo.dim_512x128.png" 
              alt="Dini.Verse Logo" 
              className="h-12 w-auto object-contain"
              srcSet="/assets/generated/screenshot_2026_logo.dim_512x128.png 2x"
            />
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/' })} className="text-header-foreground hover:bg-header-accent">
              Home
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/discover' })} className="text-header-foreground hover:bg-header-accent">
              Discover
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/avatar-shop' })} className="text-header-foreground hover:bg-header-accent">
              Avatar Shop
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/create' })} className="text-header-foreground hover:bg-header-accent">
              Create
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/dini-bucks' })} className="text-header-foreground hover:bg-header-accent">
              Dini Bucks
            </Button>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex">
            <AuthButtons />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-header-foreground hover:bg-header-accent"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-header backdrop-blur">
          <nav className="container py-4 flex flex-col gap-2">
            <Button
              variant="ghost"
              className="justify-start text-header-foreground hover:bg-header-accent"
              onClick={() => {
                navigate({ to: '/' });
                setMobileMenuOpen(false);
              }}
            >
              Home
            </Button>
            <Button
              variant="ghost"
              className="justify-start text-header-foreground hover:bg-header-accent"
              onClick={() => {
                navigate({ to: '/discover' });
                setMobileMenuOpen(false);
              }}
            >
              Discover
            </Button>
            <Button
              variant="ghost"
              className="justify-start text-header-foreground hover:bg-header-accent"
              onClick={() => {
                navigate({ to: '/avatar-shop' });
                setMobileMenuOpen(false);
              }}
            >
              Avatar Shop
            </Button>
            <Button
              variant="ghost"
              className="justify-start text-header-foreground hover:bg-header-accent"
              onClick={() => {
                navigate({ to: '/create' });
                setMobileMenuOpen(false);
              }}
            >
              Create
            </Button>
            <Button
              variant="ghost"
              className="justify-start text-header-foreground hover:bg-header-accent"
              onClick={() => {
                navigate({ to: '/dini-bucks' });
                setMobileMenuOpen(false);
              }}
            >
              Dini Bucks
            </Button>
            <div className="pt-2 border-t border-border/40 mt-2">
              <AuthButtons />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
