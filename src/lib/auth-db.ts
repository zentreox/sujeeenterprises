export type Role = "admin" | "stock_manager" | "lorry_manager" | "sales_staff" | "collector";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  lorryId?: string;
  commissionRate: number;
};

export const ROLE_LABEL: Record<Role, string> = {
  admin: "Super Admin",
  stock_manager: "Stock Manager",
  lorry_manager: "Lorry Manager",
  sales_staff: "Sales Staff",
  collector: "Cash Collector",
};

import { supabase } from "./supabase";

const AUTH_KEY = "sujee.session.user";

export function getStoredUser(): SessionUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: SessionUser | null) {
  if (user) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_KEY);
  }
  window.dispatchEvent(new Event("sujee:session"));
}

export async function signIn(email: string, password: string, role: Role): Promise<SessionUser | null> {
  // First, sign in with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    // If user doesn't exist in Supabase Auth, create them
    if (authError.message.includes("Invalid login credentials")) {
      // Create auth user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            name: email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
          },
        },
      });

      if (signUpError) {
        console.error("Sign up error:", signUpError);
        throw new Error(signUpError.message);
      }

      if (signUpData.user) {
        // Create corresponding users table entry
        const user: SessionUser = {
          id: signUpData.user.id,
          email,
          name: email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
          role,
          commissionRate: 0.04,
        };

        // Insert into users table
        const { error: insertError } = await supabase.from("users").insert({
          id: signUpData.user.id,
          email,
          name: user.name,
          role,
          commission_rate: 0.04,
          is_active: true,
        });

        if (insertError) {
          console.error("Error creating user record:", insertError);
        }

        setStoredUser(user);
        return user;
      }
    } else {
      console.error("Auth error:", authError);
      throw new Error(authError.message);
    }
  } else if (authData.user) {
    // Get user from users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", authData.user.id)
      .maybeSingle();

    if (userError) {
      console.error("Error fetching user:", userError);
    }

    const user: SessionUser = {
      id: authData.user.id,
      email: authData.user.email!,
      name: userData?.name || authData.user.user_metadata?.name || email.split("@")[0],
      role: userData?.role || authData.user.user_metadata?.role || role,
      lorryId: userData?.lorry_id,
      commissionRate: userData?.commission_rate || 0.04,
    };

    setStoredUser(user);
    return user;
  }

  return null;
}

export async function signOut() {
  await supabase.auth.signOut();
  setStoredUser(null);
}

export function getSession(): SessionUser | null {
  return getStoredUser();
}

// Legacy compatibility - for demo mode without Supabase Auth
export function loginLegacy(email: string, role: Role): SessionUser {
  const user: SessionUser = {
    id: `demo-${Date.now()}`,
    email,
    role,
    name: email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "User",
    commissionRate: 0.04,
  };
  setStoredUser(user);
  return user;
}

export function clearSession() {
  setStoredUser(null);
}
