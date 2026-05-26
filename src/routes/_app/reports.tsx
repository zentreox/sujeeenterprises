import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";
export const Route = createFileRoute("/_app/reports")({
  component: () => <ComingSoon title="Reports & Analytics" description="Sales, inventory, lorry, staff and profit reports with PDF / Excel export." />,
});
