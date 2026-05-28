import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { signIn, ROLE_LABEL, type Role } from "@/lib/auth-db";
import { Building2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

const ROLES: Role[] = ["admin", "stock_manager", "lorry_manager", "sales_staff", "collector"];

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("owner@sujee.lk");
  const [password, setPassword] = useState("password123");
  const [role, setRole] = useState<Role>("admin");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || busy) return;
    setBusy(true);
    try {
      const user = await signIn(email, password, role);
      if (user) {
        toast.success(`Welcome, ${user.name}`);
        navigate({ to: "/dashboard" });
      } else {
        toast.error("Sign-in failed. Check email/password.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Sign-in failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex flex-col justify-between bg-sidebar text-sidebar-foreground p-10">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground grid place-items-center">
            <Building2 className="size-5" />
          </div>
          <div>
            <div className="font-semibold">Sujee Enterprises</div>
            <div className="text-xs text-sidebar-foreground/70">Business Management Suite</div>
          </div>
        </div>
        <div className="space-y-4 max-w-md">
          <h1 className="text-3xl font-semibold leading-tight">Run your retail, installment, and lorry sales — all in one place.</h1>
          <p className="text-sidebar-foreground/80 text-sm">
            POS, inventory, customer installments, lorry routes, and collections — designed for Sri Lankan distribution teams.
          </p>
        </div>
        <div className="text-xs text-sidebar-foreground/60">© {new Date().getFullYear()} Sujee Enterprises</div>
      </div>

      <div className="flex items-center justify-center p-6 lg:p-12">
        <form onSubmit={submit} className="w-full max-w-sm space-y-5">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">Sign in</h2>
            <p className="text-sm text-muted-foreground">Use any email/password — demo mode.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-10 px-3 rounded-md border bg-card text-sm outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-10 px-3 rounded-md border bg-card text-sm outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Sign in as</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full h-10 px-3 rounded-md border bg-card text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{ROLE_LABEL[r]}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
