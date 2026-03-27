"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const navLinks = [
  { label: "Movies", href: "/movies" },
  { label: "Trending", href: "/trending" },
  { label: "Premium", href: "/premium" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-black/80 backdrop-blur-xl border-b border-white/5 py-3"
            : "bg-gradient-to-b from-black/60 to-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden ring-1 ring-red-600/40 group-hover:ring-red-500 transition-all duration-300">
              <Image
                src="/logos/android-chrome-192x192.png"
                alt="DjAfro Cinema"
                fill
                className="object-cover"
              />
            </div>
            <span className="font-display text-xl tracking-wider">
              <span className="text-red-600">DjAfro</span>
              <span className="text-white"> Cinema</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-4 py-2 text-sm font-medium text-white/60 hover:text-white transition-colors duration-200 group"
              >
                {link.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-red-600 group-hover:w-4 transition-all duration-300" />
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-white/70 hover:text-white transition-colors duration-200 px-4 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="relative text-sm font-semibold text-white bg-red-600 hover:bg-red-500 px-5 py-2 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-red-600/25 active:scale-95"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 rounded-lg hover:bg-white/10 transition-colors duration-200"
          >
            <span
              className={`block w-5 h-px bg-white transition-all duration-300 origin-center ${
                menuOpen ? "rotate-45 translate-y-[3px]" : ""
              }`}
            />
            <span
              className={`block w-5 h-px bg-white transition-all duration-300 ${
                menuOpen ? "opacity-0 scale-x-0" : ""
              }`}
            />
            <span
              className={`block w-5 h-px bg-white transition-all duration-300 origin-center ${
                menuOpen ? "-rotate-45 -translate-y-[9px]" : ""
              }`}
            />
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
        />

        {/* Menu Panel */}
        <div
          className={`absolute top-0 right-0 h-full w-72 bg-[#0d0d0d] border-l border-white/5 flex flex-col transition-transform duration-300 ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Panel Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
            <span className="font-display text-lg">
              <span className="text-red-600">DjAfro</span>
              <span className="text-white"> Cinema</span>
            </span>
            <button
              onClick={() => setMenuOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M1 1L15 15M15 1L1 15" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Nav Links */}
          <nav className="flex flex-col px-4 py-6 gap-1 flex-1">
            {navLinks.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all duration-200 text-sm font-medium"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Auth Buttons */}
          <div className="px-4 pb-8 flex flex-col gap-3">
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="text-center text-sm font-medium text-white/70 hover:text-white border border-white/10 hover:border-white/20 px-5 py-3 rounded-xl transition-all duration-200"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              onClick={() => setMenuOpen(false)}
              className="text-center text-sm font-semibold text-white bg-red-600 hover:bg-red-500 px-5 py-3 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-red-600/25"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}