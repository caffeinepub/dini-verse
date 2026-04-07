export interface FaceFeatures {
  eyeStyle: number; // 0-4
  eyebrowStyle: number; // 0-3
  noseStyle: number; // 0-3
  mouthStyle: number; // 0-4
  earStyle: number; // 0-2
  hairStyle: number; // 0-5
  customEyeImg?: string; // base64 data URL
  customMouthImg?: string; // base64 data URL
}

export interface AccessoryPosition {
  x: number; // -50 to 50
  y: number; // -50 to 50
  rotation: number; // -180 to 180
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  type:
    | "shirt"
    | "tshirt"
    | "pants"
    | "hat"
    | "face"
    | "neck"
    | "shoulder"
    | "front"
    | "back"
    | "waist";
  imageDataUrl: string;
  price: number;
  limitedStock: boolean;
  stock?: number;
  creatorUsername: string;
}

export interface BodyPartColors {
  headColor: string;
  torsoColor: string;
  leftArmColor: string;
  rightArmColor: string;
  leftLegColor: string;
  rightLegColor: string;
}

export interface AvatarData {
  skinColor: string;
  hairColor: string;
  faceFeatures: FaceFeatures;
  equippedClothing: {
    shirt?: string;
    tshirt?: string;
    pants?: string;
  };
  equippedAccessories: {
    hat?: string;
    face?: string;
    neck?: string;
    shoulder?: string;
    front?: string;
    back?: string;
    waist?: string;
  };
  accessoryPositions: Record<string, AccessoryPosition>;
  bodyPartColors?: BodyPartColors;
}

export const DEFAULT_FACE_FEATURES: FaceFeatures = {
  eyeStyle: 0,
  eyebrowStyle: 0,
  noseStyle: 0,
  mouthStyle: 0,
  earStyle: 0,
  hairStyle: 0,
};

export const DEFAULT_BODY_PART_COLORS: BodyPartColors = {
  headColor: "#e8e8e8",
  torsoColor: "#e8e8e8",
  leftArmColor: "#e8e8e8",
  rightArmColor: "#e8e8e8",
  leftLegColor: "#e8e8e8",
  rightLegColor: "#e8e8e8",
};

export const DEFAULT_AVATAR_DATA: AvatarData = {
  skinColor: "#f5cba7",
  hairColor: "#5a3e2b",
  faceFeatures: DEFAULT_FACE_FEATURES,
  equippedClothing: {},
  equippedAccessories: {},
  accessoryPositions: {},
  bodyPartColors: {
    headColor: "#e8e8e8",
    torsoColor: "#e8e8e8",
    leftArmColor: "#e8e8e8",
    rightArmColor: "#e8e8e8",
    leftLegColor: "#e8e8e8",
    rightLegColor: "#e8e8e8",
  },
};
