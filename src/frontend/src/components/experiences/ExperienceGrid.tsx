import { Skeleton } from '@/components/ui/skeleton';
import ExperienceCard from './ExperienceCard';
import type { Experience } from '../../backend';

interface ExperienceGridProps {
  experiences: Experience[];
  isLoading: boolean;
  emptyMessage?: string;
}

export default function ExperienceGrid({
  experiences,
  isLoading,
  emptyMessage = 'No experiences found',
}: ExperienceGridProps) {
  if (isLoading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-video w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (experiences.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🎮</div>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {experiences.map((experience) => (
        <ExperienceCard key={experience.id} experience={experience} />
      ))}
    </div>
  );
}
