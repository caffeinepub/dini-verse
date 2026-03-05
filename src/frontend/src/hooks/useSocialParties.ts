import { useQuery } from "@tanstack/react-query";

// Placeholder hooks for party system - backend not yet implemented
export function useGetCurrentParty() {
  return useQuery({
    queryKey: ["party", "current"],
    queryFn: async () => {
      // Backend party methods not yet available
      return null;
    },
    enabled: false,
  });
}
