import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from '@tanstack/react-router';
import { useGetAllExperiences } from '../hooks/useExperiences';
import { useGetCurrentUserProfile } from '../hooks/useUserProfile';
import { useCurrentUser } from '../hooks/useCurrentUser';
import ExperienceGrid from '../components/experiences/ExperienceGrid';
import { Sparkles, Users, Clock } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { data: experiences, isLoading: experiencesLoading } = useGetAllExperiences();
  const { data: userProfile, isLoading: profileLoading } = useGetCurrentUserProfile();
  const { isAuthenticated, currentUser } = useCurrentUser();

  const recommendedExperiences = experiences?.slice(0, 6) || [];

  const displayName = currentUser?.displayName || userProfile?.displayName || 'User';

  return (
    <div className="flex flex-col">
      <section className="container py-8">
        {isAuthenticated && (
          <Card className="mb-8 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-primary">
                  {userProfile?.avatar ? (
                    <AvatarImage src={userProfile.avatar.getDirectURL()} alt={displayName} />
                  ) : null}
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">
                    Welcome back, {displayName}!
                  </h2>
                  <p className="text-muted-foreground">
                    Ready to explore new experiences or create something amazing?
                  </p>
                </div>
                <div className="hidden md:flex gap-2">
                  <Button onClick={() => navigate({ to: '/create' })} className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    Create
                  </Button>
                  <Button variant="outline" onClick={() => navigate({ to: '/discover' })}>
                    Discover
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-primary">Recommended</h2>
                  <p className="text-sm text-muted-foreground">
                    Popular experiences you might enjoy
                  </p>
                </div>
                <Button variant="ghost" onClick={() => navigate({ to: '/discover' })}>
                  View All
                </Button>
              </div>
              <ExperienceGrid experiences={recommendedExperiences} isLoading={experiencesLoading} />
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Users className="h-5 w-5" />
                  Friend Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isAuthenticated ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        No recent friend activity to display
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      Connect with friends to see their activity here
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground mb-4">
                      Log in to see what your friends are playing
                    </p>
                    <Button size="sm" onClick={() => navigate({ to: '/signup' })}>
                      Log In
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-primary">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Experiences</span>
                  <span className="font-bold">{experiences?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active Players</span>
                  <span className="font-bold">Coming Soon</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Creators</span>
                  <span className="font-bold">Growing Daily</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
