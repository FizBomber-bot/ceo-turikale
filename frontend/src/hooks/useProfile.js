import { useQuery } from "@tanstack/react-query";
import { fetchProfile } from "@/lib/api";
import { profile as fallbackProfile } from "@/data/site";

export function useProfile() {
  const { data, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
    staleTime: 30_000,
  });
  return { profile: data || fallbackProfile, isLoading };
}
