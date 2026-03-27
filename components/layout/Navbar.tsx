"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const NAV_LINKS = [
  { label: "Movies", id: "featured" },
  { label: "Trending", id: "trending" },
  { label: "How It Works", id: "how-it-works" },
  { label: "Install", id: "install" },
];

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const offset = 72;
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: "smooth" });
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeSection, setActiveSection] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Scroll progress + glass activation
  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(scrollY > 60);
      setProgress(docH > 0 ? (scrollY / docH) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Active section observer
  useEffect(() => {
    const sections = NAV_LINKS.map((l) => document.getElementById(l.id)).filter(Boolean) as HTMLElement[];
    if (!sections.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveSection(e.target.id);
        });
      },
      { threshold: 0.35 }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // Close drawer on outside click
  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [mobileOpen]);

  return (
    <>
      {/* Scroll progress bar */}
      <div
        className="fixed top-0 left-0 z-[9999] h-[3px] bg-gradient-to-r from-[#e50914] via-[#ff4d4d] to-[#e50914] transition-all duration-100"
        style={{
          width: `${progress}%`,
          boxShadow: progress > 0 ? "0 0 12px 2px #e50914aa" : "none",
        }}
      />

      <header
        className={`fixed top-0 left-0 right-0 z-[9000] transition-all duration-500 ${
          scrolled
            ? "bg-[#0a0a0aee] backdrop-blur-xl border-b border-[#e50914]/20 shadow-[0_4px_32px_#00000088]"
            : "bg-transparent"
        }`}
        style={{ height: 72 }}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-6">

          {/* ── LOGO ── */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-3 group flex-shrink-0 focus:outline-none"
            aria-label="DjAfro Cinema — scroll to top"
          >
            <div className="relative w-10 h-10 transition-transform duration-300 group-hover:scale-110">
              <Image
                src="/logo.png"
                alt="DjAfro Cinema"
                fill
                className="object-contain"
                style={{ filter: "drop-shadow(0 0 8px #e50914aa)" }}
              />
            </div>
            <div className="flex flex-col leading-none">
              <span
                className="text-white text-2xl tracking-wider"
                style={{ fontFamily: "var(--font-display)", letterSpacing: "0.12em" }}
              >
                DJAFRO
              </span>
              <span className="text-[#e50914] text-[10px] tracking-[0.4em] uppercase font-semibold -mt-1">
                CINEMA
              </span>
            </div>
            {/* Vertical divider + tag */}
            <div className="hidden sm:flex flex-col items-center ml-1 pl-3 border-l border-white/10 leading-none">
              <span className="text-white/25 text-[9px] tracking-widest uppercase">est.</span>
              <span className="text-[#e50914]/60 text-[9px] tracking-widest uppercase">kenya</span>
            </div>
          </button>

          {/* ── DESKTOP NAV LINKS ── */}
          <ul className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <li key={link.id}>
                  <button
                    onClick={() => scrollToSection(link.id)}
                    className={`relative px-4 py-2 text-sm uppercase tracking-widest font-medium transition-colors duration-200 focus:outline-none group ${
                      isActive ? "text-white" : "text-white/50 hover:text-white"
                    }`}
                  >
                    {link.label}
                    {/* Animated underline */}
                    <span
                      className={`absolute bottom-0 left-0 h-[2px] bg-[#e50914] rounded-full transition-all duration-300`}
                      style={{
                        width: isActive ? "100%" : "0%",
                        boxShadow: isActive ? "0 0 8px #e50914" : "none",
                      }}
                    />
                    <span className="absolute bottom-0 left-0 h-[2px] bg-white/20 rounded-full w-0 group-hover:w-full transition-all duration-200" />
                  </button>
                </li>
              );
            })}
          </ul>

          {/* ── RIGHT: CTA + HAMBURGER ── */}
          <div className="flex items-center gap-3">
            {/* Login — desktop only */}
            <button className="hidden md:block text-white/60 hover:text-white text-sm uppercase tracking-widest font-medium transition-colors duration-200 focus:outline-none">
              Sign In
            </button>

            {/* Install App button */}
            <button
              onClick={() => scrollToSection("install")}
              className="relative overflow-hidden hidden md:flex items-center gap-2 bg-[#e50914] hover:bg-[#ff1a26] text-white text-sm font-bold uppercase tracking-widest px-5 py-2 rounded focus:outline-none transition-all duration-200 hover:shadow-[0_0_24px_#e50914aa] active:scale-95"
            >
              <span className="relative z-10">Install App</span>
              {/* Shimmer */}
              <span className="absolute inset-0 -translate-x-full skew-x-12 bg-white/20 hover:translate-x-full transition-transform duration-700 group-hover:translate-x-full" />
            </button>

            {/* Hamburger — mobile */}
            <button
              className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-[5px] focus:outline-none"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              <span
                className={`block h-[2px] bg-white rounded-full transition-all duration-300 ${mobileOpen ? "w-5 translate-y-[7px] rotate-45" : "w-6"}`}
              />
              <span
                className={`block h-[2px] bg-white rounded-full transition-all duration-300 ${mobileOpen ? "opacity-0 w-0" : "w-5"}`}
              />
              <span
                className={`block h-[2px] bg-white rounded-full transition-all duration-300 ${mobileOpen ? "w-5 -translate-y-[7px] -rotate-45" : "w-6"}`}
              />
            </button>
          </div>
        </nav>
      </header>

      {/* ── MOBILE DRAWER ── */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[8900] bg-black/70 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 bottom-0 z-[9000] w-72 bg-[#0d0d0d] border-l border-white/10 flex flex-col transition-transform duration-400 md:hidden ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ transitionTimingFunction: "cubic-bezier(0.32,0.72,0,1)" }}
      >
        {/* Film strip left edge */}
        <div className="absolute left-0 top-0 bottom-0 w-4 flex flex-col justify-evenly items-center pointer-events-none">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="w-2 h-3 rounded-sm bg-[#e50914]/15 border border-[#e50914]/10" />
          ))}
        </div>

        {/* Drawer header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-white/10 ml-4">
          <div className="flex flex-col leading-none">
            <span className="text-white text-2xl tracking-wider" style={{ fontFamily: "var(--font-display)" }}>DJAFRO</span>
            <span className="text-[#e50914] text-[10px] tracking-[0.4em] uppercase font-semibold">CINEMA</span>
          </div>
          <button onClick={() => setMobileOpen(false)} className="text-white/40 hover:text-white focus:outline-none text-2xl leading-none">✕</button>
        </div>

        {/* Drawer nav links */}
        <nav className="flex-1 px-8 pt-6 ml-4 space-y-1">
          {NAV_LINKS.map((link, i) => {
            const isActive = activeSection === link.id;
            return (
              <button
                key={link.id}
                onClick={() => { scrollToSection(link.id); setMobileOpen(false); }}
                className={`w-full text-left flex items-center gap-3 px-4 py-4 rounded text-base uppercase tracking-widest font-medium transition-all duration-200 focus:outline-none ${
                  isActive ? "text-white bg-[#e50914]/10 border-l-2 border-[#e50914]" : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
                style={{ transitionDelay: `${i * 40}ms` }}
              >
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#e50914] shadow-[0_0_6px_#e50914]" />}
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Drawer footer CTAs */}
        <div className="px-8 pb-10 ml-4 space-y-3 border-t border-white/10 pt-6">
          <button className="w-full py-3 text-sm text-white/60 hover:text-white uppercase tracking-widest font-medium transition-colors focus:outline-none border border-white/10 hover:border-white/30 rounded">
            Sign In
          </button>
          <button
            onClick={() => { scrollToSection("install"); setMobileOpen(false); }}
            className="w-full py-3 bg-[#e50914] hover:bg-[#ff1a26] text-white text-sm font-bold uppercase tracking-widest rounded transition-all duration-200 hover:shadow-[0_0_20px_#e50914aa] active:scale-95 focus:outline-none"
          >
            Install App
          </button>
        </div>
      </div>
    </>
  );
}