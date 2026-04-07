import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import RequireProfile from "../components/auth/RequireProfile";
import ChibiAvatar from "../components/avatar/ChibiAvatar";
import {
  getCurrentUsername,
  getLocalSettings,
  saveLocalSettings,
} from "../hooks/useAccountSettings";
import type { InventoryItem } from "../types/avatarTypes";
import { DEFAULT_AVATAR_DATA } from "../types/avatarTypes";

const ITEM_TYPES: {
  value: InventoryItem["type"];
  label: string;
  slot: string;
  description: string;
}[] = [
  {
    value: "hat",
    label: "Hat",
    slot: "hat",
    description: "Placed on top of the head",
  },
  {
    value: "face",
    label: "Face Accessory",
    slot: "face",
    description: "Placed over the face (glasses, masks, etc.)",
  },
  {
    value: "neck",
    label: "Neck Accessory",
    slot: "neck",
    description: "Placed around the neck (necklaces, ties, etc.)",
  },
  {
    value: "shoulder",
    label: "Shoulder Accessory",
    slot: "shoulder",
    description: "Placed across the shoulders",
  },
  {
    value: "front",
    label: "Front Accessory",
    slot: "front",
    description: "Placed on the front of the torso",
  },
  {
    value: "back",
    label: "Back Accessory",
    slot: "back",
    description: "Placed behind the torso (wings, capes, etc.)",
  },
  {
    value: "waist",
    label: "Waist Accessory",
    slot: "waist",
    description: "Placed around the waist (belts, etc.)",
  },
  {
    value: "shirt",
    label: "Shirt",
    slot: "shirt",
    description: "Worn as a shirt over the torso",
  },
  {
    value: "tshirt",
    label: "T-Shirt",
    slot: "tshirt",
    description: "Worn as a t-shirt over the torso",
  },
  {
    value: "pants",
    label: "Pants",
    slot: "pants",
    description: "Worn on the legs",
  },
];

const SHOP_KEY = "diniverse_shop_items";

function getShopItems(): InventoryItem[] {
  try {
    const raw = localStorage.getItem(SHOP_KEY);
    if (raw) return JSON.parse(raw) as InventoryItem[];
  } catch {
    /* ignore */
  }
  return [];
}

function saveShopItems(items: InventoryItem[]): void {
  localStorage.setItem(SHOP_KEY, JSON.stringify(items));
}

export default function CreateUGCAccessories() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(50);
  const [itemType, setItemType] = useState<InventoryItem["type"]>("hat");
  const [limitedStock, setLimitedStock] = useState(false);
  const [stockCount, setStockCount] = useState(10);
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [imageName, setImageName] = useState("");

  // Preview avatar with the uploaded item equipped in the correct slot
  const selectedTypeDef = ITEM_TYPES.find((t) => t.value === itemType);
  const isClothing = ["shirt", "tshirt", "pants"].includes(itemType);

  const previewAvatarData = {
    ...DEFAULT_AVATAR_DATA,
    equippedClothing: {
      ...DEFAULT_AVATAR_DATA.equippedClothing,
      ...(isClothing && imageDataUrl ? { [itemType]: "preview_item" } : {}),
    },
    equippedAccessories: {
      ...DEFAULT_AVATAR_DATA.equippedAccessories,
      ...(!isClothing && imageDataUrl ? { [itemType]: "preview_item" } : {}),
    },
    accessoryPositions: {},
  };

  // Temporarily inject the preview image so ChibiAvatar can render it
  if (imageDataUrl) {
    try {
      const shopItems = getShopItems();
      const existingIdx = shopItems.findIndex((i) => i.id === "preview_item");
      const previewItem: InventoryItem = {
        id: "preview_item",
        name: title || "Preview",
        description: "",
        type: itemType,
        imageDataUrl,
        price: 0,
        limitedStock: false,
        creatorUsername: "preview",
      };
      if (existingIdx >= 0) {
        shopItems[existingIdx] = previewItem;
      } else {
        shopItems.push(previewItem);
      }
      saveShopItems(shopItems);
    } catch {
      /* ignore */
    }
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".png")) {
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

  function handlePublish() {
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
      type: itemType,
      imageDataUrl,
      price,
      limitedStock,
      stock: limitedStock ? stockCount : undefined,
      creatorUsername: username,
    };

    // Remove the temporary preview item
    const shopItems = getShopItems().filter((i) => i.id !== "preview_item");
    shopItems.push(newItem);
    saveShopItems(shopItems);

    // Give creator a free copy
    const settings = getLocalSettings(username);
    const newInventory = [...(settings.inventory ?? []), newItem];
    saveLocalSettings(username, { ...settings, inventory: newInventory });

    toast.success("Item published to the Avatar Shop! You got a free copy.");
    setTitle("");
    setDescription("");
    setPrice(50);
    setItemType("hat");
    setLimitedStock(false);
    setStockCount(10);
    setImageDataUrl("");
    setImageName("");
  }

  return (
    <RequireProfile>
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        {/* ─ Toolbar ─ */}
        <div className="border-b bg-background/95 backdrop-blur">
          <div className="container flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: "/create" })}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Create
              </Button>
              <h1 className="text-lg font-semibold">UGC Accessories Creator</h1>
            </div>
            <Button
              size="sm"
              className="gap-1.5"
              onClick={handlePublish}
              data-ocid="ugc.publish.primary_button"
            >
              <Upload className="h-4 w-4" />
              Publish Item
            </Button>
          </div>
        </div>

        {/* ─ Main content ─ */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left panel: item details + placement */}
          <div className="w-72 border-r bg-muted/30 overflow-y-auto">
            {/* Item Type & Body Placement */}
            <Card className="m-4 border-0 shadow-none">
              <CardHeader className="pb-2 pt-3 px-3">
                <CardTitle className="text-sm">
                  Item Type & Body Placement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 px-3 pb-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">
                    Where does this go on the body?
                  </Label>
                  <Select
                    value={itemType}
                    onValueChange={(v) =>
                      setItemType(v as InventoryItem["type"])
                    }
                  >
                    <SelectTrigger data-ocid="ugc.type_select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ITEM_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedTypeDef && (
                    <p className="text-xs text-muted-foreground">
                      {selectedTypeDef.description}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Upload Image */}
            <Card className="m-4 mt-0 border-0 shadow-none">
              <CardHeader className="pb-2 pt-3 px-3">
                <CardTitle className="text-sm">Upload PNG</CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <button
                  type="button"
                  className="w-full border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors"
                  onClick={() => fileRef.current?.click()}
                  data-ocid="ugc.dropzone"
                >
                  {imageDataUrl ? (
                    <div className="flex flex-col items-center gap-2">
                      <img
                        src={imageDataUrl}
                        alt="preview"
                        className="h-16 w-16 object-contain"
                      />
                      <span className="text-xs text-muted-foreground">
                        {imageName}
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="text-2xl">📷</div>
                      <div className="text-xs text-muted-foreground">
                        Click to upload a transparent .png
                      </div>
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
              </CardContent>
            </Card>

            {/* Item Details */}
            <Card className="m-4 mt-0 border-0 shadow-none">
              <CardHeader className="pb-2 pt-3 px-3">
                <CardTitle className="text-sm">Item Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 px-3 pb-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Title</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="My Cool Hat"
                    data-ocid="ugc.title_input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Description</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your item..."
                    rows={3}
                    data-ocid="ugc.description_input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Price (Dini Bucks)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={price}
                    onChange={(e) =>
                      setPrice(
                        Math.max(0, Number.parseInt(e.target.value) || 0),
                      )
                    }
                    data-ocid="ugc.price_input"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={limitedStock}
                      onCheckedChange={setLimitedStock}
                      data-ocid="ugc.limited_switch"
                    />
                    <Label className="text-xs">Limited Stock</Label>
                  </div>
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
                      placeholder="Stock amount"
                      data-ocid="ugc.stock_input"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center: Avatar Preview */}
          <div className="flex-1 bg-background flex flex-col items-center justify-center gap-6">
            <div className="text-center">
              <p className="text-sm font-semibold text-muted-foreground mb-1">
                Avatar Preview
              </p>
              <p className="text-xs text-muted-foreground">
                Your item will appear on the avatar once you upload a PNG
              </p>
            </div>
            <div className="bg-muted/20 rounded-2xl p-8 border">
              <ChibiAvatar
                avatarData={previewAvatarData}
                width={200}
                height={260}
              />
            </div>
            {selectedTypeDef && (
              <div className="text-center space-y-1">
                <div className="text-xs font-semibold">
                  Slot:{" "}
                  <span className="text-primary">{selectedTypeDef.label}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {selectedTypeDef.description}
                </div>
              </div>
            )}
          </div>

          {/* Right panel: publish info */}
          <div className="w-64 border-l bg-muted/30 overflow-y-auto">
            <Card className="m-4 border-0 shadow-none">
              <CardHeader className="pb-2 pt-3 px-3">
                <CardTitle className="text-sm">Publishing Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 px-3 pb-3 text-xs text-muted-foreground">
                <p>When you publish:</p>
                <ul className="space-y-1.5 list-disc list-inside">
                  <li>
                    Your item appears in the Avatar Shop for others to buy
                  </li>
                  <li>You receive a free copy in your inventory</li>
                  <li>Buyers can equip it to their avatar</li>
                  <li>You earn Dini Bucks when others buy it</li>
                </ul>
                <div className="mt-3 p-2 bg-muted rounded-lg">
                  <p className="font-semibold text-foreground text-[11px] mb-1">
                    Body Placement Guide
                  </p>
                  {ITEM_TYPES.map((t) => (
                    <div
                      key={t.value}
                      className={`flex items-start gap-1 py-0.5 ${
                        t.value === itemType ? "text-primary font-semibold" : ""
                      }`}
                    >
                      <span className="shrink-0">
                        {t.value === itemType ? "▶" : "•"}
                      </span>
                      <span>
                        <strong>{t.label}:</strong> {t.description}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </RequireProfile>
  );
}
