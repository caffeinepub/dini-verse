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
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Eye,
  Fingerprint,
  Gift,
  Globe,
  Key,
  Laptop,
  Loader2,
  Lock,
  LogIn,
  Monitor,
  Moon,
  Settings2,
  Share2,
  Shield,
  Smartphone,
  Sun,
  Trash,
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
  type UserPreferences,
  getDiniBucks,
  getNotificationPrefs,
  getPreferences,
  getPrivacySettings,
  getSocialLinks,
  getCurrentUser as getSocialUser,
  redeemPromoCode,
  saveNotificationPrefs,
  savePreferences,
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

function detectDeviceName(): string {
  const ua = navigator.userAgent;
  if (/iPhone/i.test(ua)) return "iPhone";
  if (/iPad/i.test(ua)) return "iPad";
  if (/Android/i.test(ua)) return "Android Device";
  if (/Mac/i.test(ua)) return "Mac";
  if (/Windows/i.test(ua)) return "Windows PC";
  if (/Linux/i.test(ua)) return "Linux PC";
  return "Unknown Device";
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

  const username = getCurrentUsername();
  // Profile picture state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const isOpen = (key: string) => openSections[key] !== false;
  const toggleSection = (key: string) =>
    setOpenSections((prev) => ({ ...prev, [key]: !isOpen(key) }));

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

  const [locationState, setLocationState] = useState<string>(() => {
    const uname = getCurrentUsername();
    const saved = uname ? getLocalSettings(uname) : null;
    return saved?.location || "";
  });

  // Change password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Delete account confirmation
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Security state
  const [iiTwoFA, setIiTwoFA] = useState<boolean>(() => {
    if (!username) return false;
    return localStorage.getItem(`diniverse_ii2fa_${username}`) === "true";
  });
  const [pinTwoFA, setPinTwoFA] = useState<boolean>(() => {
    if (!username) return false;
    return !!localStorage.getItem(`diniverse_pin2fa_hash_${username}`);
  });
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [pinError, setPinError] = useState("");
  const [showSetPin, setShowSetPin] = useState(false);
  const [showRemovePin, setShowRemovePin] = useState(false);
  const [removePinInput, setRemovePinInput] = useState("");

  // Linked devices state
  interface LinkedDevice {
    id: string;
    name: string;
    type: "desktop" | "mobile" | "hardware";
    addedAt: string;
    sessionId?: string;
  }
  const getLinkedDevices = (): LinkedDevice[] => {
    if (!username) return [];
    try {
      return JSON.parse(
        localStorage.getItem(`diniverse_devices_${username}`) || "[]",
      );
    } catch {
      return [];
    }
  };
  const [linkedDevices, setLinkedDevices] = useState<LinkedDevice[]>(() => {
    if (!username) return [];
    const stored = getLinkedDevices();
    if (stored.length === 0) {
      // Seed current device
      const deviceSessionId = (() => {
        let sid = sessionStorage.getItem("diniverse_device_session_id");
        if (!sid) {
          sid = crypto.randomUUID();
          sessionStorage.setItem("diniverse_device_session_id", sid);
        }
        return sid;
      })();
      const device: LinkedDevice = {
        id: crypto.randomUUID(),
        name: detectDeviceName(),
        type: /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop",
        addedAt: new Date().toLocaleDateString(),
        sessionId: deviceSessionId,
      };
      localStorage.setItem(
        `diniverse_devices_${username}`,
        JSON.stringify([device]),
      );
      return [device];
    }
    return stored;
  });

  // Promo code state
  const [promoCode, setPromoCode] = useState("");
  const [isRedeemingPromo, setIsRedeemingPromo] = useState(false);
  const [diniBucksBalance, setDiniBucksBalance] = useState<number | null>(null);

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

  // Preferences state
  const [preferences, setPreferences] = useState<UserPreferences>(() =>
    username
      ? getPreferences(username)
      : { publicProfileVisibility: "everyone" },
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
    setLocationState(country);
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

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6" data-ocid="settings.page">
      <div>
        <h1 className="text-3xl font-bold">{t("settings.title")}</h1>
        <p className="text-muted-foreground mt-1">{t("settings.subtitle")}</p>
      </div>

      {/* ─── Account Info ──────────────────────────────────────────────── */}
      <Card data-ocid="settings.accountinfo.card">
        <CardHeader
          className="flex flex-row items-center justify-between cursor-pointer"
          onClick={() => toggleSection("accountInfo")}
        >
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Account Info
            </CardTitle>
            <CardDescription>Your personal account information</CardDescription>
          </div>
          {isOpen("accountInfo") ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
          )}
        </CardHeader>
        {isOpen("accountInfo") && (
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
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleChangePassword()
                    }
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
                value={locationState}
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
        )}
      </Card>

      {/* Preferences */}
      <Card data-ocid="settings.preferences.card">
        <CardHeader
          className="flex flex-row items-center justify-between cursor-pointer"
          onClick={() => toggleSection("preferences")}
        >
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="w-5 h-5" />
              Preferences
            </CardTitle>
            <CardDescription>
              Customize your Dini.Verse experience
            </CardDescription>
          </div>
          {isOpen("preferences") ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
          )}
        </CardHeader>
        {isOpen("preferences") && (
          <CardContent className="space-y-4">
            {/* Dark Mode */}
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
                data-ocid="settings.preferences.darkmode.switch"
              />
            </div>
            <Separator />
            {/* Public Profile Visibility */}
            <div className="space-y-2">
              <Label>Public Profile</Label>
              <p className="text-sm text-muted-foreground">
                Choose who can view your full profile details
              </p>
              <Select
                value={preferences.publicProfileVisibility}
                onValueChange={(val) => {
                  if (!username) return;
                  const newPrefs: UserPreferences = {
                    ...preferences,
                    publicProfileVisibility:
                      val as UserPreferences["publicProfileVisibility"],
                  };
                  setPreferences(newPrefs);
                  savePreferences(username, newPrefs);
                  toast.success("Preferences saved");
                }}
              >
                <SelectTrigger data-ocid="settings.preferences.profile_visibility.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-48 overflow-y-auto">
                  <SelectItem value="everyone">Everyone</SelectItem>
                  <SelectItem value="friends">Friends</SelectItem>
                  <SelectItem value="no-one">No one</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Promo Codes */}
      <Card data-ocid="settings.promo.card">
        <CardHeader
          className="flex flex-row items-center justify-between cursor-pointer"
          onClick={() => toggleSection("promoCodes")}
        >
          <div>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5" />
              Promo Codes
            </CardTitle>
            <CardDescription>
              Redeem a promo code to earn Dini Bucks
            </CardDescription>
          </div>
          {isOpen("promoCodes") ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
          )}
        </CardHeader>
        {isOpen("promoCodes") && (
          <CardContent className="space-y-4">
            <div className="rounded-md bg-muted/50 border px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Your balance
              </span>
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
        )}
      </Card>

      {/* Social Networks */}
      <Card data-ocid="settings.social.card">
        <CardHeader
          className="flex flex-row items-center justify-between cursor-pointer"
          onClick={() => toggleSection("socialNetworks")}
        >
          <div>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Social Networks
            </CardTitle>
            <CardDescription>
              Link your social profiles to show on your public profile
            </CardDescription>
          </div>
          {isOpen("socialNetworks") ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
          )}
        </CardHeader>
        {isOpen("socialNetworks") && (
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
        )}
      </Card>

      {/* Privacy */}
      <Card data-ocid="settings.privacy.card">
        <CardHeader
          className="flex flex-row items-center justify-between cursor-pointer"
          onClick={() => toggleSection("privacy")}
        >
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Privacy
            </CardTitle>
            <CardDescription>Control who can interact with you</CardDescription>
          </div>
          {isOpen("privacy") ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
          )}
        </CardHeader>
        {isOpen("privacy") && (
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Who can message me</Label>
              <Select
                value={privacySettings.whoCanMessage}
                onValueChange={(val) => {
                  if (!username) return;
                  const newPrivacy = {
                    ...privacySettings,
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
            <Separator />
            {/* Offline Mode */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Offline Mode</p>
                <p className="text-sm text-muted-foreground">
                  Appear offline to other users
                </p>
              </div>
              <Switch
                checked={currentVisibilityIsOffline}
                onCheckedChange={handleVisibilityChange}
                disabled={updateVisibilityMutation.isPending}
                data-ocid="settings.privacy.offline.switch"
              />
            </div>
            <Separator />
            {/* Recently Played Visibility */}
            <div className="space-y-2">
              <Label>Recently Played</Label>
              <p className="text-sm text-muted-foreground">
                Who can see your recently played games
              </p>
              <Select
                value={privacySettings.recentlyPlayedVisibility ?? "everyone"}
                onValueChange={(val) => {
                  if (!username) return;
                  const newPrivacy = {
                    ...privacySettings,
                    recentlyPlayedVisibility: val as
                      | "everyone"
                      | "friends"
                      | "no-one",
                  };
                  setPrivacySettings(newPrivacy);
                  savePrivacySettings(username, newPrivacy);
                  toast.success("Privacy settings saved");
                }}
              >
                <SelectTrigger data-ocid="settings.privacy.recently_played.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-48 overflow-y-auto">
                  <SelectItem value="everyone">Everyone</SelectItem>
                  <SelectItem value="friends">Friends Only</SelectItem>
                  <SelectItem value="no-one">No one</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Notifications */}
      <Card data-ocid="settings.notifications.card">
        <CardHeader
          className="flex flex-row items-center justify-between cursor-pointer"
          onClick={() => toggleSection("notifications")}
        >
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Choose which notifications you receive
            </CardDescription>
          </div>
          {isOpen("notifications") ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
          )}
        </CardHeader>
        {isOpen("notifications") && (
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
        )}
      </Card>

      {/* Security */}
      <Card data-ocid="settings.security.card">
        <CardHeader
          className="flex flex-row items-center justify-between cursor-pointer"
          onClick={() => toggleSection("security")}
        >
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security
            </CardTitle>
            <CardDescription>
              Manage two-step verification for your account (optional)
            </CardDescription>
          </div>
          {isOpen("security") ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
          )}
        </CardHeader>
        {isOpen("security") && (
          <CardContent className="space-y-4">
            {/* Internet Identity 2FA */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">
                  Internet Identity Verification
                </p>
                <p className="text-xs text-muted-foreground">
                  Use Internet Identity as an extra verification step when
                  logging in
                </p>
              </div>
              <Switch
                checked={iiTwoFA}
                onCheckedChange={(checked) => {
                  if (!username) return;
                  setIiTwoFA(checked);
                  if (checked) {
                    localStorage.setItem(`diniverse_ii2fa_${username}`, "true");
                    window.open("https://identity.ic0.app", "_blank");
                    toast.success(
                      "Internet Identity 2-step verification enabled",
                    );
                  } else {
                    localStorage.removeItem(`diniverse_ii2fa_${username}`);
                    toast.success(
                      "Internet Identity 2-step verification disabled",
                    );
                  }
                }}
                data-ocid="settings.security.ii2fa.switch"
              />
            </div>
            <Separator />
            {/* PIN 2FA */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">PIN Verification</p>
                  <p className="text-xs text-muted-foreground">
                    Set a 6-digit PIN for account recovery and as an extra
                    verification step
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {pinTwoFA && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowRemovePin(true);
                        setShowSetPin(false);
                      }}
                      data-ocid="settings.security.pin.remove_button"
                    >
                      Remove PIN
                    </Button>
                  )}
                  <Button
                    variant={pinTwoFA ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => {
                      setShowSetPin(!showSetPin);
                      setShowRemovePin(false);
                      setPinError("");
                      setPin("");
                      setPinConfirm("");
                    }}
                    data-ocid="settings.security.pin.set_button"
                  >
                    {pinTwoFA ? "Change PIN" : "Set PIN"}
                  </Button>
                </div>
              </div>
              {pinTwoFA && !showSetPin && !showRemovePin && (
                <div className="text-xs text-green-600 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> PIN verification is active
                </div>
              )}
              {showSetPin && (
                <div className="space-y-2 border rounded-md p-3 bg-muted/30">
                  <Label htmlFor="newPin">New PIN (exactly 6 digits)</Label>
                  <Input
                    id="newPin"
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    value={pin}
                    onChange={(e) =>
                      setPin(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="Enter 6-digit PIN"
                    data-ocid="settings.security.pin.new_input"
                  />
                  <Label htmlFor="confirmPin">Confirm PIN</Label>
                  <Input
                    id="confirmPin"
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    value={pinConfirm}
                    onChange={(e) =>
                      setPinConfirm(
                        e.target.value.replace(/\D/g, "").slice(0, 6),
                      )
                    }
                    placeholder="Confirm PIN"
                    data-ocid="settings.security.pin.confirm_input"
                  />
                  {pinError && (
                    <p className="text-xs text-destructive">{pinError}</p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        if (!username) return;
                        if (pin.length !== 6) {
                          setPinError("PIN must be exactly 6 digits");
                          return;
                        }
                        if (pin !== pinConfirm) {
                          setPinError("PINs do not match");
                          return;
                        }
                        localStorage.setItem(
                          `diniverse_pin2fa_hash_${username}`,
                          btoa(pin),
                        );
                        setPinTwoFA(true);
                        setShowSetPin(false);
                        setPin("");
                        setPinConfirm("");
                        setPinError("");
                        toast.success("PIN verification enabled");
                      }}
                      data-ocid="settings.security.pin.save_button"
                    >
                      Save PIN
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setShowSetPin(false);
                        setPin("");
                        setPinConfirm("");
                        setPinError("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              {showRemovePin && (
                <div className="space-y-2 border rounded-md p-3 bg-muted/30">
                  <Label htmlFor="removePinInput">
                    Enter your current PIN to remove it
                  </Label>
                  <Input
                    id="removePinInput"
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    value={removePinInput}
                    onChange={(e) =>
                      setRemovePinInput(
                        e.target.value.replace(/\D/g, "").slice(0, 6),
                      )
                    }
                    placeholder="Current PIN"
                    data-ocid="settings.security.pin.remove_input"
                  />
                  {pinError && (
                    <p className="text-xs text-destructive">{pinError}</p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        if (!username) return;
                        const stored = localStorage.getItem(
                          `diniverse_pin2fa_hash_${username}`,
                        );
                        if (btoa(removePinInput) !== stored) {
                          setPinError("Incorrect PIN");
                          return;
                        }
                        localStorage.removeItem(
                          `diniverse_pin2fa_hash_${username}`,
                        );
                        setPinTwoFA(false);
                        setShowRemovePin(false);
                        setRemovePinInput("");
                        setPinError("");
                        toast.success("PIN verification removed");
                      }}
                      data-ocid="settings.security.pin.remove_confirm_button"
                    >
                      Remove PIN
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setShowRemovePin(false);
                        setRemovePinInput("");
                        setPinError("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <Separator />
            {/* Linked Devices */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Linked Devices</p>
                  <p className="text-xs text-muted-foreground">
                    Devices that have accessed your account
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open("https://identity.ic0.app", "_blank")
                  }
                  data-ocid="settings.security.manage_ii_button"
                  className="flex items-center gap-1"
                >
                  <Fingerprint className="w-4 h-4" />
                  Manage Internet Identity
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </Button>
              </div>
              {linkedDevices.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No devices linked.
                </p>
              ) : (
                <div className="space-y-2">
                  {linkedDevices.map((device) => (
                    <div
                      key={device.id}
                      className="flex items-center justify-between border rounded-md px-3 py-2 bg-muted/20"
                    >
                      <div className="flex items-center gap-2">
                        {device.type === "mobile" ? (
                          <Smartphone className="w-4 h-4 text-muted-foreground" />
                        ) : device.type === "hardware" ? (
                          <Key className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Monitor className="w-4 h-4 text-muted-foreground" />
                        )}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-medium">{device.name}</p>
                            {device.sessionId &&
                              device.sessionId ===
                                sessionStorage.getItem(
                                  "diniverse_device_session_id",
                                ) && (
                                <span className="text-[10px] font-semibold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                                  Current
                                </span>
                              )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Added {device.addedAt}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          if (!username) return;
                          const updated = linkedDevices.filter(
                            (d) => d.id !== device.id,
                          );
                          setLinkedDevices(updated);
                          localStorage.setItem(
                            `diniverse_devices_${username}`,
                            JSON.stringify(updated),
                          );
                          toast.success("Device removed");
                        }}
                        data-ocid="settings.security.remove_device_button"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                To add hardware keys or biometric devices, click{" "}
                <span className="font-medium">Manage Internet Identity</span>{" "}
                above.
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50" data-ocid="settings.danger.card">
        <CardHeader
          className="flex flex-row items-center justify-between cursor-pointer"
          onClick={() => toggleSection("dangerZone")}
        >
          <div>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              {t("settings.deleteAccount.dangerZone")}
            </CardTitle>
            <CardDescription>
              {t("settings.deleteAccount.dangerZoneDescription")}
            </CardDescription>
          </div>
          {isOpen("dangerZone") ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
          )}
        </CardHeader>
        {isOpen("dangerZone") && (
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
        )}
      </Card>
    </div>
  );
}
