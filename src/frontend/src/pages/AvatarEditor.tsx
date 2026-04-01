import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import RequireProfile from "../components/auth/RequireProfile";
import ChibiAvatar from "../components/avatar/ChibiAvatar";
import {
  getCurrentUsername,
  getLocalSettings,
  saveLocalSettings,
} from "../hooks/useAccountSettings";
import type {
  AccessoryPosition,
  AvatarData,
  FaceFeatures,
  InventoryItem,
} from "../types/avatarTypes";
import { DEFAULT_AVATAR_DATA } from "../types/avatarTypes";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function loadAvatarData(): AvatarData {
  const username = getCurrentUsername();
  if (!username) return { ...DEFAULT_AVATAR_DATA };
  const settings = getLocalSettings(username);
  return settings.avatarData ?? { ...DEFAULT_AVATAR_DATA };
}

function loadInventory(): InventoryItem[] {
  const username = getCurrentUsername();
  if (!username) return [];
  const settings = getLocalSettings(username);
  return settings.inventory ?? [];
}

function saveAvatarData(data: AvatarData) {
  const username = getCurrentUsername();
  if (!username) return;
  const settings = getLocalSettings(username);
  saveLocalSettings(username, { ...settings, avatarData: data });
}

// ─── Feature Labels ───────────────────────────────────────────────────────────

const HAIR_NAMES = [
  "Short",
  "Long Straight",
  "Pigtails",
  "Bob",
  "Wavy",
  "Ponytail",
];
const EYE_NAMES = ["Round", "Cat", "Sleepy", "Sparkle", "Dot"];
const EYEBROW_NAMES = ["Arched", "Thick Flat", "Thin Curved", "Worried"];
const NOSE_NAMES = ["Dot", "Button", "Cat Nose", "Triangle"];
const MOUTH_NAMES = ["Smile", "Happy Open", "Pout", "Cat Mouth", "Neutral"];
const EAR_NAMES = ["Round", "Pointy", "Cat Ears"];

const ACCESSORY_SLOTS = [
  { key: "hat" as const, label: "Hat" },
  { key: "face" as const, label: "Face" },
  { key: "neck" as const, label: "Neck" },
  { key: "shoulder" as const, label: "Shoulder" },
  { key: "front" as const, label: "Front" },
  { key: "back" as const, label: "Back" },
  { key: "waist" as const, label: "Waist" },
];

const CLOTHING_SLOTS = [
  { key: "shirt" as const, label: "Shirt", type: "shirt" as const },
  { key: "tshirt" as const, label: "T-Shirt", type: "tshirt" as const },
  { key: "pants" as const, label: "Pants", type: "pants" as const },
];

// ─── Face Slot Row ───────────────────────────────────────────────────────────

function FaceSlot({
  label,
  value,
  max,
  names,
  onChange,
  onUpload,
  uploadKey,
  uploadValue,
}: {
  label: string;
  value: number;
  max: number;
  names: string[];
  onChange: (v: number) => void;
  onUpload?: (dataUrl: string) => void;
  uploadKey?: string;
  uploadValue?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      if (result && onUpload) onUpload(result);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/40">
      <span className="text-xs font-medium w-20 shrink-0 text-muted-foreground">
        {label}
      </span>
      <Button
        size="icon"
        variant="ghost"
        className="h-6 w-6"
        onClick={() => onChange(Math.max(0, value - 1))}
      >
        ◀
      </Button>
      <span className="text-xs font-semibold min-w-[80px] text-center">
        {uploadValue && uploadKey ? "Custom" : names[value]}
      </span>
      <Button
        size="icon"
        variant="ghost"
        className="h-6 w-6"
        onClick={() => onChange((value + 1) % (max + 1))}
      >
        ▶
      </Button>
      {onUpload && (
        <>
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-6 px-2"
            onClick={() => fileRef.current?.click()}
          >
            Upload PNG
          </Button>
          {uploadValue && (
            <Button
              size="sm"
              variant="ghost"
              className="text-xs h-6 px-1 text-destructive"
              onClick={() => onUpload("")}
            >
              ✕
            </Button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/png"
            className="hidden"
            onChange={handleFile}
          />
        </>
      )}
    </div>
  );
}

// ─── Adjustment Panel ────────────────────────────────────────────────────────

function AdjustmentPanel({
  itemId,
  position,
  onChange,
}: {
  itemId: string | undefined;
  position: AccessoryPosition;
  onChange: (pos: AccessoryPosition) => void;
}) {
  if (!itemId) {
    return (
      <div className="text-xs text-muted-foreground text-center p-4">
        Select an accessory slot to adjust its position
      </div>
    );
  }

  const nudge = (dx: number, dy: number) =>
    onChange({ ...position, x: position.x + dx, y: position.y + dy });
  const rotate = (dr: number) =>
    onChange({ ...position, rotation: position.rotation + dr });

  return (
    <div className="space-y-3 p-3">
      <div className="text-xs font-semibold text-center text-muted-foreground">
        Position Adjustment
      </div>
      <div className="grid grid-cols-3 gap-1 w-28 mx-auto">
        <div />
        <Button
          size="icon"
          variant="outline"
          className="h-7 w-7"
          onClick={() => nudge(0, -2)}
          data-ocid="avatar.accessory.button"
        >
          ↑
        </Button>
        <div />
        <Button
          size="icon"
          variant="outline"
          className="h-7 w-7"
          onClick={() => nudge(-2, 0)}
          data-ocid="avatar.accessory.button"
        >
          ←
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="h-7 w-7 text-xs"
          onClick={() => onChange({ x: 0, y: 0, rotation: 0 })}
          data-ocid="avatar.accessory.button"
        >
          ✕
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="h-7 w-7"
          onClick={() => nudge(2, 0)}
          data-ocid="avatar.accessory.button"
        >
          →
        </Button>
        <div />
        <Button
          size="icon"
          variant="outline"
          className="h-7 w-7"
          onClick={() => nudge(0, 2)}
          data-ocid="avatar.accessory.button"
        >
          ↓
        </Button>
        <div />
      </div>
      <div className="flex gap-2 justify-center">
        <Button
          size="sm"
          variant="outline"
          className="text-xs h-7"
          onClick={() => rotate(-5)}
          data-ocid="avatar.accessory.button"
        >
          ↺ -5°
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="text-xs h-7"
          onClick={() => rotate(5)}
          data-ocid="avatar.accessory.button"
        >
          ↻ +5°
        </Button>
      </div>
      <div className="text-xs text-center text-muted-foreground">
        X: {position.x} · Y: {position.y} · {position.rotation}°
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AvatarEditor() {
  const [avatarData, setAvatarData] = useState<AvatarData>(() =>
    loadAvatarData(),
  );
  const [inventory, _setInventory] = useState<InventoryItem[]>(() =>
    loadInventory(),
  );
  const [selectedAccSlot, setSelectedAccSlot] = useState<string | null>(null);

  const update = useCallback((data: AvatarData) => {
    setAvatarData(data);
    saveAvatarData(data);
    toast.success("Saved", { duration: 800 });
  }, []);

  function updateFace(patch: Partial<FaceFeatures>) {
    update({
      ...avatarData,
      faceFeatures: { ...avatarData.faceFeatures, ...patch },
    });
  }

  function equipClothing(
    slot: keyof AvatarData["equippedClothing"],
    id: string | undefined,
  ) {
    update({
      ...avatarData,
      equippedClothing: { ...avatarData.equippedClothing, [slot]: id },
    });
  }

  function equipAccessory(
    slot: keyof AvatarData["equippedAccessories"],
    id: string | undefined,
  ) {
    update({
      ...avatarData,
      equippedAccessories: { ...avatarData.equippedAccessories, [slot]: id },
    });
  }

  function updateAccPosition(itemId: string, pos: AccessoryPosition) {
    const newPositions = { ...avatarData.accessoryPositions, [itemId]: pos };
    update({ ...avatarData, accessoryPositions: newPositions });
  }

  const selectedItemId = selectedAccSlot
    ? avatarData.equippedAccessories[
        selectedAccSlot as keyof AvatarData["equippedAccessories"]
      ]
    : undefined;

  const selectedPosition: AccessoryPosition = selectedItemId
    ? (avatarData.accessoryPositions[selectedItemId] ?? {
        x: 0,
        y: 0,
        rotation: 0,
      })
    : { x: 0, y: 0, rotation: 0 };

  const inventoryByType = (type: InventoryItem["type"]) =>
    inventory.filter((i) => i.type === type);

  return (
    <RequireProfile>
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-2xl font-bold text-foreground">
              Avatar Editor
            </h1>
            <p className="text-sm text-muted-foreground">
              Customize your chibi character
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_200px] gap-5">
            {/* ── Left: Preview ── */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              <Card>
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm">Preview</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center pb-4">
                  <ChibiAvatar
                    avatarData={avatarData}
                    width={180}
                    height={220}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm">Adjust Accessory</CardTitle>
                </CardHeader>
                <CardContent className="p-0 pb-2">
                  <AdjustmentPanel
                    itemId={selectedItemId}
                    position={selectedPosition}
                    onChange={(pos) => {
                      if (selectedItemId)
                        updateAccPosition(selectedItemId, pos);
                    }}
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* ── Center: Editor Tabs ── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card className="h-full">
                <Tabs defaultValue="face">
                  <div className="px-4 pt-4">
                    <TabsList className="w-full">
                      <TabsTrigger
                        value="face"
                        className="flex-1"
                        data-ocid="avatar.tab"
                      >
                        Face
                      </TabsTrigger>
                      <TabsTrigger
                        value="clothing"
                        className="flex-1"
                        data-ocid="avatar.tab"
                      >
                        Clothing
                      </TabsTrigger>
                      <TabsTrigger
                        value="accessories"
                        className="flex-1"
                        data-ocid="avatar.tab"
                      >
                        Accessories
                      </TabsTrigger>
                      <TabsTrigger
                        value="inventory"
                        className="flex-1"
                        data-ocid="avatar.tab"
                      >
                        Inventory
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  {/* Face Tab */}
                  <TabsContent value="face" className="px-4 pb-4">
                    <div className="space-y-2 mt-3">
                      <FaceSlot
                        label="Hair"
                        value={avatarData.faceFeatures.hairStyle}
                        max={HAIR_NAMES.length - 1}
                        names={HAIR_NAMES}
                        onChange={(v) => updateFace({ hairStyle: v })}
                      />
                      <FaceSlot
                        label="Eyes"
                        value={avatarData.faceFeatures.eyeStyle}
                        max={EYE_NAMES.length - 1}
                        names={EYE_NAMES}
                        onChange={(v) => updateFace({ eyeStyle: v })}
                        onUpload={(url) =>
                          updateFace({ customEyeImg: url || undefined })
                        }
                        uploadValue={avatarData.faceFeatures.customEyeImg}
                      />
                      <FaceSlot
                        label="Eyebrows"
                        value={avatarData.faceFeatures.eyebrowStyle}
                        max={EYEBROW_NAMES.length - 1}
                        names={EYEBROW_NAMES}
                        onChange={(v) => updateFace({ eyebrowStyle: v })}
                      />
                      <FaceSlot
                        label="Nose"
                        value={avatarData.faceFeatures.noseStyle}
                        max={NOSE_NAMES.length - 1}
                        names={NOSE_NAMES}
                        onChange={(v) => updateFace({ noseStyle: v })}
                      />
                      <FaceSlot
                        label="Mouth"
                        value={avatarData.faceFeatures.mouthStyle}
                        max={MOUTH_NAMES.length - 1}
                        names={MOUTH_NAMES}
                        onChange={(v) => updateFace({ mouthStyle: v })}
                        onUpload={(url) =>
                          updateFace({ customMouthImg: url || undefined })
                        }
                        uploadValue={avatarData.faceFeatures.customMouthImg}
                      />
                      <FaceSlot
                        label="Ears"
                        value={avatarData.faceFeatures.earStyle}
                        max={EAR_NAMES.length - 1}
                        names={EAR_NAMES}
                        onChange={(v) => updateFace({ earStyle: v })}
                      />
                    </div>
                  </TabsContent>

                  {/* Clothing Tab */}
                  <TabsContent value="clothing" className="px-4 pb-4">
                    <ScrollArea className="h-[380px]">
                      <div className="space-y-5 mt-3 pr-2">
                        {CLOTHING_SLOTS.map(({ key, label, type }) => (
                          <div key={key}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold">
                                {label}
                              </span>
                              {avatarData.equippedClothing[key] && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-6 text-xs"
                                  onClick={() => equipClothing(key, undefined)}
                                  data-ocid="avatar.secondary_button"
                                >
                                  Remove
                                </Button>
                              )}
                            </div>
                            {inventoryByType(type).length === 0 ? (
                              <p className="text-xs text-muted-foreground italic">
                                No {label.toLowerCase()} items owned. Visit the
                                Avatar Shop!
                              </p>
                            ) : (
                              <div className="grid grid-cols-4 gap-2">
                                {inventoryByType(type).map((item) => (
                                  <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => equipClothing(key, item.id)}
                                    className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                                      avatarData.equippedClothing[key] ===
                                      item.id
                                        ? "border-green-500 ring-2 ring-green-300"
                                        : "border-border hover:border-primary"
                                    }`}
                                    data-ocid="avatar.item.1"
                                  >
                                    <img
                                      src={item.imageDataUrl}
                                      alt={item.name}
                                      className="w-full aspect-square object-contain bg-muted/30"
                                    />
                                    {avatarData.equippedClothing[key] ===
                                      item.id && (
                                      <div className="absolute top-0.5 right-0.5 bg-green-500 text-white text-[8px] rounded-full w-4 h-4 flex items-center justify-center">
                                        ✓
                                      </div>
                                    )}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  {/* Accessories Tab */}
                  <TabsContent value="accessories" className="px-4 pb-4">
                    <ScrollArea className="h-[380px]">
                      <div className="mt-3 pr-2">
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          {ACCESSORY_SLOTS.map(({ key, label }) => {
                            const equippedId =
                              avatarData.equippedAccessories[key];
                            const equippedItem = equippedId
                              ? inventory.find((i) => i.id === equippedId)
                              : null;
                            return (
                              <button
                                type="button"
                                key={key}
                                className={`text-left w-full p-2 rounded-lg border-2 cursor-pointer transition-all ${
                                  selectedAccSlot === key
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/50"
                                }`}
                                onClick={() =>
                                  setSelectedAccSlot(
                                    selectedAccSlot === key ? null : key,
                                  )
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter")
                                    setSelectedAccSlot(
                                      selectedAccSlot === key ? null : key,
                                    );
                                }}
                                data-ocid="avatar.item.1"
                              >
                                <div className="text-xs font-semibold mb-1">
                                  {label}
                                </div>
                                {equippedItem ? (
                                  <div className="flex items-center gap-1">
                                    <img
                                      src={equippedItem.imageDataUrl}
                                      alt={equippedItem.name}
                                      className="w-8 h-8 object-contain"
                                    />
                                    <span className="text-xs truncate">
                                      {equippedItem.name}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        equipAccessory(key, undefined);
                                      }}
                                      className="ml-auto text-destructive text-xs"
                                      data-ocid="avatar.delete_button.1"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-xs text-muted-foreground italic">
                                    Empty
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {selectedAccSlot && (
                          <div>
                            <div className="text-xs font-semibold mb-2">
                              Pick for{" "}
                              {
                                ACCESSORY_SLOTS.find(
                                  (s) => s.key === selectedAccSlot,
                                )?.label
                              }
                            </div>
                            {inventoryByType(
                              selectedAccSlot as InventoryItem["type"],
                            ).length === 0 ? (
                              <p className="text-xs text-muted-foreground italic">
                                No {selectedAccSlot} items owned.
                              </p>
                            ) : (
                              <div className="grid grid-cols-4 gap-2">
                                {inventoryByType(
                                  selectedAccSlot as InventoryItem["type"],
                                ).map((item) => (
                                  <button
                                    key={item.id}
                                    type="button"
                                    onClick={() =>
                                      equipAccessory(
                                        selectedAccSlot as keyof AvatarData["equippedAccessories"],
                                        item.id,
                                      )
                                    }
                                    className="rounded-lg border border-border hover:border-primary p-1"
                                    data-ocid="avatar.item.1"
                                  >
                                    <img
                                      src={item.imageDataUrl}
                                      alt={item.name}
                                      className="w-full aspect-square object-contain"
                                    />
                                    <div className="text-[9px] text-center truncate mt-0.5">
                                      {item.name}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  {/* Inventory Tab */}
                  <TabsContent value="inventory" className="px-4 pb-4">
                    <ScrollArea className="h-[380px]">
                      <div className="mt-3 pr-2">
                        {inventory.length === 0 ? (
                          <div
                            className="text-center py-10 text-muted-foreground"
                            data-ocid="avatar.empty_state"
                          >
                            <div className="text-3xl mb-2">🎒</div>
                            <p className="text-sm">Your inventory is empty.</p>
                            <p className="text-xs mt-1">
                              Visit the Avatar Shop to buy items!
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                            {inventory.map((item, idx) => {
                              const slot = [
                                "shirt",
                                "tshirt",
                                "pants",
                              ].includes(item.type)
                                ? (item.type as keyof AvatarData["equippedClothing"])
                                : null;
                              const accSlot = [
                                "hat",
                                "face",
                                "neck",
                                "shoulder",
                                "front",
                                "back",
                                "waist",
                              ].includes(item.type)
                                ? (item.type as keyof AvatarData["equippedAccessories"])
                                : null;
                              return (
                                <motion.div
                                  key={item.id}
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: idx * 0.03 }}
                                  className="rounded-xl border border-border bg-card overflow-hidden"
                                  data-ocid={`avatar.item.${idx + 1}`}
                                >
                                  <img
                                    src={item.imageDataUrl}
                                    alt={item.name}
                                    className="w-full aspect-square object-contain bg-muted/30"
                                  />
                                  <div className="p-1.5">
                                    <div className="text-xs font-semibold truncate">
                                      {item.name}
                                    </div>
                                    <Badge
                                      variant="secondary"
                                      className="text-[9px] h-4 px-1 mt-0.5"
                                    >
                                      {item.type}
                                    </Badge>
                                    <Button
                                      size="sm"
                                      className="w-full mt-1.5 h-6 text-xs"
                                      onClick={() => {
                                        if (slot) equipClothing(slot, item.id);
                                        if (accSlot)
                                          equipAccessory(accSlot, item.id);
                                      }}
                                      data-ocid="avatar.primary_button"
                                    >
                                      Wear
                                    </Button>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </Card>
            </motion.div>

            {/* ── Right: Color Pickers ── */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <Card>
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm">Colors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pb-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Skin Color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={avatarData.skinColor}
                        onChange={(e) =>
                          update({ ...avatarData, skinColor: e.target.value })
                        }
                        className="w-8 h-8 rounded cursor-pointer border-0"
                        data-ocid="avatar.input"
                      />
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {avatarData.skinColor}
                      </code>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Hair Color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={avatarData.hairColor}
                        onChange={(e) =>
                          update({ ...avatarData, hairColor: e.target.value })
                        }
                        className="w-8 h-8 rounded cursor-pointer border-0"
                        data-ocid="avatar.input"
                      />
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {avatarData.hairColor}
                      </code>
                    </div>
                  </div>

                  {/* Skin tone presets */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Skin Presets
                    </Label>
                    <div className="grid grid-cols-4 gap-1">
                      {[
                        "#FFDFC4",
                        "#F0D5BE",
                        "#EECEB3",
                        "#E1B899",
                        "#C68642",
                        "#8D5524",
                        "#5D3316",
                        "#3B1F11",
                      ].map((c) => (
                        <button
                          key={c}
                          type="button"
                          className={`w-full aspect-square rounded border-2 transition-all ${
                            avatarData.skinColor === c
                              ? "border-primary"
                              : "border-transparent"
                          }`}
                          style={{ backgroundColor: c }}
                          onClick={() =>
                            update({ ...avatarData, skinColor: c })
                          }
                          data-ocid="avatar.toggle"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Hair color presets */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Hair Presets
                    </Label>
                    <div className="grid grid-cols-4 gap-1">
                      {[
                        "#2C1810",
                        "#5a3e2b",
                        "#8B4513",
                        "#D2691E",
                        "#FFD700",
                        "#C0C0C0",
                        "#1a1a2e",
                        "#e75480",
                      ].map((c) => (
                        <button
                          key={c}
                          type="button"
                          className={`w-full aspect-square rounded border-2 transition-all ${
                            avatarData.hairColor === c
                              ? "border-primary"
                              : "border-transparent"
                          }`}
                          style={{ backgroundColor: c }}
                          onClick={() =>
                            update({ ...avatarData, hairColor: c })
                          }
                          data-ocid="avatar.toggle"
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </RequireProfile>
  );
}
