import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/api/auth.api";
import { queryKeys } from "@/api/query-keys";
import { useAuthStore } from "@/stores/auth.store";

export function useMe() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: getMe,
    enabled: !!accessToken,
  });
}
