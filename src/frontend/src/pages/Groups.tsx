import { Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Groups() {
  return (
    <div className="container py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Groups</h1>
          <p className="text-muted-foreground mt-1">
            Connect with communities and join groups
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Your Groups
            </CardTitle>
            <CardDescription>
              You haven't joined any groups yet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Join groups to connect with other players and discover new experiences together!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
