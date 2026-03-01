import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus } from 'lucide-react';

interface AccountsDisabledNoticeProps {
  message?: string;
}

export default function AccountsDisabledNotice({ message }: AccountsDisabledNoticeProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Login Required</h3>
        <p className="text-muted-foreground text-sm max-w-xs">
          {message || 'Please log in or create an account to continue.'}
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
          Log In
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
