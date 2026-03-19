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
  Bell,
  Camera,
  Eye,
  Gift,
  Globe,
  Loader2,
  Lock,
  LogIn,
  Moon,
  Share2,
  Shield,
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
  saveLocalSettings,
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
import {
  type NotificationPrefs,
  type PrivacySettings,
  type SocialLink,
  getDiniBucks,
  getNotificationPrefs,
  getPrivacySettings,
  getSocialLinks,
  getCurrentUser as getSocialUser,
  redeemPromoCode,
  saveNotificationPrefs,
  savePrivacySettings,
  saveSocialLinks,
} from "../utils/socialStorage";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const SOCIAL_PLATFORMS = [
  { id: "youtube", label: "YouTube", color: "#FF0000" },
  { id: "tiktok", label: "TikTok", color: "#000000" },
  { id: "discord", label: "Discord", color: "#5865F2" },
  { id: "twitch", label: "Twitch", color: "#9146FF" },
  { id: "instagram", label: "Instagram", color: "#E1306C" },
  { id: "twitter", label: "Twitter/X", color: "#000000" },
  { id: "facebook", label: "Facebook", color: "#1877F2" },
  { id: "spotify", label: "Spotify", color: "#1DB954" },
  { id: "other", label: "Other", color: "#6b7280" },
] as const;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const COUNTRIES = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Argentina",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bangladesh",
  "Belarus",
  "Belgium",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Brazil",
  "Bulgaria",
  "Cambodia",
  "Canada",
  "Chile",
  "China",
  "Colombia",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Czech Republic",
  "Denmark",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Estonia",
  "Ethiopia",
  "Finland",
  "France",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Guatemala",
  "Honduras",
  "Hungary",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kuwait",
  "Latvia",
  "Lebanon",
  "Lithuania",
  "Malaysia",
  "Mexico",
  "Morocco",
  "Myanmar",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nigeria",
  "North Korea",
  "Norway",
  "Pakistan",
  "Panama",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Puerto Rico",
  "Qatar",
  "Romania",
  "Russia",
  "Saudi Arabia",
  "Serbia",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "South Africa",
  "South Korea",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Thailand",
  "Tunisia",
  "Turkey",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zimbabwe",
];

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
  const [showUsernameEdit, setShowUsernameEdit] = useState(false);
  const [showPasswordEdit, setShowPasswordEdit] = useState(false);

  // Display name state
  const [newDisplayName, setNewDisplayName] = useState("");
  const [displayNameError, setDisplayNameError] = useState("");
  const [showDisplayNameEdit, setShowDisplayNameEdit] = useState(false);

  // Birthday state — lazy-initialized from localStorage
  const [birthday, setBirthday] = useState(() => {
    const uname = getCurrentUsername();
    const saved = uname ? getLocalSettings(uname) : null;
    if (saved?.birthday) {
      const parts = saved.birthday.split("-");
      if (parts.length === 3) {
        const [yr, mo, dy] = parts;
        return {
          year: yr,
          month: String(Number.parseInt(mo, 10)),
          day: String(Number.parseInt(dy, 10)),
        };
      }
    }
    return { month: "", day: "", year: "" };
  });

  // Change password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Delete account confirmation
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Promo code state
  const [promoCode, setPromoCode] = useState("");
  const [isRedeemingPromo, setIsRedeemingPromo] = useState(false);
  const [diniBucksBalance, setDiniBucksBalance] = useState<number | null>(null);

  const username = getCurrentUsername();
  const rawSettings = username ? getLocalSettings(username) : null;

  // Social Networks state
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(() =>
    username ? getSocialLinks(username) : [],
  );
  const [isSavingSocial, setIsSavingSocial] = useState(false);

  // Privacy state
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(() =>
    username ? getPrivacySettings(username) : { whoCanMessage: "everyone" },
  );

  // Notification prefs state
  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>(() =>
    username
      ? getNotificationPrefs(username)
      : {
          friendRequests: true,
          groupUpdates: true,
          experienceInvitations: true,
        },
  );

  // Load Dini Bucks balance
  const loadBalance = () => {
    const socialUsername = getSocialUser();
    if (socialUsername) {
      setDiniBucksBalance(getDiniBucks(socialUsername));
    }
  };
  if (diniBucksBalance === null && username) {
    loadBalance();
  }

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

      // Migrate ALL per-username data keys
      const keysToMigrate = [
        "diniverse_dinibucks_",
        "diniverse_friend_requests_",
        "diniverse_social_links_",
        "diniverse_privacy_",
        "diniverse_notif_prefs_",
        "diniverse_redeemed_codes_",
        "diniverse_lastseen_",
      ];
      for (const prefix of keysToMigrate) {
        const oldKey = `${prefix}${uname}`;
        const newKey = `${prefix}${newUname}`;
        const val = localStorage.getItem(oldKey);
        if (val !== null) {
          localStorage.setItem(newKey, val);
          localStorage.removeItem(oldKey);
        }
      }

      // Migrate message threads: keys like diniverse_messages_A_B
      const allKeys = Object.keys(localStorage);
      for (const key of allKeys) {
        if (key.startsWith("diniverse_messages_")) {
          const parts = key.replace("diniverse_messages_", "").split("_");
          if (parts.includes(uname)) {
            const newParts = parts.map((p: string) =>
              p === uname ? newUname : p,
            );
            const newKey = `diniverse_messages_${newParts.join("_")}`;
            const val = localStorage.getItem(key);
            if (val !== null) {
              localStorage.setItem(newKey, val);
              localStorage.removeItem(key);
            }
          }
        }
      }

      // Migrate groups: update ownedBy and member usernames in the shared groups array
      const groupsRaw = localStorage.getItem("diniverse_groups");
      if (groupsRaw) {
        try {
          const groups = JSON.parse(groupsRaw);
          const updatedGroups = groups.map((g: Record<string, unknown>) => {
            const updated = { ...g };
            if (updated.ownedBy === uname) updated.ownedBy = newUname;
            if (Array.isArray(updated.members)) {
              updated.members = (
                updated.members as Array<Record<string, unknown>>
              ).map((m) =>
                m.username === uname ? { ...m, username: newUname } : m,
              );
            }
            // Update social wall posts authored by old username
            if (Array.isArray(updated.socialPosts)) {
              updated.socialPosts = (
                updated.socialPosts as Array<Record<string, unknown>>
              ).map((post) => {
                const updatedPost = { ...post };
                if (updatedPost.author === uname) updatedPost.author = newUname;
                if (Array.isArray(updatedPost.replies)) {
                  updatedPost.replies = (
                    updatedPost.replies as Array<Record<string, unknown>>
                  ).map((r) =>
                    r.author === uname ? { ...r, author: newUname } : r,
                  );
                }
                return updatedPost;
              });
            }
            return updated;
          });
          localStorage.setItem(
            "diniverse_groups",
            JSON.stringify(updatedGroups),
          );
        } catch {
          /* ignore parse errors */
        }
      }

      // Migrate friend requests inside other users' data to reference new username
      const usersRaw2 = localStorage.getItem("diniverse_users");
      const allUsers = usersRaw2 ? Object.keys(JSON.parse(usersRaw2)) : [];
      for (const otherUser of allUsers) {
        if (otherUser === newUname) continue;
        const frKey = `diniverse_friend_requests_${otherUser}`;
        const frRaw = localStorage.getItem(frKey);
        if (frRaw) {
          try {
            const frs = JSON.parse(frRaw);
            const updated = frs.map((fr: Record<string, unknown>) => {
              const updatedFr = { ...fr };
              if (updatedFr.from === uname) updatedFr.from = newUname;
              if (updatedFr.to === uname) updatedFr.to = newUname;
              return updatedFr;
            });
            localStorage.setItem(frKey, JSON.stringify(updated));
          } catch {
            /* ignore */
          }
        }
      }

      // Re-issue session token
      const token = `${newUname}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      localStorage.setItem("diniverse_session_token", token);

      setNewUsername("");
      setShowUsernameEdit(false);
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
      setShowDisplayNameEdit(false);
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

  const handleBirthdayChange = (
    field: "month" | "day" | "year",
    value: string,
  ) => {
    const updated = { ...birthday, [field]: value };
    setBirthday(updated);
    if (updated.month && updated.day && updated.year && username) {
      const month = updated.month.padStart(2, "0");
      const day = updated.day.padStart(2, "0");
      const isoDate = `${updated.year}-${month}-${day}`;
      const settings = getLocalSettings(username);
      saveLocalSettings(username, { ...settings, birthday: isoDate });
      toast.success("Birthday saved");
    }
  };

  const handleLocationChange = (country: string) => {
    if (!username) return;
    const settings = getLocalSettings(username);
    saveLocalSettings(username, { ...settings, location: country });
    toast.success("Location saved");
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
      setShowPasswordEdit(false);
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

  const handleRedeemPromo = async () => {
    const socialUsername = getSocialUser();
    if (!socialUsername) {
      toast.error("Please log in to redeem promo codes");
      return;
    }
    if (!promoCode.trim()) {
      toast.error("Please enter a promo code");
      return;
    }
    setIsRedeemingPromo(true);
    try {
      const result = redeemPromoCode(socialUsername, promoCode.trim());
      if (result.success) {
        toast.success(
          `Promo code redeemed! +${result.amount} Dini Bucks added to your balance.`,
        );
        setPromoCode("");
        setDiniBucksBalance(getDiniBucks(socialUsername));
      } else {
        toast.error(result.error || "Invalid promo code");
      }
    } finally {
      setIsRedeemingPromo(false);
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
  const currentLocation = rawSettings?.location || "";

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6" data-ocid="settings.page">
      <div>
        <h1 className="text-3xl font-bold">{t("settings.title")}</h1>
        <p className="text-muted-foreground mt-1">{t("settings.subtitle")}</p>
      </div>

      {/* ─── Account Info ──────────────────────────────────────────────── */}
      <Card data-ocid="settings.accountinfo.card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Account Info
          </CardTitle>
          <CardDescription>Your personal account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Profile Picture row */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Profile Picture
            </Label>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-2 border-border">
                {currentAvatarUrl ? (
                  <AvatarImage
                    src={currentAvatarUrl}
                    alt={currentDisplayName}
                  />
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
          </div>
          <Separator />
          {/* Display Name row */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Display Name
            </Label>
            {showDisplayNameEdit ? (
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Input
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                    placeholder={currentDisplayName}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleUpdateDisplayName()
                    }
                    data-ocid="settings.accountinfo.displayname.input"
                  />
                  <Button
                    size="sm"
                    onClick={handleUpdateDisplayName}
                    disabled={updateDisplayNameMutation.isPending}
                    data-ocid="settings.accountinfo.displayname.save_button"
                  >
                    {updateDisplayNameMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Save"
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setShowDisplayNameEdit(false);
                      setNewDisplayName("");
                      setDisplayNameError("");
                    }}
                    data-ocid="settings.accountinfo.displayname.cancel_button"
                  >
                    Cancel
                  </Button>
                </div>
                {displayNameError && (
                  <p
                    className="text-sm text-destructive"
                    data-ocid="settings.accountinfo.displayname.error_state"
                  >
                    {displayNameError}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {currentDisplayName}
                </span>
                {canChangeDisplayName ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowDisplayNameEdit(true)}
                    data-ocid="settings.accountinfo.displayname.edit_button"
                  >
                    Edit
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Change in {formatCooldown(displayNameCooldownRemaining)}
                  </span>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Username row */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Username
            </Label>
            {showUsernameEdit ? (
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Input
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="New username"
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleUsernameChange()
                    }
                    data-ocid="settings.accountinfo.username.input"
                  />
                  <Button
                    size="sm"
                    onClick={handleUsernameChange}
                    disabled={isChangingUsername}
                    data-ocid="settings.accountinfo.username.save_button"
                  >
                    {isChangingUsername ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Save"
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setShowUsernameEdit(false);
                      setNewUsername("");
                      setUsernameError("");
                    }}
                    data-ocid="settings.accountinfo.username.cancel_button"
                  >
                    Cancel
                  </Button>
                </div>
                {usernameError && (
                  <p
                    className="text-sm text-destructive"
                    data-ocid="settings.accountinfo.username.error_state"
                  >
                    {usernameError}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono bg-muted px-2 py-0.5 rounded">
                  @{username}
                </span>
                {canChangeUsername ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowUsernameEdit(true)}
                    data-ocid="settings.accountinfo.username.edit_button"
                  >
                    Change
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Change in {formatCooldown(usernameCooldownRemaining)}
                  </span>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Password row */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Password
            </Label>
            {showPasswordEdit ? (
              <div className="space-y-3">
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Current password"
                  autoComplete="current-password"
                  data-ocid="settings.accountinfo.password.input"
                />
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                  autoComplete="new-password"
                />
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  onKeyDown={(e) => e.key === "Enter" && handleChangePassword()}
                />
                {passwordError && (
                  <p
                    className="text-sm text-destructive"
                    data-ocid="settings.accountinfo.password.error_state"
                  >
                    {passwordError}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleChangePassword}
                    disabled={isChangingPassword}
                    data-ocid="settings.accountinfo.password.save_button"
                  >
                    {isChangingPassword ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      "Save"
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setShowPasswordEdit(false);
                      setPasswordError("");
                      setCurrentPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                    }}
                    data-ocid="settings.accountinfo.password.cancel_button"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono text-muted-foreground">
                  ••••••••
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowPasswordEdit(true)}
                  data-ocid="settings.accountinfo.password.edit_button"
                >
                  Change
                </Button>
              </div>
            )}
          </div>

          <Separator />

          {/* Gender row */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Gender
            </Label>
            <Select
              value={currentGender}
              onValueChange={handleGenderChange}
              disabled={setGenderMutation.isPending}
            >
              <SelectTrigger data-ocid="settings.accountinfo.gender.select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-48 overflow-y-auto">
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

          <Separator />

          {/* Birthday row */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Birthday
            </Label>
            <div className="grid grid-cols-3 gap-2">
              <Select
                value={birthday.month}
                onValueChange={(v) => handleBirthdayChange("month", v)}
              >
                <SelectTrigger data-ocid="settings.accountinfo.birthday.month.select">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent className="max-h-48 overflow-y-auto">
                  {MONTHS.map((m, i) => (
                    <SelectItem key={m} value={String(i + 1)}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={birthday.day}
                onValueChange={(v) => handleBirthdayChange("day", v)}
              >
                <SelectTrigger data-ocid="settings.accountinfo.birthday.day.select">
                  <SelectValue placeholder="Day" />
                </SelectTrigger>
                <SelectContent className="max-h-48 overflow-y-auto">
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <SelectItem key={d} value={String(d)}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={birthday.year}
                onValueChange={(v) => handleBirthdayChange("year", v)}
              >
                <SelectTrigger data-ocid="settings.accountinfo.birthday.year.select">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent className="max-h-48 overflow-y-auto">
                  {Array.from({ length: 31 }, (_, i) => 2020 - i).map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Language row */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Language
            </Label>
            <Select
              value={currentLanguage}
              onValueChange={handleLanguageChange}
              disabled={setLanguageMutation.isPending}
            >
              <SelectTrigger data-ocid="settings.accountinfo.language.select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-48 overflow-y-auto">
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

          <Separator />

          {/* Location row */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Location
            </Label>
            <Select
              value={currentLocation || ""}
              onValueChange={handleLocationChange}
            >
              <SelectTrigger data-ocid="settings.accountinfo.location.select">
                <SelectValue placeholder="Select your country" />
              </SelectTrigger>
              <SelectContent className="max-h-48 overflow-y-auto">
                {COUNTRIES.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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

      {/* Promo Codes */}
      <Card data-ocid="settings.promo.card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Promo Codes
          </CardTitle>
          <CardDescription>
            Redeem a promo code to earn Dini Bucks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-muted/50 border px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Your balance</span>
            <span className="font-bold text-lg text-primary">
              {diniBucksBalance !== null
                ? diniBucksBalance.toLocaleString()
                : "—"}{" "}
              Dini Bucks
            </span>
          </div>
          <div className="flex gap-2">
            <Input
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              placeholder="Enter promo code (e.g. WELCOME)"
              onKeyDown={(e) => e.key === "Enter" && handleRedeemPromo()}
              data-ocid="settings.promo.input"
              className="uppercase"
            />
            <Button
              onClick={handleRedeemPromo}
              disabled={isRedeemingPromo || !promoCode.trim()}
              data-ocid="settings.promo.submit_button"
            >
              {isRedeemingPromo ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Redeem"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Social Networks */}
      <Card data-ocid="settings.social.card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Social Networks
          </CardTitle>
          <CardDescription>
            Link your social profiles to show on your public profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {SOCIAL_PLATFORMS.map((platform) => {
            const existing = socialLinks.find(
              (l) => l.platform === platform.id,
            );
            return (
              <div key={platform.id} className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                  style={{ background: platform.color }}
                >
                  {platform.label.charAt(0)}
                </div>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Input
                    placeholder={`${platform.label} URL`}
                    value={existing?.url ?? ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSocialLinks((prev) => {
                        const filtered = prev.filter(
                          (l) => l.platform !== platform.id,
                        );
                        if (val || existing?.username) {
                          return [
                            ...filtered,
                            {
                              platform: platform.id,
                              url: val,
                              username: existing?.username ?? "",
                            },
                          ];
                        }
                        return filtered;
                      });
                    }}
                    data-ocid={`settings.social.${platform.id}.input`}
                  />
                  <Input
                    placeholder={`${platform.label} username`}
                    value={existing?.username ?? ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSocialLinks((prev) => {
                        const filtered = prev.filter(
                          (l) => l.platform !== platform.id,
                        );
                        if (val || existing?.url) {
                          return [
                            ...filtered,
                            {
                              platform: platform.id,
                              url: existing?.url ?? "",
                              username: val,
                            },
                          ];
                        }
                        return filtered;
                      });
                    }}
                    data-ocid={`settings.social.${platform.id}.username.input`}
                  />
                </div>
              </div>
            );
          })}
          <Button
            onClick={() => {
              if (!username) return;
              setIsSavingSocial(true);
              saveSocialLinks(username, socialLinks);
              setTimeout(() => {
                setIsSavingSocial(false);
                toast.success("Social links saved!");
              }, 300);
            }}
            disabled={isSavingSocial || !username}
            className="mt-2"
            data-ocid="settings.social.save_button"
          >
            {isSavingSocial ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Save Social Links
          </Button>
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card data-ocid="settings.privacy.card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Privacy
          </CardTitle>
          <CardDescription>Control who can interact with you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Who can message me</Label>
            <Select
              value={privacySettings.whoCanMessage}
              onValueChange={(val) => {
                if (!username) return;
                const newPrivacy = {
                  whoCanMessage: val as PrivacySettings["whoCanMessage"],
                };
                setPrivacySettings(newPrivacy);
                savePrivacySettings(username, newPrivacy);
                toast.success("Privacy settings saved");
              }}
            >
              <SelectTrigger data-ocid="settings.privacy.message.select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-48 overflow-y-auto">
                <SelectItem value="everyone">Everyone</SelectItem>
                <SelectItem value="friends">Friends Only</SelectItem>
                <SelectItem value="nobody">Nobody</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card data-ocid="settings.notifications.card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Choose which notifications you receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Friend Requests</p>
              <p className="text-xs text-muted-foreground">
                Get notified when someone sends you a friend request
              </p>
            </div>
            <Switch
              checked={notifPrefs.friendRequests}
              onCheckedChange={(checked) => {
                if (!username) return;
                const updated = { ...notifPrefs, friendRequests: checked };
                setNotifPrefs(updated);
                saveNotificationPrefs(username, updated);
              }}
              data-ocid="settings.notifications.friends.switch"
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Group Updates</p>
              <p className="text-xs text-muted-foreground">
                Get notified about group activity and announcements
              </p>
            </div>
            <Switch
              checked={notifPrefs.groupUpdates}
              onCheckedChange={(checked) => {
                if (!username) return;
                const updated = { ...notifPrefs, groupUpdates: checked };
                setNotifPrefs(updated);
                saveNotificationPrefs(username, updated);
              }}
              data-ocid="settings.notifications.groups.switch"
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Experience Invitations</p>
              <p className="text-xs text-muted-foreground">
                Get notified when someone invites you to an experience
              </p>
            </div>
            <Switch
              checked={notifPrefs.experienceInvitations}
              onCheckedChange={(checked) => {
                if (!username) return;
                const updated = {
                  ...notifPrefs,
                  experienceInvitations: checked,
                };
                setNotifPrefs(updated);
                saveNotificationPrefs(username, updated);
              }}
              data-ocid="settings.notifications.experiences.switch"
            />
          </div>
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
