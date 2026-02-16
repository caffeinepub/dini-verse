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
export interface DiniVerseUser {
    displayName: string;
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
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllExperiences(): Promise<Array<Experience>>;
    getCallerUserProfile(): Promise<DiniVerseUser | null>;
    getCallerUserRole(): Promise<UserRole>;
    getExperiencesByAuthor(author: Principal): Promise<Array<Experience>>;
    getExperiencesByCategory(category: Category): Promise<Array<Experience>>;
    getTrendingExperiences(category: Category): Promise<Array<Experience>>;
    getUserProfile(user: Principal): Promise<DiniVerseUser | null>;
    isCallerAdmin(): Promise<boolean>;
    searchExperiences(searchTerm: string): Promise<Array<Experience>>;
}
