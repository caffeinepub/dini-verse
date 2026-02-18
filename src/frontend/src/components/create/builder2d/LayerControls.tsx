import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, Trash2 } from 'lucide-react';

interface LayerControlsProps {
  builder: ReturnType<typeof import('../../../hooks/useBuilder2D').useBuilder2D>;
}

export default function LayerControls({ builder }: LayerControlsProps) {
  const { selectedElement, selectedId } = builder;

  if (!selectedElement) {
    return (
      <div className="text-sm text-muted-foreground text-center py-4">
        Select an element to control layers
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-xs text-muted-foreground mb-2">
        Selected: {selectedElement.type === 'shape' ? selectedElement.shapeType : 'decal'}
      </div>
      <Button
        variant="outline"
        size="sm"
        className="w-full justify-start gap-2"
        onClick={() => selectedId && builder.moveElementForward(selectedId)}
      >
        <ArrowUp className="h-4 w-4" />
        Bring Forward
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="w-full justify-start gap-2"
        onClick={() => selectedId && builder.moveElementBackward(selectedId)}
      >
        <ArrowDown className="h-4 w-4" />
        Send Backward
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="w-full justify-start gap-2 text-destructive hover:text-destructive"
        onClick={() => selectedId && builder.deleteElement(selectedId)}
      >
        <Trash2 className="h-4 w-4" />
        Delete
      </Button>
    </div>
  );
}
