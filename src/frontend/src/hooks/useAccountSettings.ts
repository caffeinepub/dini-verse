import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Gender, Language, Variant_offline_online } from "../backend";
import { getSessionToken } from "../utils/sessionToken";
import { useSessionAuth } from "./useSessionAuth";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface LocalUserSettings {
  username: string;
  displayName: string;
  visibility: "online" | "offline";
  avatarDataUrl: string | null;
  lastUsernameChange: number;
  lastDisplayNameChange: number;
  lastPasswordChange: number;
  createdAt: number;
  gender: "female" | "male" | "other";
  language: string;
  theme: "light" | "dark";
  birthday: string | null;
  location: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function settingsKey(username: string): string {
  return `diniverse_settings_${username}`;
}

export function getCurrentUsername(): string | null {
  try {
    const token = getSessionToken();
    if (!token) return null;
    return token.split("_")[0] || null;
  } catch {
    return null;
  }
}

export function getLocalSettings(username: string): LocalUserSettings {
  try {
    const raw = localStorage.getItem(settingsKey(username));
    if (raw) {
      const parsed = JSON.parse(raw) as LocalUserSettings;
      // Ensure new fields exist for existing users
      return {
        ...parsed,
        birthday: parsed.birthday ?? null,
        location: parsed.location ?? "",
      };
    }
  } catch {
    // fall through to defaults
  }
  // Default settings
  return {
    username,
    displayName: username,
    visibility: "online",
    avatarDataUrl: null,
    lastUsernameChange: 0,
    lastDisplayNameChange: 0,
    lastPasswordChange: 0,
    createdAt: Date.now(),
    gender: "other",
    language: "en",
    theme: "light",
    birthday: null,
    location: "",
  };
}

export function saveLocalSettings(
  username: string,
  settings: LocalUserSettings,
): void {
  localStorage.setItem(settingsKey(username), JSON.stringify(settings));
}

function clearLocalSettings(username: string): void {
  localStorage.removeItem(settingsKey(username));
}

// Map LocalUserSettings to a shape that satisfies places expecting UserSettings-like objects
function toPublicSettings(s: LocalUserSettings) {
  return {
    username: s.username,
    displayName: s.displayName,
    visibility:
      s.visibility === "online"
        ? Variant_offline_online.online
        : Variant_offline_online.offline,
    gender:
      s.gender === "female"
        ? Gender.female
        : s.gender === "male"
          ? Gender.male
          : Gender.other,
    language: (s.language as Language) || Language.en,
    avatarDataUrl: s.avatarDataUrl,
    theme: s.theme,
    birthday: s.birthday,
    location: s.location,
    // Extra fields for type compat
    createdAt: BigInt(s.createdAt),
    lastUsernameChange: BigInt(s.lastUsernameChange),
    lastDisplayNameChange: BigInt(s.lastDisplayNameChange),
    lastPasswordChange: BigInt(s.lastPasswordChange),
    languageCode: s.language,
    languagePrefix: s.language,
    textDirection: "leftToRight" as const,
    nativeLanguage: (s.language as Language) || Language.en,
    pronunciationLanguage: (s.language as Language) || Language.en,
    passwordResetAttempts: BigInt(0),
    updatedAt: BigInt(Date.now()),
    lastPasswordResetAttempt: BigInt(0),
  };
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

/** Get current user's settings from localStorage — never calls the backend */
export function useGetCallerSettings() {
  const { isAuthenticated } = useSessionAuth();

  const query = useQuery({
    queryKey: ["callerSettings"],
    queryFn: () => {
      const username = getCurrentUsername();
      if (!username) return null;
      const raw = getLocalSettings(username);
      return toPublicSettings(raw);
    },
    enabled: isAuthenticated,
    retry: false,
  });

  return {
    ...query,
    isLoading: query.isLoading,
    isFetched: query.isFetched,
  };
}

/** Update display name — localStorage only, 24h cooldown */
export function useUpdateDisplayName() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newDisplayName: string) => {
      const username = getCurrentUsername();
      if (!username) throw new Error("Not authenticated");
      const settings = getLocalSettings(username);
      const now = Date.now();
      const msIn24h = 24 * 60 * 60 * 1000;
      if (
        settings.lastDisplayNameChange &&
        now - settings.lastDisplayNameChange < msIn24h
      ) {
        const remaining = msIn24h - (now - settings.lastDisplayNameChange);
        const hours = Math.ceil(remaining / (60 * 60 * 1000));
        throw new Error(
          `You can change your display name again in ${hours} hour(s)`,
        );
      }
      saveLocalSettings(username, {
        ...settings,
        displayName: newDisplayName.trim(),
        lastDisplayNameChange: now,
      });

      // Also update the diniverse_users record so login shows new display name
      try {
        const usersRaw = localStorage.getItem("diniverse_users");
        if (usersRaw) {
          const users = JSON.parse(usersRaw);
          if (users[username]) {
            users[username].displayName = newDisplayName.trim();
            localStorage.setItem("diniverse_users", JSON.stringify(users));
          }
        }
      } catch {
        // non-critical
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerSettings"] });
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

/** Update display name and avatar — localStorage only */
export function useUpdateDisplayNameAndAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      displayName: string;
      avatarDataUrl: string | null;
    }) => {
      const username = getCurrentUsername();
      if (!username) throw new Error("Not authenticated");
      const settings = getLocalSettings(username);
      saveLocalSettings(username, {
        ...settings,
        displayName: data.displayName.trim(),
        avatarDataUrl: data.avatarDataUrl,
        lastDisplayNameChange: Date.now(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerSettings"] });
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

/** Update visibility — localStorage only */
export function useUpdateVisibility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (visibility: Variant_offline_online) => {
      const username = getCurrentUsername();
      if (!username) throw new Error("Not authenticated");
      const settings = getLocalSettings(username);
      saveLocalSettings(username, {
        ...settings,
        visibility:
          visibility === Variant_offline_online.online ? "online" : "offline",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerSettings"] });
    },
  });
}

/** Update avatar (base64 data URL) — localStorage only */
export function useUpdateAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (avatarDataUrl: string | null) => {
      const username = getCurrentUsername();
      if (!username) throw new Error("Not authenticated");
      const settings = getLocalSettings(username);
      saveLocalSettings(username, {
        ...settings,
        avatarDataUrl,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerSettings"] });
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

/** Delete avatar — localStorage only */
export function useDeleteAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const username = getCurrentUsername();
      if (!username) throw new Error("Not authenticated");
      const settings = getLocalSettings(username);
      saveLocalSettings(username, { ...settings, avatarDataUrl: null });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerSettings"] });
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

/** Delete account — clears all localStorage data for this user */
export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const username = getCurrentUsername();
      if (!username) throw new Error("Not authenticated");

      // Remove settings
      clearLocalSettings(username);

      // Remove from users store
      try {
        const usersRaw = localStorage.getItem("diniverse_users");
        if (usersRaw) {
          const users = JSON.parse(usersRaw);
          delete users[username];
          localStorage.setItem("diniverse_users", JSON.stringify(users));
        }
      } catch {
        // non-critical
      }

      // Clear session token
      localStorage.removeItem("diniverse_session_token");
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

/** Set gender — localStorage only */
export function useSetGender() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (gender: Gender) => {
      const username = getCurrentUsername();
      if (!username) throw new Error("Not authenticated");
      const settings = getLocalSettings(username);
      const genderStr: "female" | "male" | "other" =
        gender === Gender.female
          ? "female"
          : gender === Gender.male
            ? "male"
            : "other";
      saveLocalSettings(username, { ...settings, gender: genderStr });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerSettings"] });
    },
  });
}

/** Set language — localStorage only */
export function useSetLanguage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      language: Language;
      languageCode: string;
      languagePrefix: string;
      textDirection: string;
      nativeLanguage: Language;
    }) => {
      const username = getCurrentUsername();
      if (!username) throw new Error("Not authenticated");
      const settings = getLocalSettings(username);
      saveLocalSettings(username, {
        ...settings,
        language: data.languageCode || data.language,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerSettings"] });
    },
  });
}

/** Set theme — localStorage only */
export function useSetTheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (theme: "light" | "dark") => {
      const username = getCurrentUsername();
      if (!username) throw new Error("Not authenticated");
      const settings = getLocalSettings(username);
      saveLocalSettings(username, { ...settings, theme });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerSettings"] });
    },
  });
}
