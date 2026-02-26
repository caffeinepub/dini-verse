import { ReactNode, useEffect } from 'react';
import { useSessionAuth } from '../../hooks/useSessionAuth';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus } from 'lucide-react';

interface RequireProfileProps {
  children: ReactNode;
}

export default function RequireProfile({ children }: RequireProfileProps) {
  const { isAuthenticated, isLoading, fetchCurrentUser } = useSessionAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCurrentUser();
    }
  }, [isAuthenticated, fetchCurrentUser]);

  if (isLoading) {
    return (
      <div className="container py-16">
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container py-16">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              You need to be logged in to access this page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please log in to your account or create a new one to access this feature.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => navigate({ to: '/login' })}
                className="flex-1 gap-2"
              >
                <LogIn className="h-4 w-4" />
                Log In
              </Button>
              <Button
                onClick={() => navigate({ to: '/signup' })}
                variant="outline"
                className="flex-1 gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Sign Up
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
