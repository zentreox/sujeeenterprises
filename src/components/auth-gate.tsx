import { useEffect } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useSession } from "@/hooks/use-session";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const user = useSession();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!user && pathname !== "/login") {
      navigate({ to: "/login" });
    }
  }, [user, pathname, navigate]);

  if (!user) return null;
  return <>{children}</>;
}
