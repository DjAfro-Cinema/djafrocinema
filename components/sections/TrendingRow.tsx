"use client";

import { useState } from "react";

const TRENDING = [
  { rank: 1, title: "The Iron Fist", genre: "Action", rating: 9.2, views: "142K", isPremium: true, poster: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=600&q=80", trend: "+24%" },
  { rank: 2, title: "Kampala Queen", genre: "Drama", rating: 8.9, views: "98K", isPremium: false, poster: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=600&q=80", trend: "+18%" },
  { rank: 3, title: "Mombasa Nights", genre: "Romance", rating: 8.5, views: "87K", isPremium: true, poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&q=80", trend: "+15%" },
  { rank: 4, title: "Last Soldier", genre: "War", rating: 8.3, views: "75K", isPremium: false, poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80", trend: "+11%" },
  { rank: 5, title: "Shadow Empire", genre: "Crime", rating: 8.1, views: "64K", isPremium: true, poster: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&q=80", trend: "+9%" },
];

export default function TrendingRow() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section id="trending" className="relative py-24 bg-[#0d0d0d] overflow-hidden">
      {/* Decorative grid lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        {/* Header */}
        <div className="mb-14">
          <p className="text-[#e50914] text-xs uppercase tracking-[0.4em] mb-2 font-semibold">This Week</p>
          <div className="flex items-baseline gap-4">
            <h2
              className="text-white leading-none"
              style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "0.06em" }}
            >
              TRENDING NOW
            </h2>
            <div className="w-px h-8 bg-[#e50914]/40" />
            <span className="text-white/30 text-sm uppercase tracking-widest">Top 5 Films</span>
          </div>
        </div>

        {/* Rankings list */}
        <div className="space-y-2">
          {TRENDING.map((movie) => (
            <div
              key={movie.rank}
              className="group relative flex items-center gap-0 overflow-hidden rounded cursor-pointer transition-all duration-300"
              style={{
                background: hovered === movie.rank ? "#161616" : "transparent",
                borderLeft: hovered === movie.rank ? "3px solid #e50914" : "3px solid transparent",
              }}
              onMouseEnter={() => setHovered(movie.rank)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Rank number — massive behind */}
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 leading-none select-none pointer-events-none transition-all duration-300"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(5rem, 12vw, 9rem)",
                  color: hovered === movie.rank ? "#e50914" : "white",
                  opacity: hovered === movie.rank ? 0.06 : 0.035,
                  left: "0.5rem",
                  letterSpacing: "-0.04em",
                }}
              >
                {movie.rank}
              </div>

              {/* Rank number — small visible */}
              <div className="relative z-10 w-16 sm:w-20 text-center flex-shrink-0">
                <span
                  className="font-black transition-colors duration-200"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.5rem",
                    color: hovered === movie.rank ? "#e50914" : "#ffffff44",
                    letterSpacing: "0.04em",
                  }}
                >
                  #{movie.rank}
                </span>
              </div>

              {/* Poster thumbnail */}
              <div
                className="relative flex-shrink-0 overflow-hidden rounded transition-all duration-300"
                style={{
                  width: "clamp(60px, 8vw, 80px)",
                  aspectRatio: "2/3",
                  transform: hovered === movie.rank ? "scale(1.05)" : "none",
                  boxShadow: hovered === movie.rank ? "0 8px 30px #00000077" : "none",
                }}
              >
                <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
              </div>

              {/* Info */}
              <div className="flex-1 px-5 py-5 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-white/30 text-xs uppercase tracking-widest">{movie.genre}</span>
                  {movie.isPremium && (
                    <span className="text-[#e50914] text-[10px] font-bold uppercase tracking-widest border border-[#e50914]/30 px-1.5 py-0.5 rounded">
                      Premium
                    </span>
                  )}
                </div>
                <p
                  className="text-white font-semibold truncate transition-colors duration-200"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(1rem, 2.5vw, 1.35rem)",
                    letterSpacing: "0.04em",
                    color: hovered === movie.rank ? "#ffffff" : "#ffffffcc",
                  }}
                >
                  {movie.title}
                </p>
              </div>

              {/* Stats */}
              <div className="flex-shrink-0 hidden sm:flex flex-col items-end gap-1 pr-6 py-5">
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400 text-xs">★</span>
                  <span className="text-white font-bold text-sm">{movie.rating}</span>
                </div>
                <span className="text-white/30 text-xs tracking-wider">{movie.views} views</span>
                <span className="text-green-400 text-xs font-semibold">{movie.trend}</span>
              </div>

              {/* Play button on hover */}
              <div
                className="flex-shrink-0 pr-6 transition-all duration-200"
                style={{ opacity: hovered === movie.rank ? 1 : 0, transform: hovered === movie.rank ? "translateX(0)" : "translateX(12px)" }}
              >
                <button className="w-10 h-10 rounded-full bg-[#e50914] flex items-center justify-center shadow-[0_0_20px_#e5091466] hover:scale-110 transition-transform">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}