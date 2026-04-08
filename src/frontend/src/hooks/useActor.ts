import type { Principal } from "@icp-sdk/core/principal";
// Stub actor hook — all data is managed via localStorage.
// The backend is minimal; this hook provides a compatible interface.
import type { Category, Experience } from "../types/backendTypes";

export interface ActorInterface {
  getAllExperiences: () => Promise<Experience[]>;
  getExperiencesByAuthor: (author: Principal) => Promise<Experience[]>;
  searchExperiences: (term: string) => Promise<Experience[]>;
  getExperiencesByCategory: (category: Category) => Promise<Experience[]>;
  getTrendingExperiences: (category: Category) => Promise<Experience[]>;
}

const stubActor: ActorInterface = {
  getAllExperiences: async () => [],
  getExperiencesByAuthor: async () => [],
  searchExperiences: async () => [],
  getExperiencesByCategory: async () => [],
  getTrendingExperiences: async () => [],
};

export function useActor(): { actor: ActorInterface; isFetching: boolean } {
  return { actor: stubActor, isFetching: false };
}
