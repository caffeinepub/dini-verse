import { Button } from '@/components/ui/button';
import { Square, Circle, Triangle } from 'lucide-react';

interface ShapePaletteProps {
  builder: ReturnType<typeof import('../../../hooks/useBuilder2D').useBuilder2D>;
}

export default function ShapePalette({ builder }: ShapePaletteProps) {
  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        className="w-full justify-start gap-2"
        onClick={() => builder.addShape('rectangle')}
      >
        <Square className="h-4 w-4" />
        Rectangle
      </Button>
      <Button
        variant="outline"
        className="w-full justify-start gap-2"
        onClick={() => builder.addShape('circle')}
      >
        <Circle className="h-4 w-4" />
        Circle
      </Button>
      <Button
        variant="outline"
        className="w-full justify-start gap-2"
        onClick={() => builder.addShape('triangle')}
      >
        <Triangle className="h-4 w-4" />
        Triangle
      </Button>
    </div>
  );
}
