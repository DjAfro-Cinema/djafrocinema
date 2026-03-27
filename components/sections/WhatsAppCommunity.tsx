"use client";

import { useEffect, useRef, useState } from "react";

const WHATSAPP_LINK = "https://wa.me/254700000000"; // Replace with actual WhatsApp group/number

export default function WhatsAppCommunity() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative py-28 bg-[#0a0a0a] overflow-hidden">
      {/* WhatsApp green ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] rounded-full bg-[#25d366] opacity-[0.04] blur-3xl pointer-events-none" />

      {/* Decorative diagonal lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.025]">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute bg-white/50"
            style={{
              width: "1px",
              height: "200%",
              left: `${i * 15}%`,
              top: "-50%",
              transform: "rotate(20deg)",
            }}
          />
        ))}
      </div>

      <div ref={ref} className="max-w-4xl mx-auto px-4 sm:px-8 text-center relative z-10">
        {/* WhatsApp icon */}
        <div
          className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-8 transition-all duration-700"
          style={{
            background: "radial-gradient(circle, #25d36622, #25d36608)",
            border: "1px solid #25d36633",
            opacity: visible ? 1 : 0,
            transform: visible ? "scale(1)" : "scale(0.5)",
            boxShadow: visible ? "0 0 40px #25d36633" : "none",
          }}
        >
          <svg viewBox="0 0 48 48" fill="#25d366" className="w-10 h-10">
            <path d="M24 4C12.95 4 4 12.95 4 24c0 3.6.96 7 2.63 9.94L4 44l10.42-2.7A19.88 19.88 0 0024 44c11.05 0 20-8.95 20-20S35.05 4 24 4zm0 36c-3.1 0-6-.8-8.53-2.2l-.6-.35-6.18 1.6 1.65-6-.38-.63A15.93 15.93 0 018 24c0-8.84 7.16-16 16-16s16 7.16 16 16-7.16 16-16 16zm8.74-11.92c-.48-.24-2.83-1.4-3.27-1.55-.44-.16-.76-.24-1.08.24-.32.48-1.23 1.55-1.51 1.87-.28.32-.56.36-1.04.12a13.1 13.1 0 01-3.87-2.38 14.5 14.5 0 01-2.68-3.33c-.28-.48-.03-.74.21-.98.22-.22.48-.56.72-.84.24-.28.32-.48.48-.8.16-.32.08-.6-.04-.84-.12-.24-1.08-2.6-1.48-3.56-.38-.93-.78-.8-1.07-.82l-.91-.02c-.32 0-.84.12-1.28.6-.44.48-1.67 1.63-1.67 3.98s1.71 4.62 1.95 4.94c.24.32 3.36 5.13 8.14 7.2 1.14.49 2.03.78 2.72.99 1.14.36 2.18.31 3 .19.92-.14 2.83-1.16 3.23-2.28.4-1.12.4-2.08.28-2.28-.12-.2-.44-.32-.92-.56z" />
          </svg>
        </div>

        {/* Tag */}
        <p
          className="text-[#25d366] text-xs uppercase tracking-[0.4em] mb-4 font-semibold transition-all duration-700"
          style={{ opacity: visible ? 1 : 0, transitionDelay: "100ms" }}
        >
          Join the Community
        </p>

        {/* Heading */}
        <h2
          className="text-white leading-tight mb-6 transition-all duration-700"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            letterSpacing: "0.06em",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(24px)",
            transitionDelay: "150ms",
          }}
        >
          10,000+ FANS.<br />
          <span style={{ color: "#25d366" }}>ONE GROUP.</span>
        </h2>

        {/* Description */}
        <p
          className="text-white/45 text-base sm:text-lg leading-relaxed max-w-xl mx-auto mb-12 transition-all duration-700"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(16px)", transitionDelay: "220ms" }}
        >
          Request movies, get notified when new titles drop, and connect with thousands of East Africans who love good cinema. It's free, it's instant, it's on WhatsApp.
        </p>

        {/* CTA */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-700"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(16px)", transitionDelay: "300ms" }}
        >
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative overflow-hidden flex items-center gap-3 bg-[#25d366] hover:bg-[#1fba57] text-white font-bold text-sm uppercase tracking-widest px-10 py-4 rounded transition-all duration-200 hover:shadow-[0_0_30px_#25d36666] active:scale-95"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 flex-shrink-0">
              <path d="M12 2C6.48 2 2 6.48 2 12c0 1.8.48 3.5 1.32 4.97L2 22l5.25-1.37A9.94 9.94 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm4.37 13.96c-.24.12-1.41.7-1.63.78-.22.08-.38.12-.54-.12s-.62-.78-.76-.94c-.14-.16-.28-.18-.52-.06-.24.12-.99.36-1.88-1.17-.14-.24-.01-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.19-.46-.39-.4-.53-.41l-.46-.01c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 1.99s.86 2.31.98 2.47c.12.16 1.68 2.56 4.07 3.6.57.24 1.02.39 1.36.5.57.18 1.09.15 1.5.09.46-.07 1.41-.58 1.61-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28z" />
            </svg>
            Join WhatsApp Group
            {/* Shimmer */}
            <span className="absolute inset-0 -translate-x-full skew-x-[-12deg] bg-white/15 group-hover:translate-x-full transition-transform duration-500" />
          </a>

          <span className="text-white/25 text-sm">or</span>

          <button className="text-white/50 hover:text-white text-sm uppercase tracking-widest font-medium transition-colors duration-200 underline underline-offset-4 decoration-white/20 hover:decoration-white/50">
            Order a Movie
          </button>
        </div>

        {/* Features list */}
        <div
          className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-14 transition-all duration-700"
          style={{ opacity: visible ? 1 : 0, transitionDelay: "400ms" }}
        >
          {[
            "Request any movie",
            "Instant notifications",
            "Free to join",
            "10K+ members",
          ].map((feat) => (
            <span key={feat} className="flex items-center gap-2 text-white/35 text-sm">
              <span className="w-1 h-1 rounded-full bg-[#25d366]" />
              {feat}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}