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
// Applies a color tint to a grayscale/white PNG via SVG filter.
// Uses feFlood (solid color) + feComposite(in) to cut out shape + feBlend(multiply)
// so dark areas stay dark and mid-tones take the target color.
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

// ─── Hair Paths ──────────────────────────────────────────────────────────────
function HairBack({ style, color }: { style: number; color: string }) {
  switch (style) {
    case 1:
      return (
        <>
          <rect x="52" y="55" width="12" height="90" rx="6" fill={color} />
          <rect x="136" y="55" width="12" height="90" rx="6" fill={color} />
        </>
      );
    case 2:
      return (
        <>
          <ellipse cx="50" cy="100" rx="10" ry="30" fill={color} />
          <ellipse cx="150" cy="100" rx="10" ry="30" fill={color} />
        </>
      );
    case 5:
      return <rect x="94" y="30" width="12" height="75" rx="6" fill={color} />;
    default:
      return null;
  }
}

function HairFront({ style, color }: { style: number; color: string }) {
  switch (style) {
    case 0:
      return (
        <path
          d="M55 58 Q55 18 100 16 Q145 18 145 58 Q140 50 130 48 Q115 38 100 38 Q85 38 70 48 Q60 50 55 58Z"
          fill={color}
        />
      );
    case 1:
      return (
        <path
          d="M55 58 Q55 18 100 15 Q145 18 145 58 Q138 46 125 42 Q112 34 100 34 Q88 34 75 42 Q62 46 55 58Z"
          fill={color}
        />
      );
    case 2:
      return (
        <path
          d="M55 60 Q55 18 100 15 Q145 18 145 60 Q140 48 130 44 Q115 36 100 36 Q85 36 70 44 Q60 48 55 60Z"
          fill={color}
        />
      );
    case 3:
      return (
        <path
          d="M52 65 Q52 16 100 14 Q148 16 148 65 Q148 80 142 85 Q138 52 125 44 Q112 36 100 36 Q88 36 75 44 Q62 52 58 85 Q52 80 52 65Z"
          fill={color}
        />
      );
    case 4:
      return (
        <>
          <path
            d="M55 60 Q55 18 100 15 Q145 18 145 60 Q138 46 125 42 Q112 34 100 34 Q88 34 75 42 Q62 46 55 60Z"
            fill={color}
          />
          <path
            d="M52 65 Q58 72 64 68 Q70 64 76 70 Q80 74 80 80"
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M148 65 Q142 72 136 68 Q130 64 124 70 Q120 74 120 80"
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
          />
        </>
      );
    case 5:
      return (
        <path
          d="M55 60 Q55 18 100 15 Q145 18 145 60 Q138 46 126 42 Q113 34 100 34 Q87 34 74 42 Q62 46 55 60Z"
          fill={color}
        />
      );
    default:
      return null;
  }
}

// ─── Eye Styles ──────────────────────────────────────────────────────────────
function Eyes({
  style,
  cx,
  customImg,
}: { style: number; cx: number; customImg?: string }) {
  if (customImg) {
    return (
      <image
        href={customImg}
        x={cx - 8}
        y={47}
        width={16}
        height={14}
        preserveAspectRatio="xMidYMid meet"
      />
    );
  }
  switch (style) {
    case 0:
      return (
        <>
          <ellipse
            cx={cx}
            cy={54}
            rx={7}
            ry={8}
            fill="#fff"
            stroke="#222"
            strokeWidth="0.8"
          />
          <circle cx={cx} cy={55} r={4} fill="#2a1a0a" />
          <circle cx={cx + 1.5} cy={53} r={1.5} fill="#fff" />
        </>
      );
    case 1:
      return (
        <>
          <path
            d={`M${cx - 7} 56 Q${cx} 48 ${cx + 7} 56 Q${cx} 58 ${cx - 7} 56Z`}
            fill="#fff"
            stroke="#222"
            strokeWidth="0.8"
          />
          <path
            d={`M${cx - 4} 55 Q${cx} 50 ${cx + 4} 55 Q${cx} 57 ${cx - 4} 55Z`}
            fill="#2a1a0a"
          />
        </>
      );
    case 2:
      return (
        <>
          <path
            d={`M${cx - 7} 54 Q${cx} 50 ${cx + 7} 54`}
            stroke="#333"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d={`M${cx - 7} 54 Q${cx} 58 ${cx + 7} 54`}
            fill="#fff"
            stroke="none"
          />
          <ellipse cx={cx} cy={55} rx={4} ry={2} fill="#2a1a0a" />
        </>
      );
    case 3:
      return (
        <>
          <ellipse
            cx={cx}
            cy={54}
            rx={7}
            ry={8}
            fill="#ddeeff"
            stroke="#222"
            strokeWidth="0.8"
          />
          <circle cx={cx} cy={55} r={4} fill="#1a3a6a" />
          <circle cx={cx + 2} cy={52} r={2} fill="#fff" />
          <circle cx={cx - 2} cy={57} r={1} fill="#fff" />
        </>
      );
    case 4:
      return <circle cx={cx} cy={55} r={3} fill="#2a1a0a" />;
    default:
      return null;
  }
}

// ─── Eyebrow Styles ──────────────────────────────────────────────────────────
function Eyebrow({
  style,
  cx,
  color,
}: { style: number; cx: number; color: string }) {
  switch (style) {
    case 0:
      return (
        <path
          d={`M${cx - 7} 45 Q${cx} 41 ${cx + 7} 45`}
          stroke={color}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      );
    case 1:
      return (
        <rect x={cx - 7} y={43} width={14} height={3} rx={1.5} fill={color} />
      );
    case 2:
      return (
        <path
          d={`M${cx - 6} 46 Q${cx} 43 ${cx + 6} 46`}
          stroke={color}
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
      );
    case 3:
      return (
        <path
          d={`M${cx - 7} 43 Q${cx} 46 ${cx + 7} 43`}
          stroke={color}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      );
    default:
      return null;
  }
}

// ─── Nose Styles ─────────────────────────────────────────────────────────────
function Nose({ style }: { style: number }) {
  switch (style) {
    case 0:
      return <circle cx={100} cy={64} r={2.5} fill="rgba(0,0,0,0.12)" />;
    case 1:
      return (
        <>
          <ellipse cx={97} cy={64} rx={2} ry={2.5} fill="rgba(0,0,0,0.10)" />
          <ellipse cx={103} cy={64} rx={2} ry={2.5} fill="rgba(0,0,0,0.10)" />
        </>
      );
    case 2:
      return (
        <path d="M97 64 Q100 66 103 64 L100 61Z" fill="rgba(180,80,100,0.5)" />
      );
    case 3:
      return <path d="M98 63 L100 67 L102 63Z" fill="rgba(0,0,0,0.12)" />;
    default:
      return null;
  }
}

// ─── Mouth Styles ────────────────────────────────────────────────────────────
function Mouth({ style, customImg }: { style: number; customImg?: string }) {
  if (customImg) {
    return (
      <image
        href={customImg}
        x={86}
        y={70}
        width={28}
        height={14}
        preserveAspectRatio="xMidYMid meet"
      />
    );
  }
  switch (style) {
    case 0:
      return (
        <path
          d="M90 73 Q100 80 110 73"
          stroke="#8b5e3c"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      );
    case 1:
      return (
        <path
          d="M88 72 Q100 82 112 72"
          stroke="#8b5e3c"
          strokeWidth="2"
          fill="#fff"
          strokeLinecap="round"
        />
      );
    case 2:
      return <ellipse cx={100} cy={75} rx={5} ry={3} fill="#c47a5a" />;
    case 3:
      return (
        <>
          <path
            d="M94 73 Q97 77 100 74"
            stroke="#8b5e3c"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M100 74 Q103 77 106 73"
            stroke="#8b5e3c"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </>
      );
    case 4:
      return (
        <line
          x1={93}
          y1={75}
          x2={107}
          y2={75}
          stroke="#8b5e3c"
          strokeWidth="2"
          strokeLinecap="round"
        />
      );
    default:
      return null;
  }
}

// ─── Ear Styles ──────────────────────────────────────────────────────────────
function Ear({
  style,
  cx,
  skinColor,
}: { style: number; cx: number; skinColor: string }) {
  switch (style) {
    case 0:
      return (
        <ellipse
          cx={cx}
          cy={58}
          rx={7}
          ry={10}
          fill={skinColor}
          stroke="#c8a882"
          strokeWidth="1.2"
        />
      );
    case 1:
      return (
        <path
          d={
            cx < 100
              ? `M${cx + 5} 50 L${cx - 6} 45 L${cx - 8} 65 L${cx + 5} 68Z`
              : `M${cx - 5} 50 L${cx + 6} 45 L${cx + 8} 65 L${cx - 5} 68Z`
          }
          fill={skinColor}
          stroke="#c8a882"
          strokeWidth="1.2"
        />
      );
    case 2:
      return (
        <>
          <ellipse
            cx={cx}
            cy={58}
            rx={7}
            ry={10}
            fill={skinColor}
            stroke="#c8a882"
            strokeWidth="1.2"
          />
          <path
            d={
              cx < 100
                ? `M${cx - 4} 28 L${cx - 10} 15 L${cx + 4} 22Z`
                : `M${cx + 4} 28 L${cx + 10} 15 L${cx - 4} 22Z`
            }
            fill={skinColor}
            stroke="#c8a882"
            strokeWidth="1.2"
          />
        </>
      );
    default:
      return null;
  }
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ChibiAvatar({
  avatarData,
  width,
  height,
  interactive = false,
  onPartClick,
  view = "front",
  walking = false,
}: ChibiAvatarProps) {
  const {
    skinColor,
    hairColor,
    faceFeatures,
    equippedClothing,
    equippedAccessories,
    accessoryPositions,
  } = avatarData;

  // Resolve per-part colors, falling back to skinColor for all if not set
  const bpc = avatarData.bodyPartColors;
  const headColor = bpc?.headColor ?? skinColor;
  const torsoColor = bpc?.torsoColor ?? skinColor;
  const leftArmColor = bpc?.leftArmColor ?? skinColor;
  const rightArmColor = bpc?.rightArmColor ?? skinColor;
  const leftLegColor = bpc?.leftLegColor ?? skinColor;
  const rightLegColor = bpc?.rightLegColor ?? skinColor;

  const eyebrowColor = hairColor;

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

  // For side view: flip the whole SVG horizontally
  const svgTransform =
    view === "side" ? "scale(-1,1) translate(-200,0)" : undefined;

  // Walking animation class names
  const walkAnimLeftLeg = walking ? "dini-walk-leg-left" : "";
  const walkAnimRightLeg = walking ? "dini-walk-leg-right" : "";
  const walkAnimLeftArm = walking ? "dini-walk-arm-left" : "";
  const walkAnimRightArm = walking ? "dini-walk-arm-right" : "";

  return (
    <svg
      viewBox="0 0 200 280"
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      style={{
        maxHeight: height ? undefined : "260px",
        width: width ? undefined : "100%",
      }}
      role="img"
      aria-label="Chibi avatar"
    >
      <title>Chibi Avatar</title>

      {/* Walk animation keyframes — transform-origin updated to match new body part coordinates */}
      {walking && (
        <style>{`
          @keyframes diniWalkLegLeft {
            0%   { transform: rotate(-12deg); transform-origin: 83px 162px; }
            100% { transform: rotate(12deg);  transform-origin: 83px 162px; }
          }
          @keyframes diniWalkLegRight {
            0%   { transform: rotate(12deg);  transform-origin: 117px 162px; }
            100% { transform: rotate(-12deg); transform-origin: 117px 162px; }
          }
          @keyframes diniWalkArmLeft {
            0%   { transform: rotate(15deg);  transform-origin: 49px 100px; }
            100% { transform: rotate(-15deg); transform-origin: 49px 100px; }
          }
          @keyframes diniWalkArmRight {
            0%   { transform: rotate(-15deg); transform-origin: 151px 100px; }
            100% { transform: rotate(15deg);  transform-origin: 151px 100px; }
          }
          .dini-walk-leg-left  { animation: diniWalkLegLeft  0.5s ease-in-out infinite alternate; }
          .dini-walk-leg-right { animation: diniWalkLegRight 0.5s ease-in-out infinite alternate; }
          .dini-walk-arm-left  { animation: diniWalkArmLeft  0.5s ease-in-out infinite alternate; }
          .dini-walk-arm-right { animation: diniWalkArmRight 0.5s ease-in-out infinite alternate; }
        `}</style>
      )}

      {/* ── Tint Filters (one per body part) ── */}
      <defs>
        <TintFilter id="tint-head" color={headColor} />
        <TintFilter id="tint-torso" color={torsoColor} />
        <TintFilter id="tint-left-arm" color={leftArmColor} />
        <TintFilter id="tint-right-arm" color={rightArmColor} />
        <TintFilter id="tint-left-leg" color={leftLegColor} />
        <TintFilter id="tint-right-leg" color={rightLegColor} />
      </defs>

      {/* Optional side-view flip wrapper */}
      <g transform={svgTransform}>
        {/* Shadow */}
        <ellipse cx="100" cy="272" rx="38" ry="5" fill="rgba(0,0,0,0.08)" />

        {/* ── Layer 1: Back accessories ── */}
        <AccessoryImage
          itemId={equippedAccessories.back}
          items={itemsById}
          x={68}
          y={120}
          w={64}
          h={70}
        />

        {/* ── Layer 2: Left Leg ── */}
        <image
          href="/assets/left.leg-019d5e50-81c2-74ab-a3b1-8a4e65a9c738.png"
          x="68"
          y="162"
          width="30"
          height="80"
          preserveAspectRatio="xMidYMid meet"
          filter="url(#tint-left-leg)"
          className={walkAnimLeftLeg}
          {...clickProps("leftLeg")}
        />

        {/* ── Layer 3: Right Leg (mirrored from left leg sprite) ── */}
        <g transform="translate(234,0) scale(-1,1)">
          <image
            href="/assets/left.leg-019d5e50-81c2-74ab-a3b1-8a4e65a9c738.png"
            x="102"
            y="162"
            width="30"
            height="80"
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
            x="68"
            y="162"
            width="64"
            height="80"
            preserveAspectRatio="xMidYMid meet"
          />
        )}

        {/* ── Layer 5: Torso ── */}
        <image
          href="/assets/torso-019d5e50-81ca-717e-ad5a-5fdace90678a.png"
          x="62"
          y="98"
          width="76"
          height="72"
          preserveAspectRatio="xMidYMid meet"
          filter="url(#tint-torso)"
          {...clickProps("torso")}
        />

        {/* ── Layer 6: T-Shirt overlay ── */}
        {equippedClothing.tshirt && itemsById[equippedClothing.tshirt] && (
          <image
            href={itemsById[equippedClothing.tshirt].imageDataUrl}
            x="62"
            y="98"
            width="76"
            height="72"
            preserveAspectRatio="xMidYMid meet"
          />
        )}

        {/* ── Layer 6b: Shirt overlay ── */}
        {equippedClothing.shirt && itemsById[equippedClothing.shirt] && (
          <image
            href={itemsById[equippedClothing.shirt].imageDataUrl}
            x="62"
            y="98"
            width="76"
            height="72"
            preserveAspectRatio="xMidYMid meet"
          />
        )}

        {/* ── Layer 7: Left Arm ── */}
        <image
          href="/assets/left.arm-019d5e50-81e1-72cb-9d59-a92f2eb8c93d.png"
          x="32"
          y="100"
          width="34"
          height="68"
          preserveAspectRatio="xMidYMid meet"
          filter="url(#tint-left-arm)"
          className={walkAnimLeftArm}
          {...clickProps("leftArm")}
        />

        {/* ── Layer 8: Right Arm ── */}
        <image
          href="/assets/right.arm-019d5e50-81c6-76f8-b6ea-99e716061e46.png"
          x="134"
          y="100"
          width="34"
          height="68"
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
          y={98}
          w={48}
          h={28}
        />

        {/* ── Layer 10: Waist ── */}
        <AccessoryImage
          itemId={equippedAccessories.waist}
          items={itemsById}
          x={62}
          y={162}
          w={76}
          h={20}
        />

        {/* ── Layer 11: Shoulder ── */}
        <AccessoryImage
          itemId={equippedAccessories.shoulder}
          items={itemsById}
          x={28}
          y={100}
          w={144}
          h={30}
        />

        {/* ── Layer 12: Hair back layer ── */}
        <HairBack style={faceFeatures.hairStyle} color={hairColor} />

        {/* ── Layer 13: Ears — use headColor for skin-matching ── */}
        <Ear style={faceFeatures.earStyle} cx={57} skinColor={headColor} />
        <Ear style={faceFeatures.earStyle} cx={143} skinColor={headColor} />

        {/* ── Layer 14: Head PNG sprite (top-most body layer, covers arms/torso) ── */}
        <image
          href="/assets/head-019d5e50-81bd-7459-a81a-4a0b37b03459.png"
          x="57"
          y="12"
          width="86"
          height="92"
          preserveAspectRatio="xMidYMid meet"
          filter="url(#tint-head)"
          {...clickProps("head")}
        />

        {/* ── Layer 15: Face Features ── */}
        {/* Eyebrows */}
        <Eyebrow
          style={faceFeatures.eyebrowStyle}
          cx={82}
          color={eyebrowColor}
        />
        <Eyebrow
          style={faceFeatures.eyebrowStyle}
          cx={118}
          color={eyebrowColor}
        />

        {/* Eyes */}
        <Eyes
          style={faceFeatures.eyeStyle}
          cx={82}
          customImg={faceFeatures.customEyeImg}
        />
        <Eyes
          style={faceFeatures.eyeStyle}
          cx={118}
          customImg={faceFeatures.customEyeImg}
        />

        {/* Nose */}
        <Nose style={faceFeatures.noseStyle} />

        {/* Mouth */}
        <Mouth
          style={faceFeatures.mouthStyle}
          customImg={faceFeatures.customMouthImg}
        />

        {/* ── Layer 16: Hair Front ── */}
        <HairFront style={faceFeatures.hairStyle} color={hairColor} />

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
          y={44}
          w={72}
          h={30}
        />

        {/* ── Layer 19: Front accessory ── */}
        <AccessoryImage
          itemId={equippedAccessories.front}
          items={itemsById}
          x={70}
          y={120}
          w={60}
          h={55}
        />
      </g>
    </svg>
  );
}
