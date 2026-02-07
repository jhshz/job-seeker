import { useMe } from "@/hooks/use-me";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useMe();
  return <>{children}</>;
}
