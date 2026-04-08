import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface Experience {
    id: string;
    title: string;
    thumbnail?: Uint8Array;
    thumbsDown: bigint;
    playerCount: bigint;
    description: string;
    author: Principal;
    thumbsUp: bigint;
    category: Category;
    gameplayControls: string;
}
export interface UserSettings {
    username: string;
    displayName: string;
    createdAt: Time;
    lastDisplayNameChange: Time;
    languageCode: string;
    language: Language;
    passwordResetAttempts: bigint;
    updatedAt: Time;
    lastPasswordChange: Time;
    gender: Gender;
    pronunciationLanguage: Language;
    languagePrefix: string;
    textDirection: TextDirection;
    visibility: Variant_offline_online;
    lastUsernameChange: Time;
    nativeLanguage: Language;
    lastPasswordResetAttempt: Time;
    avatar?: Uint8Array;
}
export interface UserProfile {
    displayName: string;
    languageCode: string;
    language: Language;
    gender: Gender;
    languagePrefix: string;
    textDirection: TextDirection;
    visibility: Variant_offline_online;
    nativeLanguage: Language;
    avatar?: Uint8Array;
}
export enum Category {
    roleplay = "roleplay",
    simulator = "simulator",
    adventure = "adventure"
}
export enum Gender {
    other = "other",
    female = "female",
    male = "male"
}
export enum Language {
    de = "de",
    en = "en",
    es = "es",
    fr = "fr",
    ko = "ko",
    nl = "nl",
    pt = "pt",
    ru = "ru",
    tr = "tr",
    vi = "vi"
}
export enum TextDirection {
    leftToRight = "leftToRight",
    rightToLeft = "rightToLeft"
}
export enum Variant_offline_online {
    offline = "offline",
    online = "online"
}
export interface backendInterface {
    deleteAccount(): Promise<void>;
    getAllExperiences(): Promise<Array<Experience>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getExperiencesByAuthor(author: Principal): Promise<Array<Experience>>;
    getExperiencesByCategory(category: Category): Promise<Array<Experience>>;
    getSettings(): Promise<UserSettings>;
    getTrendingExperiences(category: Category): Promise<Array<Experience>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    searchExperiences(searchTerm: string): Promise<Array<Experience>>;
    setGender(gender: Gender): Promise<void>;
    setLanguage(language: Language, languageCode: string, languagePrefix: string, textDirection: TextDirection, nativeLanguage: Language): Promise<void>;
    updateDisplayName(newDisplayName: string): Promise<void>;
    updateVisibility(visibility: Variant_offline_online): Promise<void>;
}
