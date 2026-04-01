import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import RequireProfile from "../components/auth/RequireProfile";
import {
  getCurrentUsername,
  getLocalSettings,
  saveLocalSettings,
} from "../hooks/useAccountSettings";
import type { InventoryItem } from "../types/avatarTypes";

// ─── Shop Items Storage ───────────────────────────────────────────────────────

const SHOP_KEY = "diniverse_shop_items";

function makeSvgDataUrl(color: string, label: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" rx="12" fill="${color}"/><text x="50" y="56" font-size="11" text-anchor="middle" fill="white" font-family="sans-serif" font-weight="bold">${label}</text></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

const DEMO_ITEMS: InventoryItem[] = [
  {
    id: "demo_shirt_1",
    name: "Classic White Shirt",
    description: "A clean, crisp white shirt perfect for any occasion.",
    type: "shirt",
    imageDataUrl: makeSvgDataUrl("#e8e8e8", "Shirt"),
    price: 50,
    limitedStock: false,
    creatorUsername: "DiniVerse",
  },
  {
    id: "demo_shirt_2",
    name: "Denim Jacket",
    description: "Cool denim jacket with patches.",
    type: "shirt",
    imageDataUrl: makeSvgDataUrl("#4a6fa5", "Denim"),
    price: 120,
    limitedStock: false,
    creatorUsername: "DiniVerse",
  },
  {
    id: "demo_tshirt_1",
    name: "Striped T-Shirt",
    description: "Colorful horizontal stripes for a fun look.",
    type: "tshirt",
    imageDataUrl: makeSvgDataUrl("#f4a261", "T-Shirt"),
    price: 35,
    limitedStock: false,
    creatorUsername: "DiniVerse",
  },
  {
    id: "demo_tshirt_2",
    name: "Neon Green Tee",
    description: "Stand out with this bright neon tee.",
    type: "tshirt",
    imageDataUrl: makeSvgDataUrl("#52b788", "Neon Tee"),
    price: 40,
    limitedStock: true,
    stock: 50,
    creatorUsername: "DiniVerse",
  },
  {
    id: "demo_pants_1",
    name: "Blue Jeans",
    description: "Classic straight-cut blue jeans.",
    type: "pants",
    imageDataUrl: makeSvgDataUrl("#264653", "Jeans"),
    price: 45,
    limitedStock: false,
    creatorUsername: "DiniVerse",
  },
  {
    id: "demo_pants_2",
    name: "Plaid Shorts",
    description: "Fun plaid shorts for summer vibes.",
    type: "pants",
    imageDataUrl: makeSvgDataUrl("#e76f51", "Shorts"),
    price: 30,
    limitedStock: false,
    creatorUsername: "DiniVerse",
  },
  {
    id: "demo_hat_1",
    name: "Top Hat",
    description: "A classic top hat for distinguished avatars.",
    type: "hat",
    imageDataUrl: makeSvgDataUrl("#1d1d1d", "Top Hat"),
    price: 75,
    limitedStock: false,
    creatorUsername: "DiniVerse",
  },
  {
    id: "demo_hat_2",
    name: "Flower Crown",
    description: "A beautiful crown made of flowers.",
    type: "hat",
    imageDataUrl: makeSvgDataUrl("#e9c46a", "Flowers"),
    price: 60,
    limitedStock: true,
    stock: 25,
    creatorUsername: "DiniVerse",
  },
  {
    id: "demo_face_1",
    name: "Star Glasses",
    description: "Sparkly star-shaped glasses.",
    type: "face",
    imageDataUrl: makeSvgDataUrl("#9b2226", "Glasses"),
    price: 30,
    limitedStock: false,
    creatorUsername: "DiniVerse",
  },
  {
    id: "demo_neck_1",
    name: "Pearl Necklace",
    description: "Elegant pearl necklace.",
    type: "neck",
    imageDataUrl: makeSvgDataUrl("#f8f9fa", "Pearls"),
    price: 55,
    limitedStock: false,
    creatorUsername: "DiniVerse",
  },
];

function getShopItems(): InventoryItem[] {
  try {
    const raw = localStorage.getItem(SHOP_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as InventoryItem[];
      // merge with demo items (demo items always present)
      const parsedIds = new Set(parsed.map((i) => i.id));
      const extras = DEMO_ITEMS.filter((d) => !parsedIds.has(d.id));
      return [
        ...DEMO_ITEMS.filter((d) => parsedIds.has(d.id)).map(
          (d) => parsed.find((p) => p.id === d.id) ?? d,
        ),
        ...extras,
        ...parsed.filter((p) => !DEMO_ITEMS.some((d) => d.id === p.id)),
      ];
    }
  } catch {
    // fall through
  }
  return DEMO_ITEMS;
}

function saveShopItems(items: InventoryItem[]): void {
  localStorage.setItem(SHOP_KEY, JSON.stringify(items));
}

function getDiniBucks(username: string): number {
  const raw = localStorage.getItem(`diniverse_dini_bucks_${username}`);
  return raw ? Number.parseInt(raw, 10) || 1000 : 1000;
}

function setDiniBucks(username: string, amount: number): void {
  localStorage.setItem(`diniverse_dini_bucks_${username}`, String(amount));
}

// ─── Item Card ────────────────────────────────────────────────────────────────

function ShopItemCard({
  item,
  owned,
  onBuy,
}: {
  item: InventoryItem;
  owned: boolean;
  onBuy: (item: InventoryItem) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
    >
      <Card className="overflow-hidden h-full flex flex-col">
        <div className="bg-muted/30 p-3 flex items-center justify-center h-24">
          <img
            src={item.imageDataUrl}
            alt={item.name}
            className="h-full object-contain"
          />
        </div>
        <CardContent className="p-3 flex-1">
          <div className="font-semibold text-sm leading-tight">{item.name}</div>
          <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {item.description}
          </div>
          <div className="flex items-center gap-1 mt-2 flex-wrap">
            <Badge variant="secondary" className="text-[10px] h-4 px-1">
              {item.type}
            </Badge>
            {item.limitedStock && (
              <Badge variant="destructive" className="text-[10px] h-4 px-1">
                Limited{item.stock !== undefined ? ` (${item.stock})` : ""}
              </Badge>
            )}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            by {item.creatorUsername}
          </div>
        </CardContent>
        <CardFooter className="p-3 pt-0 flex items-center justify-between">
          <span className="text-sm font-bold text-primary">
            {item.price === 0 ? "Free" : `${item.price} DB`}
          </span>
          {owned ? (
            <Badge className="text-xs" variant="outline">
              Owned
            </Badge>
          ) : (
            <Button
              size="sm"
              className="h-7 text-xs"
              onClick={() => onBuy(item)}
              data-ocid="shop.primary_button"
            >
              Buy
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}

// ─── Create Modal ─────────────────────────────────────────────────────────────

function CreateItemModal({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(50);
  const [type, setType] = useState<InventoryItem["type"]>("shirt");
  const [limitedStock, setLimitedStock] = useState(false);
  const [stockCount, setStockCount] = useState(10);
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [imageName, setImageName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".png")) {
      toast.error("Only PNG files are accepted.");
      return;
    }
    setImageName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImageDataUrl(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  function handleSubmit() {
    if (!title.trim()) {
      toast.error("Title is required.");
      return;
    }
    if (!imageDataUrl) {
      toast.error("Please upload a PNG image.");
      return;
    }

    const username = getCurrentUsername() ?? "unknown";
    const newItem: InventoryItem = {
      id: `ugc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: title.trim(),
      description: description.trim(),
      type,
      imageDataUrl,
      price,
      limitedStock,
      stock: limitedStock ? stockCount : undefined,
      creatorUsername: username,
    };

    // Add to shop
    const shopItems = getShopItems();
    shopItems.push(newItem);
    saveShopItems(shopItems);

    // Add to creator's inventory for free
    const settings = getLocalSettings(username);
    const newInventory = [...(settings.inventory ?? []), newItem];
    saveLocalSettings(username, { ...settings, inventory: newInventory });

    toast.success("Item published! It's now in your inventory for free.");
    setOpen(false);
    setTitle("");
    setDescription("");
    setPrice(50);
    setType("shirt");
    setLimitedStock(false);
    setStockCount(10);
    setImageDataUrl("");
    setImageName("");
    onCreated();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-ocid="shop.open_modal_button" className="gap-1">
          + Create
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md" data-ocid="shop.dialog">
        <DialogHeader>
          <DialogTitle>Create Avatar Item</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {/* Image Upload */}
          <div className="space-y-1.5">
            <Label>Upload PNG (transparent background)</Label>
            <button
              type="button"
              className="w-full border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => fileRef.current?.click()}
              data-ocid="shop.dropzone"
            >
              {imageDataUrl ? (
                <div className="flex items-center gap-3 justify-center">
                  <img
                    src={imageDataUrl}
                    alt="preview"
                    className="h-12 w-12 object-contain"
                  />
                  <span className="text-xs text-muted-foreground">
                    {imageName}
                  </span>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Click to upload a .png file
                </div>
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".png"
              className="hidden"
              onChange={handleFile}
            />
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Cool Hat"
              data-ocid="shop.input"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your item..."
              rows={2}
              data-ocid="shop.textarea"
            />
          </div>

          {/* Type */}
          <div className="space-y-1.5">
            <Label>Item Type</Label>
            <Select
              value={type}
              onValueChange={(v) => setType(v as InventoryItem["type"])}
            >
              <SelectTrigger data-ocid="shop.select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="shirt">Shirt</SelectItem>
                <SelectItem value="tshirt">T-Shirt</SelectItem>
                <SelectItem value="pants">Pants</SelectItem>
                <SelectItem value="hat">Hat</SelectItem>
                <SelectItem value="face">Face Accessory</SelectItem>
                <SelectItem value="neck">Neck Accessory</SelectItem>
                <SelectItem value="shoulder">Shoulder Accessory</SelectItem>
                <SelectItem value="front">Front Accessory</SelectItem>
                <SelectItem value="back">Back Accessory</SelectItem>
                <SelectItem value="waist">Waist Accessory</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Price */}
          <div className="space-y-1.5">
            <Label>Price (Dini Bucks)</Label>
            <Input
              type="number"
              min={0}
              value={price}
              onChange={(e) =>
                setPrice(Math.max(0, Number.parseInt(e.target.value) || 0))
              }
              data-ocid="shop.input"
            />
          </div>

          {/* Limited Stock */}
          <div className="flex items-center gap-3">
            <Switch
              checked={limitedStock}
              onCheckedChange={setLimitedStock}
              data-ocid="shop.switch"
            />
            <Label>Limited Stock</Label>
            {limitedStock && (
              <Input
                type="number"
                min={1}
                value={stockCount}
                onChange={(e) =>
                  setStockCount(
                    Math.max(1, Number.parseInt(e.target.value) || 1),
                  )
                }
                className="w-20"
                data-ocid="shop.input"
              />
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            data-ocid="shop.cancel_button"
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} data-ocid="shop.submit_button">
            Publish Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "shirt", label: "Shirts" },
  { key: "tshirt", label: "T-Shirts" },
  { key: "pants", label: "Pants" },
  { key: "hat", label: "Hats" },
  { key: "face", label: "Face" },
  { key: "neck", label: "Neck" },
  { key: "shoulder", label: "Shoulder" },
  { key: "front", label: "Front" },
  { key: "back", label: "Back" },
  { key: "waist", label: "Waist" },
] as const;

export default function AvatarShop() {
  const [shopItems, setShopItems] = useState<InventoryItem[]>(() =>
    getShopItems(),
  );
  const [diniBucks, setDiniBucksState] = useState(() => {
    const username = getCurrentUsername() ?? "";
    return getDiniBucks(username);
  });
  const [ownedIds, setOwnedIds] = useState<Set<string>>(() => {
    const username = getCurrentUsername();
    if (!username) return new Set();
    const settings = getLocalSettings(username);
    return new Set((settings.inventory ?? []).map((i) => i.id));
  });

  function refreshShop() {
    setShopItems(getShopItems());
    const username = getCurrentUsername();
    if (username) {
      const settings = getLocalSettings(username);
      setOwnedIds(new Set((settings.inventory ?? []).map((i) => i.id)));
    }
  }

  function handleBuy(item: InventoryItem) {
    const username = getCurrentUsername();
    if (!username) {
      toast.error("Please log in first.");
      return;
    }
    const balance = getDiniBucks(username);
    if (balance < item.price) {
      toast.error(
        `Not enough Dini Bucks! You have ${balance} DB, need ${item.price} DB.`,
      );
      return;
    }
    const settings = getLocalSettings(username);
    if ((settings.inventory ?? []).some((i) => i.id === item.id)) {
      toast.error("You already own this item!");
      return;
    }
    // Deduct bucks
    const newBalance = balance - item.price;
    setDiniBucks(username, newBalance);
    setDiniBucksState(newBalance);
    // Add to inventory
    const newInventory = [...(settings.inventory ?? []), item];
    saveLocalSettings(username, { ...settings, inventory: newInventory });
    setOwnedIds((prev) => new Set([...prev, item.id]));
    toast.success(
      `Purchased "${item.name}"! Check your inventory in the Avatar Editor.`,
    );
  }

  return (
    <RequireProfile>
      <div className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-6"
          >
            <div>
              <h1 className="text-2xl font-bold">Avatar Shop</h1>
              <p className="text-sm text-muted-foreground">
                Your balance:{" "}
                <span className="font-semibold text-primary">
                  {diniBucks} Dini Bucks
                </span>
              </p>
            </div>
            <CreateItemModal onCreated={refreshShop} />
          </motion.div>

          <Tabs defaultValue="all">
            <ScrollArea className="w-full">
              <TabsList className="flex w-max gap-0.5">
                {CATEGORIES.map((cat) => (
                  <TabsTrigger
                    key={cat.key}
                    value={cat.key}
                    className="text-xs px-3"
                    data-ocid="shop.tab"
                  >
                    {cat.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </ScrollArea>

            {CATEGORIES.map((cat) => {
              const items =
                cat.key === "all"
                  ? shopItems
                  : shopItems.filter((i) => i.type === cat.key);

              return (
                <TabsContent key={cat.key} value={cat.key} className="mt-4">
                  {items.length === 0 ? (
                    <div
                      className="text-center py-16 text-muted-foreground"
                      data-ocid="shop.empty_state"
                    >
                      <div className="text-4xl mb-3">🏪</div>
                      <p className="text-sm">No items in this category yet.</p>
                      <p className="text-xs mt-1">
                        Be the first to create one with the + Create button!
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {items.map((item, idx) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.04 }}
                          data-ocid={`shop.item.${idx + 1}`}
                        >
                          <ShopItemCard
                            item={item}
                            owned={ownedIds.has(item.id)}
                            onBuy={handleBuy}
                          />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        </div>
      </div>
    </RequireProfile>
  );
}
