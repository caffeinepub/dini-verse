import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useNavigate } from '@tanstack/react-router';
import { Coins, TrendingUp, Gift, Star, Zap, LogIn, UserPlus } from 'lucide-react';

export default function DiniBucks() {
  const { isAuthenticated } = useCurrentUser();
  const navigate = useNavigate();

  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dini Bucks</h1>
          <p className="text-muted-foreground">
            The virtual currency of Dini.Verse
          </p>
        </div>

        {!isAuthenticated && (
          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <p className="text-lg font-medium">Balance Viewing Requires Authentication</p>
                <p className="text-sm text-muted-foreground">
                  Log in or create an account to view and manage your Dini Bucks balance.
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

        {isAuthenticated && (
          <Card className="mb-8 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                    <Coins className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Your Balance</p>
                    <p className="text-3xl font-bold">0 Dini Bucks</p>
                  </div>
                </div>
                <Button disabled>Get Dini Bucks (Coming Soon)</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <TrendingUp className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Earn</CardTitle>
              <CardDescription>
                Play games and complete challenges
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Star className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Spend</CardTitle>
              <CardDescription>
                Buy avatar items and accessories
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Gift className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Trade</CardTitle>
              <CardDescription>
                Exchange items with other players
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Premium</CardTitle>
              <CardDescription>
                Access exclusive content
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>About Dini Bucks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Dini Bucks is the virtual currency used throughout Dini.Verse. You can earn Dini Bucks by playing experiences, creating content, and participating in the community.
            </p>
            <p className="text-muted-foreground">
              Use your Dini Bucks to purchase avatar items, accessories, animations, and other virtual goods in the Avatar Shop.
            </p>
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> The Dini Bucks economy and purchasing system is currently under development. Stay tuned for updates!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
