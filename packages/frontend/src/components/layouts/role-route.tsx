import { Navigate } from "react-router";
import { useAuthStore } from "@/stores/auth.store";
import type { Role } from "@/api/types";

export function RoleRoute({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!user.roles?.includes(role)) {
    const fallback = user.roles?.includes("recruiter") ? "/recruiter/dashboard" : "/seeker/dashboard";
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}
