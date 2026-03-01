import { useNavigate } from '@tanstack/react-router';
import { useSessionAuth } from '../../hooks/useSessionAuth';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus } from 'lucide-react';

interface RequireProfileProps {
  children: React.ReactNode;
  message?: string;
}

export default function RequireProfile({ children, message }: RequireProfileProps) {
  const { isAuthenticated } = useSessionAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Login Required</h3>
          <p className="text-muted-foreground text-sm max-w-xs">
            {message || 'Please log in or create an account to access this feature.'}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate({ to: '/login' })}
            className="flex items-center gap-1.5"
          >
            <LogIn className="w-4 h-4" />
            Login
          </Button>
          <Button
            size="sm"
            onClick={() => navigate({ to: '/signup' })}
            className="flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            Sign Up
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
