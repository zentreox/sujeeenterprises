import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";
export const Route = createFileRoute("/_app/settings")({
  component: () => <ComingSoon title="Settings" description="Company info, branches, roles & permissions, backups and integrations." />,
});
