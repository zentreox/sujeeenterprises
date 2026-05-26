import { useEffect, useState } from "react";
import { getSession, type SessionUser } from "@/lib/auth";

export function useSession(): SessionUser | null {
  const [user, setUser] = useState<SessionUser | null>(() => getSession());
  useEffect(() => {
    const sync = () => setUser(getSession());
    window.addEventListener("sujee:session", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("sujee:session", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return user;
}
