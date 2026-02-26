import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export default function AuthChangeBanner() {
  return (
    <Alert className="rounded-none border-x-0 border-t-0 bg-muted/50">
      <Info className="h-4 w-4" />
      <AlertDescription className="text-sm">
        <strong>Notice:</strong> On-platform authentication is now available. External login redirects remain disabled and all changes require owner approval.
      </AlertDescription>
    </Alert>
  );
}
