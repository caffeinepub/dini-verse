import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { Play, User } from 'lucide-react';
import type { Experience } from '../../backend';
import { useGetUserProfile } from '../../hooks/useUserProfile';

interface ExperienceCardProps {
  experience: Experience;
}

export default function ExperienceCard({ experience }: ExperienceCardProps) {
  const navigate = useNavigate();
  const { data: creator } = useGetUserProfile(experience.author);

  const thumbnailUrl = experience.thumbnail?.getDirectURL();

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
      <div
        onClick={() => navigate({ to: '/experience/$experienceId', params: { experienceId: experience.id } })}
        className="relative aspect-video bg-muted overflow-hidden"
      >
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={experience.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-5xl">🎮</div>
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
          <Button
            size="lg"
            className="opacity-0 group-hover:opacity-100 transition-opacity gap-2"
            onClick={(e) => {
              e.stopPropagation();
              navigate({ to: '/experience/$experienceId', params: { experienceId: experience.id } });
            }}
          >
            <Play className="h-5 w-5" />
            Play
          </Button>
        </div>
      </div>
      <CardHeader>
        <CardTitle className="line-clamp-1">{experience.title}</CardTitle>
        <CardDescription className="line-clamp-2">{experience.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span className="line-clamp-1">{creator?.displayName || 'Unknown Creator'}</span>
        </div>
      </CardContent>
    </Card>
  );
}
