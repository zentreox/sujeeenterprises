import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";
export const Route = createFileRoute("/_app/lorries")({
  component: () => <ComingSoon title="Lorry Management" description="Manage 12 lorries, drivers, routes, stock transfers and daily collections." />,
});
