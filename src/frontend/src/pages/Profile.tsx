import RequireProfile from '../components/auth/RequireProfile';
import { useSessionAuth } from '../hooks/useSessionAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, Settings } from 'lucide-react';

export default function Profile() {
  const { currentUser } = useSessionAuth();

  return (
    <RequireProfile>
      <div className="container py-8">
        <div className="space-y-8">
          {currentUser && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Your Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      {currentUser.avatar && <AvatarImage src={currentUser.avatar} alt={currentUser.displayName} />}
                      <AvatarFallback className="text-2xl">
                        {currentUser.displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-2xl font-bold">{currentUser.displayName}</h2>
                      <p className="text-sm text-muted-foreground">
                        @{currentUser.username}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" className="gap-2">
                      <User className="h-4 w-4" />
                      Edit Profile
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Settings className="h-4 w-4" />
                      Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Display Name</p>
                      <p className="text-base">{currentUser.displayName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Username</p>
                      <p className="text-base">@{currentUser.username}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </RequireProfile>
  );
}
