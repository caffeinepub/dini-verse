import { useState, useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Settings as SettingsIcon, User, Eye, EyeOff, Trash2, Upload, X, AlertTriangle, Moon, Sun } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import RequireProfile from '../components/auth/RequireProfile';
import { 
  useGetCallerSettings, 
  useUpdateDisplayName, 
  useUpdateDisplayNameAndAvatar, 
  useUpdateVisibility, 
  useDeleteAvatar,
  useDeleteAccount,
  useSetGender,
  useSetLanguage
} from '../hooks/useAccountSettings';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { ExternalBlob, Variant_offline_online, Gender, Language, TextDirection } from '../backend';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import { useTranslation } from '../hooks/useTranslation';

export default function Settings() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { clear: logout } = useInternetIdentity();
  const { data: settings, isLoading, error, isFetched } = useGetCallerSettings();
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  
  const updateDisplayNameMutation = useUpdateDisplayName();
  const updateDisplayNameAndAvatarMutation = useUpdateDisplayNameAndAvatar();
  const updateVisibilityMutation = useUpdateVisibility();
  const deleteAvatarMutation = useDeleteAvatar();
  const deleteAccountMutation = useDeleteAccount();
  const setGenderMutation = useSetGender();
  const setLanguageMutation = useSetLanguage();

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
            <AlertTitle>{t('settings.error.title')}</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>{t('settings.error.description')}</p>
              {error.message && (
                <p className="text-sm font-mono bg-destructive/10 p-2 rounded border border-destructive/20 mt-2">
                  {t('settings.error.details')}: {error.message}
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
      return `${days} ${t('settings.time.days')}`;
    }
    return `${hours} ${t('settings.time.hours')}`;
  };

  const handleUpdateDisplayName = async () => {
    if (!displayName.trim() || displayName === settings.displayName) {
      return;
    }

    try {
      await updateDisplayNameMutation.mutateAsync(displayName.trim());
      toast.success(t('settings.displayName.success'));
    } catch (err: any) {
      const message = err.message || t('settings.displayName.error');
      toast.error(message);
    }
  };

  const handleUpdatePassword = async () => {
    if (!password.trim()) {
      toast.error(t('settings.password.emptyError'));
      return;
    }

    // Note: Backend doesn't have password update yet, this is a placeholder
    toast.error(t('settings.password.notImplemented'));
    setPassword('');
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(t('settings.avatar.invalidType'));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('settings.avatar.tooLarge'));
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

      toast.success(t('settings.avatar.success'));
    } catch (err: any) {
      const message = err.message || t('settings.avatar.error');
      toast.error(message);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      await deleteAvatarMutation.mutateAsync();
      toast.success(t('settings.avatar.removed'));
    } catch (err: any) {
      const message = err.message || t('settings.avatar.removeError');
      toast.error(message);
    }
  };

  const handleVisibilityToggle = async (checked: boolean) => {
    const newVisibility: Variant_offline_online = checked 
      ? Variant_offline_online.offline 
      : Variant_offline_online.online;

    try {
      await updateVisibilityMutation.mutateAsync(newVisibility);
      toast.success(t(checked ? 'settings.visibility.offline' : 'settings.visibility.online'));
    } catch (err: any) {
      const message = err.message || t('settings.visibility.error');
      toast.error(message);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error(t('settings.deleteAccount.confirmError'));
      return;
    }

    try {
      await deleteAccountMutation.mutateAsync();
      toast.success(t('settings.deleteAccount.success'));
      
      // Clear all queries and logout
      queryClient.clear();
      await logout();
      navigate({ to: '/' });
    } catch (err: any) {
      const message = err.message || t('settings.deleteAccount.error');
      toast.error(message);
    }
  };

  const handleGenderChange = async (value: string) => {
    const gender = value === 'male' ? Gender.male : Gender.female;
    try {
      await setGenderMutation.mutateAsync(gender);
      toast.success(t('settings.gender.success'));
    } catch (err: any) {
      const message = err.message || t('settings.gender.error');
      toast.error(message);
    }
  };

  const handleLanguageChange = async (value: string) => {
    const languageMap: Record<string, { 
      language: Language; 
      code: string; 
      prefix: string; 
      direction: TextDirection;
      native: Language;
    }> = {
      'english': { 
        language: Language.english, 
        code: 'en', 
        prefix: 'en', 
        direction: TextDirection.leftToRight,
        native: Language.english
      },
      'german': { 
        language: Language.german, 
        code: 'de', 
        prefix: 'de', 
        direction: TextDirection.leftToRight,
        native: Language.german
      },
    };

    const langConfig = languageMap[value];
    if (!langConfig) return;

    try {
      await setLanguageMutation.mutateAsync({
        language: langConfig.language,
        languageCode: langConfig.code,
        languagePrefix: langConfig.prefix,
        textDirection: langConfig.direction,
        nativeLanguage: langConfig.native,
      });
      toast.success(t('settings.language.success'));
    } catch (err: any) {
      const message = err.message || t('settings.language.error');
      toast.error(message);
    }
  };

  const handleThemeToggle = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

  return (
    <RequireProfile>
      <div className="container py-8 max-w-4xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">{t('settings.title')}</h1>
            <p className="text-muted-foreground mt-1">
              {t('settings.subtitle')}
            </p>
          </div>

          {/* Profile Picture Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {t('settings.avatar.title')}
              </CardTitle>
              <CardDescription>
                {t('settings.avatar.description')}
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
                      {t('settings.avatar.upload')}
                    </Button>
                    
                    {settings.avatar && (
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={handleRemoveAvatar}
                        disabled={deleteAvatarMutation.isPending}
                      >
                        <X className="h-4 w-4" />
                        {t('settings.avatar.remove')}
                      </Button>
                    )}
                  </div>
                  
                  {isUploading && (
                    <div className="space-y-2">
                      <Progress value={uploadProgress} />
                      <p className="text-sm text-muted-foreground">
                        {t('settings.avatar.uploading')} {uploadProgress}%
                      </p>
                    </div>
                  )}
                  
                  <p className="text-sm text-muted-foreground">
                    {t('settings.avatar.recommendation')}
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
              <CardTitle>{t('settings.username.title')}</CardTitle>
              <CardDescription>
                {t('settings.username.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">{t('settings.username.label')}</Label>
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
                    {t('settings.username.cooldown')} {getTimeRemaining(settings.lastUsernameChange, SEVEN_DAYS_NS)}
                  </AlertDescription>
                </Alert>
              )}
              
              <p className="text-sm text-muted-foreground">
                {t('settings.username.limit')}
              </p>
            </CardContent>
          </Card>

          {/* Display Name Section */}
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.displayName.title')}</CardTitle>
              <CardDescription>
                {t('settings.displayName.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">{t('settings.displayName.label')}</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => handleDisplayNameChange(e.target.value)}
                  disabled={!canChangeDisplayName || updateDisplayNameMutation.isPending}
                  placeholder={settings.displayName}
                />
              </div>
              
              {!canChangeDisplayName && (
                <Alert>
                  <AlertDescription>
                    {t('settings.displayName.cooldown')} {getTimeRemaining(settings.lastDisplayNameChange, ONE_DAY_NS)}
                  </AlertDescription>
                </Alert>
              )}
              
              <Button
                onClick={handleUpdateDisplayName}
                disabled={!canChangeDisplayName || updateDisplayNameMutation.isPending || displayName === settings.displayName}
              >
                {updateDisplayNameMutation.isPending ? t('settings.displayName.updating') : t('settings.displayName.update')}
              </Button>
            </CardContent>
          </Card>

          {/* Gender Section */}
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.gender.title')}</CardTitle>
              <CardDescription>
                {t('settings.gender.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gender">{t('settings.gender.label')}</Label>
                <Select 
                  value={settings.gender === Gender.male ? 'male' : 'female'}
                  onValueChange={handleGenderChange}
                  disabled={setGenderMutation.isPending}
                >
                  <SelectTrigger id="gender">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">{t('settings.gender.male')}</SelectItem>
                    <SelectItem value="female">{t('settings.gender.female')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Language Section */}
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.language.title')}</CardTitle>
              <CardDescription>
                {t('settings.language.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language">{t('settings.language.label')}</Label>
                <Select 
                  value={settings.language === Language.english ? 'english' : 'german'}
                  onValueChange={handleLanguageChange}
                  disabled={setLanguageMutation.isPending}
                >
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="german">Deutsch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Theme Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                {t('settings.theme.title')}
              </CardTitle>
              <CardDescription>
                {t('settings.theme.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode">{t('settings.theme.darkMode')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.theme.darkModeDescription')}
                  </p>
                </div>
                <Switch
                  id="dark-mode"
                  checked={theme === 'dark'}
                  onCheckedChange={handleThemeToggle}
                />
              </div>
            </CardContent>
          </Card>

          {/* Password Section */}
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.password.title')}</CardTitle>
              <CardDescription>
                {t('settings.password.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{t('settings.password.warning.title')}</strong> {t('settings.password.warning.message')}
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Label htmlFor="password">{t('settings.password.label')}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={!canChangePassword}
                  placeholder={t('settings.password.placeholder')}
                />
              </div>
              
              {!canChangePassword && (
                <Alert>
                  <AlertDescription>
                    {t('settings.password.cooldown')} {getTimeRemaining(settings.lastPasswordChange, ONE_DAY_NS)}
                  </AlertDescription>
                </Alert>
              )}
              
              <Button
                onClick={handleUpdatePassword}
                disabled={!canChangePassword || !password.trim()}
                variant="outline"
              >
                {t('settings.password.update')}
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
                {t('settings.visibility.title')}
              </CardTitle>
              <CardDescription>
                {t('settings.visibility.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="appear-offline">{t('settings.visibility.offlineMode')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.visibility.offlineModeDescription')}
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
                {t('settings.deleteAccount.dangerZone')}
              </CardTitle>
              <CardDescription>
                {t('settings.deleteAccount.dangerZoneDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{t('settings.deleteAccount.warning.title')}</strong> {t('settings.deleteAccount.warning.message')}
                </AlertDescription>
              </Alert>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    {t('settings.deleteAccount.button')}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('settings.deleteAccount.confirmTitle')}</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-4">
                      <p>{t('settings.deleteAccount.confirmMessage')}</p>
                      <div className="space-y-2">
                        <Label htmlFor="delete-confirm">{t('settings.deleteAccount.typeDelete')}</Label>
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
                      {t('settings.deleteAccount.cancel')}
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirmText !== 'DELETE' || deleteAccountMutation.isPending}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {deleteAccountMutation.isPending ? t('settings.deleteAccount.deleting') : t('settings.deleteAccount.confirm')}
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
