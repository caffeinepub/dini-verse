import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useRateExperience } from '../../hooks/useExperiences';
import { toast } from 'sonner';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';

interface ExperienceRatingControlsProps {
  experienceId: string;
  thumbsUp: bigint;
  thumbsDown: bigint;
}

export default function ExperienceRatingControls({
  experienceId,
  thumbsUp,
  thumbsDown,
}: ExperienceRatingControlsProps) {
  const { identity } = useInternetIdentity();
  const rateMutation = useRateExperience();

  const isAuthenticated = !!identity;

  const handleRate = async (isThumbsUp: boolean) => {
    if (!isAuthenticated) {
      toast.error('Please log in to rate experiences');
      return;
    }

    try {
      await rateMutation.mutateAsync({ experienceId, isThumbsUp });
      toast.success(isThumbsUp ? 'Thumbs up!' : 'Thumbs down!');
    } catch (error) {
      console.error('Rating error:', error);
      toast.error('Failed to rate experience');
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleRate(true)}
        disabled={rateMutation.isPending}
        className="gap-2"
      >
        <ThumbsUp className="h-4 w-4" />
        <span>{Number(thumbsUp)}</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleRate(false)}
        disabled={rateMutation.isPending}
        className="gap-2"
      >
        <ThumbsDown className="h-4 w-4" />
        <span>{Number(thumbsDown)}</span>
      </Button>
    </div>
  );
}
