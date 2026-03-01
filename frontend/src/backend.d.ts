import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export interface Experience {
    id: string;
    title: string;
    thumbnail?: ExternalBlob;
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
    avatar?: ExternalBlob;
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
    avatar?: ExternalBlob;
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
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_offline_online {
    offline = "offline",
    online = "online"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteAccount(): Promise<void>;
    deleteAvatar(): Promise<void>;
    getAllExperiences(): Promise<Array<Experience>>;
    getAllLanguageSettings(): Promise<Array<[Principal, UserSettings]>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getExperiencesByAuthor(author: Principal): Promise<Array<Experience>>;
    getExperiencesByCategory(category: Category): Promise<Array<Experience>>;
    getGender(): Promise<Gender>;
    getLanguageSettings(): Promise<[Language, string, string, TextDirection, Language]>;
    getSettings(): Promise<UserSettings>;
    getTrendingExperiences(category: Category): Promise<Array<Experience>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(displayName: string, avatar: ExternalBlob | null, visibility: Variant_offline_online, gender: Gender, language: Language, languageCode: string, languagePrefix: string, textDirection: TextDirection, nativeLanguage: Language): Promise<void>;
    searchExperiences(searchTerm: string): Promise<Array<Experience>>;
    setGender(gender: Gender): Promise<void>;
    setLanguage(language: Language, languageCode: string, languagePrefix: string, textDirection: TextDirection, nativeLanguage: Language): Promise<void>;
    updateDisplayName(newDisplayName: string): Promise<void>;
    updateDisplayNameAndAvatar(newDisplayName: string, avatar: ExternalBlob | null): Promise<void>;
    updateVisibility(visibility: Visibility): Promise<void>;
}
