import { Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Inventory() {
  return (
    <div className="container py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground mt-1">
            Manage your items, accessories, and collectibles
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Your Items
            </CardTitle>
            <CardDescription>
              Your inventory is currently empty
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                You don't have any items yet. Visit the Avatar Shop to get started!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
