"use client";

import { useEffect, useRef, useState } from "react";

const PLATFORMS = [
  {
    name: "Android",
    desc: "Add to Home Screen from Chrome or any Android browser.",
    steps: ["Open in Chrome", "Tap menu (⋮)", "\"Add to Home Screen\""],
    icon: (
      <svg viewBox="0 0 48 48" fill="currentColor" className="w-8 h-8">
        <path d="M7 36c0 1.1.9 2 2 2h2v7a3 3 0 006 0v-7h6v7a3 3 0 006 0v-7h2a2 2 0 002-2V17H7v19zm30-27.3l2.6-4.5a.5.5 0 00-.9-.5l-2.7 4.6A17 17 0 0024 7c-4.5 0-8.6 1.7-11.7 4.4l-2.6-4.6a.5.5 0 10-.9.5L11.4 11A16.9 16.9 0 007 22h34c0-5.1-2.2-9.7-4-13.3zM18 19a2 2 0 110-4 2 2 0 010 4zm12 0a2 2 0 110-4 2 2 0 010 4z" />
      </svg>
    ),
    accent: "#3ddc84",
    available: true,
  },
  {
    name: "iPhone",
    desc: "Install via Safari on any iPhone or iPad — no App Store.",
    steps: ["Open in Safari", "Tap Share (⬆)", "\"Add to Home Screen\""],
    icon: (
      <svg viewBox="0 0 48 48" fill="currentColor" className="w-8 h-8">
        <path d="M35.5 25.2c0-5.1 4.2-7.5 4.3-7.6-2.4-3.5-6-4-7.3-4-3.1-.3-6.1 1.8-7.7 1.8-1.6 0-4-1.8-6.6-1.7-3.4 0-6.5 2-8.2 5C7 23.5 8.3 33 12 38c1.8 2.6 4 5.5 6.8 5.4 2.7-.1 3.8-1.8 7-1.8 3.3 0 4.2 1.8 7 1.7 3-.1 4.9-2.7 6.7-5.3 2.1-3 3-5.9 3-6.1-.1 0-5-2-5-6.7zm-4.6-13.1c1.5-1.8 2.5-4.3 2.2-6.8-2.1.1-4.7 1.4-6.2 3.2-1.4 1.6-2.6 4.2-2.3 6.6 2.4.2 4.8-1.2 6.3-3z" />
      </svg>
    ),
    accent: "#aaaaaa",
    available: true,
  },
  {
    name: "Desktop",
    desc: "Install on Windows, Mac, or Linux from Chrome or Edge.",
    steps: ["Open in Chrome/Edge", "Click install icon (⊕)", "Click \"Install\""],
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth="1.8">
        <rect x="4" y="6" width="40" height="28" rx="2" />
        <path d="M16 34v6M10 40h28" />
        <circle cx="24" cy="20" r="6" />
        <path d="M24 14v3M24 23v3M18 20h3M27 20h3" />
      </svg>
    ),
    accent: "#4285f4",
    available: true,
  },
  {
    name: "Smart TV",
    desc: "Open djafrocinema.com in your Smart TV browser and install.",
    steps: ["Open TV browser", "Go to djafrocinema.com", "Add to apps"],
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth="1.8">
        <rect x="2" y="6" width="44" height="28" rx="2" />
        <path d="M16 34v6M10 40h28M20 20l8-4v8l-8-4z" />
      </svg>
    ),
    accent: "#e50914",
    available: true,
  },
];

export default function InstallCTA() {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="install" className="relative py-28 bg-[#0d0d0d] overflow-hidden">
      {/* Big BG text */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none whitespace-nowrap"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(5rem, 18vw, 14rem)",
          color: "white",
          opacity: 0.015,
          letterSpacing: "0.08em",
        }}
      >
        INSTALL
      </div>

      {/* Glow orb */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-48 rounded-full bg-[#e50914] opacity-[0.05] blur-3xl pointer-events-none" />

      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <p className="text-[#e50914] text-xs uppercase tracking-[0.4em] mb-3 font-semibold">Free Install · Any Device</p>
          <h2
            className="text-white leading-none mb-4"
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.5rem, 6vw, 4rem)", letterSpacing: "0.06em" }}
          >
            INSTALL DJAFRO CINEMA
          </h2>
          <p className="text-white/40 max-w-lg mx-auto text-base leading-relaxed">
            No App Store fees. No Google Play cut. Install directly to any device and get the full cinema experience — for free.
          </p>
        </div>

        {/* Social proof */}
        <div className="flex items-center justify-center gap-8 mb-16">
          {[
            { num: "1,200+", label: "Downloads" },
            { num: "4.9★", label: "Rating" },
            { num: "0 KSh", label: "Install Cost" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center">
              <span
                className="text-white text-2xl font-black leading-none"
                style={{ fontFamily: "var(--font-display)", letterSpacing: "0.05em" }}
              >
                {s.num}
              </span>
              <span className="text-white/30 text-xs uppercase tracking-widest mt-1">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Platform cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLATFORMS.map((p, i) => (
            <div
              key={p.name}
              className="relative rounded overflow-hidden border border-white/5 cursor-pointer transition-all duration-300"
              style={{
                background: hovered === i ? "#131313" : "#0e0e0e",
                borderColor: hovered === i ? `${p.accent}44` : "rgba(255,255,255,0.05)",
                boxShadow: hovered === i ? `0 12px 40px #00000066, 0 0 0 1px ${p.accent}22` : "none",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(32px)",
                transition: `opacity 0.6s ease ${i * 100}ms, transform 0.6s cubic-bezier(0.22,1,0.36,1) ${i * 100}ms, background 0.2s, border-color 0.2s, box-shadow 0.2s`,
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Top accent bar */}
              <div
                className="h-[3px] transition-all duration-300"
                style={{ background: `linear-gradient(90deg, ${p.accent}, transparent)`, opacity: hovered === i ? 1 : 0.3 }}
              />

              <div className="p-7">
                {/* Icon */}
                <div className="mb-5 transition-transform duration-300" style={{ color: p.accent, transform: hovered === i ? "scale(1.1)" : "none" }}>
                  {p.icon}
                </div>

                {/* Platform name */}
                <h3
                  className="text-white text-xl mb-2 leading-tight"
                  style={{ fontFamily: "var(--font-display)", letterSpacing: "0.04em" }}
                >
                  {p.name}
                </h3>

                {/* Desc */}
                <p className="text-white/40 text-sm leading-relaxed mb-6">{p.desc}</p>

                {/* Steps */}
                <ol className="space-y-2 mb-7">
                  {p.steps.map((step, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm text-white/50">
                      <span
                        className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5"
                        style={{ background: `${p.accent}22`, color: p.accent }}
                      >
                        {j + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>

                {/* CTA */}
                <button
                  className="w-full py-3 rounded text-sm font-bold uppercase tracking-widest transition-all duration-200 active:scale-95"
                  style={{
                    background: hovered === i ? p.accent : "transparent",
                    color: hovered === i ? "#fff" : p.accent,
                    border: `1px solid ${p.accent}44`,
                    boxShadow: hovered === i ? `0 0 20px ${p.accent}44` : "none",
                  }}
                >
                  Install on {p.name}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}