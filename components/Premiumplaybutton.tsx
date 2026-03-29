"use client";

// components/payment/PremiumPlayButton.tsx
/**
 * Drop-in play button — enforces payment guard.
 *
 * isPaid=true  → fires onPlay immediately (no modal, no Appwrite check)
 * isPaid=false + isPremium=true → guard runs, modal appears
 * isPremium=false → fires onPlay immediately
 */

import { usePaymentGuard } from "@/hooks/Usepaymentguard";
import PaymentModal from "@/components/Premiumplaybutton";

interface PremiumPlayButtonProps {
  movieId: string;
  movieTitle: string;
  posterUrl?: string;
  isPremium: boolean;
  isPaid?: boolean;     // pre-resolved from paidMovieIds.includes(id)
  userId: string;
  onPlay: (movieId: string) => void;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  "aria-label"?: string;
}

export default function PremiumPlayButton({
  movieId,
  movieTitle,
  posterUrl,
  isPremium,
  isPaid = false,
  userId,
  onPlay,
  children,
  className,
  style,
  "aria-label": ariaLabel,
}: PremiumPlayButtonProps) {
  const { guardState, requestPlay, submitPayment, dismissModal, proceedToPlay } =
    usePaymentGuard(onPlay);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Fast path — already paid or free movie
    if (!isPremium || isPaid) {
      onPlay(movieId);
      return;
    }
    // Needs guard: check Appwrite then show modal if unpaid
    requestPlay({ movieId, movieTitle, posterUrl, isPremium, userId });
  };

  return (
    <>
      <button
        className={className}
        style={style}
        aria-label={ariaLabel ?? `Play ${movieTitle}`}
        onClick={handleClick}
        disabled={guardState.state === "checking"}
      >
        {children}
      </button>

      <PaymentModal
        guardState={guardState}
        userId={userId}
        onSubmitPayment={submitPayment}
        onDismiss={dismissModal}
        onProceedToPlay={proceedToPlay}
      />
    </>
  );
}