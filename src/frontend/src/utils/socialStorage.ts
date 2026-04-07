import { getLocalSettings } from "../hooks/useAccountSettings";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface FriendRequest {
  from: string;
  to: string;
  status: "pending" | "accepted" | "declined";
  sentAt: number;
}

export interface ChatMessage {
  id: string;
  sender: string;
  type: "text" | "image" | "video" | "gif";
  content: string;
  gifUrl?: string;
  timestamp: number;
  deleted: boolean;
}

// ─── Promo Codes ────────────────────────────────────────────────────────────

const PROMO_CODES: Record<string, number> = {
  "DINI-GC": 100,
  DINI: 200,
  WELCOME: 300,
  "DINI-VERSE": 500,
};

// ─── Real-time Sync ─────────────────────────────────────────────────────────

export function emitSocialSync(key?: string): void {
  try {
    localStorage.setItem("diniverse_social_sync_ts", String(Date.now()));
    window.dispatchEvent(
      new StorageEvent("storage", { key: key ?? "diniverse_social_sync" }),
    );
  } catch {
    /* ignore */
  }
}

// ─── Session ────────────────────────────────────────────────────────────────

export function getCurrentUser(): string | null {
  try {
    const token = localStorage.getItem("diniverse_session_token");
    if (!token) return null;
    return token.split("_")[0] || null;
  } catch {
    return null;
  }
}

// ─── Users ──────────────────────────────────────────────────────────────────

export function getAllUsers(): string[] {
  try {
    const raw = localStorage.getItem("diniverse_users");
    if (!raw) return [];
    return Object.keys(JSON.parse(raw));
  } catch {
    return [];
  }
}

export function getUserDisplayName(username: string): string {
  try {
    const raw = localStorage.getItem("diniverse_users");
    if (raw) {
      const users = JSON.parse(raw);
      if (users[username]?.displayName) return users[username].displayName;
    }
    // fallback to settings
    const settings = getLocalSettings(username);
    return settings.displayName || username;
  } catch {
    return username;
  }
}

export function getUserAvatarUrl(username: string): string | null {
  try {
    const settings = getLocalSettings(username);
    return settings.avatarDataUrl || null;
  } catch {
    return null;
  }
}

export function updateHeartbeat(username: string): void {
  try {
    localStorage.setItem(`diniverse_lastseen_${username}`, String(Date.now()));
  } catch {
    // ignore
  }
}

export function getLastSeen(username: string): number {
  try {
    const raw = localStorage.getItem(`diniverse_lastseen_${username}`);
    return raw ? Number(raw) : 0;
  } catch {
    return 0;
  }
}

export function getUserVisibility(username: string): "online" | "offline" {
  try {
    const settings = getLocalSettings(username);
    if (settings.visibility !== "online") return "offline";
    const lastSeen = getLastSeen(username);
    if (!lastSeen) return "offline";
    return Date.now() - lastSeen < 180000 ? "online" : "offline";
  } catch {
    return "offline";
  }
}

// ─── Friend Requests ────────────────────────────────────────────────────────

function getRequestsKey(username: string): string {
  return `diniverse_friend_requests_${username}`;
}

function loadRequests(username: string): FriendRequest[] {
  try {
    const raw = localStorage.getItem(getRequestsKey(username));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRequests(username: string, requests: FriendRequest[]): void {
  localStorage.setItem(getRequestsKey(username), JSON.stringify(requests));
}

export function getFriends(username: string): string[] {
  // Friends = users who mutually have accepted requests
  const sent = loadRequests(username).filter(
    (r) => r.from === username && r.status === "accepted",
  );
  const received = loadRequests(username).filter(
    (r) => r.to === username && r.status === "accepted",
  );
  const sentTo = sent.map((r) => r.to);
  const receivedFrom = received.map((r) => r.from);
  return [...new Set([...sentTo, ...receivedFrom])];
}

export function getPendingIncoming(username: string): FriendRequest[] {
  return loadRequests(username).filter(
    (r) => r.to === username && r.status === "pending",
  );
}

export function getPendingOutgoing(username: string): FriendRequest[] {
  return loadRequests(username).filter(
    (r) => r.from === username && r.status === "pending",
  );
}

export function isFriendWith(userA: string, userB: string): boolean {
  return getFriends(userA).includes(userB);
}

export function hasPendingRequestTo(from: string, to: string): boolean {
  const requests = loadRequests(from);
  return requests.some(
    (r) => r.from === from && r.to === to && r.status === "pending",
  );
}

export function sendFriendRequest(from: string, to: string): void {
  if (from === to) return;
  // Check if already exists
  const fromReqs = loadRequests(from);
  const exists = fromReqs.some(
    (r) =>
      ((r.from === from && r.to === to) || (r.from === to && r.to === from)) &&
      r.status === "pending",
  );
  if (exists) return;

  const newRequest: FriendRequest = {
    from,
    to,
    status: "pending",
    sentAt: Date.now(),
  };

  // Store in sender's list
  const senderReqs = loadRequests(from);
  senderReqs.push(newRequest);
  saveRequests(from, senderReqs);

  // Store in receiver's list
  const receiverReqs = loadRequests(to);
  receiverReqs.push(newRequest);
  saveRequests(to, receiverReqs);

  emitSocialSync("diniverse_social_sync");
}

export function respondToRequest(
  from: string,
  to: string,
  action: "accept" | "decline",
): void {
  // Update both users' request lists
  const newStatus = action === "accept" ? "accepted" : "declined";

  for (const username of [from, to]) {
    const reqs = loadRequests(username);
    const updated = reqs.map((r) => {
      if (r.from === from && r.to === to && r.status === "pending") {
        return { ...r, status: newStatus } as FriendRequest;
      }
      return r;
    });
    saveRequests(username, updated);
  }

  emitSocialSync("diniverse_social_sync");
}

export function unfriend(userA: string, userB: string): void {
  for (const username of [userA, userB]) {
    const reqs = loadRequests(username);
    const updated = reqs.filter(
      (r) =>
        !(
          ((r.from === userA && r.to === userB) ||
            (r.from === userB && r.to === userA)) &&
          r.status === "accepted"
        ),
    );
    saveRequests(username, updated);
  }

  emitSocialSync("diniverse_social_sync");
}

// ─── Messages ───────────────────────────────────────────────────────────────

function getMessagesKey(userA: string, userB: string): string {
  const sorted = [userA, userB].sort();
  return `diniverse_messages_${sorted[0]}_${sorted[1]}`;
}

export function getMessages(userA: string, userB: string): ChatMessage[] {
  try {
    const raw = localStorage.getItem(getMessagesKey(userA, userB));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveMessages(
  userA: string,
  userB: string,
  msgs: ChatMessage[],
): void {
  const key = getMessagesKey(userA, userB);
  localStorage.setItem(key, JSON.stringify(msgs));
  emitSocialSync(key);
}

// ─── Dini Bucks ─────────────────────────────────────────────────────────────

function getDiniBucksKey(username: string): string {
  return `diniverse_dinibucks_${username}`;
}

export function getDiniBucks(username: string): number {
  try {
    const raw = localStorage.getItem(getDiniBucksKey(username));
    if (raw !== null) return Number.parseInt(raw, 10);
    // Default 1000 on first access
    addDiniBucks(username, 1000);
    return 1000;
  } catch {
    return 0;
  }
}

export function addDiniBucks(username: string, amount: number): void {
  try {
    const current = (() => {
      const raw = localStorage.getItem(getDiniBucksKey(username));
      return raw !== null ? Number.parseInt(raw, 10) : 0;
    })();
    localStorage.setItem(getDiniBucksKey(username), String(current + amount));
  } catch {
    // ignore
  }
}

// ─── Promo Codes ────────────────────────────────────────────────────────────

function getRedeemedCodesKey(username: string): string {
  return `diniverse_redeemed_codes_${username}`;
}

export function getRedeemedCodes(username: string): string[] {
  try {
    const raw = localStorage.getItem(getRedeemedCodesKey(username));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function redeemPromoCode(
  username: string,
  code: string,
): { success: boolean; amount?: number; error?: string } {
  const upperCode = code.trim().toUpperCase();
  const amount = PROMO_CODES[upperCode];

  if (!amount) {
    return { success: false, error: "Invalid promo code" };
  }

  const redeemed = getRedeemedCodes(username);
  if (redeemed.includes(upperCode)) {
    return { success: false, error: "You have already used this promo code" };
  }

  // Mark as redeemed
  redeemed.push(upperCode);
  localStorage.setItem(getRedeemedCodesKey(username), JSON.stringify(redeemed));

  // Add Dini Bucks
  addDiniBucks(username, amount);

  return { success: true, amount };
}

// ─── Social Networks ─────────────────────────────────────────────────────────

export interface SocialLink {
  platform: string;
  url: string;
  username: string;
}

export function getSocialLinks(username: string): SocialLink[] {
  try {
    const raw = localStorage.getItem(`diniverse_social_links_${username}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSocialLinks(username: string, links: SocialLink[]): void {
  localStorage.setItem(
    `diniverse_social_links_${username}`,
    JSON.stringify(links),
  );
}

// ─── Privacy Settings ────────────────────────────────────────────────────────

export interface PrivacySettings {
  whoCanMessage: "everyone" | "friends" | "nobody";
  offlineMode?: boolean;
  recentlyPlayedVisibility?: "everyone" | "friends" | "no-one";
}

export function getPrivacySettings(username: string): PrivacySettings {
  try {
    const raw = localStorage.getItem(`diniverse_privacy_${username}`);
    return raw ? JSON.parse(raw) : { whoCanMessage: "everyone" };
  } catch {
    return { whoCanMessage: "everyone" };
  }
}

export function savePrivacySettings(
  username: string,
  settings: PrivacySettings,
): void {
  localStorage.setItem(
    `diniverse_privacy_${username}`,
    JSON.stringify(settings),
  );
}

// ─── Notification Preferences ────────────────────────────────────────────────

export interface NotificationPrefs {
  friendRequests: boolean;
  groupUpdates: boolean;
  experienceInvitations: boolean;
}

export function getNotificationPrefs(username: string): NotificationPrefs {
  try {
    const raw = localStorage.getItem(`diniverse_notif_prefs_${username}`);
    return raw
      ? JSON.parse(raw)
      : {
          friendRequests: true,
          groupUpdates: true,
          experienceInvitations: true,
        };
  } catch {
    return {
      friendRequests: true,
      groupUpdates: true,
      experienceInvitations: true,
    };
  }
}

export function saveNotificationPrefs(
  username: string,
  prefs: NotificationPrefs,
): void {
  localStorage.setItem(
    `diniverse_notif_prefs_${username}`,
    JSON.stringify(prefs),
  );
}

// ─── User Preferences ────────────────────────────────────────────────────────

export interface UserPreferences {
  publicProfileVisibility: "everyone" | "friends" | "no-one";
  nameTagColor?: string;
}

export function getPreferences(username: string): UserPreferences {
  try {
    const raw = localStorage.getItem(`diniverse_preferences_${username}`);
    return raw
      ? JSON.parse(raw)
      : { publicProfileVisibility: "everyone", nameTagColor: "#22c55e" };
  } catch {
    return { publicProfileVisibility: "everyone", nameTagColor: "#22c55e" };
  }
}

export function savePreferences(
  username: string,
  prefs: UserPreferences,
): void {
  localStorage.setItem(
    `diniverse_preferences_${username}`,
    JSON.stringify(prefs),
  );
}

export function getNameTagColor(username: string): string {
  const prefs = getPreferences(username);
  return prefs.nameTagColor ?? "#22c55e";
}
