import type { AvatarData } from "../../types/avatarTypes";

interface ChibiAvatarProps {
  avatarData: AvatarData;
  width?: number;
  height?: number;
  interactive?: boolean;
  onPartClick?: (part: string) => void;
}

// ─── Hair Paths ──────────────────────────────────────────────────────────────
// hairStyle 0: Short boyish cut
// hairStyle 1: Long straight
// hairStyle 2: Twin pigtails
// hairStyle 3: Bob
// hairStyle 4: Wavy/curly
// hairStyle 5: Ponytail

function HairBack({ style, color }: { style: number; color: string }) {
  switch (style) {
    case 1: // Long straight — back layer
      return (
        <>
          <rect x="52" y="55" width="12" height="90" rx="6" fill={color} />
          <rect x="136" y="55" width="12" height="90" rx="6" fill={color} />
        </>
      );
    case 2: // Pigtails — back
      return (
        <>
          <ellipse cx="50" cy="100" rx="10" ry="30" fill={color} />
          <ellipse cx="150" cy="100" rx="10" ry="30" fill={color} />
        </>
      );
    case 5: // Ponytail — back
      return <rect x="94" y="30" width="12" height="75" rx="6" fill={color} />;
    default:
      return null;
  }
}

function HairFront({ style, color }: { style: number; color: string }) {
  switch (style) {
    case 0: // Short boyish
      return (
        <path
          d="M55 58 Q55 18 100 16 Q145 18 145 58 Q140 50 130 48 Q115 38 100 38 Q85 38 70 48 Q60 50 55 58Z"
          fill={color}
        />
      );
    case 1: // Long straight
      return (
        <path
          d="M55 58 Q55 18 100 15 Q145 18 145 58 Q138 46 125 42 Q112 34 100 34 Q88 34 75 42 Q62 46 55 58Z"
          fill={color}
        />
      );
    case 2: // Pigtails
      return (
        <path
          d="M55 60 Q55 18 100 15 Q145 18 145 60 Q140 48 130 44 Q115 36 100 36 Q85 36 70 44 Q60 48 55 60Z"
          fill={color}
        />
      );
    case 3: // Bob
      return (
        <path
          d="M52 65 Q52 16 100 14 Q148 16 148 65 Q148 80 142 85 Q138 52 125 44 Q112 36 100 36 Q88 36 75 44 Q62 52 58 85 Q52 80 52 65Z"
          fill={color}
        />
      );
    case 4: // Wavy
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
    case 5: // Ponytail
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
    case 0: // Round cute
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
    case 1: // Cat eyes
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
    case 2: // Sleepy
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
    case 3: // Sparkle
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
    case 4: // Dot eyes
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
    case 0: // Arched
      return (
        <path
          d={`M${cx - 7} 45 Q${cx} 41 ${cx + 7} 45`}
          stroke={color}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      );
    case 1: // Thick flat
      return (
        <rect x={cx - 7} y={43} width={14} height={3} rx={1.5} fill={color} />
      );
    case 2: // Thin curved
      return (
        <path
          d={`M${cx - 6} 46 Q${cx} 43 ${cx + 6} 46`}
          stroke={color}
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
      );
    case 3: // Worried
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
    case 0: // Dot
      return <circle cx={100} cy={64} r={2.5} fill="rgba(0,0,0,0.12)" />;
    case 1: // Button
      return (
        <>
          <ellipse cx={97} cy={64} rx={2} ry={2.5} fill="rgba(0,0,0,0.10)" />
          <ellipse cx={103} cy={64} rx={2} ry={2.5} fill="rgba(0,0,0,0.10)" />
        </>
      );
    case 2: // Cat nose
      return (
        <path d="M97 64 Q100 66 103 64 L100 61Z" fill="rgba(180,80,100,0.5)" />
      );
    case 3: // Triangle
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
    case 0: // Smile
      return (
        <path
          d="M90 73 Q100 80 110 73"
          stroke="#8b5e3c"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      );
    case 1: // Happy open
      return (
        <path
          d="M88 72 Q100 82 112 72"
          stroke="#8b5e3c"
          strokeWidth="2"
          fill="#fff"
          strokeLinecap="round"
        />
      );
    case 2: // Pout
      return <ellipse cx={100} cy={75} rx={5} ry={3} fill="#c47a5a" />;
    case 3: // Cat mouth
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
    case 4: // Neutral
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
    case 0: // Round
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
    case 1: // Pointy (elf)
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
    case 2: // Cat ears (decorative)
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
}: ChibiAvatarProps) {
  const {
    skinColor,
    hairColor,
    faceFeatures,
    equippedClothing,
    equippedAccessories,
    accessoryPositions,
  } = avatarData;
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

  // We need a way to look up items by id. The caller should provide inventory, but for now we use a placeholder.
  // avatarData doesn't contain item data, only IDs — so we resolve from localStorage here.
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
    // Also check all user inventories
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

      {/* ── Layer 2: Legs / Pants ── */}
      {/* Left Leg */}
      <rect
        x="72"
        y="175"
        width="26"
        height="70"
        rx="8"
        fill={skinColor}
        stroke="#c8a882"
        strokeWidth="1.2"
        {...clickProps("leftLeg")}
      />
      {/* Right Leg */}
      <rect
        x="102"
        y="175"
        width="26"
        height="70"
        rx="8"
        fill={skinColor}
        stroke="#c8a882"
        strokeWidth="1.2"
        {...clickProps("rightLeg")}
      />
      {/* Pants overlay */}
      {equippedClothing.pants && itemsById[equippedClothing.pants] && (
        <image
          href={itemsById[equippedClothing.pants].imageDataUrl}
          x="68"
          y="168"
          width="64"
          height="80"
          preserveAspectRatio="xMidYMid meet"
        />
      )}

      {/* ── Layer 3: Torso ── */}
      <rect
        x="65"
        y="115"
        width="70"
        height="65"
        rx="10"
        fill={skinColor}
        stroke="#c8a882"
        strokeWidth="1.2"
        {...clickProps("torso")}
      />
      {/* T-Shirt overlay */}
      {equippedClothing.tshirt && itemsById[equippedClothing.tshirt] && (
        <image
          href={itemsById[equippedClothing.tshirt].imageDataUrl}
          x="55"
          y="108"
          width="90"
          height="75"
          preserveAspectRatio="xMidYMid meet"
        />
      )}
      {/* Shirt overlay (on top of tshirt) */}
      {equippedClothing.shirt && itemsById[equippedClothing.shirt] && (
        <image
          href={itemsById[equippedClothing.shirt].imageDataUrl}
          x="55"
          y="108"
          width="90"
          height="75"
          preserveAspectRatio="xMidYMid meet"
        />
      )}

      {/* ── Layer 4: Arms ── */}
      {/* Left Arm */}
      <rect
        x="40"
        y="118"
        width="26"
        height="58"
        rx="8"
        fill={skinColor}
        stroke="#c8a882"
        strokeWidth="1.2"
        {...clickProps("leftArm")}
      />
      {/* Right Arm */}
      <rect
        x="134"
        y="118"
        width="26"
        height="58"
        rx="8"
        fill={skinColor}
        stroke="#c8a882"
        strokeWidth="1.2"
        {...clickProps("rightArm")}
      />

      {/* ── Layer 5: Neck ── */}
      <rect
        x="89"
        y="100"
        width="22"
        height="20"
        rx="5"
        fill={skinColor}
        stroke="#c8a882"
        strokeWidth="1.2"
        {...clickProps("neck")}
      />
      {/* Neck accessory */}
      <AccessoryImage
        itemId={equippedAccessories.neck}
        items={itemsById}
        x={76}
        y={98}
        w={48}
        h={28}
      />

      {/* ── Layer 6: Waist ── */}
      <AccessoryImage
        itemId={equippedAccessories.waist}
        items={itemsById}
        x={60}
        y={168}
        w={80}
        h={20}
      />

      {/* ── Layer 7: Shoulder ── */}
      <AccessoryImage
        itemId={equippedAccessories.shoulder}
        items={itemsById}
        x={28}
        y={110}
        w={144}
        h={30}
      />

      {/* ── Layer 8: Head/skin ── */}
      {/* Hair back layer */}
      <HairBack style={faceFeatures.hairStyle} color={hairColor} />

      {/* Ears */}
      <Ear style={faceFeatures.earStyle} cx={57} skinColor={skinColor} />
      <Ear style={faceFeatures.earStyle} cx={143} skinColor={skinColor} />

      {/* Head */}
      <rect
        x="57"
        y="22"
        width="86"
        height="82"
        rx="26"
        fill={skinColor}
        stroke="#c8a882"
        strokeWidth="1.2"
        {...clickProps("head")}
      />

      {/* ── Layer 9: Face Features ── */}
      {/* Eyebrows */}
      <Eyebrow style={faceFeatures.eyebrowStyle} cx={82} color={eyebrowColor} />
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

      {/* ── Layer 10: Hair Front ── */}
      <HairFront style={faceFeatures.hairStyle} color={hairColor} />

      {/* ── Layer 11: Hat ── */}
      <AccessoryImage
        itemId={equippedAccessories.hat}
        items={itemsById}
        x={52}
        y={0}
        w={96}
        h={44}
      />

      {/* ── Layer 12: Face accessory (glasses etc) ── */}
      <AccessoryImage
        itemId={equippedAccessories.face}
        items={itemsById}
        x={64}
        y={44}
        w={72}
        h={30}
      />

      {/* ── Layer 13: Front accessory ── */}
      <AccessoryImage
        itemId={equippedAccessories.front}
        items={itemsById}
        x={70}
        y={120}
        w={60}
        h={55}
      />
    </svg>
  );
}
