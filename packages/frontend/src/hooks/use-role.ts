import { useAuthStore } from "@/stores/auth.store";
import type { Role } from "@/api/types";

export function useRole(): Role | null {
  const user = useAuthStore((s) => s.user);
  if (!user?.roles?.length) return null;
  return (user.roles[0] as Role) ?? null;
}

export function useIsSeeker(): boolean {
  return useRole() === "seeker";
}

export function useIsRecruiter(): boolean {
  return useRole() === "recruiter";
}
