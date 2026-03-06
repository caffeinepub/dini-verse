import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  Ban,
  BookOpen,
  Coins,
  Crown,
  Gamepad2,
  Image,
  LogIn,
  Plus,
  Shield,
  Shirt,
  Swords,
  Trash2,
  TrendingUp,
  UserMinus,
  Users,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  getCurrentUsername,
  getLocalSettings,
} from "../hooks/useAccountSettings";
import { useSessionAuth } from "../hooks/useSessionAuth";

// ─── Data Models ─────────────────────────────────────────────────────────────

interface GroupMember {
  username: string;
  role: string;
  rank: number;
  status: "active" | "banned";
  joinedAt: number;
}

interface GroupExperience {
  id: string;
  name: string;
  createdBy: string;
  createdAt: number;
}

interface GroupItem {
  id: string;
  name: string;
  type: "shirt" | "pants" | "ugc";
  price: number;
  createdBy: string;
  createdAt: number;
}

interface GroupPost {
  id: string;
  author: string;
  content: string;
  createdAt: number;
}

interface AuditEntry {
  id: string;
  action: string;
  performedBy: string;
  target?: string;
  timestamp: number;
}

interface AllyEnemy {
  groupId: string;
  groupName: string;
  type: "ally" | "enemy";
}

interface JoinRequest {
  username: string;
  requestedAt: number;
}

interface RecurringPayout {
  id: string;
  member: string;
  amount: number;
  frequency: "weekly" | "monthly";
}

interface Group {
  id: string;
  name: string;
  thumbnailDataUrl: string | null;
  ownedBy: string;
  members: GroupMember[];
  roles: string[];
  treasury: number;
  experiences: GroupExperience[];
  items: GroupItem[];
  posts: GroupPost[];
  auditLog: AuditEntry[];
  alliesEnemies: AllyEnemy[];
  joinRequests: JoinRequest[];
  recurringPayouts: RecurringPayout[];
  createdAt: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const GROUPS_KEY = "diniverse_groups";
const GROUP_COST = 500;

function getGroups(): Group[] {
  try {
    const raw = localStorage.getItem(GROUPS_KEY);
    return raw ? (JSON.parse(raw) as Group[]) : [];
  } catch {
    return [];
  }
}

function saveGroups(groups: Group[]): void {
  localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
}

function getDiniBucks(username: string): number {
  const raw = localStorage.getItem(`diniverse_dinibucks_${username}`);
  return raw ? Number(raw) : 1000;
}

function setDiniBucks(username: string, amount: number): void {
  localStorage.setItem(`diniverse_dinibucks_${username}`, String(amount));
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

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function addAuditEntry(
  group: Group,
  action: string,
  performedBy: string,
  target?: string,
): Group {
  return {
    ...group,
    auditLog: [
      {
        id: generateId(),
        action,
        performedBy,
        target,
        timestamp: Date.now(),
      },
      ...group.auditLog,
    ],
  };
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

function MemberManagementTab({
  group,
  currentUser,
  onUpdate,
}: {
  group: Group;
  currentUser: string;
  onUpdate: (g: Group) => void;
}) {
  const [newRole, setNewRole] = useState("");
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const isAdmin =
    group.members.find((m) => m.username === currentUser)?.role === "Owner" ||
    group.members.find((m) => m.username === currentUser)?.role === "Admin";

  const handleKick = (target: string) => {
    let updated = {
      ...group,
      members: group.members.filter((m) => m.username !== target),
    };
    updated = addAuditEntry(updated, "Kicked member", currentUser, target);
    onUpdate(updated);
    toast.success(`${target} has been kicked`);
  };

  const handleBan = (target: string) => {
    let updated = {
      ...group,
      members: group.members.map((m) =>
        m.username === target ? { ...m, status: "banned" as const } : m,
      ),
    };
    updated = addAuditEntry(updated, "Banned member", currentUser, target);
    onUpdate(updated);
    toast.success(`${target} has been banned`);
  };

  const handleAcceptJoinRequest = (requesterUsername: string) => {
    let updated: Group = {
      ...group,
      joinRequests: group.joinRequests.filter(
        (r) => r.username !== requesterUsername,
      ),
      members: [
        ...group.members,
        {
          username: requesterUsername,
          role: "Member",
          rank: group.members.length + 1,
          status: "active",
          joinedAt: Date.now(),
        },
      ],
    };
    updated = addAuditEntry(
      updated,
      "Accepted join request",
      currentUser,
      requesterUsername,
    );
    onUpdate(updated);
    toast.success(`${requesterUsername} has joined the group`);
  };

  const handleDeclineJoinRequest = (requesterUsername: string) => {
    const updated: Group = {
      ...group,
      joinRequests: group.joinRequests.filter(
        (r) => r.username !== requesterUsername,
      ),
    };
    onUpdate(updated);
    toast.success(`Join request from ${requesterUsername} declined`);
  };

  const handleCreateRole = () => {
    if (!newRole.trim()) {
      toast.error("Role name is required");
      return;
    }
    if (group.roles.includes(newRole.trim())) {
      toast.error("Role already exists");
      return;
    }
    let updated: Group = {
      ...group,
      roles: [...group.roles, newRole.trim()],
    };
    updated = addAuditEntry(
      updated,
      `Created role: ${newRole.trim()}`,
      currentUser,
    );
    onUpdate(updated);
    setNewRole("");
    setShowRoleDialog(false);
    toast.success(`Role "${newRole.trim()}" created`);
  };

  const handleRoleChange = (memberUsername: string, role: string) => {
    let updated: Group = {
      ...group,
      members: group.members.map((m) =>
        m.username === memberUsername ? { ...m, role } : m,
      ),
    };
    updated = addAuditEntry(
      updated,
      `Changed ${memberUsername}'s role to ${role}`,
      currentUser,
      memberUsername,
    );
    onUpdate(updated);
    toast.success("Role updated");
  };

  return (
    <div className="space-y-6">
      {/* Roles */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">Roles</h3>
          {isAdmin && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowRoleDialog(true)}
              data-ocid="groups.member.open_modal_button"
            >
              <Plus className="w-3 h-3 mr-1" />
              Create Role
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {group.roles.map((role) => (
            <Badge key={role} variant="secondary">
              {role}
            </Badge>
          ))}
        </div>
      </div>

      <Separator />

      {/* Members table */}
      <div>
        <h3 className="font-semibold text-sm mb-3">
          Members ({group.members.filter((m) => m.status === "active").length})
        </h3>
        <Table data-ocid="groups.member.table">
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Rank</TableHead>
              <TableHead>Status</TableHead>
              {isAdmin && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {group.members.map((member, idx) => (
              <TableRow
                key={member.username}
                data-ocid={`groups.member.row.${idx + 1}`}
              >
                <TableCell className="font-medium">
                  {member.username}
                  {member.username === group.ownedBy && (
                    <Crown className="w-3 h-3 inline ml-1 text-yellow-500" />
                  )}
                </TableCell>
                <TableCell>
                  {isAdmin && member.username !== group.ownedBy ? (
                    <Select
                      value={member.role}
                      onValueChange={(v) =>
                        handleRoleChange(member.username, v)
                      }
                    >
                      <SelectTrigger className="w-28 h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {group.roles.map((r) => (
                          <SelectItem key={r} value={r}>
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant="outline">{member.role}</Badge>
                  )}
                </TableCell>
                <TableCell>{member.rank}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      member.status === "active" ? "default" : "destructive"
                    }
                  >
                    {member.status}
                  </Badge>
                </TableCell>
                {isAdmin && (
                  <TableCell>
                    {member.username !== group.ownedBy &&
                      member.username !== currentUser && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                            onClick={() => handleKick(member.username)}
                            title="Kick"
                            data-ocid={`groups.member.delete_button.${idx + 1}`}
                          >
                            <UserMinus className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                            onClick={() => handleBan(member.username)}
                            title="Ban"
                          >
                            <Ban className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Join Requests */}
      {isAdmin && group.joinRequests.length > 0 && (
        <>
          <Separator />
          <div>
            <h3 className="font-semibold text-sm mb-3">
              Join Requests ({group.joinRequests.length})
            </h3>
            <div className="space-y-2">
              {group.joinRequests.map((req, idx) => (
                <div
                  key={req.username}
                  className="flex items-center justify-between p-3 border rounded-lg"
                  data-ocid={`groups.join.row.${idx + 1}`}
                >
                  <span className="font-medium text-sm">{req.username}</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleAcceptJoinRequest(req.username)}
                      data-ocid={`groups.join.confirm_button.${idx + 1}`}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeclineJoinRequest(req.username)}
                      data-ocid={`groups.join.cancel_button.${idx + 1}`}
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Create Role Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent data-ocid="groups.role.dialog">
          <DialogHeader>
            <DialogTitle>Create Role</DialogTitle>
            <DialogDescription>Add a new role to the group.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="roleName">Role Name</Label>
            <Input
              id="roleName"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              placeholder="e.g. Moderator"
              onKeyDown={(e) => e.key === "Enter" && handleCreateRole()}
              data-ocid="groups.role.input"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRoleDialog(false)}
              data-ocid="groups.role.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateRole}
              data-ocid="groups.role.confirm_button"
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RevenueTab({
  group,
  currentUser,
  onUpdate,
}: {
  group: Group;
  currentUser: string;
  onUpdate: (g: Group) => void;
}) {
  const [payoutMember, setPayoutMember] = useState("");
  const [payoutAmount, setPayoutAmount] = useState("");
  const [recurringMember, setRecurringMember] = useState("");
  const [recurringAmount, setRecurringAmount] = useState("");
  const [recurringFreq, setRecurringFreq] = useState<"weekly" | "monthly">(
    "weekly",
  );

  const isAdmin =
    group.members.find((m) => m.username === currentUser)?.role === "Owner" ||
    group.members.find((m) => m.username === currentUser)?.role === "Admin";

  const activeMembers = group.members.filter((m) => m.status === "active");

  const handleOneTimePayout = () => {
    if (!payoutMember) {
      toast.error("Select a member");
      return;
    }
    const amt = Number(payoutAmount);
    if (!amt || amt <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (amt > group.treasury) {
      toast.error("Insufficient treasury funds");
      return;
    }
    let updated: Group = { ...group, treasury: group.treasury - amt };
    updated = addAuditEntry(
      updated,
      `One-time payout of ${amt} Dini Bucks`,
      currentUser,
      payoutMember,
    );
    onUpdate(updated);
    setPayoutMember("");
    setPayoutAmount("");
    toast.success(`Paid ${amt} Dini Bucks to ${payoutMember}`);
  };

  const handleAddRecurring = () => {
    if (!recurringMember) {
      toast.error("Select a member");
      return;
    }
    const amt = Number(recurringAmount);
    if (!amt || amt <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    const payout: RecurringPayout = {
      id: generateId(),
      member: recurringMember,
      amount: amt,
      frequency: recurringFreq,
    };
    let updated: Group = {
      ...group,
      recurringPayouts: [...(group.recurringPayouts || []), payout],
    };
    updated = addAuditEntry(
      updated,
      `Added recurring ${recurringFreq} payout of ${amt} Dini Bucks`,
      currentUser,
      recurringMember,
    );
    onUpdate(updated);
    setRecurringMember("");
    setRecurringAmount("");
    toast.success("Recurring payout added");
  };

  const handleRemoveRecurring = (id: string) => {
    let updated: Group = {
      ...group,
      recurringPayouts: (group.recurringPayouts || []).filter(
        (p) => p.id !== id,
      ),
    };
    updated = addAuditEntry(updated, "Removed recurring payout", currentUser);
    onUpdate(updated);
    toast.success("Recurring payout removed");
  };

  return (
    <div className="space-y-6">
      {/* Treasury balance */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
        <Coins className="w-8 h-8 text-primary" />
        <div>
          <p className="text-sm text-muted-foreground">Treasury Balance</p>
          <p className="text-2xl font-bold">
            {group.treasury.toLocaleString()} Dini Bucks
          </p>
        </div>
      </div>

      {isAdmin && (
        <>
          {/* One-Time Payout */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">One-Time Payout</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Member</Label>
                  <Select value={payoutMember} onValueChange={setPayoutMember}>
                    <SelectTrigger data-ocid="groups.payout.select">
                      <SelectValue placeholder="Select member" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeMembers.map((m) => (
                        <SelectItem key={m.username} value={m.username}>
                          {m.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Amount (Dini Bucks)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    placeholder="0"
                    data-ocid="groups.payout.input"
                  />
                </div>
              </div>
              <Button
                size="sm"
                onClick={handleOneTimePayout}
                data-ocid="groups.payout.primary_button"
              >
                Pay Out
              </Button>
            </CardContent>
          </Card>

          {/* Recurring Payout */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Recurring Payout</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Member</Label>
                  <Select
                    value={recurringMember}
                    onValueChange={setRecurringMember}
                  >
                    <SelectTrigger data-ocid="groups.recurring.select">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeMembers.map((m) => (
                        <SelectItem key={m.username} value={m.username}>
                          {m.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Amount</Label>
                  <Input
                    type="number"
                    min={1}
                    value={recurringAmount}
                    onChange={(e) => setRecurringAmount(e.target.value)}
                    placeholder="0"
                    data-ocid="groups.recurring.input"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Frequency</Label>
                  <Select
                    value={recurringFreq}
                    onValueChange={(v) =>
                      setRecurringFreq(v as "weekly" | "monthly")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddRecurring}
                data-ocid="groups.recurring.primary_button"
              >
                Add Recurring Payout
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {/* Recurring payouts list */}
      {(group.recurringPayouts || []).length > 0 && (
        <div>
          <h3 className="font-semibold text-sm mb-3">
            Active Recurring Payouts
          </h3>
          <div className="space-y-2">
            {(group.recurringPayouts || []).map((p, idx) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 border rounded-lg"
                data-ocid={`groups.recurring.row.${idx + 1}`}
              >
                <div>
                  <span className="font-medium text-sm">{p.member}</span>
                  <span className="text-muted-foreground text-sm ml-2">
                    {p.amount} Dini Bucks / {p.frequency}
                  </span>
                </div>
                {isAdmin && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-destructive"
                    onClick={() => handleRemoveRecurring(p.id)}
                    data-ocid={`groups.recurring.delete_button.${idx + 1}`}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ExperiencesTab({
  group,
  currentUser,
  onUpdate,
}: {
  group: Group;
  currentUser: string;
  onUpdate: (g: Group) => void;
}) {
  const [showDialog, setShowDialog] = useState(false);
  const [expName, setExpName] = useState("");

  const hasPermission =
    group.members.find((m) => m.username === currentUser)?.role === "Owner" ||
    group.members.find((m) => m.username === currentUser)?.role === "Admin" ||
    group.members.find((m) => m.username === currentUser)?.role === "Member";

  const handleAddExperience = () => {
    if (!expName.trim()) {
      toast.error("Experience name is required");
      return;
    }
    const exp: GroupExperience = {
      id: generateId(),
      name: expName.trim(),
      createdBy: currentUser,
      createdAt: Date.now(),
    };
    let updated: Group = {
      ...group,
      experiences: [...group.experiences, exp],
    };
    updated = addAuditEntry(
      updated,
      `Added experience: ${expName.trim()}`,
      currentUser,
    );
    onUpdate(updated);
    setExpName("");
    setShowDialog(false);
    toast.success("Experience added");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">
          Group Experiences ({group.experiences.length})
        </h3>
        {hasPermission && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowDialog(true)}
            data-ocid="groups.exp.open_modal_button"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Experience
          </Button>
        )}
      </div>

      {group.experiences.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-xl"
          data-ocid="groups.exp.empty_state"
        >
          <Gamepad2 className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-sm">
            No group experiences yet. Add one to get started!
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {group.experiences.map((exp, idx) => (
            <div
              key={exp.id}
              className="flex items-center gap-3 p-3 border rounded-lg"
              data-ocid={`groups.exp.item.${idx + 1}`}
            >
              <Gamepad2 className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium text-sm">{exp.name}</p>
                <p className="text-xs text-muted-foreground">
                  Created by {exp.createdBy} ·{" "}
                  {formatRelativeTime(exp.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent data-ocid="groups.exp.dialog">
          <DialogHeader>
            <DialogTitle>Add Group Experience</DialogTitle>
            <DialogDescription>
              Add a game or experience owned by the group.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="expName">Experience Name</Label>
            <Input
              id="expName"
              value={expName}
              onChange={(e) => setExpName(e.target.value)}
              placeholder="e.g. Epic Adventure World"
              onKeyDown={(e) => e.key === "Enter" && handleAddExperience()}
              data-ocid="groups.exp.input"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              data-ocid="groups.exp.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddExperience}
              data-ocid="groups.exp.confirm_button"
            >
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ItemSalesTab({
  group,
  currentUser,
  onUpdate,
}: {
  group: Group;
  currentUser: string;
  onUpdate: (g: Group) => void;
}) {
  const [showDialog, setShowDialog] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemType, setItemType] = useState<"shirt" | "pants" | "ugc">("shirt");
  const [itemPrice, setItemPrice] = useState("");

  const hasPermission =
    group.members.find((m) => m.username === currentUser)?.role === "Owner" ||
    group.members.find((m) => m.username === currentUser)?.role === "Admin" ||
    group.members.find((m) => m.username === currentUser)?.role === "Member";

  const typeLabels: Record<string, string> = {
    shirt: "Shirt",
    pants: "Pants",
    ugc: "UGC Item",
  };

  const handleCreateItem = () => {
    if (!itemName.trim()) {
      toast.error("Item name is required");
      return;
    }
    const price = Number(itemPrice);
    if (!price || price < 0) {
      toast.error("Enter a valid price");
      return;
    }
    const item: GroupItem = {
      id: generateId(),
      name: itemName.trim(),
      type: itemType,
      price,
      createdBy: currentUser,
      createdAt: Date.now(),
    };
    let updated: Group = { ...group, items: [...group.items, item] };
    updated = addAuditEntry(
      updated,
      `Created item: ${itemName.trim()} (${typeLabels[itemType]}, ${price} Dini Bucks)`,
      currentUser,
    );
    onUpdate(updated);
    setItemName("");
    setItemPrice("");
    setShowDialog(false);
    toast.success("Item created");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">
          Items for Sale ({group.items.length})
        </h3>
        {hasPermission && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowDialog(true)}
            data-ocid="groups.items.open_modal_button"
          >
            <Plus className="w-3 h-3 mr-1" />
            Create Item
          </Button>
        )}
      </div>

      {group.items.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-xl"
          data-ocid="groups.items.empty_state"
        >
          <Shirt className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-sm">
            No items yet. Create clothing or UGC items for sale!
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {group.items.map((item, idx) => (
            <div
              key={item.id}
              className="p-3 border rounded-lg space-y-1"
              data-ocid={`groups.items.item.${idx + 1}`}
            >
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm">{item.name}</p>
                <Badge variant="secondary" className="text-xs">
                  {typeLabels[item.type]}
                </Badge>
              </div>
              <p className="text-sm font-semibold text-primary">
                {item.price} Dini Bucks
              </p>
              <p className="text-xs text-muted-foreground">
                by {item.createdBy}
              </p>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent data-ocid="groups.items.dialog">
          <DialogHeader>
            <DialogTitle>Create Item</DialogTitle>
            <DialogDescription>
              Create a clothing or UGC item for your group to sell.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label>Item Name</Label>
              <Input
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="e.g. Cool Hat"
                data-ocid="groups.items.input"
              />
            </div>
            <div className="space-y-1">
              <Label>Type</Label>
              <Select
                value={itemType}
                onValueChange={(v) =>
                  setItemType(v as "shirt" | "pants" | "ugc")
                }
              >
                <SelectTrigger data-ocid="groups.items.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="shirt">Shirt</SelectItem>
                  <SelectItem value="pants">Pants</SelectItem>
                  <SelectItem value="ugc">UGC Item</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Price (Dini Bucks)</Label>
              <Input
                type="number"
                min={0}
                value={itemPrice}
                onChange={(e) => setItemPrice(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              data-ocid="groups.items.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateItem}
              data-ocid="groups.items.confirm_button"
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SocialTab({
  group,
  currentUser,
  onUpdate,
}: {
  group: Group;
  currentUser: string;
  onUpdate: (g: Group) => void;
}) {
  const [postContent, setPostContent] = useState("");

  const handlePost = () => {
    if (!postContent.trim()) {
      toast.error("Post content is required");
      return;
    }
    const post: GroupPost = {
      id: generateId(),
      author: currentUser,
      content: postContent.trim(),
      createdAt: Date.now(),
    };
    const updated: Group = {
      ...group,
      posts: [post, ...group.posts],
    };
    onUpdate(updated);
    setPostContent("");
    toast.success("Post published!");
  };

  const sortedPosts = [...group.posts].sort(
    (a, b) => b.createdAt - a.createdAt,
  );

  return (
    <div className="space-y-4">
      {/* Post composer */}
      <div className="space-y-2">
        <Textarea
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          placeholder="Write something for the group..."
          rows={3}
          data-ocid="groups.social.textarea"
        />
        <Button
          size="sm"
          onClick={handlePost}
          data-ocid="groups.social.primary_button"
        >
          Post
        </Button>
      </div>

      <Separator />

      {/* Feed */}
      {sortedPosts.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-10 text-center"
          data-ocid="groups.social.empty_state"
        >
          <p className="text-muted-foreground text-sm">
            No posts yet. Be the first to post!
          </p>
        </div>
      ) : (
        <ScrollArea className="h-80">
          <div className="space-y-3 pr-3">
            {sortedPosts.map((post, idx) => (
              <div
                key={post.id}
                className="p-3 border rounded-lg space-y-2"
                data-ocid={`groups.social.item.${idx + 1}`}
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {post.author.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-sm">{post.author}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {formatRelativeTime(post.createdAt)}
                  </span>
                </div>
                <p className="text-sm">{post.content}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

function AuditLogTab({ group }: { group: Group }) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm">Activity Log</h3>
      {group.auditLog.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-10 text-center"
          data-ocid="groups.audit.empty_state"
        >
          <BookOpen className="w-8 h-8 text-muted-foreground mb-2" />
          <p className="text-muted-foreground text-sm">
            No activity logged yet.
          </p>
        </div>
      ) : (
        <ScrollArea className="h-80">
          <Table data-ocid="groups.audit.table">
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>By</TableHead>
                <TableHead>Target</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {group.auditLog.map((entry, idx) => (
                <TableRow
                  key={entry.id}
                  data-ocid={`groups.audit.row.${idx + 1}`}
                >
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatRelativeTime(entry.timestamp)}
                  </TableCell>
                  <TableCell className="text-sm">{entry.action}</TableCell>
                  <TableCell className="text-sm">{entry.performedBy}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {entry.target || "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      )}
    </div>
  );
}

function AlliesEnemiesTab({
  group,
  currentUser,
  onUpdate,
}: {
  group: Group;
  currentUser: string;
  onUpdate: (g: Group) => void;
}) {
  const [showAllyDialog, setShowAllyDialog] = useState(false);
  const [showEnemyDialog, setShowEnemyDialog] = useState(false);
  const [groupName, setGroupName] = useState("");

  const isAdmin =
    group.members.find((m) => m.username === currentUser)?.role === "Owner" ||
    group.members.find((m) => m.username === currentUser)?.role === "Admin";

  const handleAdd = (type: "ally" | "enemy") => {
    if (!groupName.trim()) {
      toast.error("Group name is required");
      return;
    }
    const entry: AllyEnemy = {
      groupId: generateId(),
      groupName: groupName.trim(),
      type,
    };
    let updated: Group = {
      ...group,
      alliesEnemies: [...group.alliesEnemies, entry],
    };
    updated = addAuditEntry(
      updated,
      `Added ${type}: ${groupName.trim()}`,
      currentUser,
    );
    onUpdate(updated);
    setGroupName("");
    setShowAllyDialog(false);
    setShowEnemyDialog(false);
    toast.success(`${groupName.trim()} added as ${type}`);
  };

  const handleRemove = (id: string, name: string) => {
    let updated: Group = {
      ...group,
      alliesEnemies: group.alliesEnemies.filter((e) => e.groupId !== id),
    };
    updated = addAuditEntry(
      updated,
      `Removed ${name} from allies/enemies`,
      currentUser,
    );
    onUpdate(updated);
    toast.success(`${name} removed`);
  };

  const allies = group.alliesEnemies.filter((e) => e.type === "ally");
  const enemies = group.alliesEnemies.filter((e) => e.type === "enemy");

  return (
    <div className="space-y-6">
      {/* Allies */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm flex items-center gap-1">
            <Shield className="w-4 h-4 text-green-500" />
            Allies ({allies.length})
          </h3>
          {isAdmin && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setGroupName("");
                setShowAllyDialog(true);
              }}
              data-ocid="groups.allies.open_modal_button"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Ally
            </Button>
          )}
        </div>
        {allies.length === 0 ? (
          <p
            className="text-sm text-muted-foreground py-4 text-center border-2 border-dashed rounded-lg"
            data-ocid="groups.allies.empty_state"
          >
            No allies yet.
          </p>
        ) : (
          <div className="space-y-2">
            {allies.map((e, idx) => (
              <div
                key={e.groupId}
                className="flex items-center justify-between p-3 border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800 rounded-lg"
                data-ocid={`groups.allies.item.${idx + 1}`}
              >
                <span className="font-medium text-sm">{e.groupName}</span>
                {isAdmin && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={() => handleRemove(e.groupId, e.groupName)}
                    data-ocid={`groups.allies.delete_button.${idx + 1}`}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Enemies */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm flex items-center gap-1">
            <Swords className="w-4 h-4 text-red-500" />
            Enemies ({enemies.length})
          </h3>
          {isAdmin && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setGroupName("");
                setShowEnemyDialog(true);
              }}
              data-ocid="groups.enemies.open_modal_button"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Enemy
            </Button>
          )}
        </div>
        {enemies.length === 0 ? (
          <p
            className="text-sm text-muted-foreground py-4 text-center border-2 border-dashed rounded-lg"
            data-ocid="groups.enemies.empty_state"
          >
            No enemies declared.
          </p>
        ) : (
          <div className="space-y-2">
            {enemies.map((e, idx) => (
              <div
                key={e.groupId}
                className="flex items-center justify-between p-3 border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800 rounded-lg"
                data-ocid={`groups.enemies.item.${idx + 1}`}
              >
                <span className="font-medium text-sm">{e.groupName}</span>
                {isAdmin && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={() => handleRemove(e.groupId, e.groupName)}
                    data-ocid={`groups.enemies.delete_button.${idx + 1}`}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ally Dialog */}
      <Dialog open={showAllyDialog} onOpenChange={setShowAllyDialog}>
        <DialogContent data-ocid="groups.allies.dialog">
          <DialogHeader>
            <DialogTitle>Add Ally Group</DialogTitle>
            <DialogDescription>
              Establish an alliance with another group.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label>Group Name</Label>
            <Input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              onKeyDown={(e) => e.key === "Enter" && handleAdd("ally")}
              data-ocid="groups.allies.input"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAllyDialog(false)}
              data-ocid="groups.allies.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleAdd("ally")}
              data-ocid="groups.allies.confirm_button"
            >
              Add Ally
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enemy Dialog */}
      <Dialog open={showEnemyDialog} onOpenChange={setShowEnemyDialog}>
        <DialogContent data-ocid="groups.enemies.dialog">
          <DialogHeader>
            <DialogTitle>Declare Enemy</DialogTitle>
            <DialogDescription>
              Declare a rivalry with another group.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label>Group Name</Label>
            <Input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              onKeyDown={(e) => e.key === "Enter" && handleAdd("enemy")}
              data-ocid="groups.enemies.input"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEnemyDialog(false)}
              data-ocid="groups.enemies.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleAdd("enemy")}
              data-ocid="groups.enemies.confirm_button"
            >
              Declare Enemy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Group Detail View ────────────────────────────────────────────────────────

function GroupDetail({
  group: initialGroup,
  currentUser,
  onBack,
}: {
  group: Group;
  currentUser: string;
  onBack: () => void;
}) {
  const [group, setGroup] = useState<Group>(initialGroup);

  const handleUpdate = (updated: Group) => {
    setGroup(updated);
    const groups = getGroups();
    const idx = groups.findIndex((g) => g.id === updated.id);
    if (idx >= 0) {
      groups[idx] = updated;
      saveGroups(groups);
    }
  };

  return (
    <div className="space-y-6" data-ocid="groups.detail.panel">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          data-ocid="groups.detail.cancel_button"
        >
          ← Back
        </Button>
        <div className="flex items-center gap-3">
          {group.thumbnailDataUrl ? (
            <img
              src={group.thumbnailDataUrl}
              alt={group.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold">{group.name}</h2>
            <p className="text-sm text-muted-foreground">
              {group.members.filter((m) => m.status === "active").length}{" "}
              members · {group.treasury} Dini Bucks treasury
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="members" className="w-full">
        <ScrollArea className="w-full">
          <TabsList className="w-full flex flex-nowrap overflow-x-auto">
            <TabsTrigger value="members" data-ocid="groups.detail.tab">
              Member Management
            </TabsTrigger>
            <TabsTrigger value="revenue" data-ocid="groups.detail.tab">
              Revenue
            </TabsTrigger>
            <TabsTrigger value="experiences" data-ocid="groups.detail.tab">
              Experiences
            </TabsTrigger>
            <TabsTrigger value="items" data-ocid="groups.detail.tab">
              Item Sales
            </TabsTrigger>
            <TabsTrigger value="social" data-ocid="groups.detail.tab">
              Social
            </TabsTrigger>
            <TabsTrigger value="audit" data-ocid="groups.detail.tab">
              Audit Log
            </TabsTrigger>
            <TabsTrigger value="allies" data-ocid="groups.detail.tab">
              Allies/Enemies
            </TabsTrigger>
          </TabsList>
        </ScrollArea>
        <TabsContent value="members" className="mt-4">
          <MemberManagementTab
            group={group}
            currentUser={currentUser}
            onUpdate={handleUpdate}
          />
        </TabsContent>
        <TabsContent value="revenue" className="mt-4">
          <RevenueTab
            group={group}
            currentUser={currentUser}
            onUpdate={handleUpdate}
          />
        </TabsContent>
        <TabsContent value="experiences" className="mt-4">
          <ExperiencesTab
            group={group}
            currentUser={currentUser}
            onUpdate={handleUpdate}
          />
        </TabsContent>
        <TabsContent value="items" className="mt-4">
          <ItemSalesTab
            group={group}
            currentUser={currentUser}
            onUpdate={handleUpdate}
          />
        </TabsContent>
        <TabsContent value="social" className="mt-4">
          <SocialTab
            group={group}
            currentUser={currentUser}
            onUpdate={handleUpdate}
          />
        </TabsContent>
        <TabsContent value="audit" className="mt-4">
          <AuditLogTab group={group} />
        </TabsContent>
        <TabsContent value="allies" className="mt-4">
          <AlliesEnemiesTab
            group={group}
            currentUser={currentUser}
            onUpdate={handleUpdate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Groups() {
  const { isAuthenticated } = useSessionAuth();
  const navigate = useNavigate();

  const username = getCurrentUsername();
  const localSettings = username ? getLocalSettings(username) : null;
  const displayName = localSettings?.displayName || username || "User";

  const [groups, setGroupsState] = useState<Group[]>(() => getGroups());
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupThumbnail, setNewGroupThumbnail] = useState<string | null>(
    null,
  );
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const diniBucks = username ? getDiniBucks(username) : 0;

  const refreshGroups = () => {
    const fresh = getGroups();
    setGroupsState(fresh);
    // Also update selected group if open
    if (selectedGroup) {
      const updated = fresh.find((g) => g.id === selectedGroup.id);
      if (updated) setSelectedGroup(updated);
    }
  };

  const handleThumbnailUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    setNewGroupThumbnail(dataUrl);
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
  };

  const handleCreateGroup = () => {
    if (!username) return;
    if (!newGroupName.trim()) {
      toast.error("Group name is required");
      return;
    }
    const bucks = getDiniBucks(username);
    if (bucks < GROUP_COST) {
      toast.error(
        `Insufficient Dini Bucks. You need ${GROUP_COST} but have ${bucks}.`,
      );
      return;
    }

    // Deduct cost
    setDiniBucks(username, bucks - GROUP_COST);

    const newGroup: Group = {
      id: generateId(),
      name: newGroupName.trim(),
      thumbnailDataUrl: newGroupThumbnail,
      ownedBy: username,
      members: [
        {
          username,
          role: "Owner",
          rank: 1,
          status: "active",
          joinedAt: Date.now(),
        },
      ],
      roles: ["Owner", "Admin", "Member"],
      treasury: 0,
      experiences: [],
      items: [],
      posts: [],
      auditLog: [
        {
          id: generateId(),
          action: `Group created by ${username}`,
          performedBy: username,
          timestamp: Date.now(),
        },
      ],
      alliesEnemies: [],
      joinRequests: [],
      recurringPayouts: [],
      createdAt: Date.now(),
    };

    const updated = [...groups, newGroup];
    saveGroups(updated);
    setGroupsState(updated);
    setNewGroupName("");
    setNewGroupThumbnail(null);
    setShowCreateDialog(false);
    toast.success(`Group "${newGroup.name}" created! 500 Dini Bucks deducted.`);
  };

  if (!isAuthenticated) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-8"
        data-ocid="groups.page"
      >
        <div className="text-center space-y-3">
          <LogIn className="w-12 h-12 mx-auto text-muted-foreground" />
          <h2 className="text-2xl font-bold">Login Required</h2>
          <p className="text-muted-foreground max-w-sm">
            Please log in to create and manage groups.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            data-ocid="groups.login.button"
            onClick={() => navigate({ to: "/login" })}
          >
            Log In
          </Button>
          <Button
            variant="outline"
            data-ocid="groups.signup.button"
            onClick={() => navigate({ to: "/signup" })}
          >
            Sign Up
          </Button>
        </div>
      </div>
    );
  }

  const myGroups = groups.filter((g) =>
    g.members.some((m) => m.username === username && m.status === "active"),
  );

  // If a group is selected, show its detail view
  if (selectedGroup) {
    return (
      <div className="container py-8 max-w-4xl">
        <GroupDetail
          group={selectedGroup}
          currentUser={username!}
          onBack={() => {
            refreshGroups();
            setSelectedGroup(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8" data-ocid="groups.page">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Groups</h1>
          <p className="text-muted-foreground mt-1">
            Connect with communities and collaborate together
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
            <Coins className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">
              {diniBucks.toLocaleString()} Dini Bucks
            </span>
          </div>
          <Button
            onClick={() => setShowCreateDialog(true)}
            data-ocid="groups.create.primary_button"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Group
          </Button>
        </div>
      </div>

      {/* Trending Groups */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Trending Groups</h2>
        </div>
        {groups.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-xl"
            data-ocid="groups.trending.empty_state"
          >
            <Users className="w-12 h-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              No groups yet. Be the first to create one!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {groups.map((group, idx) => (
              <button
                key={group.id}
                type="button"
                className="text-left p-3 border rounded-xl hover:border-primary/50 hover:bg-accent/50 transition-all group"
                onClick={() => setSelectedGroup(group)}
                data-ocid={`groups.trending.item.${idx + 1}`}
              >
                <div className="aspect-square rounded-lg overflow-hidden bg-primary/10 mb-2 flex items-center justify-center">
                  {group.thumbnailDataUrl ? (
                    <img
                      src={group.thumbnailDataUrl}
                      alt={group.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Image className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                  {group.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {group.members.filter((m) => m.status === "active").length}{" "}
                  members
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Your Groups */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Your Groups</h2>
        </div>
        {myGroups.length === 0 ? (
          <Card data-ocid="groups.my.empty_state">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                No Groups Yet
              </CardTitle>
              <CardDescription>
                You haven't joined or created any groups yet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-muted-foreground mb-4">
                  Create a group for 500 Dini Bucks to get started!
                </p>
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  data-ocid="groups.my.primary_button"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Group
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {myGroups.map((group, idx) => (
              <Card
                key={group.id}
                className="cursor-pointer hover:border-primary/50 transition-all"
                onClick={() => setSelectedGroup(group)}
                data-ocid={`groups.my.item.${idx + 1}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-primary/10 flex items-center justify-center shrink-0">
                      {group.thumbnailDataUrl ? (
                        <img
                          src={group.thumbnailDataUrl}
                          alt={group.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Users className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{group.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {
                          group.members.filter((m) => m.status === "active")
                            .length
                        }{" "}
                        members
                      </p>
                    </div>
                    {group.ownedBy === username && (
                      <Crown className="w-4 h-4 text-yellow-500 shrink-0" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Group Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent data-ocid="groups.create.dialog">
          <DialogHeader>
            <DialogTitle>Create a Group</DialogTitle>
            <DialogDescription>
              Start a new community group on Dini.Verse.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Cost warning */}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <div className="text-sm text-amber-800 dark:text-amber-300">
                <span className="font-semibold">
                  Cost: {GROUP_COST} Dini Bucks
                </span>
                <span className="ml-1">
                  — Your balance: {diniBucks} Dini Bucks
                </span>
                {diniBucks < GROUP_COST && (
                  <p className="text-destructive font-medium mt-1">
                    Insufficient Dini Bucks!
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="groupName">Group Name *</Label>
              <Input
                id="groupName"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Enter group name"
                onKeyDown={(e) => e.key === "Enter" && handleCreateGroup()}
                data-ocid="groups.create.input"
              />
            </div>

            <div className="space-y-1">
              <Label>Thumbnail</Label>
              <div className="flex items-center gap-3">
                {newGroupThumbnail ? (
                  <div className="relative">
                    <img
                      src={newGroupThumbnail}
                      alt="Thumbnail preview"
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setNewGroupThumbnail(null)}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                    <Image className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => thumbnailInputRef.current?.click()}
                  data-ocid="groups.create.upload_button"
                >
                  Upload Image
                </Button>
                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleThumbnailUpload}
                  data-ocid="groups.create.dropzone"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Thumbnail appears on the Trending Groups section.
              </p>
            </div>

            <p className="text-xs text-muted-foreground">
              You ({displayName}) will be the Owner of this group.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              data-ocid="groups.create.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateGroup}
              disabled={diniBucks < GROUP_COST}
              data-ocid="groups.create.confirm_button"
            >
              Create Group ({GROUP_COST} Dini Bucks)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
