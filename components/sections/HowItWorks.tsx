"use client";

import { useEffect, useRef, useState } from "react";

const STEPS = [
  {
    num: "01",
    title: "Install the App",
    desc: "Add DjAfro Cinema to your phone, desktop, or smart TV — no app store needed. Works on every device, anywhere in East Africa.",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth="1.5">
        <rect x="8" y="4" width="32" height="40" rx="4" />
        <path d="M18 36h12M24 8v16M17 18l7 7 7-7" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Browse & Discover",
    desc: "Explore hundreds of DJ Afro dubbed movies, Bollywood hits, and East African cinema. Search by genre, year, or mood.",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth="1.5">
        <circle cx="22" cy="22" r="12" />
        <path d="M32 32l8 8" />
        <path d="M18 22h8M22 18v8" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Watch Free or Unlock",
    desc: "Hundreds of movies are completely free. Premium movies unlock instantly for just 10 KSh — pay with M-Pesa, no card needed.",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth="1.5">
        <path d="M16 22V16a8 8 0 1116 0v6" />
        <rect x="10" y="22" width="28" height="20" rx="3" />
        <circle cx="24" cy="32" r="3" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    num: "04",
    title: "Stream on Any Device",
    desc: "Watch on your phone, laptop, or smart TV — even on slow connections. Your movie history syncs across every device.",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth="1.5">
        <rect x="4" y="8" width="32" height="22" rx="2" />
        <path d="M16 30v8M10 38h20M36 24h8M36 20h8M36 28h8" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="how-it-works" className="relative py-28 bg-[#0a0a0a] overflow-hidden">
      {/* Large background text */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none whitespace-nowrap"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(6rem, 20vw, 16rem)",
          color: "white",
          opacity: 0.018,
          letterSpacing: "0.1em",
        }}
      >
        HOW IT WORKS
      </div>

      {/* Red glow top-right */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#e50914] opacity-[0.04] blur-3xl pointer-events-none" />

      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <p className="text-[#e50914] text-xs uppercase tracking-[0.4em] mb-3 font-semibold">Simple & Fast</p>
          <h2
            className="text-white leading-none"
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.5rem, 6vw, 4rem)", letterSpacing: "0.06em" }}
          >
            START WATCHING IN MINUTES
          </h2>
          <p className="text-white/40 mt-4 max-w-xl mx-auto text-base leading-relaxed">
            No credit card. No App Store. No nonsense. DjAfro Cinema is built for how Kenyans actually watch movies.
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 rounded overflow-hidden">
          {STEPS.map((step, i) => (
            <div
              key={step.num}
              className="relative bg-[#0a0a0a] p-8 group transition-all duration-300 hover:bg-[#111]"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(32px)",
                transition: `opacity 0.6s ease ${i * 120}ms, transform 0.6s cubic-bezier(0.22,1,0.36,1) ${i * 120}ms, background 0.2s`,
              }}
            >
              {/* Step number — large ghost */}
              <div
                className="absolute top-4 right-4 leading-none select-none"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "4rem",
                  color: "#e50914",
                  opacity: 0.07,
                  letterSpacing: "-0.04em",
                }}
              >
                {step.num}
              </div>

              {/* Icon */}
              <div className="text-[#e50914] mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:translate-y-[-2px]">
                {step.icon}
              </div>

              {/* Small num visible */}
              <div className="text-[#e50914] text-xs font-bold uppercase tracking-[0.3em] mb-3">{step.num}</div>

              {/* Title */}
              <h3
                className="text-white text-xl mb-4 leading-tight"
                style={{ fontFamily: "var(--font-display)", letterSpacing: "0.04em" }}
              >
                {step.title}
              </h3>

              {/* Desc */}
              <p className="text-white/45 text-sm leading-relaxed">{step.desc}</p>

              {/* Bottom accent line on hover */}
              <div
                className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-[#e50914] to-transparent transition-all duration-400"
                style={{ width: "0%", }}
              />
              <div className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-[#e50914] to-transparent group-hover:w-full transition-all duration-500 w-0" />
            </div>
          ))}
        </div>

        {/* Connecting line between steps — desktop only */}
        <div className="hidden lg:block absolute top-[calc(50%+2rem)] left-1/2 -translate-x-1/2 w-[calc(100%-8rem)] pointer-events-none" />
      </div>
    </section>
  );
}