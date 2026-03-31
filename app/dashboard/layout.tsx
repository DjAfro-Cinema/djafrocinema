// app/dashboard/layout.tsx
// Wraps all dashboard pages.
// AuthGuard → PremiumGateProvider → PaymentModal (one instance, portal)

import { ReactNode } from "react";
import AuthGuard from "@/components/AuthGuard";
import DashboardGateWrapper from "@/components/payment/DashboardGateWrapper";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { ThemeProvider } from "@/context/ThemeContext";


export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <ThemeProvider>
      <DashboardGateWrapper>
        {children}
        <ThemeToggle/>
      </DashboardGateWrapper>
      </ThemeProvider>
    </AuthGuard>
  );
}