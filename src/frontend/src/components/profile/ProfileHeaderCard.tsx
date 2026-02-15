import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { Sparkles, Compass } from 'lucide-react';
import type { DiniVerseUser } from '../../backend';

interface ProfileHeaderCardProps {
  profile: DiniVerseUser | null | undefined;
  isLoading: boolean;
}

export default function ProfileHeaderCard({ profile, isLoading }: ProfileHeaderCardProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">Loading profile...</div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return null;
  }

  const avatarUrl = profile.avatar?.getDirectURL();

  return (
    <Card>
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <Avatar className="h-24 w-24">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={profile.displayName} />}
            <AvatarFallback className="text-3xl">
              {profile.displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{profile.displayName}</h1>
              <p className="text-muted-foreground">Dini.Verse Creator</p>
            </div>

            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <Button onClick={() => navigate({ to: '/discover' })} variant="outline" className="gap-2">
                <Compass className="h-4 w-4" />
                Discover
              </Button>
              <Button onClick={() => navigate({ to: '/discover' })} className="gap-2">
                <Sparkles className="h-4 w-4" />
                Publish Experience
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
