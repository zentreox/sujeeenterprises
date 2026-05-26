import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AuthGate } from "@/components/auth-gate";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/_app")({
  component: () => (
    <AuthGate>
      <AppShell>
        <Outlet />
      </AppShell>
    </AuthGate>
  ),
});
