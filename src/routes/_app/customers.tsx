import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";
export const Route = createFileRoute("/_app/customers")({
  component: () => <ComingSoon title="Customers" description="Customer profiles, NIC & guarantor details, installment history and balances." />,
});
