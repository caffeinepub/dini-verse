import type { AvatarData } from "../../types/avatarTypes";
import { DEFAULT_AVATAR_DATA } from "../../types/avatarTypes";
import ChibiAvatar from "./ChibiAvatar";

interface AvatarDisplayProps {
  skinColor?: string;
  bodyPartColors?: Record<string, string>;
  avatarData?: AvatarData;
  className?: string;
  width?: number;
  height?: number;
  view?: "front" | "side";
  walking?: boolean;
}

export default function AvatarDisplay({
  skinColor = "#f5cba7",
  bodyPartColors = {},
  avatarData,
  className = "",
  width,
  height,
  view = "front",
  walking = false,
}: AvatarDisplayProps) {
  const resolvedData: AvatarData = avatarData ?? {
    ...DEFAULT_AVATAR_DATA,
    skinColor: bodyPartColors.head ?? skinColor,
    hairColor: "#5a3e2b",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <ChibiAvatar
        avatarData={resolvedData}
        width={width}
        height={height}
        view={view}
        walking={walking}
      />
    </div>
  );
}
