import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Shirt, Glasses, Crown, Sparkles } from 'lucide-react';

export default function AvatarShop() {
  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Avatar Shop</h1>
          <p className="text-muted-foreground">
            Customize your avatar with clothes, accessories, and animations
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardHeader>
              <Shirt className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Clothing</CardTitle>
              <CardDescription>Shirts, pants, and outfits</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardHeader>
              <Glasses className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Accessories</CardTitle>
              <CardDescription>Hats, glasses, and more</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardHeader>
              <Crown className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Premium Items</CardTitle>
              <CardDescription>Exclusive collectibles</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardHeader>
              <Sparkles className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Animations</CardTitle>
              <CardDescription>Emotes and dances</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Shop Coming Soon</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                The Avatar Shop is currently under development. Soon you'll be able to purchase items using Dini Bucks to customize your avatar.
              </p>
              <Button disabled>Browse Items (Coming Soon)</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
