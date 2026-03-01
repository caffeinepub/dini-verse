import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useSessionAuth } from '../hooks/useSessionAuth';
import {
  useGetCallerSettings,
  useUpdateDisplayName,
  useUpdateVisibility,
  useSetLanguage,
  useSetGender,
  useDeleteAccount,
} from '../hooks/useAccountSettings';
import { useTranslation } from '../hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Loader2, User, Globe, Eye, Trash2, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { Language, TextDirection, Gender, Variant_offline_online } from '../backend';

export default function Settings() {
  const { isAuthenticated, logout } = useSessionAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data: settings, isLoading: isLoadingSettings } = useGetCallerSettings();
  const updateDisplayNameMutation = useUpdateDisplayName();
  const updateVisibilityMutation = useUpdateVisibility();
  const setLanguageMutation = useSetLanguage();
  const setGenderMutation = useSetGender();
  const deleteAccountMutation = useDeleteAccount();

  const [newDisplayName, setNewDisplayName] = useState('');
  const [displayNameError, setDisplayNameError] = useState('');

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-8">
        <div className="text-center space-y-3">
          <LogIn className="w-12 h-12 mx-auto text-muted-foreground" />
          <h2 className="text-2xl font-bold">Login Required</h2>
          <p className="text-muted-foreground max-w-sm">
            Please log in to view and manage your account settings.
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => navigate({ to: '/login' })}>Log In</Button>
          <Button variant="outline" onClick={() => navigate({ to: '/signup' })}>Sign Up</Button>
        </div>
      </div>
    );
  }

  if (isLoadingSettings) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleUpdateDisplayName = async () => {
    if (!newDisplayName.trim()) {
      setDisplayNameError('Display name is required');
      return;
    }
    if (newDisplayName.trim().length < 2) {
      setDisplayNameError('Display name must be at least 2 characters');
      return;
    }
    setDisplayNameError('');
    try {
      await updateDisplayNameMutation.mutateAsync(newDisplayName.trim());
      setNewDisplayName('');
      toast.success('Display name updated');
    } catch (err: any) {
      toast.error(err?.message || 'Update failed');
    }
  };

  const handleVisibilityChange = async (checked: boolean) => {
    try {
      await updateVisibilityMutation.mutateAsync(
        checked ? Variant_offline_online.online : Variant_offline_online.offline
      );
      toast.success('Visibility updated');
    } catch (err: any) {
      toast.error(err?.message || 'Update failed');
    }
  };

  const handleLanguageChange = async (lang: string) => {
    try {
      const langEnum = lang as Language;
      const langCodeMap: Record<Language, string> = {
        [Language.en]: 'en', [Language.es]: 'es', [Language.fr]: 'fr',
        [Language.pt]: 'pt', [Language.de]: 'de', [Language.tr]: 'tr',
        [Language.ru]: 'ru', [Language.vi]: 'vi', [Language.ko]: 'ko',
        [Language.nl]: 'nl',
      };
      const code = langCodeMap[langEnum] || 'en';
      await setLanguageMutation.mutateAsync({
        language: langEnum,
        languageCode: code,
        languagePrefix: code,
        textDirection: TextDirection.leftToRight,
        nativeLanguage: langEnum,
      });
      toast.success('Language updated');
    } catch (err: any) {
      toast.error(err?.message || 'Update failed');
    }
  };

  const handleGenderChange = async (gender: string) => {
    try {
      await setGenderMutation.mutateAsync(gender as Gender);
      toast.success('Gender updated');
    } catch (err: any) {
      toast.error(err?.message || 'Update failed');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccountMutation.mutateAsync();
      toast.success('Account deleted');
      await logout();
      navigate({ to: '/' });
    } catch (err: any) {
      toast.error(err?.message || 'Delete failed');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account preferences</p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile
          </CardTitle>
          <CardDescription>Update your profile information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>Current Display Name</Label>
            <p className="text-sm font-medium">{settings?.displayName || '—'}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="displayName">New Display Name</Label>
            <div className="flex gap-2">
              <Input
                id="displayName"
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
                placeholder="Enter new display name"
                onKeyDown={(e) => e.key === 'Enter' && handleUpdateDisplayName()}
              />
              <Button
                onClick={handleUpdateDisplayName}
                disabled={updateDisplayNameMutation.isPending}
              >
                {updateDisplayNameMutation.isPending
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : 'Save'}
              </Button>
            </div>
            {displayNameError && (
              <p className="text-sm text-destructive">{displayNameError}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Visibility Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Visibility
          </CardTitle>
          <CardDescription>Control who can see your online status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Online Status</p>
              <p className="text-sm text-muted-foreground">Show as online to other users</p>
            </div>
            <Switch
              checked={settings?.visibility === Variant_offline_online.online}
              onCheckedChange={handleVisibilityChange}
              disabled={updateVisibilityMutation.isPending}
            />
          </div>
        </CardContent>
      </Card>

      {/* Language & Gender Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Language & Gender
          </CardTitle>
          <CardDescription>Choose your preferred language and gender</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Interface Language</Label>
            <Select
              value={settings?.language || Language.en}
              onValueChange={handleLanguageChange}
              disabled={setLanguageMutation.isPending}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Language.en}>English</SelectItem>
                <SelectItem value={Language.es}>Español</SelectItem>
                <SelectItem value={Language.fr}>Français</SelectItem>
                <SelectItem value={Language.pt}>Português</SelectItem>
                <SelectItem value={Language.de}>Deutsch</SelectItem>
                <SelectItem value={Language.tr}>Türkçe</SelectItem>
                <SelectItem value={Language.ru}>Русский</SelectItem>
                <SelectItem value={Language.vi}>Tiếng Việt</SelectItem>
                <SelectItem value={Language.ko}>한국어</SelectItem>
                <SelectItem value={Language.nl}>Nederlands</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Gender</Label>
            <Select
              value={settings?.gender || Gender.female}
              onValueChange={handleGenderChange}
              disabled={setGenderMutation.isPending}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Gender.female}>Female</SelectItem>
                <SelectItem value={Gender.male}>Male</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="w-5 h-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible and destructive actions</CardDescription>
        </CardHeader>
        <CardContent>
          <Separator className="mb-4" />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Delete Account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all data
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. Your account and all associated data will be
                    permanently deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={deleteAccountMutation.isPending}
                  >
                    {deleteAccountMutation.isPending
                      ? <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      : null}
                    Yes, delete my account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
