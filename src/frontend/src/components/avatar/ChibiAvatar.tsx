import type { AvatarData } from "../../types/avatarTypes";

interface ChibiAvatarProps {
  avatarData: AvatarData;
  width?: number;
  height?: number;
  interactive?: boolean;
  onPartClick?: (part: string) => void;
  view?: "front" | "side";
  walking?: boolean;
}

// ─── Tint Filter ──────────────────────────────────────────────────────────────
function TintFilter({ id, color }: { id: string; color: string }) {
  return (
    <filter
      id={id}
      x="0%"
      y="0%"
      width="100%"
      height="100%"
      colorInterpolationFilters="sRGB"
    >
      <feFlood floodColor={color} result="flood" />
      <feComposite
        in="flood"
        in2="SourceGraphic"
        operator="in"
        result="coloredImage"
      />
      <feBlend in="coloredImage" in2="SourceGraphic" mode="multiply" />
    </filter>
  );
}

// ─── Body Layout ──────────────────────────────────────────────────────────────
//
// Strategy: Each PNG sprite has transparent padding around its visible content.
// We render the PNG at a LARGER size than its logical "slot", with a NEGATIVE
// offset to compensate for the padding on each edge.
//
// For each part, we define:
//   SLOT_*  = logical bounding box where the visible body part should appear
//   IMG_*   = actual <image> x/y/w/h — oversized and shifted to fill the slot
//             compensating for transparent insets inside each PNG
//
// Inset estimates per sprite (transparent padding on each edge):
//   HEAD:      top=8  right=8  bottom=8  left=8   (~10% each side — nearly fills PNG)
//   TORSO:     top=10 right=12 bottom=10 left=12  (~15% sides, slightly padded)
//   ARM:       top=6  right=8  bottom=14 left=8   (narrow sprite, bottom tapers)
//   LEG:       top=6  right=10 bottom=8  left=10  (leg is centered with side padding)
//
// Canvas: 200 × 280 viewBox
//
// Logical slots (where visible pixels should land):
//   HEAD:      cx=100, top=14,  w=72,  h=72   → x=64  y=14  right=136 bottom=86
//   TORSO:     cx=100, top=86,  w=52,  h=56   → x=74  y=86  right=126 bottom=142
//   LEFT ARM:  right=74, top=90, w=22, h=48   → x=52  y=90
//   RIGHT ARM: left=126, top=90, w=22, h=48   → x=126 y=90
//   LEFT LEG:  cx=87,  top=142, w=26, h=64   → x=74  y=142
//   RIGHT LEG: cx=113, top=142, w=26, h=64   → x=100 y=142

// ── Logical slot constants (where visible pixels land) ──────────────────────
const SLOT_HEAD_X = 64;
const SLOT_HEAD_Y = 14;
const SLOT_HEAD_W = 72;
const SLOT_HEAD_H = 72;

const SLOT_TORSO_X = 74;
const SLOT_TORSO_Y = SLOT_HEAD_Y + SLOT_HEAD_H; // 86
const SLOT_TORSO_W = 52;
const SLOT_TORSO_H = 56;

const SLOT_ARM_W = 22;
const SLOT_ARM_H = 50;
const SLOT_LARM_X = SLOT_TORSO_X - SLOT_ARM_W; // 52
const SLOT_LARM_Y = SLOT_TORSO_Y + 2; // 88 — slight drop so shoulder aligns
const SLOT_RARM_X = SLOT_TORSO_X + SLOT_TORSO_W; // 96 ... wait, computed below
const SLOT_RARM_Y = SLOT_LARM_Y;

const SLOT_LEG_W = 26;
const SLOT_LEG_H = 66;
const SLOT_LLEG_X = SLOT_TORSO_X; // 74 — left leg under left side of torso
const SLOT_LLEG_Y = SLOT_TORSO_Y + SLOT_TORSO_H; // 142
const SLOT_RLEG_X = SLOT_TORSO_X + SLOT_TORSO_W - SLOT_LEG_W; // 100
const SLOT_RLEG_Y = SLOT_LLEG_Y; // 142

// ── Per-sprite insets (transparent padding inside each PNG) ──────────────────
// These tell us how much of the PNG is empty transparent space on each edge.
// We expand the rendered image size by insets, and shift x/y leftward/upward.
const HEAD_INSET = { t: 8, r: 8, b: 8, l: 8 };
const TORSO_INSET = { t: 10, r: 14, b: 10, l: 14 };
const ARM_INSET = { t: 6, r: 8, b: 10, l: 8 };
const LEG_INSET = { t: 6, r: 10, b: 8, l: 10 };

// ── Compute actual <image> bounds from slot + insets ─────────────────────────
// img_x = slot_x - inset_left,  img_w = slot_w + inset_left + inset_right
function expand(
  sx: number,
  sy: number,
  sw: number,
  sh: number,
  ins: { t: number; r: number; b: number; l: number },
) {
  return {
    x: sx - ins.l,
    y: sy - ins.t,
    w: sw + ins.l + ins.r,
    h: sh + ins.t + ins.b,
  };
}

const HEAD_IMG = expand(
  SLOT_HEAD_X,
  SLOT_HEAD_Y,
  SLOT_HEAD_W,
  SLOT_HEAD_H,
  HEAD_INSET,
);
const TORSO_IMG = expand(
  SLOT_TORSO_X,
  SLOT_TORSO_Y,
  SLOT_TORSO_W,
  SLOT_TORSO_H,
  TORSO_INSET,
);
const LARM_IMG = expand(
  SLOT_LARM_X,
  SLOT_LARM_Y,
  SLOT_ARM_W,
  SLOT_ARM_H,
  ARM_INSET,
);
const RARM_IMG = expand(
  SLOT_RARM_X,
  SLOT_RARM_Y,
  SLOT_ARM_W,
  SLOT_ARM_H,
  ARM_INSET,
);
const LLEG_IMG = expand(
  SLOT_LLEG_X,
  SLOT_LLEG_Y,
  SLOT_LEG_W,
  SLOT_LEG_H,
  LEG_INSET,
);
const RLEG_IMG = expand(
  SLOT_RLEG_X,
  SLOT_RLEG_Y,
  SLOT_LEG_W,
  SLOT_LEG_H,
  LEG_INSET,
);

// Right leg mirror: translate(rx*2+rw, 0) scale(-1,1) where rx,rw are the IMG coords
// This flips the image in place around its own center
const RLEG_MIRROR_TRANSLATE = RLEG_IMG.x * 2 + RLEG_IMG.w;

export default function ChibiAvatar({
  avatarData,
  width,
  height,
  interactive = false,
  onPartClick,
  view = "front",
  walking = false,
}: ChibiAvatarProps) {
  const { equippedClothing, equippedAccessories, accessoryPositions } =
    avatarData;

  // Resolve per-part colors, falling back to skinColor
  const bpc = avatarData.bodyPartColors;
  const skinColor = avatarData.skinColor ?? "#e8b89a";
  const headColor = bpc?.headColor ?? skinColor;
  const torsoColor = bpc?.torsoColor ?? skinColor;
  const leftArmColor = bpc?.leftArmColor ?? skinColor;
  const rightArmColor = bpc?.rightArmColor ?? skinColor;
  const leftLegColor = bpc?.leftLegColor ?? skinColor;
  const rightLegColor = bpc?.rightLegColor ?? skinColor;

  function getPos(itemId: string | undefined): {
    dx: number;
    dy: number;
    rot: number;
  } {
    if (!itemId) return { dx: 0, dy: 0, rot: 0 };
    const pos = accessoryPositions[itemId];
    if (!pos) return { dx: 0, dy: 0, rot: 0 };
    return { dx: pos.x, dy: pos.y, rot: pos.rotation };
  }

  function AccessoryImage({
    itemId,
    items,
    x,
    y,
    w,
    h,
  }: {
    itemId: string | undefined;
    items: Record<string, { imageDataUrl: string }>;
    x: number;
    y: number;
    w: number;
    h: number;
  }) {
    if (!itemId || !items[itemId]) return null;
    const { dx, dy, rot } = getPos(itemId);
    const cx = x + w / 2 + dx;
    const cy = y + h / 2 + dy;
    return (
      <image
        href={items[itemId].imageDataUrl}
        x={x + dx}
        y={y + dy}
        width={w}
        height={h}
        preserveAspectRatio="xMidYMid meet"
        transform={rot !== 0 ? `rotate(${rot} ${cx} ${cy})` : undefined}
      />
    );
  }

  const itemsById: Record<string, { imageDataUrl: string }> = {};
  try {
    const shopRaw = localStorage.getItem("diniverse_shop_items");
    if (shopRaw) {
      const shopItems = JSON.parse(shopRaw) as Array<{
        id: string;
        imageDataUrl: string;
      }>;
      for (const item of shopItems) {
        itemsById[item.id] = item;
      }
    }
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("diniverse_settings_")) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed.inventory)) {
            for (const item of parsed.inventory) {
              if (item.id && item.imageDataUrl) {
                itemsById[item.id] = item;
              }
            }
          }
        }
      }
    }
  } catch {
    // ignore
  }

  const clickProps = (part: string) =>
    interactive && onPartClick
      ? { onClick: () => onPartClick(part), style: { cursor: "pointer" } }
      : {};

  // Side view: flip entire SVG horizontally
  const svgTransform =
    view === "side" ? "scale(-1,1) translate(-200,0)" : undefined;

  const walkAnimLeftLeg = walking ? "dini-walk-leg-left" : "";
  const walkAnimRightLeg = walking ? "dini-walk-leg-right" : "";
  const walkAnimLeftArm = walking ? "dini-walk-arm-left" : "";
  const walkAnimRightArm = walking ? "dini-walk-arm-right" : "";

  return (
    <svg
      viewBox="0 0 200 280"
      xmlns="http://www.w3.org/2000/svg"
      width={width ?? 200}
      height={height ?? 280}
      overflow="visible"
      role="img"
      aria-label="Chibi avatar"
    >
      <title>Chibi Avatar</title>

      {walking && (
        <style>{`
          @keyframes diniWalkLegLeft {
            0%   { transform: rotate(-12deg); transform-origin: ${SLOT_LLEG_X + SLOT_LEG_W / 2}px ${SLOT_LLEG_Y}px; }
            100% { transform: rotate(12deg);  transform-origin: ${SLOT_LLEG_X + SLOT_LEG_W / 2}px ${SLOT_LLEG_Y}px; }
          }
          @keyframes diniWalkLegRight {
            0%   { transform: rotate(12deg);  transform-origin: ${SLOT_RLEG_X + SLOT_LEG_W / 2}px ${SLOT_RLEG_Y}px; }
            100% { transform: rotate(-12deg); transform-origin: ${SLOT_RLEG_X + SLOT_LEG_W / 2}px ${SLOT_RLEG_Y}px; }
          }
          @keyframes diniWalkArmLeft {
            0%   { transform: rotate(15deg);  transform-origin: ${SLOT_LARM_X + SLOT_ARM_W / 2}px ${SLOT_LARM_Y}px; }
            100% { transform: rotate(-15deg); transform-origin: ${SLOT_LARM_X + SLOT_ARM_W / 2}px ${SLOT_LARM_Y}px; }
          }
          @keyframes diniWalkArmRight {
            0%   { transform: rotate(-15deg); transform-origin: ${SLOT_RARM_X + SLOT_ARM_W / 2}px ${SLOT_RARM_Y}px; }
            100% { transform: rotate(15deg);  transform-origin: ${SLOT_RARM_X + SLOT_ARM_W / 2}px ${SLOT_RARM_Y}px; }
          }
          .dini-walk-leg-left  { animation: diniWalkLegLeft  0.5s ease-in-out infinite alternate; }
          .dini-walk-leg-right { animation: diniWalkLegRight 0.5s ease-in-out infinite alternate; }
          .dini-walk-arm-left  { animation: diniWalkArmLeft  0.5s ease-in-out infinite alternate; }
          .dini-walk-arm-right { animation: diniWalkArmRight 0.5s ease-in-out infinite alternate; }
        `}</style>
      )}

      <defs>
        <TintFilter id="tint-head" color={headColor} />
        <TintFilter id="tint-torso" color={torsoColor} />
        <TintFilter id="tint-left-arm" color={leftArmColor} />
        <TintFilter id="tint-right-arm" color={rightArmColor} />
        <TintFilter id="tint-left-leg" color={leftLegColor} />
        <TintFilter id="tint-right-leg" color={rightLegColor} />
        {/* Clip to slot so transparent overflow from adjacent parts doesn't bleed */}
        <clipPath id="clip-larm">
          <rect
            x={SLOT_LARM_X - 2}
            y={SLOT_LARM_Y - 2}
            width={SLOT_ARM_W + 4}
            height={SLOT_ARM_H + 4}
          />
        </clipPath>
        <clipPath id="clip-rarm">
          <rect
            x={SLOT_RARM_X - 2}
            y={SLOT_RARM_Y - 2}
            width={SLOT_ARM_W + 4}
            height={SLOT_ARM_H + 4}
          />
        </clipPath>
        <clipPath id="clip-lleg">
          <rect
            x={SLOT_LLEG_X - 2}
            y={SLOT_LLEG_Y - 2}
            width={SLOT_LEG_W + 4}
            height={SLOT_LEG_H + 4}
          />
        </clipPath>
        <clipPath id="clip-rleg">
          <rect
            x={SLOT_RLEG_X - 2}
            y={SLOT_RLEG_Y - 2}
            width={SLOT_LEG_W + 4}
            height={SLOT_LEG_H + 4}
          />
        </clipPath>
      </defs>

      <g transform={svgTransform}>
        {/* Drop shadow */}
        <ellipse cx="100" cy="272" rx="34" ry="5" fill="rgba(0,0,0,0.08)" />

        {/* ── Layer 1: Back accessory (behind everything) ── */}
        <AccessoryImage
          itemId={equippedAccessories.back}
          items={itemsById}
          x={SLOT_TORSO_X}
          y={SLOT_TORSO_Y}
          w={SLOT_TORSO_W}
          h={SLOT_TORSO_H}
        />

        {/* ── Layer 2: Left Leg ── */}
        <image
          href="/assets/left.leg-019d5e50-81c2-74ab-a3b1-8a4e65a9c738.png"
          x={LLEG_IMG.x}
          y={LLEG_IMG.y}
          width={LLEG_IMG.w}
          height={LLEG_IMG.h}
          preserveAspectRatio="xMidYMid meet"
          filter="url(#tint-left-leg)"
          clipPath="url(#clip-lleg)"
          className={walkAnimLeftLeg}
          {...clickProps("leftLeg")}
        />

        {/* ── Layer 3: Right Leg (mirrored from left leg PNG) ── */}
        <g transform={`translate(${RLEG_MIRROR_TRANSLATE},0) scale(-1,1)`}>
          <image
            href="/assets/left.leg-019d5e50-81c2-74ab-a3b1-8a4e65a9c738.png"
            x={RLEG_IMG.x}
            y={RLEG_IMG.y}
            width={RLEG_IMG.w}
            height={RLEG_IMG.h}
            preserveAspectRatio="xMidYMid meet"
            filter="url(#tint-right-leg)"
            className={walkAnimRightLeg}
            {...clickProps("rightLeg")}
          />
        </g>

        {/* ── Layer 4: Pants overlay (spans both legs) ── */}
        {equippedClothing.pants && itemsById[equippedClothing.pants] && (
          <image
            href={itemsById[equippedClothing.pants].imageDataUrl}
            x={SLOT_LLEG_X}
            y={SLOT_LLEG_Y}
            width={SLOT_RLEG_X + SLOT_LEG_W - SLOT_LLEG_X}
            height={SLOT_LEG_H}
            preserveAspectRatio="xMidYMid meet"
          />
        )}

        {/* ── Layer 5: Torso ── */}
        <image
          href="/assets/torso-019d5e50-81ca-717e-ad5a-5fdace90678a.png"
          x={TORSO_IMG.x}
          y={TORSO_IMG.y}
          width={TORSO_IMG.w}
          height={TORSO_IMG.h}
          preserveAspectRatio="xMidYMid meet"
          filter="url(#tint-torso)"
          {...clickProps("torso")}
        />

        {/* ── Layer 6a: T-Shirt overlay ── */}
        {equippedClothing.tshirt && itemsById[equippedClothing.tshirt] && (
          <image
            href={itemsById[equippedClothing.tshirt].imageDataUrl}
            x={SLOT_TORSO_X}
            y={SLOT_TORSO_Y}
            width={SLOT_TORSO_W}
            height={SLOT_TORSO_H}
            preserveAspectRatio="xMidYMid meet"
          />
        )}

        {/* ── Layer 6b: Shirt overlay ── */}
        {equippedClothing.shirt && itemsById[equippedClothing.shirt] && (
          <image
            href={itemsById[equippedClothing.shirt].imageDataUrl}
            x={SLOT_TORSO_X}
            y={SLOT_TORSO_Y}
            width={SLOT_TORSO_W}
            height={SLOT_TORSO_H}
            preserveAspectRatio="xMidYMid meet"
          />
        )}

        {/* ── Layer 7: Left Arm ── */}
        <image
          href="/assets/left.arm-019d5e50-81e1-72cb-9d59-a92f2eb8c93d.png"
          x={LARM_IMG.x}
          y={LARM_IMG.y}
          width={LARM_IMG.w}
          height={LARM_IMG.h}
          preserveAspectRatio="xMidYMid meet"
          filter="url(#tint-left-arm)"
          clipPath="url(#clip-larm)"
          className={walkAnimLeftArm}
          {...clickProps("leftArm")}
        />

        {/* ── Layer 8: Right Arm ── */}
        <image
          href="/assets/right.arm-019d5e50-81c6-76f8-b6ea-99e716061e46.png"
          x={RARM_IMG.x}
          y={RARM_IMG.y}
          width={RARM_IMG.w}
          height={RARM_IMG.h}
          preserveAspectRatio="xMidYMid meet"
          filter="url(#tint-right-arm)"
          clipPath="url(#clip-rarm)"
          className={walkAnimRightArm}
          {...clickProps("rightArm")}
        />

        {/* ── Layer 9: Neck accessory ── */}
        <AccessoryImage
          itemId={equippedAccessories.neck}
          items={itemsById}
          x={SLOT_TORSO_X + 8}
          y={SLOT_TORSO_Y}
          w={SLOT_TORSO_W - 16}
          h={22}
        />

        {/* ── Layer 10: Waist accessory ── */}
        <AccessoryImage
          itemId={equippedAccessories.waist}
          items={itemsById}
          x={SLOT_TORSO_X}
          y={SLOT_TORSO_Y + SLOT_TORSO_H - 16}
          w={SLOT_TORSO_W}
          h={16}
        />

        {/* ── Layer 11: Shoulder accessory ── */}
        <AccessoryImage
          itemId={equippedAccessories.shoulder}
          items={itemsById}
          x={SLOT_LARM_X}
          y={SLOT_LARM_Y}
          w={SLOT_RARM_X + SLOT_ARM_W - SLOT_LARM_X}
          h={26}
        />

        {/* ── Layer 14: Head (topmost body layer) ── */}
        <image
          href="/assets/head-019d5e50-81bd-7459-a81a-4a0b37b03459.png"
          x={HEAD_IMG.x}
          y={HEAD_IMG.y}
          width={HEAD_IMG.w}
          height={HEAD_IMG.h}
          preserveAspectRatio="xMidYMid meet"
          filter="url(#tint-head)"
          {...clickProps("head")}
        />

        {/* ── Layer 17: Hat ── */}
        <AccessoryImage
          itemId={equippedAccessories.hat}
          items={itemsById}
          x={SLOT_HEAD_X - 4}
          y={SLOT_HEAD_Y - 6}
          w={SLOT_HEAD_W + 8}
          h={38}
        />

        {/* ── Layer 18: Face accessory (glasses, etc.) ── */}
        <AccessoryImage
          itemId={equippedAccessories.face}
          items={itemsById}
          x={SLOT_HEAD_X + 8}
          y={SLOT_HEAD_Y + 28}
          w={SLOT_HEAD_W - 16}
          h={26}
        />

        {/* ── Layer 19: Front accessory ── */}
        <AccessoryImage
          itemId={equippedAccessories.front}
          items={itemsById}
          x={SLOT_TORSO_X + 6}
          y={SLOT_TORSO_Y + 8}
          w={SLOT_TORSO_W - 12}
          h={SLOT_TORSO_H - 12}
        />
      </g>
    </svg>
  );
}
