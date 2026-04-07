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

// ─── Main Component ──────────────────────────────────────────────────────────
// Body layout (viewBox 0 0 200 310):
//   Head:      x=57  y=10   w=86  h=86   (center at x=100, bottom at y=96)
//   Torso:     x=62  y=96   w=76  h=72   (top flush with head bottom)
//   Left Arm:  x=30  y=96   w=32  h=72   (right edge at x=62, flush with torso top)
//   Right Arm: x=138 y=96   w=32  h=72   (left edge at x=138, flush with torso top)
//   Left Leg:  x=65  y=168  w=30  h=80   (top flush with torso bottom y=168)
//   Right Leg: x=105 y=168  w=30  h=80   (top flush with torso bottom y=168)

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

  const svgTransform =
    view === "side" ? "scale(-1,1) translate(-200,0)" : undefined;

  const walkAnimLeftLeg = walking ? "dini-walk-leg-left" : "";
  const walkAnimRightLeg = walking ? "dini-walk-leg-right" : "";
  const walkAnimLeftArm = walking ? "dini-walk-arm-left" : "";
  const walkAnimRightArm = walking ? "dini-walk-arm-right" : "";

  // ── Body layout constants ──
  // Head
  const HEAD_X = 57;
  const HEAD_Y = 10;
  const HEAD_W = 86;
  const HEAD_H = 86;
  // Torso: top edge = head bottom
  const TORSO_X = 62;
  const TORSO_Y = HEAD_Y + HEAD_H;
  const TORSO_W = 76;
  const TORSO_H = 72;
  // Arms: top edge = torso top, left/right flush to torso sides
  const LARM_X = TORSO_X - 32;
  const LARM_Y = TORSO_Y;
  const ARM_W = 32;
  const ARM_H = 72;
  const RARM_X = TORSO_X + TORSO_W;
  const RARM_Y = TORSO_Y;
  // Legs: top edge = torso bottom
  const LLEG_X = 65;
  const LLEG_Y = TORSO_Y + TORSO_H;
  const LEG_W = 30;
  const LEG_H = 80;
  const RLEG_X = 105;
  const RLEG_Y = LLEG_Y;

  return (
    <svg
      viewBox="0 0 200 320"
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      style={{
        maxHeight: height ? undefined : "280px",
        width: width ? undefined : "100%",
      }}
      role="img"
      aria-label="Chibi avatar"
    >
      <title>Chibi Avatar</title>

      {walking && (
        <style>{`
          @keyframes diniWalkLegLeft {
            0%   { transform: rotate(-12deg); transform-origin: ${LLEG_X + LEG_W / 2}px ${LLEG_Y}px; }
            100% { transform: rotate(12deg);  transform-origin: ${LLEG_X + LEG_W / 2}px ${LLEG_Y}px; }
          }
          @keyframes diniWalkLegRight {
            0%   { transform: rotate(12deg);  transform-origin: ${RLEG_X + LEG_W / 2}px ${RLEG_Y}px; }
            100% { transform: rotate(-12deg); transform-origin: ${RLEG_X + LEG_W / 2}px ${RLEG_Y}px; }
          }
          @keyframes diniWalkArmLeft {
            0%   { transform: rotate(15deg);  transform-origin: ${LARM_X + ARM_W / 2}px ${LARM_Y}px; }
            100% { transform: rotate(-15deg); transform-origin: ${LARM_X + ARM_W / 2}px ${LARM_Y}px; }
          }
          @keyframes diniWalkArmRight {
            0%   { transform: rotate(-15deg); transform-origin: ${RARM_X + ARM_W / 2}px ${RARM_Y}px; }
            100% { transform: rotate(15deg);  transform-origin: ${RARM_X + ARM_W / 2}px ${RARM_Y}px; }
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
      </defs>

      <g transform={svgTransform}>
        {/* Shadow */}
        <ellipse cx="100" cy="310" rx="38" ry="5" fill="rgba(0,0,0,0.08)" />

        {/* ── Layer 1: Back accessory ── */}
        <AccessoryImage
          itemId={equippedAccessories.back}
          items={itemsById}
          x={TORSO_X}
          y={TORSO_Y}
          w={TORSO_W}
          h={TORSO_H}
        />

        {/* ── Layer 2: Left Leg ── */}
        <image
          href="/assets/left.leg-019d5e50-81c2-74ab-a3b1-8a4e65a9c738.png"
          x={LLEG_X}
          y={LLEG_Y}
          width={LEG_W}
          height={LEG_H}
          preserveAspectRatio="xMidYMid meet"
          filter="url(#tint-left-leg)"
          className={walkAnimLeftLeg}
          {...clickProps("leftLeg")}
        />

        {/* ── Layer 3: Right Leg (mirrored from left leg sprite) ── */}
        <g transform={`translate(${RLEG_X * 2 + LEG_W},0) scale(-1,1)`}>
          <image
            href="/assets/left.leg-019d5e50-81c2-74ab-a3b1-8a4e65a9c738.png"
            x={RLEG_X}
            y={RLEG_Y}
            width={LEG_W}
            height={LEG_H}
            preserveAspectRatio="xMidYMid meet"
            filter="url(#tint-right-leg)"
            className={walkAnimRightLeg}
            {...clickProps("rightLeg")}
          />
        </g>

        {/* ── Layer 4: Pants overlay ── */}
        {equippedClothing.pants && itemsById[equippedClothing.pants] && (
          <image
            href={itemsById[equippedClothing.pants].imageDataUrl}
            x={LLEG_X}
            y={LLEG_Y}
            width={RLEG_X + LEG_W - LLEG_X}
            height={LEG_H}
            preserveAspectRatio="xMidYMid meet"
          />
        )}

        {/* ── Layer 5: Torso ── */}
        <image
          href="/assets/torso-019d5e50-81ca-717e-ad5a-5fdace90678a.png"
          x={TORSO_X}
          y={TORSO_Y}
          width={TORSO_W}
          height={TORSO_H}
          preserveAspectRatio="xMidYMid meet"
          filter="url(#tint-torso)"
          {...clickProps("torso")}
        />

        {/* ── Layer 6: T-Shirt overlay ── */}
        {equippedClothing.tshirt && itemsById[equippedClothing.tshirt] && (
          <image
            href={itemsById[equippedClothing.tshirt].imageDataUrl}
            x={TORSO_X}
            y={TORSO_Y}
            width={TORSO_W}
            height={TORSO_H}
            preserveAspectRatio="xMidYMid meet"
          />
        )}

        {/* ── Layer 6b: Shirt overlay ── */}
        {equippedClothing.shirt && itemsById[equippedClothing.shirt] && (
          <image
            href={itemsById[equippedClothing.shirt].imageDataUrl}
            x={TORSO_X}
            y={TORSO_Y}
            width={TORSO_W}
            height={TORSO_H}
            preserveAspectRatio="xMidYMid meet"
          />
        )}

        {/* ── Layer 7: Left Arm ── */}
        <image
          href="/assets/left.arm-019d5e50-81e1-72cb-9d59-a92f2eb8c93d.png"
          x={LARM_X}
          y={LARM_Y}
          width={ARM_W}
          height={ARM_H}
          preserveAspectRatio="xMidYMid meet"
          filter="url(#tint-left-arm)"
          className={walkAnimLeftArm}
          {...clickProps("leftArm")}
        />

        {/* ── Layer 8: Right Arm ── */}
        <image
          href="/assets/right.arm-019d5e50-81c6-76f8-b6ea-99e716061e46.png"
          x={RARM_X}
          y={RARM_Y}
          width={ARM_W}
          height={ARM_H}
          preserveAspectRatio="xMidYMid meet"
          filter="url(#tint-right-arm)"
          className={walkAnimRightArm}
          {...clickProps("rightArm")}
        />

        {/* ── Layer 9: Neck accessory ── */}
        <AccessoryImage
          itemId={equippedAccessories.neck}
          items={itemsById}
          x={76}
          y={TORSO_Y}
          w={48}
          h={28}
        />

        {/* ── Layer 10: Waist ── */}
        <AccessoryImage
          itemId={equippedAccessories.waist}
          items={itemsById}
          x={TORSO_X}
          y={TORSO_Y + TORSO_H - 20}
          w={TORSO_W}
          h={20}
        />

        {/* ── Layer 11: Shoulder ── */}
        <AccessoryImage
          itemId={equippedAccessories.shoulder}
          items={itemsById}
          x={LARM_X}
          y={LARM_Y}
          w={RARM_X + ARM_W - LARM_X}
          h={30}
        />

        {/* ── Layer 14: Head PNG sprite ── */}
        <image
          href="/assets/head-019d5e50-81bd-7459-a81a-4a0b37b03459.png"
          x={HEAD_X}
          y={HEAD_Y}
          width={HEAD_W}
          height={HEAD_H}
          preserveAspectRatio="xMidYMid meet"
          filter="url(#tint-head)"
          {...clickProps("head")}
        />

        {/* ── Layer 17: Hat ── */}
        <AccessoryImage
          itemId={equippedAccessories.hat}
          items={itemsById}
          x={52}
          y={0}
          w={96}
          h={44}
        />

        {/* ── Layer 18: Face accessory (glasses etc) ── */}
        <AccessoryImage
          itemId={equippedAccessories.face}
          items={itemsById}
          x={64}
          y={HEAD_Y + 34}
          w={72}
          h={30}
        />

        {/* ── Layer 19: Front accessory ── */}
        <AccessoryImage
          itemId={equippedAccessories.front}
          items={itemsById}
          x={TORSO_X + 8}
          y={TORSO_Y + 10}
          w={TORSO_W - 16}
          h={TORSO_H - 15}
        />
      </g>
    </svg>
  );
}
