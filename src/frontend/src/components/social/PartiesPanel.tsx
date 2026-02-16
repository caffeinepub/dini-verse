import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';

export default function PartiesPanel() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Party System</CardTitle>
          <CardDescription>Join games together with friends</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-16">
            <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Party System Coming Soon</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Create parties, invite friends, and join experiences together. This feature is currently in development.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
