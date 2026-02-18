import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from '@tanstack/react-router';
import { Gamepad2, Shirt } from 'lucide-react';

export default function Create() {
  const navigate = useNavigate();

  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Create</h1>
          <p className="text-muted-foreground">
            Choose what you want to create
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card 
            className="cursor-pointer hover:border-primary transition-all hover:shadow-lg"
            onClick={() => navigate({ to: '/create/games' })}
          >
            <CardHeader className="pb-4">
              <Gamepad2 className="h-16 w-16 text-primary mb-4" />
              <CardTitle className="text-2xl">Create Games/Experiences</CardTitle>
              <CardDescription className="text-base">
                Build immersive games and experiences with our easy drag-and-drop 2D builder. 
                Create props using shapes, decals, and simple controls. Perfect for beginners and pros alike.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Drag-and-drop 2D shape builder</li>
                <li>• Upload and position decals</li>
                <li>• Resize, rotate, and layer elements</li>
                <li>• Adjust colors, transparency, and positioning</li>
                <li>• Save and share your props</li>
              </ul>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:border-primary transition-all hover:shadow-lg"
            onClick={() => navigate({ to: '/create/ugc-accessories' })}
          >
            <CardHeader className="pb-4">
              <Shirt className="h-16 w-16 text-primary mb-4" />
              <CardTitle className="text-2xl">Create UGC Accessories</CardTitle>
              <CardDescription className="text-base">
                Design custom accessories for your avatar. Create unique clothing, hats, gear, and more 
                to express your style or share with the community.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Design custom avatar accessories</li>
                <li>• Create clothing and gear</li>
                <li>• Share with the community</li>
                <li>• Express your unique style</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
