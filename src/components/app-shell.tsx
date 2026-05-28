import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ScanBarcode,
  Package,
  Truck,
  Users,
  Wallet,
  ReceiptText,
  ShoppingCart,
  Boxes,
  Settings,
  Menu,
  X,
  Building2,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard };

const NAV: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/pos", label: "POS Sales", icon: ScanBarcode },
  { to: "/inventory", label: "Inventory", icon: Boxes },
  { to: "/products", label: "Products", icon: Package },
  { to: "/sales", label: "Sales", icon: ShoppingCart },
  { to: "/purchases", label: "Purchases", icon: ReceiptText },
  { to: "/lorries", label: "Lorries", icon: Truck },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/collections", label: "Collections", icon: Wallet },
  { to: "/reports", label: "Reports", icon: TrendingUp },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex w-full bg-background">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-sidebar text-sidebar-foreground flex flex-col transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="h-16 flex items-center gap-3 px-5 border-b border-sidebar-border">
          <div className="size-9 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground grid place-items-center">
            <Building2 className="size-5" />
          </div>
          <div>
            <div className="font-semibold leading-tight">Sujee Enterprises</div>
            <div className="text-xs text-sidebar-foreground/70">Business Suite</div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          {NAV.map((item) => {
            const Active = pathname === item.to || pathname.startsWith(item.to + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  Active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <div className="px-2 py-2">
            <div className="text-sm font-medium truncate">Sujee Enterprises</div>
            <div className="text-xs text-sidebar-foreground/70">Business Suite</div>
          </div>
        </div>
      </aside>

      {open && (
        <button
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        />
      )}

      <div className="flex-1 flex flex-col lg:ml-64 min-w-0">
        <header className="h-16 flex items-center gap-3 border-b bg-card px-4 lg:px-6 sticky top-0 z-20">
          <button
            className="lg:hidden inline-flex items-center justify-center rounded-md size-9 hover:bg-accent"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <div className="font-medium text-sm text-muted-foreground">
            {NAV.find((i) => pathname === i.to || pathname.startsWith(i.to + "/"))?.label ?? "Sujee Enterprises"}
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 min-w-0">{children}</main>
      </div>
    </div>
  );
}
