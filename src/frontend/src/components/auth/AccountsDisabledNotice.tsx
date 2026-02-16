import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { LogIn, UserPlus } from 'lucide-react';

export default function AccountsDisabledNotice() {
  const navigate = useNavigate();

  return (
    <Card className="max-w-md mx-auto border-muted">
      <CardHeader>
        <CardTitle>Login Required</CardTitle>
        <CardDescription>
          Please log in to access this feature
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          You need to be logged in to access this feature. Create an account or log in to continue.
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
  );
}
