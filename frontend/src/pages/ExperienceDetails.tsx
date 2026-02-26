import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetExperience, useIncrementPlayerCount } from '../hooks/useExperiences';
import { useGetUserProfile } from '../hooks/useUserProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, User, Users } from 'lucide-react';
import { useState } from 'react';
import ExperienceRatingControls from '../components/experiences/ExperienceRatingControls';
import InGameMenu from '../components/experiences/InGameMenu';
import CreatorFollowButton from '../components/experiences/CreatorFollowButton';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { toast } from 'sonner';

export default function ExperienceDetails() {
  const { id } = useParams({ from: '/experience/$id' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: experience, isLoading } = useGetExperience(id);
  const { data: creator } = useGetUserProfile(experience?.author);
  const incrementPlayerMutation = useIncrementPlayerCount();
  const [isPlaying, setIsPlaying] = useState(false);

  const isAuthenticated = !!identity;

  if (isLoading) {
    return (
      <div className="container py-16">
        <div className="text-center">Loading experience...</div>
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="container py-16">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Experience Not Found</CardTitle>
            <CardDescription>
              The experience you're looking for doesn't exist.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate({ to: '/discover' })}>
              Back to Discover
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const thumbnailUrl = experience.thumbnail?.getDirectURL();

  const handlePlay = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to play experiences');
      return;
    }

    try {
      await incrementPlayerMutation.mutateAsync(id);
      setIsPlaying(true);
    } catch (error) {
      console.error('Failed to start experience:', error);
      toast.error('Failed to start experience');
    }
  };

  const handleLeave = () => {
    setIsPlaying(false);
  };

  const handleResetCharacter = () => {
    // Reset simulated play state
  };

  const getCategoryLabel = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const defaultControls = [
    'WASD: Move',
    'Space: Jump',
    'Mouse: Camera',
  ];

  const controlsText = experience.gameplayControls || defaultControls.join('\n');
  const controlsLines = controlsText.split('\n').filter(line => line.trim());

  return (
    <div className="container py-8">
      <Button
        variant="ghost"
        onClick={() => navigate({ to: '/discover' })}
        className="mb-6 gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Discover
      </Button>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
            {isPlaying ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                <div className="text-center space-y-4">
                  <div className="text-6xl">🎮</div>
                  <div className="text-2xl font-bold">Experience Launched!</div>
                  <p className="text-muted-foreground">
                    In a full implementation, this would launch the experience.
                  </p>
                </div>
              </div>
            ) : thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt={experience.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-8xl">🎮</div>
              </div>
            )}
            
            {isPlaying && <InGameMenu onLeave={handleLeave} onResetCharacter={handleResetCharacter} />}
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-3xl">{experience.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{getCategoryLabel(experience.category)}</Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{Number(experience.playerCount)} playing</span>
                    </div>
                  </div>
                </div>
                {!isPlaying && (
                  <Button size="lg" onClick={handlePlay} className="gap-2">
                    <Play className="h-5 w-5" />
                    Play
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{experience.description}</p>
              </div>

              <ExperienceRatingControls
                experienceId={id}
                thumbsUp={experience.thumbsUp}
                thumbsDown={experience.thumbsDown}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gameplay Controls</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {controlsLines.map((control, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    {control}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Creator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  {creator?.avatar && (
                    <AvatarImage src={creator.avatar.getDirectURL()} alt={creator.displayName} />
                  )}
                  <AvatarFallback>
                    <User className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">
                    {creator?.displayName || 'Unknown Creator'}
                  </p>
                  <p className="text-sm text-muted-foreground">Creator</p>
                </div>
              </div>
              
              {creator && (
                <CreatorFollowButton authorPrincipal={experience.author} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Players</span>
                <span className="font-semibold">{Number(experience.playerCount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Likes</span>
                <span className="font-semibold">{Number(experience.thumbsUp)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Dislikes</span>
                <span className="font-semibold">{Number(experience.thumbsDown)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
