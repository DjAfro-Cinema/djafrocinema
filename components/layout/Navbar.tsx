"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Film,
  TrendingUp,
  Info,
  Smartphone,
  Search,
  X,
  Menu,
  LogIn,
} from "lucide-react";
import { usePWAInstall } from "@/hooks/Usepwainstall";

const NAV_LINKS = [
  { label: "Movies",       id: "featured",     icon: <Film       size={14} /> },
  { label: "Trending",     id: "trending",     icon: <TrendingUp size={14} /> },
  { label: "How It Works", id: "how-it-works", icon: <Info       size={14} /> },
  { label: "Install",      id: "install",      icon: <Smartphone size={14} /> },
];

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const offset = 80;
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: "smooth" });
}

// ── tiny toast ──────────────────────────────────────────────────────────────
function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setVis(true), 30);
    const t2 = setTimeout(() => { setVis(false); setTimeout(onDone, 400); }, 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);
  return (
    <div
      style={{
        position: "fixed", bottom: 28, left: "50%", transform: `translateX(-50%) translateY(${vis ? 0 : 16}px)`,
        opacity: vis ? 1 : 0, transition: "all .38s cubic-bezier(.22,1,.36,1)",
        background: "#0d0d0d", border: "1px solid rgba(255,255,255,.1)",
        boxShadow: "0 8px 32px rgba(0,0,0,.7), 0 0 0 1px rgba(229,9,20,.12)",
        color: "#fff", padding: "11px 22px", borderRadius: 4,
        fontSize: 12, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase",
        zIndex: 99999, whiteSpace: "nowrap",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <span style={{ color: "#e50914", marginRight: 8 }}>✓</span>{msg}
    </div>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled]         = useState(false);
  const [progress, setProgress]         = useState(0);
  const [activeSection, setActiveSection] = useState("");
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [searchOpen, setSearchOpen]     = useState(false);
  const [searchValue, setSearchValue]   = useState("");
  const [hoveredLink, setHoveredLink]   = useState<string | null>(null);
  const [toast, setToast]               = useState<string | null>(null);
  const [btnBusy, setBtnBusy]           = useState(false);
  const drawerRef       = useRef<HTMLDivElement>(null);
  const searchInputRef  = useRef<HTMLInputElement>(null);
  const desktopSearchRef = useRef<HTMLInputElement>(null);

  const { isInstalled, deferredPrompt, triggerInstall } = usePWAInstall();

  // ── scroll + progress ────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(scrollY > 40);
      setProgress(docH > 0 ? (scrollY / docH) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── active section ───────────────────────────────────────────────────────
  useEffect(() => {
    const sections = NAV_LINKS.map((l) => document.getElementById(l.id)).filter(Boolean) as HTMLElement[];
    if (!sections.length) return;
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach((e) => { if (e.isIntersecting) setActiveSection(e.target.id); }); },
      { threshold: 0.3, rootMargin: "-80px 0px 0px 0px" }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  // ── body scroll lock ─────────────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // ── outside click closes drawer ──────────────────────────────────────────
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

  // ── keyboard search ──────────────────────────────────────────────────────
  const openSearch = useCallback(() => {
    setSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 50);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.key === "/" || (e.ctrlKey && e.key === "k")) && !searchOpen) {
        e.preventDefault(); openSearch();
      }
      if (e.key === "Escape" && searchOpen) { setSearchOpen(false); setSearchValue(""); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [searchOpen, openSearch]);

  // ── install handler ──────────────────────────────────────────────────────
  const handleInstallClick = useCallback(async () => {
    if (isInstalled) {
      setToast("Already installed on your device");
      return;
    }
    if (!deferredPrompt) {
      // No native prompt (iOS or already showing) — scroll to install section
      scrollToSection("install");
      return;
    }
    setBtnBusy(true);
    const outcome = await triggerInstall();
    setBtnBusy(false);
    if (outcome === "accepted") {
      setToast("App installed successfully!");
    }
  }, [isInstalled, deferredPrompt, triggerInstall]);

  // ── shimmer: show on Install App button when PWA is installable ──────────
  const showShimmer = !isInstalled && !!deferredPrompt;

  return (
    <>
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}

      {/* ── SCROLL PROGRESS ── */}
      <div
        aria-hidden
        className="fixed top-0 left-0 z-[9999] h-[2px] transition-all duration-75"
        style={{
          width: `${progress}%`,
          background: "linear-gradient(90deg, #e50914 0%, #ff6b6b 50%, #e50914 100%)",
          boxShadow: progress > 0 ? "0 0 16px 2px #e5091488" : "none",
        }}
      />

      {/* ── MAIN HEADER ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-[9000] transition-all duration-500 ease-out ${
          scrolled ? "border-b border-white/[0.06]" : ""
        }`}
        style={{
          height: 72,
          background: scrolled
            ? "linear-gradient(180deg, rgba(6,6,6,0.97) 0%, rgba(6,6,6,0.92) 100%)"
            : "linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 100%)",
          backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
        }}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-4">

          {/* ── LOGO ── */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="relative flex items-center flex-shrink-0 focus:outline-none group"
            aria-label="DjAfro Cinema — scroll to top"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <div
              className="relative transition-all duration-500 group-hover:scale-105"
              style={{ height: 48, width: "auto", minWidth: 120, maxWidth: 200 }}
            >
              <Image
                src="/logo.png"
                alt="DjAfro Cinema"
                fill
                className="object-contain object-left"
                priority
                style={{
                  filter: "drop-shadow(0 0 12px rgba(229,9,20,0.6)) drop-shadow(0 0 24px rgba(229,9,20,0.3))",
                  transition: "filter 0.4s ease",
                }}
              />
            </div>
            <span
              aria-hidden
              className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(229,9,20,0.15) 0%, transparent 70%)" }}
            />
          </button>

          {/* ── DESKTOP NAV ── */}
          <ul className="hidden lg:flex items-center gap-0 ml-2">
            {NAV_LINKS.map((link) => {
              const isActive  = activeSection === link.id;
              const isHovered = hoveredLink === link.id;
              return (
                <li key={link.id}>
                  <button
                    onClick={() => scrollToSection(link.id)}
                    onMouseEnter={() => setHoveredLink(link.id)}
                    onMouseLeave={() => setHoveredLink(null)}
                    className="relative px-5 py-2.5 text-[11px] uppercase tracking-[0.2em] font-semibold focus:outline-none transition-colors duration-300 flex items-center gap-2"
                    style={{
                      color: isActive ? "#fff" : isHovered ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.42)",
                    }}
                  >
                    <span className="transition-colors duration-300" style={{ color: isActive ? "#e50914" : "inherit" }}>
                      {link.icon}
                    </span>
                    <span className="relative z-10">{link.label}</span>
                    <span
                      className="absolute left-2 right-2 bottom-1 rounded-full transition-all duration-300 ease-out"
                      style={{
                        height: 2,
                        background: isActive ? "linear-gradient(90deg, transparent, #e50914, transparent)" : "transparent",
                        transform: isActive ? "scaleX(1)" : "scaleX(0)",
                        opacity: isActive ? 1 : 0,
                        boxShadow: isActive ? "0 0 8px #e50914" : "none",
                      }}
                    />
                    <span
                      className="absolute inset-0 rounded transition-all duration-200"
                      style={{
                        background: isHovered && !isActive ? "rgba(255,255,255,0.05)" : isActive ? "rgba(229,9,20,0.06)" : "transparent",
                      }}
                    />
                    {isActive && (
                      <span
                        className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#e50914]"
                        style={{ boxShadow: "0 0 6px #e50914" }}
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          {/* ── RIGHT SIDE ── */}
          <div className="flex items-center gap-2 ml-auto lg:ml-0">

            {/* Desktop Search Bar */}
            <div className="hidden md:flex items-center">
              {searchOpen ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 bg-white/[0.06] backdrop-blur-md transition-all duration-300">
                  <Search size={14} color="rgba(255,255,255,0.5)" />
                  <input
                    ref={desktopSearchRef}
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Search movies, genres…"
                    className="bg-transparent text-white text-sm placeholder-white/30 focus:outline-none w-48 transition-all duration-300"
                    onBlur={() => { if (!searchValue) setSearchOpen(false); }}
                    autoFocus
                  />
                  {searchValue && (
                    <button onClick={() => { setSearchValue(""); setSearchOpen(false); }} className="text-white/30 hover:text-white/70 transition-colors">
                      <X size={12} />
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => { setSearchOpen(true); setTimeout(() => desktopSearchRef.current?.focus(), 50); }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 hover:border-white/25 bg-white/[0.03] hover:bg-white/[0.07] transition-all duration-200 group focus:outline-none"
                >
                  <Search size={13} className="text-white/40 group-hover:text-white/70 transition-colors" />
                  <span className="text-white/30 text-[11px] tracking-wider group-hover:text-white/50 transition-colors">Search</span>
                  <kbd className="hidden xl:inline-flex items-center text-[9px] text-white/20 border border-white/10 px-1.5 py-0.5 rounded font-mono">/</kbd>
                </button>
              )}
            </div>

            {/* Sign In */}
            <Link
              href="/auth"
              className="hidden lg:flex items-center gap-1.5 text-white/40 hover:text-white text-[11px] uppercase tracking-[0.15em] font-semibold transition-colors duration-200 px-3 py-2 focus:outline-none hover:bg-white/5 rounded"
            >
              <LogIn size={13} />
              Sign In
            </Link>

            {/* ── Install App CTA (desktop) ── */}
            <button
              onClick={handleInstallClick}
              disabled={btnBusy}
              className="hidden md:flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] px-5 py-2.5 rounded focus:outline-none transition-all duration-200 active:scale-95 group overflow-hidden relative"
              style={{
                background: isInstalled
                  ? "linear-gradient(135deg, #15803d 0%, #166534 100%)"
                  : "linear-gradient(135deg, #e50914 0%, #c20710 100%)",
                boxShadow: "0 0 0 0 rgba(229,9,20,0)",
                opacity: btnBusy ? 0.75 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isInstalled)
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px 4px rgba(229,9,20,0.4)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 0 rgba(229,9,20,0)";
              }}
            >
              <Smartphone size={13} className="relative z-10 text-white" />
              <span className="relative z-10 text-white">
                {btnBusy ? "Installing…" : isInstalled ? "App Installed ✓" : "Install App"}
              </span>
              {/* shimmer ribbon — only when installable */}
              {showShimmer && (
                <span
                  aria-hidden
                  className="absolute inset-0 -translate-x-full skew-x-[-20deg] bg-white/20 group-hover:translate-x-[200%] transition-transform duration-700"
                />
              )}
            </button>

            {/* Search icon — mobile */}
            <button
              onClick={openSearch}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-full border border-white/10 hover:border-white/25 transition-colors focus:outline-none"
              aria-label="Search"
            >
              <Search size={16} className="text-white/60" />
            </button>

            {/* Hamburger */}
            <button
              className="lg:hidden w-10 h-10 flex flex-col justify-center items-center gap-[5px] focus:outline-none"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              <span className={`block h-[1.5px] bg-white rounded-full transition-all duration-300 origin-center ${mobileOpen ? "w-5 translate-y-[6.5px] rotate-45" : "w-6"}`} />
              <span className={`block h-[1.5px] bg-white rounded-full transition-all duration-200 ${mobileOpen ? "opacity-0 w-0" : "w-5"}`} />
              <span className={`block h-[1.5px] bg-white rounded-full transition-all duration-300 origin-center ${mobileOpen ? "w-5 -translate-y-[6.5px] -rotate-45" : "w-6"}`} />
            </button>
          </div>
        </nav>
      </header>

      {/* ── MOBILE SEARCH OVERLAY ── */}
      <div
        className={`fixed inset-0 z-[9800] flex flex-col transition-all duration-300 md:hidden ${
          searchOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(20px)" }}
      >
        <div className="flex items-center gap-3 px-4 pt-6 pb-4 border-b border-white/10">
          <Search size={18} className="text-white/50 flex-shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search movies, genres, actors…"
            className="flex-1 bg-transparent text-white text-base placeholder-white/25 focus:outline-none"
          />
          <button
            onClick={() => { setSearchOpen(false); setSearchValue(""); }}
            className="text-white/40 hover:text-white text-sm px-2 transition-colors focus:outline-none"
          >
            Cancel
          </button>
        </div>
        {!searchValue && (
          <div className="px-6 pt-8">
            <p className="text-white/20 text-xs uppercase tracking-widest mb-4">Popular Searches</p>
            <div className="flex flex-wrap gap-2">
              {["Action", "Drama", "Nollywood", "Comedy", "Thriller", "Romance"].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchValue(tag)}
                  className="px-4 py-2 rounded-full border border-white/10 text-white/50 text-sm hover:border-[#e50914]/50 hover:text-white transition-all duration-200"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── MOBILE DRAWER BACKDROP ── */}
      <div
        aria-hidden
        className={`fixed inset-0 z-[8800] transition-opacity duration-400 lg:hidden ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
      />

      {/* ── MOBILE DRAWER ── */}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 bottom-0 z-[9100] w-[88vw] max-w-[340px] flex flex-col lg:hidden transition-transform duration-500 ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
          background: "#080808",
        }}
      >
        {/* Drawer cinematic bg */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: "url('/drawer-bg.jpg')" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, rgba(229,9,20,0.10) 0%, transparent 50%, rgba(0,0,0,0.95) 100%)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(8,8,8,0.7) 0%, rgba(8,8,8,0.3) 40%, rgba(8,8,8,0.85) 100%)" }} />
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <filter id="grain">
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
              <feColorMatrix type="saturate" values="0"/>
            </filter>
            <rect width="100%" height="100%" filter="url(#grain)" />
          </svg>
        </div>

        {/* Film sprocket holes */}
        <div className="absolute left-0 top-0 bottom-0 w-5 flex flex-col justify-evenly items-center pointer-events-none z-10">
          {Array.from({ length: 22 }).map((_, i) => (
            <div
              key={i}
              className="w-2.5 h-4 rounded-sm"
              style={{
                background: "rgba(229,9,20,0.12)",
                border: "1px solid rgba(229,9,20,0.08)",
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.03)",
              }}
            />
          ))}
        </div>

        {/* Drawer content */}
        <div className="relative z-10 flex flex-col h-full pl-7">

          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-7 pb-6 border-b border-white/[0.08]">
            <div className="relative" style={{ height: 40, width: "auto", minWidth: 100, maxWidth: 160 }}>
              <Image
                src="/logo.png"
                alt="DjAfro Cinema"
                fill
                className="object-contain object-left"
                style={{ filter: "drop-shadow(0 0 10px rgba(229,9,20,0.5))" }}
              />
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-white/10 text-white/35 hover:text-white hover:border-white/25 transition-all focus:outline-none"
              aria-label="Close menu"
            >
              <X size={12} />
            </button>
          </div>

          {/* Drawer Search */}
          <div className="px-5 py-4">
            <div
              className="flex items-center gap-3 px-4 py-2.5 rounded-full border border-white/10 focus-within:border-[#e50914]/40 transition-colors"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <Search size={13} className="text-white/30 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search movies…"
                className="flex-1 bg-transparent text-sm text-white placeholder-white/25 focus:outline-none"
              />
            </div>
          </div>

          {/* Nav label */}
          <p className="px-5 text-white/20 text-[9px] uppercase tracking-[0.35em] mb-2">Navigation</p>

          {/* Nav links */}
          <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
            {NAV_LINKS.map((link, i) => {
              const isActive = activeSection === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => { scrollToSection(link.id); setMobileOpen(false); }}
                  className="w-full flex items-center gap-4 px-4 py-3.5 rounded-lg transition-all duration-200 focus:outline-none group relative overflow-hidden"
                  style={{
                    background: isActive ? "rgba(229,9,20,0.12)" : "transparent",
                    transitionDelay: mobileOpen ? `${i * 50}ms` : "0ms",
                  }}
                >
                  <span
                    className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full transition-all duration-300"
                    style={{
                      background: isActive ? "#e50914" : "transparent",
                      boxShadow: isActive ? "0 0 8px #e50914" : "none",
                    }}
                  />
                  <span className="transition-colors duration-200" style={{ color: isActive ? "#e50914" : "rgba(255,255,255,0.2)" }}>
                    {link.icon}
                  </span>
                  <span
                    className="text-sm uppercase tracking-[0.15em] font-semibold transition-colors duration-200"
                    style={{ color: isActive ? "#fff" : "rgba(255,255,255,0.45)" }}
                  >
                    {link.label}
                  </span>
                  <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }} />
                </button>
              );
            })}
          </nav>

          {/* Drawer footer */}
          <div className="px-5 pb-10 pt-5 border-t border-white/[0.07] space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-[#e50914]" style={{ boxShadow: "0 0 6px #e50914" }} />
              <span className="text-white/20 text-[10px] uppercase tracking-widest">Kenya · Streaming</span>
            </div>

            {/* Sign In in drawer */}
            <Link
              href="/auth"
              onClick={() => setMobileOpen(false)}
              className="w-full py-3 text-[11px] text-white/50 hover:text-white uppercase tracking-[0.15em] font-semibold transition-colors focus:outline-none border border-white/10 hover:border-white/25 rounded-lg flex items-center justify-center gap-2"
            >
              <LogIn size={13} />
              Sign In
            </Link>

            {/* ── Install App (drawer) ── */}
            <button
              onClick={() => { handleInstallClick(); setMobileOpen(false); }}
              disabled={btnBusy}
              className="w-full py-3 text-[11px] text-white font-bold uppercase tracking-[0.15em] rounded-lg transition-all duration-200 active:scale-[0.98] focus:outline-none relative overflow-hidden flex items-center justify-center gap-2"
              style={{
                background: isInstalled
                  ? "linear-gradient(135deg, #15803d 0%, #166534 100%)"
                  : "linear-gradient(135deg, #e50914 0%, #c20710 100%)",
                boxShadow: isInstalled ? "0 4px 20px rgba(21,128,61,0.35)" : "0 4px 20px rgba(229,9,20,0.35)",
                opacity: btnBusy ? 0.75 : 1,
              }}
            >
              <Smartphone size={13} />
              {btnBusy ? "Installing…" : isInstalled ? "App Installed ✓" : "Install App"}
              {/* shimmer ribbon */}
              {showShimmer && (
                <span
                  aria-hidden
                  className="absolute inset-0 -translate-x-full skew-x-[-20deg] bg-white/20 group-hover:translate-x-[200%] transition-transform duration-700"
                />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}