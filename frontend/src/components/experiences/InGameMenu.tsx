import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Menu, LogOut, RotateCcw, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface InGameMenuProps {
  onLeave: () => void;
  onResetCharacter: () => void;
}

export default function InGameMenu({ onLeave, onResetCharacter }: InGameMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const handleLeave = () => {
    setMenuOpen(false);
    onLeave();
  };

  const handleResetCharacter = () => {
    setResetDialogOpen(false);
    setMenuOpen(false);
    onResetCharacter();
    toast.success('Character reset successfully');
  };

  return (
    <>
      <Button
        variant="secondary"
        size="icon"
        onClick={() => setMenuOpen(true)}
        className="fixed top-20 right-4 z-50"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Game Menu</DialogTitle>
            <DialogDescription>
              Manage your gameplay experience
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={handleLeave}
            >
              <LogOut className="h-4 w-4" />
              Leave
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => {
                setMenuOpen(false);
                setResetDialogOpen(true);
              }}
            >
              <RotateCcw className="h-4 w-4" />
              Reset Character
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => {
                setMenuOpen(false);
                setSettingsOpen(true);
              }}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Character?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset your character to the starting position. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetCharacter}>Reset</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>In-Game Settings</DialogTitle>
            <DialogDescription>
              Adjust your gameplay preferences
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 text-center text-muted-foreground">
            <Settings className="h-12 w-12 mx-auto mb-4" />
            <p>Settings configuration coming soon</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
