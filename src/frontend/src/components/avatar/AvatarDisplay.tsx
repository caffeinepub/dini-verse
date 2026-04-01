// Shared 2D Avatar display component — read-only, no interactions

interface AvatarDisplayProps {
  skinColor?: string;
  bodyPartColors?: Record<string, string>;
  className?: string;
}

type BodyPartKey =
  | "head"
  | "neck"
  | "torso"
  | "leftUpperArm"
  | "rightUpperArm"
  | "leftLowerArm"
  | "rightLowerArm"
  | "leftLeg"
  | "rightLeg";

function getPartColor(
  part: BodyPartKey,
  skinColor: string,
  bodyPartColors: Record<string, string>,
): string {
  return bodyPartColors[part] ?? skinColor;
}

export default function AvatarDisplay({
  skinColor = "#f5cba7",
  bodyPartColors = {},
  className = "",
}: AvatarDisplayProps) {
  const c = (key: BodyPartKey) => getPartColor(key, skinColor, bodyPartColors);

  return (
    <svg
      viewBox="0 0 200 320"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full h-full ${className}`}
      style={{ maxHeight: "220px" }}
      role="img"
      aria-label="User avatar"
    >
      <title>User Avatar</title>

      {/* Shadow */}
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
        fill={c("leftLeg")}
        stroke="#c8a882"
        strokeWidth="1.5"
      />
      {/* Right Leg */}
      <rect
        x="105"
        y="200"
        width="35"
        height="90"
        rx="8"
        fill={c("rightLeg")}
        stroke="#c8a882"
        strokeWidth="1.5"
      />

      {/* Left Upper Arm */}
      <rect
        x="20"
        y="102"
        width="30"
        height="70"
        rx="8"
        fill={c("leftUpperArm")}
        stroke="#c8a882"
        strokeWidth="1.5"
      />
      {/* Right Upper Arm */}
      <rect
        x="150"
        y="102"
        width="30"
        height="70"
        rx="8"
        fill={c("rightUpperArm")}
        stroke="#c8a882"
        strokeWidth="1.5"
      />

      {/* Left Lower Arm */}
      <rect
        x="15"
        y="172"
        width="30"
        height="60"
        rx="8"
        fill={c("leftLowerArm")}
        stroke="#c8a882"
        strokeWidth="1.5"
      />
      {/* Right Lower Arm */}
      <rect
        x="155"
        y="172"
        width="30"
        height="60"
        rx="8"
        fill={c("rightLowerArm")}
        stroke="#c8a882"
        strokeWidth="1.5"
      />

      {/* Torso */}
      <rect
        x="55"
        y="100"
        width="90"
        height="105"
        rx="10"
        fill={c("torso")}
        stroke="#c8a882"
        strokeWidth="1.5"
      />

      {/* Neck */}
      <rect
        x="88"
        y="82"
        width="24"
        height="22"
        rx="5"
        fill={c("neck")}
        stroke="#c8a882"
        strokeWidth="1.5"
      />

      {/* Head */}
      <rect
        x="65"
        y="20"
        width="70"
        height="65"
        rx="18"
        fill={c("head")}
        stroke="#c8a882"
        strokeWidth="1.5"
      />

      {/* Eyes */}
      <ellipse cx="85" cy="45" rx="6" ry="7" fill="#fff" />
      <ellipse cx="115" cy="45" rx="6" ry="7" fill="#fff" />
      <circle cx="86" cy="46" r="3.5" fill="#3a2a1a" />
      <circle cx="116" cy="46" r="3.5" fill="#3a2a1a" />
      <circle cx="87.2" cy="44.5" r="1.2" fill="#fff" />
      <circle cx="117.2" cy="44.5" r="1.2" fill="#fff" />

      {/* Eyebrows */}
      <path
        d="M79 37 Q85 33 91 37"
        stroke="#5a3e2b"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M109 37 Q115 33 121 37"
        stroke="#5a3e2b"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />

      {/* Nose */}
      <ellipse cx="100" cy="57" rx="3" ry="4" fill="rgba(0,0,0,0.08)" />

      {/* Smile */}
      <path
        d="M88 67 Q100 75 112 67"
        stroke="#8b5e3c"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />

      {/* Ears */}
      <ellipse
        cx="65"
        cy="52"
        rx="6"
        ry="9"
        fill={c("head")}
        stroke="#c8a882"
        strokeWidth="1.5"
      />
      <ellipse
        cx="135"
        cy="52"
        rx="6"
        ry="9"
        fill={c("head")}
        stroke="#c8a882"
        strokeWidth="1.5"
      />
    </svg>
  );
}
