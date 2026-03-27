"use client";

import { useRef, useState } from "react";

const MOVIES = [
  { id: 1, title: "Blood Brothers", genre: "Action", year: 2024, rating: 8.4, isPremium: false, poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&q=80" },
  { id: 2, title: "Mumbai Love", genre: "Romance", year: 2023, rating: 7.8, isPremium: true, poster: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=400&q=80" },
  { id: 3, title: "The Warlord", genre: "Epic", year: 2024, rating: 9.1, isPremium: true, poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&q=80" },
  { id: 4, title: "Savanna Run", genre: "Thriller", year: 2024, rating: 8.0, isPremium: false, poster: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=400&q=80" },
  { id: 5, title: "Ghost City", genre: "Crime", year: 2023, rating: 8.7, isPremium: true, poster: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&q=80" },
  { id: 6, title: "The Oracle", genre: "Mystery", year: 2024, rating: 7.9, isPremium: false, poster: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80" },
  { id: 7, title: "Nairobi Vice", genre: "Crime", year: 2023, rating: 8.5, isPremium: true, poster: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&q=80" },
  { id: 8, title: "Desert Rider", genre: "Adventure", year: 2024, rating: 8.2, isPremium: false, poster: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&q=80" },
];

export default function FeaturedCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef(0);
  const scrollStart = useRef(0);

  const scroll = (dir: "left" | "right") => {
    if (!trackRef.current) return;
    const amount = trackRef.current.clientWidth * 0.7;
    trackRef.current.scrollBy({ left: dir === "right" ? amount : -amount, behavior: "smooth" });
  };

  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = e.pageX;
    scrollStart.current = trackRef.current?.scrollLeft ?? 0;
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !trackRef.current) return;
    trackRef.current.scrollLeft = scrollStart.current - (e.pageX - dragStart.current);
  };
  const onMouseUp = () => setIsDragging(false);

  return (
    <section id="featured" className="relative py-24 bg-[#0a0a0a] overflow-hidden">
      {/* Section decorative left border */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-24 bg-gradient-to-b from-transparent via-[#e50914] to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-[#e50914] text-xs uppercase tracking-[0.4em] mb-2 font-semibold">Now Streaming</p>
            <h2
              className="text-white leading-none"
              style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "0.06em" }}
            >
              FEATURED MOVIES
            </h2>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              className="w-10 h-10 rounded-full border border-white/20 hover:border-[#e50914]/60 flex items-center justify-center text-white/50 hover:text-white transition-all duration-200 hover:shadow-[0_0_12px_#e5091433]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-10 h-10 rounded-full border border-white/20 hover:border-[#e50914]/60 flex items-center justify-center text-white/50 hover:text-white transition-all duration-200 hover:shadow-[0_0_12px_#e5091433]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Track */}
        <div
          ref={trackRef}
          className="flex gap-5 overflow-x-auto pb-4 cursor-grab active:cursor-grabbing select-none"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          {MOVIES.map((movie) => (
            <div
              key={movie.id}
              className="flex-shrink-0 group relative"
              style={{ width: "clamp(180px, 20vw, 240px)" }}
              onMouseEnter={() => setHoveredId(movie.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Card */}
              <div
                className="relative rounded overflow-hidden transition-all duration-400"
                style={{
                  aspectRatio: "2/3",
                  transform: hoveredId === movie.id ? "translateY(-8px) scale(1.03)" : "none",
                  boxShadow: hoveredId === movie.id ? "0 24px 60px #00000088, 0 0 0 1px #e50914aa" : "0 4px 20px #00000055",
                }}
              >
                {/* Poster */}
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                  draggable={false}
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-80" />

                {/* Premium badge */}
                {movie.isPremium && (
                  <div className="absolute top-3 right-3 bg-[#e50914] text-white text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">
                    10 KSh
                  </div>
                )}

                {/* Info on hover */}
                <div
                  className="absolute inset-0 flex flex-col justify-end p-4 transition-all duration-300"
                  style={{ opacity: hoveredId === movie.id ? 1 : 0, transform: hoveredId === movie.id ? "translateY(0)" : "translateY(8px)" }}
                >
                  <p className="text-[#e50914] text-[10px] uppercase tracking-widest font-semibold mb-1">{movie.genre}</p>
                  <p className="text-white font-bold text-sm leading-tight mb-3">{movie.title}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-white/50 text-xs">{movie.year} · ★ {movie.rating}</span>
                    <button className="w-8 h-8 rounded-full bg-[#e50914] flex items-center justify-center shadow-[0_0_12px_#e5091488] hover:scale-110 transition-transform">
                      <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Title always visible at bottom when not hovered */}
                <div
                  className="absolute bottom-0 left-0 right-0 p-3 transition-opacity duration-300"
                  style={{ opacity: hoveredId === movie.id ? 0 : 1 }}
                >
                  <p className="text-white font-semibold text-sm leading-tight truncate">{movie.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View all */}
        <div className="mt-10 flex justify-center">
          <button className="group flex items-center gap-3 text-white/50 hover:text-white text-sm uppercase tracking-widest font-medium transition-colors duration-200">
            View All Movies
            <svg
              className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}