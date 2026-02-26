import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';

interface PropertiesPanelProps {
  builder: ReturnType<typeof import('../../../hooks/useBuilder2D').useBuilder2D>;
}

export default function PropertiesPanel({ builder }: PropertiesPanelProps) {
  const { selectedElement, selectedId } = builder;

  if (!selectedElement) {
    return (
      <Card className="m-4 border-0 shadow-none">
        <CardHeader>
          <CardTitle className="text-sm">Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground text-center py-8">
            Select an element to edit properties
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="m-4 border-0 shadow-none">
      <CardHeader>
        <CardTitle className="text-sm">Properties</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label className="text-xs">Position X</Label>
          <Slider
            value={[selectedElement.x]}
            onValueChange={([x]) => selectedId && builder.updateElement(selectedId, { x })}
            min={0}
            max={800}
            step={1}
          />
          <div className="text-xs text-muted-foreground">{Math.round(selectedElement.x)}px</div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Position Y</Label>
          <Slider
            value={[selectedElement.y]}
            onValueChange={([y]) => selectedId && builder.updateElement(selectedId, { y })}
            min={0}
            max={600}
            step={1}
          />
          <div className="text-xs text-muted-foreground">{Math.round(selectedElement.y)}px</div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Opacity</Label>
          <Slider
            value={[selectedElement.opacity * 100]}
            onValueChange={([opacity]) => selectedId && builder.updateElement(selectedId, { opacity: opacity / 100 })}
            min={0}
            max={100}
            step={1}
          />
          <div className="text-xs text-muted-foreground">{Math.round(selectedElement.opacity * 100)}%</div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Rotation</Label>
          <Slider
            value={[selectedElement.rotation]}
            onValueChange={([rotation]) => selectedId && builder.updateElement(selectedId, { rotation })}
            min={0}
            max={360}
            step={1}
          />
          <div className="text-xs text-muted-foreground">{Math.round(selectedElement.rotation)}°</div>
        </div>

        {selectedElement.type === 'shape' && (
          <div className="space-y-2">
            <Label className="text-xs">Fill Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={selectedElement.color || '#cde5aa'}
                onChange={(e) => selectedId && builder.updateElement(selectedId, { color: e.target.value })}
                className="w-16 h-10 p-1 cursor-pointer"
              />
              <Input
                type="text"
                value={selectedElement.color || '#cde5aa'}
                onChange={(e) => selectedId && builder.updateElement(selectedId, { color: e.target.value })}
                className="flex-1"
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-xs">Width</Label>
          <Slider
            value={[selectedElement.width]}
            onValueChange={([width]) => selectedId && builder.updateElement(selectedId, { width })}
            min={20}
            max={400}
            step={1}
          />
          <div className="text-xs text-muted-foreground">{Math.round(selectedElement.width)}px</div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Height</Label>
          <Slider
            value={[selectedElement.height]}
            onValueChange={([height]) => selectedId && builder.updateElement(selectedId, { height })}
            min={20}
            max={400}
            step={1}
          />
          <div className="text-xs text-muted-foreground">{Math.round(selectedElement.height)}px</div>
        </div>
      </CardContent>
    </Card>
  );
}
