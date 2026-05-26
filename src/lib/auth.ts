export type Role = "admin" | "stock_manager" | "lorry_manager" | "sales_staff" | "collector";

export type SessionUser = {
  name: string;
  email: string;
  role: Role;
};

const KEY = "sujee.session";

export const ROLE_LABEL: Record<Role, string> = {
  admin: "Super Admin",
  stock_manager: "Stock Manager",
  lorry_manager: "Lorry Manager",
  sales_staff: "Sales Staff",
  collector: "Cash Collector",
};

export function getSession(): SessionUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

export function setSession(user: SessionUser) {
  localStorage.setItem(KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("sujee:session"));
}

export function clearSession() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("sujee:session"));
}

export function login(email: string, role: Role): SessionUser {
  const user: SessionUser = {
    email,
    role,
    name: email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "User",
  };
  setSession(user);
  return user;
}
