import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  getCurrentUsername,
  getLocalSettings,
  saveLocalSettings,
} from "../hooks/useAccountSettings";

// ─── Body Part Config ────────────────────────────────────────────────────────

const BODY_PARTS = [
  { key: "head", label: "Head" },
  { key: "neck", label: "Neck" },
  { key: "torso", label: "Torso" },
  { key: "leftUpperArm", label: "Left Upper Arm" },
  { key: "rightUpperArm", label: "Right Upper Arm" },
  { key: "leftLowerArm", label: "Left Lower Arm" },
  { key: "rightLowerArm", label: "Right Lower Arm" },
  { key: "leftLeg", label: "Left Leg" },
  { key: "rightLeg", label: "Right Leg" },
] as const;

type BodyPartKey = (typeof BODY_PARTS)[number]["key"];

// ─── Avatar SVG ──────────────────────────────────────────────────────────────

interface AvatarSVGProps {
  skinColor: string;
  bodyPartColors: Record<string, string>;
  advancedMode: boolean;
  selectedPart: BodyPartKey | null;
  onPartClick: (part: BodyPartKey) => void;
}

function getPartColor(
  part: BodyPartKey,
  skinColor: string,
  bodyPartColors: Record<string, string>,
  advancedMode: boolean,
): string {
  if (advancedMode && bodyPartColors[part]) {
    return bodyPartColors[part];
  }
  return skinColor;
}

function AvatarSVG({
  skinColor,
  bodyPartColors,
  advancedMode,
  selectedPart,
  onPartClick,
}: AvatarSVGProps) {
  const partColor = (key: BodyPartKey) =>
    getPartColor(key, skinColor, bodyPartColors, advancedMode);

  const shapeProps = (key: BodyPartKey) => ({
    fill: partColor(key),
    stroke: selectedPart === key && advancedMode ? "#4a90d9" : "#c8a882",
    strokeWidth: selectedPart === key && advancedMode ? 3 : 1.5,
    onClick: advancedMode ? () => onPartClick(key) : undefined,
    style: {
      cursor: advancedMode ? "pointer" : "default",
      filter:
        selectedPart === key && advancedMode
          ? "drop-shadow(0 0 6px rgba(74, 144, 217, 0.7))"
          : undefined,
      transition: "fill 0.2s ease, stroke 0.15s ease",
    },
  });

  return (
    <svg
      viewBox="0 0 200 320"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      style={{ maxHeight: "380px" }}
      role="img"
      aria-label="2D avatar character preview"
    >
      <title>2D Avatar Character</title>

      {/* Shadow under feet */}
      <ellipse
        cx="100"
        cy="308"
        rx="40"
        ry="6"
        fill="rgba(0,0,0,0.08)"
        stroke="none"
      />

      {/* Left Leg */}
      <rect
        x="60"
        y="200"
        width="35"
        height="90"
        rx="8"
        {...shapeProps("leftLeg")}
      />
      {/* Right Leg */}
      <rect
        x="105"
        y="200"
        width="35"
        height="90"
        rx="8"
        {...shapeProps("rightLeg")}
      />

      {/* Left Upper Arm */}
      <rect
        x="20"
        y="102"
        width="30"
        height="70"
        rx="8"
        {...shapeProps("leftUpperArm")}
      />
      {/* Right Upper Arm */}
      <rect
        x="150"
        y="102"
        width="30"
        height="70"
        rx="8"
        {...shapeProps("rightUpperArm")}
      />

      {/* Left Lower Arm */}
      <rect
        x="15"
        y="172"
        width="30"
        height="60"
        rx="8"
        {...shapeProps("leftLowerArm")}
      />
      {/* Right Lower Arm */}
      <rect
        x="155"
        y="172"
        width="30"
        height="60"
        rx="8"
        {...shapeProps("rightLowerArm")}
      />

      {/* Torso */}
      <rect
        x="55"
        y="102"
        width="90"
        height="100"
        rx="10"
        {...shapeProps("torso")}
      />

      {/* Neck */}
      <rect
        x="88"
        y="82"
        width="24"
        height="22"
        rx="4"
        {...shapeProps("neck")}
      />

      {/* Head */}
      <ellipse cx="100" cy="50" rx="35" ry="38" {...shapeProps("head")} />

      {/* Eyes whites */}
      <ellipse
        cx="88"
        cy="46"
        rx="5"
        ry="6"
        fill="#fff"
        stroke="#c8a882"
        strokeWidth="0.5"
      />
      <ellipse
        cx="112"
        cy="46"
        rx="5"
        ry="6"
        fill="#fff"
        stroke="#c8a882"
        strokeWidth="0.5"
      />
      {/* Pupils */}
      <ellipse cx="88" cy="47" rx="3" ry="3.5" fill="#3d2b1f" />
      <ellipse cx="112" cy="47" rx="3" ry="3.5" fill="#3d2b1f" />
      {/* Eye shine */}
      <ellipse cx="89" cy="46" rx="1" ry="1" fill="#fff" />
      <ellipse cx="113" cy="46" rx="1" ry="1" fill="#fff" />

      {/* Mouth */}
      <path
        d="M 91 63 Q 100 69 109 63"
        stroke="#9b6b4a"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Nose */}
      <ellipse
        cx="100"
        cy="56"
        rx="2.5"
        ry="3"
        fill="none"
        stroke="#b88860"
        strokeWidth="1"
      />

      {/* Shirt collar detail */}
      <path
        d="M 88 102 L 100 115 L 112 102"
        stroke="rgba(0,0,0,0.12)"
        strokeWidth="1"
        fill="none"
      />

      {/* Belt area */}
      <rect
        x="55"
        y="193"
        width="90"
        height="9"
        rx="4"
        fill="rgba(0,0,0,0.1)"
        stroke="none"
      />
    </svg>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function AvatarEditor() {
  const username = getCurrentUsername();
  const savedSettings = username ? getLocalSettings(username) : null;

  const [skinColor, setSkinColor] = useState<string>(
    savedSettings?.skinColor ?? "#f5cba7",
  );
  const [bodyPartColors, setBodyPartColors] = useState<Record<string, string>>(
    savedSettings?.bodyPartColors ?? {},
  );
  const [advancedMode, setAdvancedMode] = useState(false);
  const [selectedPart, setSelectedPart] = useState<BodyPartKey | null>(null);

  function handleSave(
    newSkinColor: string,
    newBodyPartColors: Record<string, string>,
  ) {
    if (!username) return;
    const settings = getLocalSettings(username);
    saveLocalSettings(username, {
      ...settings,
      skinColor: newSkinColor,
      bodyPartColors: newBodyPartColors,
    });
    toast.success("Avatar colors saved!");
  }

  function handleSkinColorChange(color: string) {
    setSkinColor(color);
    handleSave(color, bodyPartColors);
  }

  function handlePartColorChange(part: BodyPartKey, color: string) {
    const updated = { ...bodyPartColors, [part]: color };
    setBodyPartColors(updated);
    handleSave(skinColor, updated);
  }

  function handleResetPart(part: BodyPartKey) {
    const updated = { ...bodyPartColors };
    delete updated[part];
    setBodyPartColors(updated);
    handleSave(skinColor, updated);
  }

  function handleResetAll() {
    setBodyPartColors({});
    handleSave(skinColor, {});
    setSelectedPart(null);
  }

  const currentPartColor = selectedPart
    ? (bodyPartColors[selectedPart] ?? skinColor)
    : skinColor;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex flex-col gap-6 p-4 md:p-6 max-w-5xl mx-auto"
      data-ocid="avatar.page"
    >
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: "#cde5aa" }}
        >
          <span className="text-lg">🎨</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Avatar Editor</h1>
          <p className="text-sm text-muted-foreground">
            Customize your character&apos;s appearance
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Avatar Preview */}
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Preview</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-6">
            <div
              className="rounded-2xl p-6 flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #f0f9e8 0%, #e8f5d0 100%)",
                minHeight: "320px",
                width: "100%",
                maxWidth: "280px",
              }}
            >
              <AvatarSVG
                skinColor={skinColor}
                bodyPartColors={bodyPartColors}
                advancedMode={advancedMode}
                selectedPart={selectedPart}
                onPartClick={(part) => {
                  setSelectedPart((prev) => (prev === part ? null : part));
                }}
              />
            </div>
          </CardContent>
          {advancedMode && (
            <div className="px-4 pb-4 text-xs text-muted-foreground text-center">
              Click a body part to select it and change its color
            </div>
          )}
        </Card>

        {/* Controls */}
        <div className="flex flex-col gap-4">
          {/* Global Skin Color */}
          <Card className="shadow-sm">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-semibold">Skin Color</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Applied to all body parts
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full border-2 border-border shadow-sm"
                    style={{ backgroundColor: skinColor }}
                  />
                  <input
                    type="color"
                    value={skinColor}
                    onChange={(e) => handleSkinColorChange(e.target.value)}
                    className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                    style={{ padding: "2px" }}
                    data-ocid="avatar.input"
                    aria-label="Global skin color"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2 font-mono">
                {skinColor.toUpperCase()}
              </p>
            </CardContent>
          </Card>

          {/* Advanced Toggle */}
          <Card className="shadow-sm">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label
                    htmlFor="advanced-toggle"
                    className="text-sm font-semibold"
                  >
                    Advanced Mode
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Color each body part individually
                  </p>
                </div>
                <Switch
                  id="advanced-toggle"
                  checked={advancedMode}
                  onCheckedChange={(checked) => {
                    setAdvancedMode(checked);
                    if (!checked) setSelectedPart(null);
                  }}
                  data-ocid="avatar.toggle"
                />
              </div>
            </CardContent>
          </Card>

          {/* Advanced: Selected Part Picker */}
          {advancedMode && selectedPart && (
            <motion.div
              key={selectedPart}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Card
                className="shadow-sm border-2"
                style={{ borderColor: "#4a90d9" }}
              >
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-semibold">
                      {BODY_PARTS.find((p) => p.key === selectedPart)?.label}
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7 px-2 text-muted-foreground"
                      onClick={() => handleResetPart(selectedPart)}
                    >
                      Reset to skin
                    </Button>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full border-2 border-border shadow-sm"
                      style={{ backgroundColor: currentPartColor }}
                    />
                    <input
                      type="color"
                      value={currentPartColor}
                      onChange={(e) =>
                        handlePartColorChange(selectedPart, e.target.value)
                      }
                      className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                      style={{ padding: "2px" }}
                      data-ocid="avatar.input"
                      aria-label={`Color for ${selectedPart}`}
                    />
                    <span className="text-xs font-mono text-muted-foreground">
                      {currentPartColor.toUpperCase()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Advanced: Body Parts Grid */}
          {advancedMode && (
            <Card className="shadow-sm">
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-sm font-semibold">
                  Body Parts
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="grid grid-cols-1 gap-2">
                  {BODY_PARTS.map((part) => {
                    const partC = bodyPartColors[part.key] ?? skinColor;
                    const isSelected = selectedPart === part.key;
                    const hasCustomColor = !!bodyPartColors[part.key];
                    return (
                      <button
                        key={part.key}
                        type="button"
                        onClick={() =>
                          setSelectedPart((prev) =>
                            prev === part.key ? null : part.key,
                          )
                        }
                        className={[
                          "flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all",
                          isSelected
                            ? "ring-2 ring-blue-400 bg-blue-50 dark:bg-blue-950"
                            : "hover:bg-muted",
                        ].join(" ")}
                        data-ocid={`avatar.item.${BODY_PARTS.indexOf(part) + 1}`}
                      >
                        <span className="font-medium">{part.label}</span>
                        <div className="flex items-center gap-2">
                          {hasCustomColor && (
                            <span className="text-xs text-muted-foreground font-mono">
                              custom
                            </span>
                          )}
                          <div
                            className="w-6 h-6 rounded-full border border-border shadow-sm"
                            style={{ backgroundColor: partC }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>

                {Object.keys(bodyPartColors).length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3 text-xs"
                    onClick={handleResetAll}
                    data-ocid="avatar.secondary_button"
                  >
                    Reset All to Skin Color
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Save hint */}
          <p className="text-xs text-muted-foreground text-center">
            Colors are automatically saved to your profile
          </p>
        </div>
      </div>
    </motion.div>
  );
}
