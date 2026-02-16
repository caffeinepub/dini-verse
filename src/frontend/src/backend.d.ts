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
export interface FriendRequest {
    to: Principal;
    status: FriendRequestStatus;
    from: Principal;
}
export type Time = bigint;
export interface DiniVerseUser {
    displayName: string;
    avatar?: ExternalBlob;
}
export interface Message {
    id: bigint;
    content: string;
    read: boolean;
    sender: Principal;
    timestamp: Time;
    receiver: Principal;
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
export interface MessageInput {
    content: string;
    receiver: Principal;
}
export enum Category {
    roleplay = "roleplay",
    simulator = "simulator",
    adventure = "adventure"
}
export enum FriendRequestStatus {
    cancelled = "cancelled",
    pending = "pending",
    accepted = "accepted",
    declined = "declined"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_accept_decline {
    accept = "accept",
    decline = "decline"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createExperience(title: string, description: string, thumbnail: ExternalBlob | null, category: Category, gameplayControls: string): Promise<string>;
    getAllExperiences(): Promise<Array<Experience>>;
    getCallerUserProfile(): Promise<DiniVerseUser | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCurrentUserProfile(): Promise<DiniVerseUser | null>;
    getExperience(id: string): Promise<Experience | null>;
    getExperiencesByAuthor(author: Principal): Promise<Array<Experience>>;
    getExperiencesByCategory(category: Category): Promise<Array<Experience>>;
    getFriendsList(): Promise<Array<Principal>>;
    getGameplayControls(experienceId: string): Promise<string>;
    getMessages(receiver: Principal): Promise<Array<Message>>;
    getPendingFriendRequests(): Promise<Array<Principal>>;
    getTrendingExperiences(category: Category): Promise<Array<Experience>>;
    getUserProfile(user: Principal): Promise<DiniVerseUser | null>;
    incrementPlayerCount(experienceId: string): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    rateExperience(experienceId: string, isThumbsUp: boolean): Promise<void>;
    respondToFriendRequest(from: Principal, action: Variant_accept_decline): Promise<void>;
    saveCallerUserProfile(profile: DiniVerseUser): Promise<void>;
    searchExperiences(searchTerm: string): Promise<Array<Experience>>;
    searchUsersByDisplayName(searchTerm: string): Promise<Array<[Principal, DiniVerseUser]>>;
    sendFriendRequest(target: Principal): Promise<FriendRequest>;
    sendMessage(input: MessageInput): Promise<Message>;
    signUp(displayName: string, avatar: ExternalBlob | null): Promise<void>;
    unfriend(target: Principal): Promise<void>;
}
