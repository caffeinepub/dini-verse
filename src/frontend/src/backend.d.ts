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
export interface PublicUserProfile {
    displayName: string;
    visibility: Variant_offline_online;
    avatar?: ExternalBlob;
}
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
    passwordResetAttempts: bigint;
    updatedAt: Time;
    lastPasswordChange: Time;
    visibility: Variant_offline_online;
    lastUsernameChange: Time;
    lastPasswordResetAttempt: Time;
    avatar?: ExternalBlob;
}
export enum Category {
    roleplay = "roleplay",
    simulator = "simulator",
    adventure = "adventure"
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
    deleteAvatar(): Promise<void>;
    getAllExperiences(): Promise<Array<Experience>>;
    getCallerUserProfile(): Promise<PublicUserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getExperiencesByAuthor(author: Principal): Promise<Array<Experience>>;
    getExperiencesByCategory(category: Category): Promise<Array<Experience>>;
    getOrCreateCallerSettings(): Promise<UserSettings>;
    getTrendingExperiences(category: Category): Promise<Array<Experience>>;
    getUserProfile(user: Principal): Promise<PublicUserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: PublicUserProfile): Promise<void>;
    searchExperiences(searchTerm: string): Promise<Array<Experience>>;
    updateDisplayName(newDisplayName: string): Promise<void>;
    updateDisplayNameAndAvatar(newDisplayName: string, avatar: ExternalBlob | null): Promise<void>;
    updateVisibility(visibility: Visibility): Promise<void>;
}
