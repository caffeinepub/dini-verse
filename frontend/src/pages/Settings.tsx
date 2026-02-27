import { useState, useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Settings as SettingsIcon, User, Eye, EyeOff, Trash2, Upload, X, AlertTriangle, Moon, Sun, LogIn, UserPlus } from 'lucide-react';
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

const SUPPORTED_LANGUAGES: { value: Language; label: string }[] = [
  { value: Language.en, label: 'English' },
  { value: Language.es, label: 'Español' },
  { value: Language.fr, label: 'Français' },
  { value: Language.pt, label: 'Português' },
  { value: Language.de, label: 'Deutsch' },
  { value: Language.tr, label: 'Türkçe' },
  { value: Language.ru, label: 'Русский' },
  { value: Language.vi, label: 'Tiếng Việt' },
  { value: Language.ko, label: '한국어' },
  { value: Language.nl, label: 'Nederlands' },
];

const LANGUAGE_META: Record<Language, { code: string; prefix: string; direction: TextDirection }> = {
  [Language.en]: { code: 'en', prefix: 'en', direction: TextDirection.leftToRight },
  [Language.es]: { code: 'es', prefix: 'es', direction: TextDirection.leftToRight },
  [Language.fr]: { code: 'fr', prefix: 'fr', direction: TextDirection.leftToRight },
  [Language.pt]: { code: 'pt', prefix: 'pt', direction: TextDirection.leftToRight },
  [Language.de]: { code: 'de', prefix: 'de', direction: TextDirection.leftToRight },
  [Language.tr]: { code: 'tr', prefix: 'tr', direction: TextDirection.leftToRight },
  [Language.ru]: { code: 'ru', prefix: 'ru', direction: TextDirection.leftToRight },
  [Language.vi]: { code: 'vi', prefix: 'vi', direction: TextDirection.leftToRight },
  [Language.ko]: { code: 'ko', prefix: 'ko', direction: TextDirection.leftToRight },
  [Language.nl]: { code: 'nl', prefix: 'nl', direction: TextDirection.leftToRight },
};

function SettingsLoginPrompt() {
  const navigate = useNavigate();
  const { login, loginStatus } = useInternetIdentity();
  const { t } = useTranslation();
  const isLoggingIn = loginStatus === 'logging-in';

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <SettingsIcon className="w-7 h-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">{t('settings.title')}</h1>
          <p className="text-muted-foreground text-sm">{t('settings.subtitle')}</p>
        </div>
      </div>
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Authentication Required</CardTitle>
          <CardDescription>
            You need to be logged in to access your settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Please log in to your account to view and manage your account settings.
          </p>
          <div className="flex gap-2">
            <Button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="flex-1 gap-2"
            >
              <LogIn className="h-4 w-4" />
              {isLoggingIn ? 'Logging in...' : 'Log In'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { identity, clear: logout, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;

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
      setDisplayName(settings.displayName || '');
    }
  }, [settings]);

  const handleDisplayNameFocus = () => { isEditingRef.current = true; };
  const handleDisplayNameBlur = () => { isEditingRef.current = false; };

  const getAvatarUrl = () => {
    if (settings?.avatar) {
      return settings.avatar.getDirectURL();
    }
    return null;
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(t('settings.avatar.invalidType'));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('settings.avatar.tooLarge'));
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) => {
        setUploadProgress(pct);
      });

      await updateDisplayNameAndAvatarMutation.mutateAsync({
        displayName: settings?.displayName || displayName,
        avatar: blob,
      });
      toast.success(t('settings.avatar.success'));
    } catch (err: any) {
      toast.error(err?.message || t('settings.avatar.error'));
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
      toast.error(err?.message || t('settings.avatar.removeError'));
    }
  };

  const handleUpdateDisplayName = async () => {
    if (!displayName.trim()) return;
    try {
      await updateDisplayNameMutation.mutateAsync(displayName.trim());
      toast.success(t('settings.displayName.success'));
    } catch (err: any) {
      toast.error(err?.message || t('settings.displayName.error'));
    }
  };

  const handleGenderChange = async (value: string) => {
    try {
      await setGenderMutation.mutateAsync(value as Gender);
      toast.success(t('settings.gender.success'));
    } catch (err: any) {
      toast.error(err?.message || t('settings.gender.error'));
    }
  };

  const handleLanguageChange = async (value: string) => {
    const lang = value as Language;
    const meta = LANGUAGE_META[lang];
    if (!meta) return;
    try {
      await setLanguageMutation.mutateAsync({
        language: lang,
        languageCode: meta.code,
        languagePrefix: meta.prefix,
        textDirection: meta.direction,
        nativeLanguage: lang,
      });
      toast.success(t('settings.language.success'));
    } catch (err: any) {
      toast.error(err?.message || t('settings.language.error'));
    }
  };

  const handleVisibilityToggle = async (checked: boolean) => {
    const visibility = checked ? Variant_offline_online.offline : Variant_offline_online.online;
    try {
      await updateVisibilityMutation.mutateAsync(visibility);
      toast.success(checked ? t('settings.visibility.offline') : t('settings.visibility.online'));
    } catch (err: any) {
      toast.error(err?.message || t('settings.visibility.error'));
    }
  };

  const handlePasswordUpdate = () => {
    if (!password.trim()) {
      toast.error(t('settings.password.emptyError'));
      return;
    }
    toast.info(t('settings.password.notImplemented'));
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error(t('settings.deleteAccount.confirmError'));
      return;
    }
    try {
      await deleteAccountMutation.mutateAsync();
      toast.success(t('settings.deleteAccount.success'));
      await logout();
      queryClient.clear();
      navigate({ to: '/' });
    } catch (err: any) {
      toast.error(err?.message || t('settings.deleteAccount.error'));
    }
  };

  const getDisplayNameCooldownText = () => {
    if (!settings) return null;
    const now = BigInt(Date.now()) * 1_000_000n;
    const cooldownEnd = settings.lastDisplayNameChange + 86_400_000_000_000n;
    if (now < cooldownEnd) {
      const remaining = cooldownEnd - now;
      const hours = Number(remaining / 3_600_000_000_000n);
      const days = Math.floor(hours / 24);
      if (days > 0) return `${days} ${t('settings.time.days')}`;
      return `${hours} ${t('settings.time.hours')}`;
    }
    return null;
  };

  // Show loading while Internet Identity is initializing
  if (isInitializing) {
    return (
      <div className="container py-16">
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated via Internet Identity
  if (!isAuthenticated) {
    return <SettingsLoginPrompt />;
  }

  const displayNameCooldown = getDisplayNameCooldownText();
  const avatarUrl = getAvatarUrl();
  const isOffline = settings?.visibility === Variant_offline_online.offline;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <SettingsIcon className="w-7 h-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">{t('settings.title')}</h1>
          <p className="text-muted-foreground text-sm">{t('settings.subtitle')}</p>
        </div>
      </div>

      {error && isFetched && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t('settings.error.title')}</AlertTitle>
          <AlertDescription>
            {t('settings.error.description')}
            {error instanceof Error && (
              <details className="mt-2 text-xs">
                <summary>{t('settings.error.details')}</summary>
                <pre className="mt-1 whitespace-pre-wrap">{error.message}</pre>
              </details>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Profile Picture */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {t('settings.avatar.title')}
          </CardTitle>
          <CardDescription>{t('settings.avatar.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              {avatarUrl && <AvatarImage src={avatarUrl} alt="Avatar" />}
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {(settings?.displayName || 'U').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Label htmlFor="avatar-upload" className="cursor-pointer">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    disabled={isUploading || updateDisplayNameAndAvatarMutation.isPending}
                  >
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      {isUploading ? t('settings.avatar.uploading') : t('settings.avatar.upload')}
                    </span>
                  </Button>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={isUploading}
                  />
                </Label>
                {avatarUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveAvatar}
                    disabled={deleteAvatarMutation.isPending}
                  >
                    <X className="w-4 h-4 mr-2" />
                    {t('settings.avatar.remove')}
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{t('settings.avatar.recommendation')}</p>
            </div>
          </div>
          {isUploading && (
            <div className="space-y-1">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">{uploadProgress}%</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Display Name */}
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.displayName.title')}</CardTitle>
          <CardDescription>{t('settings.displayName.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="display-name">{t('settings.displayName.label')}</Label>
            <Input
              id="display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              onFocus={handleDisplayNameFocus}
              onBlur={handleDisplayNameBlur}
              disabled={!!displayNameCooldown || updateDisplayNameMutation.isPending}
            />
            {displayNameCooldown && (
              <p className="text-xs text-muted-foreground">
                {t('settings.displayName.cooldown')} {displayNameCooldown}
              </p>
            )}
          </div>
          <Button
            onClick={handleUpdateDisplayName}
            disabled={!!displayNameCooldown || updateDisplayNameMutation.isPending || !displayName.trim()}
          >
            {updateDisplayNameMutation.isPending
              ? t('settings.displayName.updating')
              : t('settings.displayName.update')}
          </Button>
        </CardContent>
      </Card>

      {/* Gender */}
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.gender.title')}</CardTitle>
          <CardDescription>{t('settings.gender.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>{t('settings.gender.label')}</Label>
            <Select
              value={settings?.gender || Gender.female}
              onValueChange={handleGenderChange}
              disabled={setGenderMutation.isPending}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Gender.male}>{t('settings.gender.male')}</SelectItem>
                <SelectItem value={Gender.female}>{t('settings.gender.female')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Language */}
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.language.title')}</CardTitle>
          <CardDescription>{t('settings.language.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>{t('settings.language.label')}</Label>
            <Select
              value={settings?.language || Language.en}
              onValueChange={handleLanguageChange}
              disabled={setLanguageMutation.isPending}
            >
              <SelectTrigger className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Theme */}
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.theme.title')}</CardTitle>
          <CardDescription>{t('settings.theme.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                {t('settings.theme.darkMode')}
              </Label>
              <p className="text-xs text-muted-foreground">{t('settings.theme.darkModeDescription')}</p>
            </div>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.password.title')}</CardTitle>
          <CardDescription>{t('settings.password.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{t('settings.password.warning.title')}</AlertTitle>
            <AlertDescription>{t('settings.password.warning.message')}</AlertDescription>
          </Alert>
          <div className="space-y-2">
            <Label htmlFor="password">{t('settings.password.label')}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('settings.password.placeholder')}
            />
          </div>
          <Button onClick={handlePasswordUpdate} variant="outline">
            {t('settings.password.update')}
          </Button>
        </CardContent>
      </Card>

      {/* Visibility */}
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.visibility.title')}</CardTitle>
          <CardDescription>{t('settings.visibility.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                {isOffline ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {isOffline ? t('settings.visibility.appearOffline') : t('settings.visibility.appearOnline')}
              </Label>
              <p className="text-xs text-muted-foreground">
                {isOffline ? t('settings.visibility.offlineDescription') : t('settings.visibility.onlineDescription')}
              </p>
            </div>
            <Switch
              checked={isOffline}
              onCheckedChange={handleVisibilityToggle}
              disabled={updateVisibilityMutation.isPending}
            />
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="w-5 h-5" />
            {t('settings.deleteAccount.title')}
          </CardTitle>
          <CardDescription>{t('settings.deleteAccount.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="w-4 h-4 mr-2" />
                {t('settings.deleteAccount.button')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('settings.deleteAccount.confirmTitle')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('settings.deleteAccount.confirmDescription')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-2 py-2">
                <Label htmlFor="delete-confirm">{t('settings.deleteAccount.typeDelete')}</Label>
                <Input
                  id="delete-confirm"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeleteConfirmText('')}>
                  {t('settings.deleteAccount.cancel')}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'DELETE' || deleteAccountMutation.isPending}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleteAccountMutation.isPending
                    ? t('settings.deleteAccount.deleting')
                    : t('settings.deleteAccount.confirm')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
