import { Construction } from "lucide-react";

export function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="rounded-xl border bg-card p-12 text-center shadow-sm">
        <div className="mx-auto size-14 rounded-full bg-primary/10 text-primary grid place-items-center mb-4">
          <Construction className="size-6" />
        </div>
        <div className="font-medium">Module in progress</div>
        <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
          This module is part of the next iteration. The current build focuses on auth, dashboard, POS, inventory, sales and purchases.
        </p>
      </div>
    </div>
  );
}
