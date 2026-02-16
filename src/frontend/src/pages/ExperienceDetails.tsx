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
  const { experienceId } = useParams({ from: '/experience/$experienceId' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: experience, isLoading } = useGetExperience(experienceId);
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
      await incrementPlayerMutation.mutateAsync(experienceId);
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
                <div className="text-6xl">🎮</div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-4xl font-bold tracking-tight">{experience.title}</h1>
                  <Badge variant="secondary">{getCategoryLabel(experience.category)}</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>by {creator?.displayName || 'Unknown Creator'}</span>
                </div>
              </div>
              {!isPlaying && (
                <Button 
                  size="lg" 
                  onClick={handlePlay} 
                  className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                  disabled={incrementPlayerMutation.isPending}
                >
                  <Play className="h-5 w-5" />
                  Play
                </Button>
              )}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {experience.description}
                </p>
              </CardContent>
            </Card>

            {isPlaying && (
              <Card>
                <CardHeader>
                  <CardTitle>Controls</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {controlsLines.map((line, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        {line}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Players:</span>
                <span className="font-semibold">{Number(experience.playerCount)}</span>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-2">Rating</div>
                <ExperienceRatingControls
                  experienceId={experienceId}
                  thumbsUp={experience.thumbsUp}
                  thumbsDown={experience.thumbsDown}
                />
              </div>
            </CardContent>
          </Card>

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
                    {creator?.displayName?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{creator?.displayName || 'Unknown'}</div>
                  <div className="text-sm text-muted-foreground">Creator</div>
                </div>
              </div>
              {experience.author && (
                <CreatorFollowButton authorPrincipal={experience.author} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {isPlaying && <InGameMenu onLeave={handleLeave} onResetCharacter={handleResetCharacter} />}
    </div>
  );
}
