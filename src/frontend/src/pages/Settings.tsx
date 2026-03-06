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
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  Camera,
  Eye,
  Globe,
  Loader2,
  Lock,
  LogIn,
  Moon,
  Sun,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  Gender,
  Language,
  TextDirection,
  Variant_offline_online,
} from "../backend";
import { useTranslationContext } from "../contexts/TranslationContext";
import {
  getCurrentUsername,
  getLocalSettings,
  useDeleteAccount,
  useGetCallerSettings,
  useSetGender,
  useSetLanguage,
  useUpdateAvatar,
  useUpdateDisplayName,
  useUpdateVisibility,
} from "../hooks/useAccountSettings";
import { useSessionAuth } from "../hooks/useSessionAuth";
import { useTranslation } from "../hooks/useTranslation";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function formatCooldown(remainingMs: number): string {
  const hours = Math.ceil(remainingMs / (60 * 60 * 1000));
  if (hours >= 24) {
    const days = Math.ceil(hours / 24);
    return `${days} day(s)`;
  }
  return `${hours} hour(s)`;
}

export default function Settings() {
  const { isAuthenticated, logout, changePassword } = useSessionAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { setLanguage: setContextLanguage } = useTranslationContext();
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isLoading: isLoadingSettings } = useGetCallerSettings();
  const updateDisplayNameMutation = useUpdateDisplayName();
  const updateVisibilityMutation = useUpdateVisibility();
  const setLanguageMutation = useSetLanguage();
  const setGenderMutation = useSetGender();
  const deleteAccountMutation = useDeleteAccount();
  const updateAvatarMutation = useUpdateAvatar();

  // Profile picture state
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Username state
  const [newUsername, setNewUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [isChangingUsername, setIsChangingUsername] = useState(false);

  // Display name state
  const [newDisplayName, setNewDisplayName] = useState("");
  const [displayNameError, setDisplayNameError] = useState("");

  // Change password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Delete account confirmation
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const username = getCurrentUsername();
  const rawSettings = username ? getLocalSettings(username) : null;

  // Cooldown checks
  const now = Date.now();
  const usernameCooldownRemaining = rawSettings
    ? Math.max(0, SEVEN_DAYS_MS - (now - (rawSettings.lastUsernameChange || 0)))
    : 0;
  const displayNameCooldownRemaining = rawSettings
    ? Math.max(0, ONE_DAY_MS - (now - (rawSettings.lastDisplayNameChange || 0)))
    : 0;
  const canChangeUsername = usernameCooldownRemaining === 0;
  const canChangeDisplayName = displayNameCooldownRemaining === 0;

  if (!isAuthenticated) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-8"
        data-ocid="settings.page"
      >
        <div className="text-center space-y-3">
          <LogIn className="w-12 h-12 mx-auto text-muted-foreground" />
          <h2 className="text-2xl font-bold">Login Required</h2>
          <p className="text-muted-foreground max-w-sm">
            Please log in to view and manage your account settings.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            data-ocid="settings.login.button"
            onClick={() => navigate({ to: "/login" })}
          >
            Log In
          </Button>
          <Button
            data-ocid="settings.signup.button"
            variant="outline"
            onClick={() => navigate({ to: "/signup" })}
          >
            Sign Up
          </Button>
        </div>
      </div>
    );
  }

  if (isLoadingSettings) {
    return (
      <div
        className="flex items-center justify-center min-h-[60vh]"
        data-ocid="settings.loading_state"
      >
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(t("settings.avatar.invalidType"));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("settings.avatar.tooLarge"));
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      await updateAvatarMutation.mutateAsync(dataUrl);
      toast.success(t("settings.avatar.success"));
    } catch {
      toast.error(t("settings.avatar.error"));
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveAndReupload = async () => {
    try {
      await updateAvatarMutation.mutateAsync(null);
      // After clearing, open file picker so user can upload a new one
      setTimeout(() => {
        fileInputRef.current?.click();
      }, 100);
    } catch {
      toast.error(t("settings.avatar.removeError"));
    }
  };

  const handleUsernameChange = async () => {
    setUsernameError("");
    if (!newUsername.trim()) {
      setUsernameError("Username is required");
      return;
    }
    if (newUsername.trim().length < 3) {
      setUsernameError("Username must be at least 3 characters");
      return;
    }
    if (!canChangeUsername) {
      setUsernameError(
        `You can change your username in ${formatCooldown(usernameCooldownRemaining)}`,
      );
      return;
    }
    setIsChangingUsername(true);
    try {
      const uname = getCurrentUsername();
      if (!uname) throw new Error("Not authenticated");

      // Check if new username is taken
      const usersRaw = localStorage.getItem("diniverse_users");
      const users = usersRaw ? JSON.parse(usersRaw) : {};
      if (users[newUsername.trim()]) {
        throw new Error("Username already taken");
      }

      // Migrate user record
      const oldSettings = getLocalSettings(uname);
      const newUname = newUsername.trim();

      // Create new user record
      users[newUname] = { ...users[uname] };
      delete users[uname];
      localStorage.setItem("diniverse_users", JSON.stringify(users));

      // Migrate settings
      const newSettings = {
        ...oldSettings,
        username: newUname,
        lastUsernameChange: Date.now(),
      };
      localStorage.setItem(
        `diniverse_settings_${newUname}`,
        JSON.stringify(newSettings),
      );
      localStorage.removeItem(`diniverse_settings_${uname}`);

      // Re-issue session token
      const token = `${newUname}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      localStorage.setItem("diniverse_session_token", token);

      setNewUsername("");
      toast.success("Username updated — please log in again");
      await logout();
      navigate({ to: "/login" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Update failed";
      setUsernameError(msg);
      toast.error(msg);
    } finally {
      setIsChangingUsername(false);
    }
  };

  const handleUpdateDisplayName = async () => {
    if (!newDisplayName.trim()) {
      setDisplayNameError("Display name is required");
      return;
    }
    if (newDisplayName.trim().length < 2) {
      setDisplayNameError("Display name must be at least 2 characters");
      return;
    }
    setDisplayNameError("");
    try {
      await updateDisplayNameMutation.mutateAsync(newDisplayName.trim());
      setNewDisplayName("");
      toast.success(t("settings.displayName.success"));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Update failed";
      toast.error(msg);
    }
  };

  const handleVisibilityChange = async (checked: boolean) => {
    try {
      await updateVisibilityMutation.mutateAsync(
        checked
          ? Variant_offline_online.offline
          : Variant_offline_online.online,
      );
      const msg = checked
        ? t("settings.visibility.offline")
        : t("settings.visibility.online");
      toast.success(msg);
    } catch {
      toast.error(t("settings.visibility.error"));
    }
  };

  const handleLanguageChange = async (lang: string) => {
    try {
      const langEnum = lang as Language;
      await setLanguageMutation.mutateAsync({
        language: langEnum,
        languageCode: lang,
        languagePrefix: lang,
        textDirection: TextDirection.leftToRight,
        nativeLanguage: langEnum,
      });
      // Update translation context immediately
      setContextLanguage(langEnum);
      toast.success(t("settings.language.success"));
    } catch {
      toast.error(t("settings.language.error"));
    }
  };

  const handleGenderChange = async (gender: string) => {
    try {
      await setGenderMutation.mutateAsync(gender as Gender);
      toast.success(t("settings.gender.success"));
    } catch {
      toast.error(t("settings.gender.error"));
    }
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    if (!currentPassword) {
      setPasswordError("Current password is required");
      return;
    }
    if (!newPassword) {
      setPasswordError("New password is required");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }
    setIsChangingPassword(true);
    try {
      await changePassword(currentPassword, newPassword, confirmPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password changed successfully");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to change password";
      setPasswordError(msg);
      toast.error(msg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      toast.error(t("settings.deleteAccount.confirmError"));
      return;
    }
    try {
      await deleteAccountMutation.mutateAsync();
      toast.success(t("settings.deleteAccount.success"));
      queryClient.clear();
      await logout();
      navigate({ to: "/" });
    } catch {
      toast.error(t("settings.deleteAccount.error"));
    }
  };

  const currentAvatarUrl = rawSettings?.avatarDataUrl ?? null;
  const currentDisplayName = rawSettings?.displayName || username || "User";
  const currentVisibilityIsOffline = rawSettings?.visibility === "offline";
  const currentLanguage = rawSettings?.language || Language.en;
  const currentGender = rawSettings?.gender || "other";

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6" data-ocid="settings.page">
      <div>
        <h1 className="text-3xl font-bold">{t("settings.title")}</h1>
        <p className="text-muted-foreground mt-1">{t("settings.subtitle")}</p>
      </div>

      {/* Profile Picture */}
      <Card data-ocid="settings.avatar.card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            {t("settings.avatar.title")}
          </CardTitle>
          <CardDescription>{t("settings.avatar.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-border">
              {currentAvatarUrl ? (
                <AvatarImage src={currentAvatarUrl} alt={currentDisplayName} />
              ) : null}
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {currentDisplayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                {currentAvatarUrl ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveAndReupload}
                    disabled={
                      updateAvatarMutation.isPending || isUploadingAvatar
                    }
                    data-ocid="settings.avatar.delete_button"
                  >
                    {updateAvatarMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-1" />
                        Removing...
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4 mr-1" />
                        Remove
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    data-ocid="settings.avatar.upload_button"
                  >
                    {isUploadingAvatar ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-1" />
                        {t("settings.avatar.uploading")}
                      </>
                    ) : (
                      <>
                        <Camera className="w-4 h-4 mr-1" />
                        {t("settings.avatar.upload")}
                      </>
                    )}
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("settings.avatar.recommendation")}
              </p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
            data-ocid="settings.avatar.dropzone"
          />
        </CardContent>
      </Card>

      {/* Username */}
      <Card data-ocid="settings.username.card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {t("settings.username.title")}
          </CardTitle>
          <CardDescription>
            {t("settings.username.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label>{t("settings.username.label")}</Label>
            <p className="text-sm font-mono bg-muted px-3 py-1.5 rounded">
              @{username}
            </p>
          </div>
          {canChangeUsername ? (
            <div className="space-y-2">
              <Label htmlFor="newUsername">New Username</Label>
              <div className="flex gap-2">
                <Input
                  id="newUsername"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Enter new username"
                  onKeyDown={(e) => e.key === "Enter" && handleUsernameChange()}
                  data-ocid="settings.username.input"
                />
                <Button
                  onClick={handleUsernameChange}
                  disabled={isChangingUsername}
                  data-ocid="settings.username.save_button"
                >
                  {isChangingUsername ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
              {usernameError && (
                <p
                  className="text-sm text-destructive"
                  data-ocid="settings.username.error_state"
                >
                  {usernameError}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t("settings.username.cooldown")}{" "}
              {formatCooldown(usernameCooldownRemaining)}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Display Name */}
      <Card data-ocid="settings.displayname.card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {t("settings.displayName.title")}
          </CardTitle>
          <CardDescription>
            {t("settings.displayName.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label>Current Display Name</Label>
            <p className="text-sm font-medium">{currentDisplayName}</p>
          </div>
          {canChangeDisplayName ? (
            <div className="space-y-2">
              <Label htmlFor="displayName">
                {t("settings.displayName.label")}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="displayName"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  placeholder={currentDisplayName}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleUpdateDisplayName()
                  }
                  data-ocid="settings.displayname.input"
                />
                <Button
                  onClick={handleUpdateDisplayName}
                  disabled={updateDisplayNameMutation.isPending}
                  data-ocid="settings.displayname.save_button"
                >
                  {updateDisplayNameMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
              {displayNameError && (
                <p
                  className="text-sm text-destructive"
                  data-ocid="settings.displayname.error_state"
                >
                  {displayNameError}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t("settings.displayName.cooldown")}{" "}
              {formatCooldown(displayNameCooldownRemaining)}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Offline Mode */}
      <Card data-ocid="settings.visibility.card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            {t("settings.visibility.title")}
          </CardTitle>
          <CardDescription>
            {t("settings.visibility.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                {t("settings.visibility.offlineMode")}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("settings.visibility.offlineModeDescription")}
              </p>
            </div>
            <Switch
              checked={currentVisibilityIsOffline}
              onCheckedChange={handleVisibilityChange}
              disabled={updateVisibilityMutation.isPending}
              data-ocid="settings.visibility.switch"
            />
          </div>
        </CardContent>
      </Card>

      {/* Language & Gender */}
      <Card data-ocid="settings.preferences.card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            {t("settings.language.title")} &amp; {t("settings.gender.title")}
          </CardTitle>
          <CardDescription>
            {t("settings.language.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("settings.language.label")}</Label>
            <Select
              value={currentLanguage}
              onValueChange={handleLanguageChange}
              disabled={setLanguageMutation.isPending}
            >
              <SelectTrigger data-ocid="settings.language.select">
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
            <Label>{t("settings.gender.label")}</Label>
            <Select
              value={currentGender}
              onValueChange={handleGenderChange}
              disabled={setGenderMutation.isPending}
            >
              <SelectTrigger data-ocid="settings.gender.select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Gender.female}>
                  {t("settings.gender.female")}
                </SelectItem>
                <SelectItem value={Gender.male}>
                  {t("settings.gender.male")}
                </SelectItem>
                <SelectItem value={Gender.other}>Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Theme */}
      <Card data-ocid="settings.theme.card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {theme === "dark" ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
            {t("settings.theme.title")}
          </CardTitle>
          <CardDescription>{t("settings.theme.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{t("settings.theme.darkMode")}</p>
              <p className="text-sm text-muted-foreground">
                {t("settings.theme.darkModeDescription")}
              </p>
            </div>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={(checked) =>
                setTheme(checked ? "dark" : "light")
              }
              data-ocid="settings.theme.switch"
            />
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card data-ocid="settings.password.card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            {t("settings.password.title")}
          </CardTitle>
          <CardDescription>
            {t("settings.password.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-3 flex gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div className="text-sm text-amber-800 dark:text-amber-300">
              <span className="font-semibold">
                {t("settings.password.warning.title")}
              </span>{" "}
              {t("settings.password.warning.message")}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              autoComplete="current-password"
              data-ocid="settings.password.input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              autoComplete="new-password"
              onKeyDown={(e) => e.key === "Enter" && handleChangePassword()}
            />
          </div>
          {passwordError && (
            <p
              className="text-sm text-destructive"
              data-ocid="settings.password.error_state"
            >
              {passwordError}
            </p>
          )}
          <Button
            onClick={handleChangePassword}
            disabled={isChangingPassword}
            className="w-full"
            data-ocid="settings.password.save_button"
          >
            {isChangingPassword ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Changing Password...
              </>
            ) : (
              "Change Password"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50" data-ocid="settings.danger.card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="w-5 h-5" />
            {t("settings.deleteAccount.dangerZone")}
          </CardTitle>
          <CardDescription>
            {t("settings.deleteAccount.dangerZoneDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Separator className="mb-4" />
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 mb-4 flex gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
            <div className="text-sm text-destructive">
              <span className="font-semibold">
                {t("settings.deleteAccount.warning.title")}
              </span>{" "}
              {t("settings.deleteAccount.warning.message")}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                {t("settings.deleteAccount.button")}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("settings.deleteAccount.confirmMessage")}
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  data-ocid="settings.delete.open_modal_button"
                >
                  {t("settings.deleteAccount.button")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent data-ocid="settings.delete.dialog">
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {t("settings.deleteAccount.confirmTitle")}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("settings.deleteAccount.confirmMessage")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-2 py-2">
                  <Label htmlFor="deleteConfirm">
                    {t("settings.deleteAccount.typeDelete")}
                  </Label>
                  <Input
                    id="deleteConfirm"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="DELETE"
                    data-ocid="settings.delete.input"
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    onClick={() => setDeleteConfirmText("")}
                    data-ocid="settings.delete.cancel_button"
                  >
                    {t("settings.deleteAccount.cancel")}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={
                      deleteAccountMutation.isPending ||
                      deleteConfirmText !== "DELETE"
                    }
                    data-ocid="settings.delete.confirm_button"
                  >
                    {deleteAccountMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        {t("settings.deleteAccount.deleting")}
                      </>
                    ) : (
                      t("settings.deleteAccount.confirm")
                    )}
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
