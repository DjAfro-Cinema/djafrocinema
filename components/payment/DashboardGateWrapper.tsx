"use client";

// components/payment/DashboardGateWrapper.tsx
// Client-side wrapper: provides PremiumGateContext + mounts PaymentModal ONCE.
// All movie cards just call usePremiumGate().requestPlay — zero modal logic inside cards.

import { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { PremiumGateProvider } from "@/context/PremiumGateContext";
import PaymentModal from "./PaymentModal";

export default function DashboardGateWrapper({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  return (
    <PremiumGateProvider userId={user?.$id}>
      {children}
      {/* Single modal instance — reads from context, portal to document.body */}
      <PaymentModal />
    </PremiumGateProvider>
  );
}