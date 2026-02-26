import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import BuilderCanvas from '../components/create/builder2d/BuilderCanvas';
import ShapePalette from '../components/create/builder2d/ShapePalette';
import LayerControls from '../components/create/builder2d/LayerControls';
import PropertiesPanel from '../components/create/builder2d/PropertiesPanel';
import DecalUploader from '../components/create/builder2d/DecalUploader';
import PropsPanel from '../components/create/builder2d/PropsPanel';
import { useBuilder2D } from '../hooks/useBuilder2D';

export default function CreateGamesBuilder2D() {
  const navigate = useNavigate();
  const builder = useBuilder2D();
  const [showPropsPanel, setShowPropsPanel] = useState(false);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="border-b bg-background/95 backdrop-blur">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: '/create' })}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Create
            </Button>
            <h1 className="text-lg font-semibold">2D Game Builder</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPropsPanel(!showPropsPanel)}
            >
              {showPropsPanel ? 'Hide Props' : 'Show Props'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => builder.clearCanvas()}
            >
              Clear Canvas
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 border-r bg-muted/30 overflow-y-auto">
          <Card className="m-4 border-0 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Shapes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <ShapePalette builder={builder} />
            </CardContent>
          </Card>

          <Card className="m-4 border-0 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Decals</CardTitle>
            </CardHeader>
            <CardContent>
              <DecalUploader builder={builder} />
            </CardContent>
          </Card>

          <Card className="m-4 border-0 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Layers</CardTitle>
            </CardHeader>
            <CardContent>
              <LayerControls builder={builder} />
            </CardContent>
          </Card>
        </div>

        <div className="flex-1 bg-background overflow-hidden">
          <BuilderCanvas builder={builder} />
        </div>

        <div className="w-80 border-l bg-muted/30 overflow-y-auto">
          {showPropsPanel ? (
            <PropsPanel builder={builder} />
          ) : (
            <PropertiesPanel builder={builder} />
          )}
        </div>
      </div>
    </div>
  );
}
