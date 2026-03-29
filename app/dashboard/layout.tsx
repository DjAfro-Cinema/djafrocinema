// app/dashboard/layout.tsx
// Wraps all dashboard pages.
// AuthGuard → PremiumGateProvider → PaymentModal (one instance, portal)

import { ReactNode } from "react";
import AuthGuard from "@/components/AuthGuard";
import DashboardGateWrapper from "@/components/payment/DashboardGateWrapper";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <DashboardGateWrapper>
        {children}
      </DashboardGateWrapper>
    </AuthGuard>
  );
}