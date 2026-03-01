import RequireProfile from '../components/auth/RequireProfile';
import { useSessionAuth } from '../hooks/useSessionAuth';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, Settings } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

export default function Profile() {
  const { user } = useSessionAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <RequireProfile>
      <div className="container py-8">
        <div className="space-y-8">
          {user && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>{t('profile.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarFallback className="text-2xl">
                        {user.displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-2xl font-bold">{user.displayName}</h2>
                      <p className="text-sm text-muted-foreground">
                        @{user.username}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" className="gap-2">
                      <User className="h-4 w-4" />
                      {t('profile.editProfile')}
                    </Button>
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => navigate({ to: '/settings' })}
                    >
                      <Settings className="h-4 w-4" />
                      {t('profile.settings')}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('profile.accountInfo')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t('profile.displayName')}</p>
                      <p className="text-base">{user.displayName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t('profile.username')}</p>
                      <p className="text-base">@{user.username}</p>
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
