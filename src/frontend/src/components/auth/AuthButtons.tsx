import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { LogIn, LogOut, UserPlus } from 'lucide-react';

export default function AuthButtons() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.message === 'User is already authenticated') {
        await clear();
        setTimeout(() => login(), 300);
      }
    }
  };

  const handleSignUp = async () => {
    if (isAuthenticated) {
      navigate({ to: '/signup' });
    } else {
      try {
        await login();
        navigate({ to: '/signup' });
      } catch (error: any) {
        console.error('Sign up error:', error);
      }
    }
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/' });
  };

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
        onClick={handleLogin}
        disabled={isLoggingIn}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <LogIn className="h-4 w-4" />
        {isLoggingIn ? 'Logging in...' : 'Log in'}
      </Button>
      <Button
        onClick={handleSignUp}
        disabled={isLoggingIn}
        size="sm"
        className="gap-2"
      >
        <UserPlus className="h-4 w-4" />
        Sign up
      </Button>
    </div>
  );
}
