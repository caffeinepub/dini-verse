import { ReactNode } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCurrentUserProfile } from '../../hooks/useUserProfile';
import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, UserPlus } from 'lucide-react';

interface RequireProfileProps {
  children: ReactNode;
}

export default function RequireProfile({ children }: RequireProfileProps) {
  const { identity, login } = useInternetIdentity();
  const { data: userProfile, isLoading, isFetched } = useGetCurrentUserProfile();
  const navigate = useNavigate();

  const isAuthenticated = !!identity;

  useEffect(() => {
    if (isAuthenticated && isFetched && userProfile === null) {
      navigate({ to: '/signup' });
    }
  }, [isAuthenticated, isFetched, userProfile, navigate]);

  if (!isAuthenticated) {
    return (
      <div className="container py-16">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              You need to be logged in to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button onClick={login} className="gap-2">
              <LogIn className="h-4 w-4" />
              Log in
            </Button>
            <Button
              onClick={() => {
                login();
                navigate({ to: '/signup' });
              }}
              variant="outline"
              className="gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Sign up
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading || !isFetched) {
    return (
      <div className="container py-16">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (userProfile === null) {
    return null;
  }

  return <>{children}</>;
}
