import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { Code, Box, Palette, Zap, Layers, Play } from 'lucide-react';

export default function Create() {
  const navigate = useNavigate();
  const { isAuthenticated } = useCurrentUser();

  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Create</h1>
          <p className="text-muted-foreground">
            Build amazing experiences with Dini Studio
          </p>
        </div>

        {!isAuthenticated && (
          <Card className="mb-8 border-primary/50 bg-primary/5">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-lg mb-4">Log in to start creating your own experiences</p>
                <Button onClick={() => navigate({ to: '/signup' })}>
                  Log In to Create
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <Box className="h-10 w-10 text-primary mb-2" />
              <CardTitle>3D Viewport</CardTitle>
              <CardDescription>
                Build your world with an intuitive 3D editor
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Layers className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Object Library</CardTitle>
              <CardDescription>
                Insert pre-made objects and assets
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Palette className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Properties Panel</CardTitle>
              <CardDescription>
                Customize every aspect of your objects
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Code className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Lua Scripting</CardTitle>
              <CardDescription>
                Add custom behavior with code
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Live Testing</CardTitle>
              <CardDescription>
                Test your experience in real-time
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Play className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Publish & Share</CardTitle>
              <CardDescription>
                Share your creations with the world
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Box className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Dini Studio Coming Soon</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                The full Dini Studio creation tool is currently in development. For now, you can publish simple experiences from the Discover page.
              </p>
              <Button onClick={() => navigate({ to: '/discover' })}>
                Go to Discover
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
