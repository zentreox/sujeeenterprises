import { Navigate, useRouterState } from "@tanstack/react-router";
import { useSession } from "@/hooks/use-session";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const user = useSession();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (!user && pathname !== "/login") {
    return <Navigate to="/login" replace />;
  }

  if (!user) return null;
  return <>{children}</>;
}
