import { useState, useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Settings as SettingsIcon, User, Eye, EyeOff, Trash2, Upload, X, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import { Progress } from '@/components/ui/progress';
import RequireProfile from '../components/auth/RequireProfile';
import { useGetCallerSettings, useUpdateDisplayName, useUpdateDisplayNameAndAvatar, useUpdateVisibility, useDeleteAvatar } from '../hooks/useAccountSettings';
import { useSessionAuth } from '../hooks/useSessionAuth';
import { useQueryClient } from '@tanstack/react-query';
import { ExternalBlob, Variant_offline_online } from '../backend';
import { toast } from 'sonner';

export default function Settings() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { logout } = useSessionAuth();
  const { data: settings, isLoading, error, isFetched } = useGetCallerSettings();
  
  const updateDisplayNameMutation = useUpdateDisplayName();
  const updateDisplayNameAndAvatarMutation = useUpdateDisplayNameAndAvatar();
  const updateVisibilityMutation = useUpdateVisibility();
  const deleteAvatarMutation = useDeleteAvatar();

  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const isEditingRef = useRef(false);

  // Sync displayName from fetched settings
  useEffect(() => {
    if (settings && !isEditingRef.current) {
      setDisplayName(settings.displayName);
    }
  }, [settings]);

  // Track when user is actively editing
  const handleDisplayNameChange = (value: string) => {
    isEditingRef.current = true;
    setDisplayName(value);
  };

  // Reset editing flag after successful mutation
  useEffect(() => {
    if (updateDisplayNameMutation.isSuccess) {
      isEditingRef.current = false;
    }
  }, [updateDisplayNameMutation.isSuccess]);

  if (isLoading) {
    return (
      <RequireProfile>
        <div className="container py-8">
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </div>
      </RequireProfile>
    );
  }

  if (error) {
    return (
      <RequireProfile>
        <div className="container py-8">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Failed to load settings</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>Failed to load settings. Please try again later.</p>
              {error.message && (
                <p className="text-sm font-mono bg-destructive/10 p-2 rounded border border-destructive/20 mt-2">
                  Error details: {error.message}
                </p>
              )}
            </AlertDescription>
          </Alert>
        </div>
      </RequireProfile>
    );
  }

  // Settings should always be non-null after successful fetch
  if (!settings) {
    return (
      <RequireProfile>
        <div className="container py-8">
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </div>
      </RequireProfile>
    );
  }

  const avatarUrl = settings.avatar?.getDirectURL();
  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  // Calculate cooldown status
  const now = Date.now() * 1000000; // Convert to nanoseconds
  const ONE_DAY_NS = BigInt(86400000000000);
  const SEVEN_DAYS_NS = BigInt(7 * 86400000000000);

  const canChangeDisplayName = now >= Number(settings.lastDisplayNameChange) + Number(ONE_DAY_NS);
  const canChangePassword = now >= Number(settings.lastPasswordChange) + Number(ONE_DAY_NS);
  const canChangeUsername = now >= Number(settings.lastUsernameChange) + Number(SEVEN_DAYS_NS);

  const getTimeRemaining = (lastChange: bigint, cooldownNs: bigint): string => {
    const nextAvailable = Number(lastChange) + Number(cooldownNs);
    const remaining = nextAvailable - now;
    if (remaining <= 0) return '';
    
    const hours = Math.floor(remaining / 3600000000000);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''}`;
    }
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  };

  const handleUpdateDisplayName = async () => {
    if (!displayName.trim() || displayName === settings.displayName) {
      return;
    }

    try {
      await updateDisplayNameMutation.mutateAsync(displayName.trim());
      toast.success('Display name updated successfully');
    } catch (err: any) {
      const message = err.message || 'Failed to update display name';
      toast.error(message);
    }
  };

  const handleUpdatePassword = async () => {
    if (!password.trim()) {
      toast.error('Please enter a new password');
      return;
    }

    // Note: Backend doesn't have password update yet, this is a placeholder
    toast.error('Password update not yet implemented');
    setPassword('');
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      await updateDisplayNameAndAvatarMutation.mutateAsync({
        displayName: settings.displayName,
        avatar: blob,
      });

      toast.success('Profile picture updated successfully');
    } catch (err: any) {
      const message = err.message || 'Failed to upload avatar';
      toast.error(message);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      await deleteAvatarMutation.mutateAsync();
      toast.success('Profile picture removed');
    } catch (err: any) {
      const message = err.message || 'Failed to remove avatar';
      toast.error(message);
    }
  };

  const handleVisibilityToggle = async (checked: boolean) => {
    const newVisibility: Variant_offline_online = checked 
      ? Variant_offline_online.offline 
      : Variant_offline_online.online;

    try {
      await updateVisibilityMutation.mutateAsync(newVisibility);
      toast.success(`You now appear ${checked ? 'offline' : 'online'}`);
    } catch (err: any) {
      const message = err.message || 'Failed to update visibility';
      toast.error(message);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    try {
      // Note: Backend doesn't have delete account yet
      toast.error('Account deletion not yet implemented');
      
      // When implemented, this should:
      // 1. Call backend delete method
      // 2. Clear all queries
      // 3. Logout
      // 4. Redirect to home
      
      // await deleteAccountMutation.mutateAsync();
      // queryClient.clear();
      // await logout();
      // navigate({ to: '/' });
    } catch (err: any) {
      const message = err.message || 'Failed to delete account';
      toast.error(message);
    }
  };

  return (
    <RequireProfile>
      <div className="container py-8 max-w-4xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground mt-1">
              Manage your account and preferences
            </p>
          </div>

          {/* Profile Picture Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Picture
              </CardTitle>
              <CardDescription>
                Upload a custom avatar or use a letter avatar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  {avatarUrl && <AvatarImage src={avatarUrl} alt={settings.displayName} />}
                  <AvatarFallback className="text-3xl">
                    {getInitials(settings.displayName)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-3">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => document.getElementById('avatar-upload')?.click()}
                      disabled={isUploading || updateDisplayNameAndAvatarMutation.isPending}
                    >
                      <Upload className="h-4 w-4" />
                      Upload Image
                    </Button>
                    
                    {settings.avatar && (
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={handleRemoveAvatar}
                        disabled={deleteAvatarMutation.isPending}
                      >
                        <X className="h-4 w-4" />
                        Remove
                      </Button>
                    )}
                  </div>
                  
                  {isUploading && (
                    <div className="space-y-2">
                      <Progress value={uploadProgress} />
                      <p className="text-sm text-muted-foreground">
                        Uploading... {uploadProgress}%
                      </p>
                    </div>
                  )}
                  
                  <p className="text-sm text-muted-foreground">
                    Recommended: Square image, max 5MB
                  </p>
                </div>
              </div>
              
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </CardContent>
          </Card>

          {/* Username Section */}
          <Card>
            <CardHeader>
              <CardTitle>Username</CardTitle>
              <CardDescription>
                Your unique identifier (can be changed every 7 days)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={settings.username}
                  disabled
                  className="bg-muted"
                />
              </div>
              
              {!canChangeUsername && (
                <Alert>
                  <AlertDescription>
                    You can change your username again in {getTimeRemaining(settings.lastUsernameChange, SEVEN_DAYS_NS)}
                  </AlertDescription>
                </Alert>
              )}
              
              <p className="text-sm text-muted-foreground">
                Username changes are limited to once every 7 days
              </p>
            </CardContent>
          </Card>

          {/* Display Name Section */}
          <Card>
            <CardHeader>
              <CardTitle>Display Name</CardTitle>
              <CardDescription>
                Your public display name (can be changed every day)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => handleDisplayNameChange(e.target.value)}
                  disabled={!canChangeDisplayName || updateDisplayNameMutation.isPending}
                  placeholder="Enter your display name"
                />
              </div>
              
              {!canChangeDisplayName && (
                <Alert>
                  <AlertDescription>
                    You can change your display name again in {getTimeRemaining(settings.lastDisplayNameChange, ONE_DAY_NS)}
                  </AlertDescription>
                </Alert>
              )}
              
              <Button
                onClick={handleUpdateDisplayName}
                disabled={!canChangeDisplayName || updateDisplayNameMutation.isPending || displayName === settings.displayName}
              >
                {updateDisplayNameMutation.isPending ? 'Updating...' : 'Update Display Name'}
              </Button>
            </CardContent>
          </Card>

          {/* Password Section */}
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>
                Change your account password (can be changed every day)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> If you forget your password, you will lose access to your account and have to start over. Make sure to remember it!
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={!canChangePassword}
                  placeholder="Enter new password"
                />
              </div>
              
              {!canChangePassword && (
                <Alert>
                  <AlertDescription>
                    You can change your password again in {getTimeRemaining(settings.lastPasswordChange, ONE_DAY_NS)}
                  </AlertDescription>
                </Alert>
              )}
              
              <Button
                onClick={handleUpdatePassword}
                disabled={!canChangePassword || !password.trim()}
                variant="outline"
              >
                Update Password
              </Button>
            </CardContent>
          </Card>

          {/* Visibility Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {settings.visibility === Variant_offline_online.offline ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
                Visibility
              </CardTitle>
              <CardDescription>
                Control whether you appear online to other users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="appear-offline">Appear Offline</Label>
                  <p className="text-sm text-muted-foreground">
                    Hide your online status from other users
                  </p>
                </div>
                <Switch
                  id="appear-offline"
                  checked={settings.visibility === Variant_offline_online.offline}
                  onCheckedChange={handleVisibilityToggle}
                  disabled={updateVisibilityMutation.isPending}
                />
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Danger Zone */}
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Warning:</strong> Deleting your account is permanent and cannot be undone. All your data, experiences, and progress will be lost forever.
                </AlertDescription>
              </Alert>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-4">
                      <p>
                        This action cannot be undone. This will permanently delete your account
                        and remove all your data from our servers.
                      </p>
                      <div className="space-y-2">
                        <Label htmlFor="delete-confirm">
                          Type <strong>DELETE</strong> to confirm
                        </Label>
                        <Input
                          id="delete-confirm"
                          value={deleteConfirmText}
                          onChange={(e) => setDeleteConfirmText(e.target.value)}
                          placeholder="DELETE"
                        />
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setDeleteConfirmText('')}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={deleteConfirmText !== 'DELETE'}
                    >
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </RequireProfile>
  );
}
