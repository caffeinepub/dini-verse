import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

export default function CreateUGCAccessories() {
  const navigate = useNavigate();

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: '/create' })}
          className="gap-2 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Create
        </Button>

        <Card className="border-primary/20">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <Sparkles className="h-20 w-20 text-primary" />
            </div>
            <CardTitle className="text-3xl mb-2">UGC Accessories Creator</CardTitle>
            <CardDescription className="text-lg">
              Coming Soon
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              The UGC Accessories Creator is currently under development. Soon you'll be able to design 
              custom clothing, hats, gear, and accessories for your avatar.
            </p>
            <p className="text-muted-foreground">
              Stay tuned for updates as we bring this exciting feature to life!
            </p>
            <div className="pt-4">
              <Button onClick={() => navigate({ to: '/create' })}>
                Explore Other Creation Tools
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
