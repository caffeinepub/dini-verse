import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSessionAuth } from '../hooks/useSessionAuth';
import { useNavigate } from '@tanstack/react-router';
import { Code, Box, Palette, Zap, Layers, Play, LogIn, UserPlus } from 'lucide-react';

export default function Create() {
  const { isAuthenticated } = useSessionAuth();
  const navigate = useNavigate();

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
          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <p className="text-lg font-medium">Creation Features Require Authentication</p>
                <p className="text-sm text-muted-foreground">
                  Log in or create an account to access the full Dini Studio creation suite.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => navigate({ to: '/login' })} className="gap-2">
                    <LogIn className="h-4 w-4" />
                    Log In
                  </Button>
                  <Button onClick={() => navigate({ to: '/signup' })} variant="outline" className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    Sign Up
                  </Button>
                </div>
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
                Access thousands of pre-built objects and assets
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Code className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Scripting</CardTitle>
              <CardDescription>
                Add interactivity with visual scripting or code
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Palette className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Materials</CardTitle>
              <CardDescription>
                Customize textures and materials for your objects
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Physics</CardTitle>
              <CardDescription>
                Add realistic physics and interactions
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Play className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Test & Publish</CardTitle>
              <CardDescription>
                Test your experience and publish to the community
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Dini Studio is a powerful creation platform that lets you build immersive 3D experiences without extensive coding knowledge.
            </p>
            <p className="text-muted-foreground">
              Whether you're creating an adventure game, a roleplay world, or a simulator, Dini Studio provides all the tools you need to bring your vision to life.
            </p>
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> The full Dini Studio creation suite is currently under development. Stay tuned for updates!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
