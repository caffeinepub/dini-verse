// Local type definitions that mirror the backend types.
// Since the backend is minimal and all data is localStorage-based, these are
// defined here rather than generated from the backend.

export enum Gender {
  female = "female",
  male = "male",
  other = "other",
}

export enum Language {
  en = "en",
  es = "es",
  fr = "fr",
  pt = "pt",
  de = "de",
  tr = "tr",
  ru = "ru",
  vi = "vi",
  ko = "ko",
  nl = "nl",
}

export enum TextDirection {
  leftToRight = "leftToRight",
  rightToLeft = "rightToLeft",
}

export enum Variant_offline_online {
  offline = "offline",
  online = "online",
}

export enum Category {
  adventure = "adventure",
  roleplay = "roleplay",
  simulator = "simulator",
}

export interface UserProfile {
  displayName: string;
  avatarDataUrl?: string | null;
  visibility: Variant_offline_online;
  gender: Gender;
  language: Language;
}

export interface Experience {
  id: string;
  title: string;
  description: string;
  thumbnail: { getDirectURL: () => string } | null;
  author: string;
  category: Category;
  playerCount: number;
  thumbsUp: number;
  thumbsDown: number;
  gameplayControls: string;
}
