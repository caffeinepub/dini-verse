import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  Check,
  Coins,
  Crown,
  Gamepad2,
  Shield,
  Trash2,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type NotificationType =
  | "group_join_request"
  | "group_join_accepted"
  | "group_join_declined"
  | "friend_request"
  | "friend_accepted"
  | "group_role_changed"
  | "dini_bucks_received"
  | "game_published"
  | "group_ally"
  | "group_enemy"
  | "system";

export interface DiniNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  timestamp: number;
  groupId?: string;
  fromUser?: string;
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

const NOTIF_KEY_PREFIX = "diniverse_notifications_";

export function getNotifications(username: string): DiniNotification[] {
  try {
    const raw = localStorage.getItem(`${NOTIF_KEY_PREFIX}${username}`);
    return raw ? (JSON.parse(raw) as DiniNotification[]) : [];
  } catch {
    return [];
  }
}

export function saveNotifications(
  username: string,
  notifications: DiniNotification[],
): void {
  localStorage.setItem(
    `${NOTIF_KEY_PREFIX}${username}`,
    JSON.stringify(notifications),
  );
}

export function pushNotification(
  username: string,
  notif: Omit<DiniNotification, "id" | "read" | "timestamp">,
): void {
  const existing = getNotifications(username);
  const newNotif: DiniNotification = {
    ...notif,
    id: Math.random().toString(36).slice(2) + Date.now().toString(36),
    read: false,
    timestamp: Date.now(),
  };
  saveNotifications(username, [newNotif, ...existing].slice(0, 100)); // keep last 100
}

// ─── Icon by type ─────────────────────────────────────────────────────────────

function NotifIcon({ type }: { type: NotificationType }) {
  const cls = "w-4 h-4 shrink-0";
  switch (type) {
    case "group_join_request":
      return <Users className={`${cls} text-blue-500`} />;
    case "group_join_accepted":
      return <UserCheck className={`${cls} text-green-500`} />;
    case "group_join_declined":
      return <X className={`${cls} text-red-500`} />;
    case "friend_request":
      return <Users className={`${cls} text-purple-500`} />;
    case "friend_accepted":
      return <UserCheck className={`${cls} text-green-500`} />;
    case "group_role_changed":
      return <Crown className={`${cls} text-yellow-500`} />;
    case "dini_bucks_received":
      return <Coins className={`${cls} text-amber-500`} />;
    case "game_published":
      return <Gamepad2 className={`${cls} text-blue-500`} />;
    case "group_ally":
      return <Shield className={`${cls} text-green-500`} />;
    case "group_enemy":
      return <Shield className={`${cls} text-red-500`} />;
    default:
      return <Bell className={`${cls} text-muted-foreground`} />;
  }
}

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  username: string | null;
}

export default function NotificationsPanel({ username }: Props) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<DiniNotification[]>([]);

  // Refresh every time panel opens or periodically
  useEffect(() => {
    if (!username) return;
    const refresh = () => setNotifications(getNotifications(username));
    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [username]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    if (!username) return;
    const updated = notifications.map((n) => ({ ...n, read: true }));
    saveNotifications(username, updated);
    setNotifications(updated);
  };

  const markRead = (id: string) => {
    if (!username) return;
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n,
    );
    saveNotifications(username, updated);
    setNotifications(updated);
  };

  const deleteNotification = (id: string) => {
    if (!username) return;
    const updated = notifications.filter((n) => n.id !== id);
    saveNotifications(username, updated);
    setNotifications(updated);
  };

  const clearAll = () => {
    if (!username) return;
    saveNotifications(username, []);
    setNotifications([]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-header-foreground hover:bg-header-accent"
          data-ocid="notifications.open_modal_button"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center px-1">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-96 p-0"
        align="end"
        data-ocid="notifications.popover"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            <span className="font-semibold text-sm">Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs px-1.5 py-0">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={markAllRead}
                data-ocid="notifications.mark_all_read.button"
              >
                <Check className="w-3 h-3 mr-1" />
                Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-destructive hover:text-destructive"
                onClick={clearAll}
                data-ocid="notifications.clear_all.delete_button"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* List */}
        {notifications.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-12 text-center"
            data-ocid="notifications.empty_state"
          >
            <Bell className="w-10 h-10 text-muted-foreground mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground">
              No notifications yet.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Group activity and updates will appear here.
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[400px]">
            <div className="divide-y">
              {notifications.map((notif, idx) => (
                <div
                  key={notif.id}
                  className={`flex items-start gap-3 px-4 py-3 hover:bg-accent/50 transition-colors ${
                    !notif.read ? "bg-primary/5" : ""
                  }`}
                  data-ocid={`notifications.item.${idx + 1}`}
                >
                  <div className="mt-0.5">
                    <NotifIcon type={notif.type} />
                  </div>
                  <button
                    type="button"
                    className="flex-1 min-w-0 cursor-pointer text-left bg-transparent border-none p-0"
                    onClick={() => markRead(notif.id)}
                  >
                    <p
                      className={`text-sm leading-tight ${!notif.read ? "font-semibold" : "font-medium"}`}
                    >
                      {notif.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                      {notif.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatRelativeTime(notif.timestamp)}
                    </p>
                  </button>
                  <div className="flex items-center gap-1 shrink-0">
                    {!notif.read && (
                      <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                      onClick={() => deleteNotification(notif.id)}
                      data-ocid={`notifications.delete_button.${idx + 1}`}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="px-4 py-2 text-center">
              <p className="text-xs text-muted-foreground">
                {notifications.length} notification
                {notifications.length !== 1 ? "s" : ""}
              </p>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
