import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";
export const Route = createFileRoute("/_app/collections")({
  component: () => <ComingSoon title="Cash Collections" description="Daily collection routes, payment entry and collector performance." />,
});
