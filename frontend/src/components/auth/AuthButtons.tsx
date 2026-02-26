import { useSessionAuth } from '../../hooks/useSessionAuth';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { LogOut, LogIn, UserPlus } from 'lucide-react';

export default function AuthButtons() {
  const { isAuthenticated, logout, isLoading } = useSessionAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate({ to: '/' });
  };

  if (isLoading) {
    return (
      <Button variant="outline" size="sm" disabled className="gap-2">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        Loading...
      </Button>
    );
  }

  if (isAuthenticated) {
    return (
      <Button
        onClick={handleLogout}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <LogOut className="h-4 w-4" />
        Log out
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={() => navigate({ to: '/login' })}
        variant="ghost"
        size="sm"
        className="gap-2"
      >
        <LogIn className="h-4 w-4" />
        Log In
      </Button>
      <Button
        onClick={() => navigate({ to: '/signup' })}
        variant="default"
        size="sm"
        className="gap-2"
      >
        <UserPlus className="h-4 w-4" />
        Sign Up
      </Button>
    </div>
  );
}
