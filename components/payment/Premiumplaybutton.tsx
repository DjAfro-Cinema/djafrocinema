"use client";

// components/payment/PremiumPlayButton.tsx
//
// Thin guard button — delegates ALL modal/payment logic to PremiumGateContext.
// PaymentModal.tsx (already mounted in your layout via DashboardGateWrapper)
// handles the actual UI. This button just calls requestPlay().
//
// Usage (already correct in MovieBanner + MovieCard):
//
//   <PremiumPlayButton
//     movieId={movie.id}
//     movieTitle={movie.title}
//     posterUrl={movie.img}
//     isPremium={movie.premium ?? false}
//     isPaid={isPaid}
//     userId={userId}
//     onPlay={handlePlay}
//     style={{ ... }}
//   >
//     <Play size={13} fill="#fff" /> Watch Now
//   </PremiumPlayButton>

import { CSSProperties, ReactNode } from "react";
import { usePremiumGate } from "@/context/PremiumGateContext";

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface PremiumPlayButtonProps {
  movieId: string;
  movieTitle: string;
  posterUrl?: string;
  isPremium: boolean;
  isPaid: boolean;
  userId: string;         // kept for API compat with MovieBanner/MovieCard — context owns its own userId
  onPlay: (movieId: string) => void;
  style?: CSSProperties;
  className?: string;
  children?: ReactNode;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function PremiumPlayButton({
  movieId,
  movieTitle,
  posterUrl,
  isPremium,
  onPlay,
  style,
  className,
  children,
}: PremiumPlayButtonProps) {
  const { requestPlay } = usePremiumGate();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    requestPlay({
      movieId,
      movieTitle,
      posterUrl,
      isPremium,
      // onUnlocked is called by PremiumGateContext ONLY after:
      //   - free movie (immediate)
      //   - already paid (immediate, skips modal)
      //   - payment confirmed (after M-Pesa polling succeeds)
      onUnlocked: onPlay,
    });
  };

  return (
    <button onClick={handleClick} style={style} className={className}>
      {children}
    </button>
  );
}