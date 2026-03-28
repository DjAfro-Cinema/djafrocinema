"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search, X, SlidersHorizontal, Play, Star, Crown, Mic2,
  ChevronDown, Grid3X3, LayoutList, Flame, Sparkles, Clock,
  TrendingUp, Heart, Filter,
} from "lucide-react";
import DashboardSidebar from "@/components/dashboard/sidebar/DashboardSidebar";
import { useDashboardLayout } from "@/hooks/useDashboardLayout";

// ── TYPES ─────────────────────────────────────────────────────────────────────

interface Movie {
  id: string;
  title: string;
  genre: string;
  year: number;
  rating: string;
  premium: boolean;
  dubbed?: boolean;
  img: string;
  rank?: number;
  duration?: string;
  views?: string;
  description?: string;
  tags?: string[];
}

// ── ALL MOVIES DATASET ────────────────────────────────────────────────────────

const ALL_MOVIES: Movie[] = [
  // Action
  { id: "m1",  title: "John Wick 4",              genre: "Action",    year: 2023, rating: "8.9", premium: true,  img: "/images/movie3.jpg",  duration: "2h 49m", views: "4.2M", description: "A legendary assassin fights his way through the criminal underworld's most powerful forces.", tags: ["Intense", "Stylish", "Epic"] },
  { id: "m2",  title: "Thunderbolts*",            genre: "Marvel",    year: 2024, rating: "7.9", premium: true,  img: "/images/movie6.jpg",  duration: "2h 7m",  views: "3.8M", description: "Marvel's ragtag group of antiheroes is sent on a dangerous mission.", tags: ["Superhero", "Action", "Comedy"] },
  { id: "m3",  title: "Ghost Rider",              genre: "Action",    year: 2024, rating: "8.2", premium: false, img: "/images/movie10.jpg", duration: "1h 50m", views: "2.1M", description: "The spirit of vengeance returns in a blaze of hellfire.", tags: ["Supernatural", "Dark", "Thrilling"] },
  { id: "m4",  title: "Rampage",                  genre: "Thriller",  year: 2023, rating: "8.1", premium: false, img: "/images/movie4.jpg",  duration: "1h 47m", views: "1.9M", description: "A primatologist must stop three mutated animals from destroying Chicago.", tags: ["Giant Monsters", "Dwayne Johnson"] },
  { id: "m5",  title: "Red 2",                    genre: "Action",    year: 2023, rating: "8.5", premium: false, img: "/images/movie9.jpg",  duration: "1h 56m", views: "2.4M", description: "Retired CIA operative Frank Moses reunites his team for a global manhunt.", tags: ["Comedy", "Spy", "Action"] },
  { id: "m6",  title: "The Meg",                  genre: "Thriller",  year: 2024, rating: "7.9", premium: false, img: "/images/movie12.jpg", duration: "1h 53m", views: "2.8M", description: "A deep-sea submersible crew faces a prehistoric megalodon shark.", tags: ["Ocean", "Survival", "Monster"] },
  // Bollywood / Dubbed
  { id: "m7",  title: "Baahubali: The Beginning", genre: "Bollywood", year: 2015, rating: "9.1", premium: true,  dubbed: true, img: "/images/movie2.jpg",  duration: "2h 39m", views: "12.4M", description: "An epic tale of kingdoms, love, and betrayal in ancient India. DJ Afro dubbed.", tags: ["Epic", "Fantasy", "Dubbed"] },
  { id: "m8",  title: "Krish III",                genre: "Sci-Fi",    year: 2013, rating: "8.8", premium: true,  dubbed: true, img: "/images/movie5.webp", duration: "2h 44m", views: "5.6M", description: "India's greatest superhero battles a genetic villain threatening humanity.", tags: ["Superhero", "Bollywood", "Dubbed"] },
  { id: "m9",  title: "Kick",                     genre: "Bollywood", year: 2023, rating: "7.8", premium: true,  dubbed: true, img: "/images/movie11.jpg", duration: "2h 28m", views: "3.2M", description: "A thrill-seeking daredevil becomes a vigilante to help the poor. Fully dubbed.", tags: ["Comedy", "Romance", "Dubbed"] },
  { id: "m10", title: "Ghost City",               genre: "Action",    year: 2023, rating: "8.7", premium: true,  dubbed: true, img: "/images/movie8.jpg",  duration: "1h 58m", views: "3.9M", description: "A cop uncovers supernatural secrets beneath a city's criminal empire.", tags: ["Crime", "Supernatural", "Dubbed"] },
  // Adventure
  { id: "m11", title: "Anaconda Rising",          genre: "Adventure", year: 2024, rating: "8.4", premium: false, img: "/images/movie7.jpg",  duration: "1h 45m", views: "3.3M", description: "The Amazon's most terrifying predator awakens in this heart-pounding adventure.", tags: ["Nature", "Survival", "Exclusive"] },
  { id: "m12", title: "Baahubali: The Conclusion",genre: "Bollywood", year: 2017, rating: "9.2", premium: true,  dubbed: true, img: "/images/movie1.jpg",  duration: "2h 47m", views: "18.1M", description: "The epic conclusion answers the greatest question in Indian cinema history.", tags: ["Epic", "War", "Dubbed"] },
  // Extra cards to fill
  { id: "m13", title: "Fast X",                   genre: "Action",    year: 2023, rating: "8.0", premium: true,  img: "/images/movie3.jpg",  duration: "2h 21m", views: "6.1M", description: "Dominic Toretto faces his most formidable foe yet in the tenth chapter.", tags: ["Cars", "Family", "Action"] },
  { id: "m14", title: "Black Panther: Wakanda Forever", genre: "Marvel", year: 2022, rating: "7.8", premium: true, img: "/images/movie6.jpg", duration: "2h 41m", views: "8.3M", description: "Wakanda must protect itself from intervening world powers after a great loss.", tags: ["Superhero", "Emotional", "Marvel"] },
  { id: "m15", title: "Extraction 2",             genre: "Action",    year: 2023, rating: "8.3", premium: true,  img: "/images/movie10.jpg", duration: "2h 2m",  views: "4.8M", description: "Tyler Rake returns for a breathtaking mission across Europe's most dangerous cities.", tags: ["Netflix", "War", "Brutal"] },
  { id: "m16", title: "Blue Beetle",              genre: "Sci-Fi",    year: 2023, rating: "7.2", premium: false, img: "/images/movie4.jpg",  duration: "2h 7m",  views: "1.4M", description: "A young man bonds with an alien scarab to become a superhero.", tags: ["DC", "Superhero", "Family"] },
  { id: "m17", title: "Devotion",                 genre: "Drama",     year: 2023, rating: "7.4", premium: false, img: "/images/movie9.jpg",  duration: "2h 18m", views: "890K", description: "The story of two elite fighter pilots during the Korean War.", tags: ["War", "True Story", "Drama"] },
  { id: "m18", title: "Aquaman 2",                genre: "Action",    year: 2023, rating: "6.9", premium: true,  img: "/images/movie12.jpg", duration: "2h 4m",  views: "2.7M", description: "Arthur Curry must forge an alliance with his imprisoned brother to save Atlantis.", tags: ["DC", "Fantasy", "Ocean"] },
  { id: "m19", title: "Vikram",                   genre: "Bollywood", year: 2022, rating: "8.4", premium: true,  dubbed: true, img: "/images/movie2.jpg",  duration: "2h 54m", views: "7.2M", description: "A black ops mission uncovers a sinister conspiracy. Powerfully dubbed by DJ Afro.", tags: ["Crime", "Thrilling", "Dubbed"] },
  { id: "m20", title: "Pathaan",                  genre: "Bollywood", year: 2023, rating: "8.0", premium: true,  dubbed: true, img: "/images/movie5.webp", duration: "2h 26m", views: "5.9M", description: "India's most wanted spy is called back into action to prevent catastrophe.", tags: ["Spy", "Action", "Dubbed"] },
  { id: "m21", title: "Avatar 2",                 genre: "Sci-Fi",    year: 2022, rating: "7.8", premium: true,  img: "/images/movie8.jpg",  duration: "3h 12m", views: "11.2M", description: "Jake Sully and Neytiri's family face new threats from the RDA corporation.", tags: ["Sci-Fi", "Epic", "Visual Marvel"] },
  { id: "m22", title: "Nope",                     genre: "Thriller",  year: 2022, rating: "7.1", premium: false, img: "/images/movie7.jpg",  duration: "2h 10m", views: "1.2M", description: "Ranchers encounter a mysterious force in the skies above their California valley.", tags: ["Horror", "Mystery", "Jordan Peele"] },
  { id: "m23", title: "RRR",                      genre: "Bollywood", year: 2022, rating: "9.0", premium: true,  dubbed: true, img: "/images/movie11.jpg", duration: "3h 2m",  views: "9.8M", description: "Two Indian revolutionaries fight British rule in a spectacular action saga. DJ Afro dubbed.", tags: ["Epic", "History", "Dubbed"] },
  { id: "m24", title: "Top Gun: Maverick",        genre: "Action",    year: 2022, rating: "8.3", premium: true,  img: "/images/movie1.jpg",  duration: "2h 11m", views: "8.6M", description: "Maverick returns to train the next generation of Top Gun graduates.", tags: ["Military", "Nostalgia", "Action"] },
];

const GENRES_TABS = ["All", "Action", "Bollywood", "Marvel", "Sci-Fi", "Thriller", "Adventure", "Drama"];
const SORT_OPTIONS = [
  { val: "trending", label: "Trending",  Icon: TrendingUp },
  { val: "rating",   label: "Top Rated", Icon: Star },
  { val: "newest",   label: "Newest",    Icon: Sparkles },
  { val: "popular",  label: "Most Watched", Icon: Flame },
];

const USER = { name: "Mwangi", email: "mwangi@djafro.co.ke" };

// ── FEATURED BANNER (top of movies page) ─────────────────────────────────────

function FeaturedBanner({ movie, onPlay }: { movie: Movie; onPlay: (m: Movie) => void }) {
  return (
    <div style={{ position: "relative", width: "100%", height: "clamp(260px, 38vw, 440px)", overflow: "hidden", flexShrink: 0 }}>
      {/* BG image */}
      <img
        src={movie.img}
        alt={movie.title}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.38) saturate(1.15)" }}
      />
      {/* Gradient overlays */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, #080808 0%, rgba(8,8,8,0.25) 55%, transparent 100%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(8,8,8,0.85) 0%, transparent 60%)" }} />

      {/* Content */}
      <div style={{ position: "absolute", bottom: 0, left: 0, padding: "clamp(20px,4vw,48px)", maxWidth: 560 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 9, letterSpacing: "0.4em", textTransform: "uppercase", color: "#e50914", fontWeight: 700, fontFamily: "'DM Sans', sans-serif", background: "rgba(229,9,20,0.12)", border: "1px solid rgba(229,9,20,0.3)", padding: "3px 10px", borderRadius: 3 }}>
            FEATURED
          </span>
          {movie.dubbed && (
            <span style={{ fontSize: 9, letterSpacing: "0.35em", textTransform: "uppercase", color: "#fff", fontWeight: 700, fontFamily: "'DM Sans', sans-serif", background: "rgba(255,180,0,0.15)", border: "1px solid rgba(255,180,0,0.3)", padding: "3px 10px", borderRadius: 3, display: "flex", alignItems: "center", gap: 4 }}>
              <Mic2 size={9} /> DJ AFRO DUBBED
            </span>
          )}
        </div>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2rem,5vw,3.5rem)", color: "#fff", letterSpacing: "0.05em", lineHeight: 1, margin: "0 0 10px" }}>
          {movie.title}
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14, flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 5, color: "#f5c518", fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
            <Star size={12} fill="#f5c518" /> {movie.rating}
          </span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans', sans-serif" }}>{movie.year}</span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans', sans-serif" }}>{movie.duration}</span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans', sans-serif" }}>{movie.genre}</span>
        </div>
        <p style={{ fontSize: "clamp(12px,1.5vw,14px)", color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6, margin: "0 0 20px", maxWidth: 440 }}>
          {movie.description}
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => onPlay(movie)}
            style={{ display: "flex", alignItems: "center", gap: 9, padding: "11px 26px", background: "#e50914", border: "none", borderRadius: 6, color: "#fff", fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}
          >
            <Play size={14} fill="#fff" /> Play Now
          </button>
          <Link
            href={`/dashboard/movies/${movie.id}`}
            style={{ display: "flex", alignItems: "center", gap: 9, padding: "11px 22px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", textDecoration: "none", cursor: "pointer" }}
          >
            More Info
          </Link>
        </div>
      </div>

      {/* Stat badge top-right */}
      <div style={{ position: "absolute", top: 24, right: 24, textAlign: "right" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", fontFamily: "'DM Sans', sans-serif", marginBottom: 4 }}>
          Viewed
        </div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.6rem", color: "#fff", letterSpacing: "0.05em" }}>
          {movie.views}
        </div>
      </div>
    </div>
  );
}

// ── MOVIE CARD (grid variant) ──────────────────────────────────────────────────

function MovieCard({ movie, view }: { movie: Movie; view: "grid" | "list" }) {
  const [hovered, setHovered] = useState(false);

  if (view === "list") {
    return (
      <Link
        href={`/dashboard/movies/${movie.id}`}
        style={{ textDecoration: "none", display: "block" }}
      >
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            display: "flex", gap: 16, alignItems: "center",
            padding: "12px 14px",
            background: hovered ? "rgba(255,255,255,0.04)" : "transparent",
            border: "1px solid",
            borderColor: hovered ? "rgba(229,9,20,0.2)" : "rgba(255,255,255,0.06)",
            borderRadius: 10,
            transition: "all 0.18s",
            cursor: "pointer",
          }}
        >
          <div style={{ position: "relative", width: 80, height: 112, flexShrink: 0, borderRadius: 6, overflow: "hidden" }}>
            <img src={movie.img} alt={movie.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            {movie.rank && (
              <div style={{ position: "absolute", top: 4, left: 4, fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", color: "#e50914", lineHeight: 1 }}>
                #{movie.rank}
              </div>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 5, flexWrap: "wrap" }}>
              {movie.premium && <Crown size={10} color="#f5c518" />}
              {movie.dubbed && <Mic2 size={10} color="rgba(255,180,0,0.8)" />}
              <span style={{ fontSize: 9, color: "#e50914", letterSpacing: "0.35em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>{movie.genre}</span>
            </div>
            <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", color: "#fff", letterSpacing: "0.06em", margin: "0 0 5px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {movie.title}
            </h3>
            <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.35)", fontFamily: "'DM Sans', sans-serif", margin: "0 0 8px", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {movie.description}
            </p>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#f5c518", fontSize: 11, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
                <Star size={10} fill="#f5c518" /> {movie.rating}
              </span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "'DM Sans', sans-serif" }}>{movie.year}</span>
              {movie.duration && <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "'DM Sans', sans-serif" }}>{movie.duration}</span>}
              {movie.views && <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "'DM Sans', sans-serif" }}>{movie.views} views</span>}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <div style={{
              width: 38, height: 38,
              borderRadius: "50%",
              background: hovered ? "#e50914" : "rgba(229,9,20,0.12)",
              border: "1px solid rgba(229,9,20,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.18s",
            }}>
              <Play size={14} fill={hovered ? "#fff" : "#e50914"} color={hovered ? "#fff" : "#e50914"} />
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Grid view
  return (
    <Link href={`/dashboard/movies/${movie.id}`} style={{ textDecoration: "none", display: "block" }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ position: "relative", borderRadius: 10, overflow: "hidden", cursor: "pointer", background: "#0c0c0e" }}
      >
        {/* Poster */}
        <div style={{ position: "relative", paddingTop: "144%", overflow: "hidden" }}>
          <img
            src={movie.img}
            alt={movie.title}
            style={{
              position: "absolute", inset: 0, width: "100%", height: "100%",
              objectFit: "cover",
              transform: hovered ? "scale(1.06)" : "scale(1)",
              transition: "transform 0.5s ease",
            }}
          />

          {/* Overlay on hover */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(0deg, rgba(8,8,8,0.95) 0%, rgba(8,8,8,0.4) 50%, transparent 100%)",
            opacity: hovered ? 1 : 0.6,
            transition: "opacity 0.3s",
          }} />

          {/* Badges top */}
          <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 5, flexWrap: "wrap" }}>
            {movie.premium && (
              <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 8, letterSpacing: "0.3em", padding: "3px 7px", background: "rgba(245,197,24,0.15)", border: "1px solid rgba(245,197,24,0.3)", borderRadius: 3, color: "#f5c518", fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>
                <Crown size={8} fill="#f5c518" color="#f5c518" /> PREMIUM
              </span>
            )}
            {movie.dubbed && (
              <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 8, letterSpacing: "0.3em", padding: "3px 7px", background: "rgba(255,180,0,0.15)", border: "1px solid rgba(255,180,0,0.3)", borderRadius: 3, color: "rgba(255,200,50,0.9)", fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>
                <Mic2 size={8} /> DUBBED
              </span>
            )}
          </div>

          {/* Rank badge */}
          {movie.rank && (
            <div style={{ position: "absolute", top: 10, right: 10, fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", color: "#e50914", lineHeight: 1, textShadow: "0 2px 12px rgba(229,9,20,0.5)" }}>
              #{movie.rank}
            </div>
          )}

          {/* Play button on hover */}
          <div style={{
            position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
            opacity: hovered ? 1 : 0, transition: "opacity 0.2s",
          }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#e50914", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 30px rgba(229,9,20,0.5)" }}>
              <Play size={20} fill="#fff" color="#fff" />
            </div>
          </div>

          {/* Bottom info */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px 12px 10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontSize: 9, color: "#e50914", letterSpacing: "0.35em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>
                {movie.genre}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 3, color: "#f5c518", fontSize: 10, fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>
                <Star size={9} fill="#f5c518" /> {movie.rating}
              </span>
            </div>
            <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.95rem", color: "#fff", letterSpacing: "0.05em", margin: "0 0 3px", lineHeight: 1.1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {movie.title}
            </h3>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans', sans-serif" }}>{movie.year}</span>
              {movie.duration && <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans', sans-serif" }}>{movie.duration}</span>}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── GENRE SECTION ─────────────────────────────────────────────────────────────

function GenreSection({
  genre,
  movies,
  view,
}: {
  genre: string;
  movies: Movie[];
  view: "grid" | "list";
}) {
  if (!movies.length) return null;
  return (
    <section style={{ marginBottom: 52 }}>
      {/* Section header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 3, height: 20, background: "#e50914", boxShadow: "0 0 8px rgba(229,9,20,0.5)" }} />
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.3rem,2.5vw,1.8rem)", letterSpacing: "0.07em", color: "#fff", margin: 0 }}>
            {genre}
          </h2>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: "'DM Sans', sans-serif" }}>
            {movies.length} films
          </span>
        </div>
        <Link
          href={`/dashboard/movies?genre=${genre.toLowerCase()}`}
          style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", textDecoration: "none", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}
        >
          View All →
        </Link>
      </div>

      {view === "grid" ? (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 12,
        }}>
          {movies.map(m => <MovieCard key={m.id} movie={m} view="grid" />)}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {movies.map(m => <MovieCard key={m.id} movie={m} view="list" />)}
        </div>
      )}
    </section>
  );
}

// ── SORT DROPDOWN ─────────────────────────────────────────────────────────────

function SortDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const current = SORT_OPTIONS.find(o => o.val === value) ?? SORT_OPTIONS[0];

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(p => !p)}
        style={{
          display: "flex", alignItems: "center", gap: 7, padding: "8px 14px",
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: 8, color: "rgba(255,255,255,0.55)", fontSize: 12,
          fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
        }}
      >
        <current.Icon size={13} />
        {current.label}
        <ChevronDown size={11} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", right: 0,
          minWidth: 160,
          background: "#111113", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 10, overflow: "hidden", zIndex: 100,
          boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
        }}>
          {SORT_OPTIONS.map(o => (
            <button
              key={o.val}
              onClick={() => { onChange(o.val); setOpen(false); }}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 9,
                padding: "10px 14px", background: o.val === value ? "rgba(229,9,20,0.1)" : "transparent",
                border: "none", color: o.val === value ? "#fff" : "rgba(255,255,255,0.45)",
                fontSize: 12, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", textAlign: "left",
                borderLeft: o.val === value ? "2px solid #e50914" : "2px solid transparent",
              }}
            >
              <o.Icon size={12} color={o.val === value ? "#e50914" : "inherit"} />
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────

export default function MoviesPage() {
  const searchParams = useSearchParams();
  const layout = useDashboardLayout();
  const {
    isMobile, isSmall,
    sidebarCollapsed, setSidebarCollapsed,
    scrolled,
  } = layout;

  const filterParam = searchParams?.get("filter") ?? null;
  const genreParam  = searchParams?.get("genre") ?? null;

  const [activeGenre, setActiveGenre]   = useState(genreParam ? capitalize(genreParam) : "All");
  const [searchVal,   setSearchVal]     = useState("");
  const [searchOpen,  setSearchOpen]    = useState(false);
  const [sortBy,      setSortBy]        = useState("trending");
  const [view,        setView]          = useState<"grid" | "list">("grid");
  const [showFilter,  setShowFilter]    = useState(false);
  const [freeOnly,    setFreeOnly]      = useState(filterParam === "free");
  const [dubbedOnly,  setDubbedOnly]    = useState(filterParam === "dubbed");
  const [loading,     setLoading]       = useState(true);

  useEffect(() => { setTimeout(() => setLoading(false), 900); }, []);

  function capitalize(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

  // Filter + sort movies
  const filtered = ALL_MOVIES.filter(m => {
    if (freeOnly   && m.premium) return false;
    if (dubbedOnly && !m.dubbed) return false;
    if (activeGenre !== "All" && m.genre.toLowerCase() !== activeGenre.toLowerCase()) return false;
    if (searchVal) {
      const q = searchVal.toLowerCase();
      return m.title.toLowerCase().includes(q) || m.genre.toLowerCase().includes(q) || (m.description ?? "").toLowerCase().includes(q);
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "rating")  return parseFloat(b.rating) - parseFloat(a.rating);
    if (sortBy === "newest")  return b.year - a.year;
    if (sortBy === "popular") return parseFloat(b.views?.replace(/[^0-9.]/g, "") ?? "0") - parseFloat(a.views?.replace(/[^0-9.]/g, "") ?? "0");
    return (a.rank ?? 99) - (b.rank ?? 99);
  });

  // Group by genre when "All" is selected
  const genreGroups: Record<string, Movie[]> = {};
  if (activeGenre === "All" && !searchVal) {
    GENRES_TABS.filter(g => g !== "All").forEach(g => {
      const gMovies = sorted.filter(m => m.genre === g);
      if (gMovies.length) genreGroups[g] = gMovies;
    });
    // Any remaining genres not in the tab list
    sorted.forEach(m => {
      if (!GENRES_TABS.includes(m.genre)) {
        genreGroups[m.genre] = [...(genreGroups[m.genre] ?? []), m];
      }
    });
  }

  const featured = ALL_MOVIES.find(m => m.id === "m12") ?? ALL_MOVIES[0];

  const handlePlay = useCallback((m: Movie) => {
    console.log("play", m.title);
  }, []);

  return (
    <>
      <div style={{ display: "flex", height: "100svh", background: "#080808", overflow: "hidden" }}>
        {/* Sidebar */}
        {!isSmall && (
          <DashboardSidebar
            user={USER}
            collapsed={sidebarCollapsed}
            onCollapsedChange={setSidebarCollapsed}
          />
        )}

        {/* Content column */}
        <div
          id="movies-scroll-col"
          style={{ flex: 1, minWidth: 0, height: "100svh", overflowY: "auto", overflowX: "hidden", display: "flex", flexDirection: "column" }}
        >
          {/* ── STICKY TOP BAR ── */}
          <header style={{
            position: "sticky", top: 0, zIndex: 800,
            height: 62,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 clamp(16px,3vw,28px)",
            background: scrolled ? "rgba(8,8,10,0.97)" : "rgba(8,8,10,0.8)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            flexShrink: 0,
            gap: 12,
          }}>
            {/* Title */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.3rem,2.5vw,1.8rem)", color: "#fff", letterSpacing: "0.1em", margin: 0 }}>
                Movies
              </h1>
              <span style={{ fontSize: 9, letterSpacing: "0.35em", textTransform: "uppercase", color: "#e50914", fontWeight: 700, fontFamily: "'DM Sans', sans-serif", background: "rgba(229,9,20,0.1)", border: "1px solid rgba(229,9,20,0.2)", padding: "3px 8px", borderRadius: 3 }}>
                {ALL_MOVIES.length} FILMS
              </span>
            </div>

            {/* Right controls */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* Search */}
              {searchOpen ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(229,9,20,0.25)", borderRadius: 8 }}>
                  <Search size={13} color="rgba(255,255,255,0.3)" strokeWidth={1.8} />
                  <input
                    autoFocus
                    value={searchVal}
                    onChange={e => setSearchVal(e.target.value)}
                    placeholder="Search movies…"
                    style={{ background: "transparent", border: "none", color: "#fff", fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: "none", width: 160 }}
                  />
                  <button onClick={() => { setSearchOpen(false); setSearchVal(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", display: "flex" }}>
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  style={{ width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 9, cursor: "pointer", color: "rgba(255,255,255,0.4)" }}
                >
                  <Search size={15} strokeWidth={1.8} />
                </button>
              )}

              {/* Sort */}
              <SortDropdown value={sortBy} onChange={setSortBy} />

              {/* View toggle */}
              <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, overflow: "hidden" }}>
                {(["grid", "list"] as const).map(v => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", background: view === v ? "rgba(229,9,20,0.2)" : "transparent", border: "none", cursor: "pointer", color: view === v ? "#e50914" : "rgba(255,255,255,0.3)", transition: "all 0.15s" }}
                  >
                    {v === "grid" ? <Grid3X3 size={14} /> : <LayoutList size={14} />}
                  </button>
                ))}
              </div>

              {/* Filter toggle */}
              <button
                onClick={() => setShowFilter(p => !p)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 14px", height: 38, background: showFilter ? "rgba(229,9,20,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${showFilter ? "rgba(229,9,20,0.3)" : "rgba(255,255,255,0.07)"}`, borderRadius: 9, cursor: "pointer", color: showFilter ? "#e50914" : "rgba(255,255,255,0.4)", fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}
              >
                <Filter size={13} />
                {!isSmall && "Filter"}
              </button>
            </div>
          </header>

          {/* ── FILTER BAR ── */}
          {showFilter && (
            <div style={{ padding: "14px clamp(16px,3vw,28px)", background: "rgba(12,12,14,0.95)", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 9, letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>Filters:</span>
              {[
                { key: "free",   label: "Free to Watch",  val: freeOnly,   set: setFreeOnly },
                { key: "dubbed", label: "DJ Afro Dubbed",  val: dubbedOnly, set: setDubbedOnly },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => f.set(p => !p)}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: f.val ? "rgba(229,9,20,0.15)" : "rgba(255,255,255,0.03)", border: `1px solid ${f.val ? "rgba(229,9,20,0.35)" : "rgba(255,255,255,0.08)"}`, borderRadius: 6, color: f.val ? "#fff" : "rgba(255,255,255,0.35)", fontSize: 11, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}
                >
                  {f.val && <span style={{ color: "#e50914", marginRight: 2 }}>✓</span>}
                  {f.label}
                </button>
              ))}
              {(freeOnly || dubbedOnly) && (
                <button onClick={() => { setFreeOnly(false); setDubbedOnly(false); }} style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                  Clear all
                </button>
              )}
            </div>
          )}

          {/* ── GENRE TABS ── */}
          <div style={{ padding: "0 clamp(16px,3vw,28px)", background: "rgba(8,8,8,0.6)", borderBottom: "1px solid rgba(255,255,255,0.04)", flexShrink: 0 }}>
            <div style={{ display: "flex", gap: 2, overflowX: "auto", scrollbarWidth: "none" }}>
              {GENRES_TABS.map(g => (
                <button
                  key={g}
                  onClick={() => setActiveGenre(g)}
                  style={{
                    flexShrink: 0,
                    fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase", fontWeight: 600,
                    padding: "14px 18px",
                    cursor: "pointer",
                    background: "transparent",
                    border: "none",
                    borderBottom: activeGenre === g ? "2px solid #e50914" : "2px solid transparent",
                    color: activeGenre === g ? "#fff" : "rgba(255,255,255,0.28)",
                    fontFamily: "'DM Sans', sans-serif",
                    transition: "all 0.18s",
                  }}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* ── BODY ── */}
          {loading ? (
            <div style={{ padding: "40px clamp(16px,3vw,28px)", display: "flex", flexDirection: "column", gap: 32 }}>
              {[1, 2].map(i => (
                <div key={i}>
                  <div style={{ height: 22, width: 200, background: "rgba(255,255,255,0.05)", borderRadius: 4, marginBottom: 16, position: "relative", overflow: "hidden" }}>
                    <div className="dj-shimmer" />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 12 }}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <div key={j} style={{ paddingTop: "144%", background: "#0c0c0e", borderRadius: 10, position: "relative", overflow: "hidden" }}>
                        <div className="dj-shimmer" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Featured Banner — only show on All tab with no search */}
              {activeGenre === "All" && !searchVal && !freeOnly && !dubbedOnly && (
                <FeaturedBanner movie={featured} onPlay={handlePlay} />
              )}

              <div style={{ padding: "clamp(20px,3vw,40px) clamp(16px,3vw,28px) 80px" }}>

                {/* Search results header */}
                {searchVal && (
                  <div style={{ marginBottom: 24 }}>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontFamily: "'DM Sans', sans-serif", margin: 0 }}>
                      {sorted.length} result{sorted.length !== 1 ? "s" : ""} for <span style={{ color: "#fff" }}>"{searchVal}"</span>
                    </p>
                  </div>
                )}

                {/* Active filter pills */}
                {(freeOnly || dubbedOnly) && (
                  <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
                    {freeOnly && (
                      <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, padding: "5px 12px", background: "rgba(229,9,20,0.1)", border: "1px solid rgba(229,9,20,0.2)", borderRadius: 4, color: "#e50914", fontFamily: "'DM Sans', sans-serif" }}>
                        Free to Watch <button onClick={() => setFreeOnly(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", padding: 0, display: "flex" }}><X size={10} /></button>
                      </span>
                    )}
                    {dubbedOnly && (
                      <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, padding: "5px 12px", background: "rgba(255,180,0,0.1)", border: "1px solid rgba(255,180,0,0.2)", borderRadius: 4, color: "rgba(255,200,50,0.9)", fontFamily: "'DM Sans', sans-serif" }}>
                        <Mic2 size={10} /> DJ Afro Dubbed <button onClick={() => setDubbedOnly(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", padding: 0, display: "flex" }}><X size={10} /></button>
                      </span>
                    )}
                  </div>
                )}

                {/* Content */}
                {sorted.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "80px 20px" }}>
                    <div style={{ fontSize: "3rem", marginBottom: 16 }}>🎬</div>
                    <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", margin: "0 0 8px" }}>No Movies Found</h3>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.18)", fontFamily: "'DM Sans', sans-serif" }}>Try adjusting your filters or search query</p>
                  </div>
                ) : activeGenre === "All" && !searchVal ? (
                  // Genre-grouped layout
                  Object.entries(genreGroups).map(([g, movies]) => (
                    <GenreSection key={g} genre={g} movies={movies} view={view} />
                  ))
                ) : (
                  // Flat layout
                  view === "grid" ? (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
                      {sorted.map(m => <MovieCard key={m.id} movie={m} view="grid" />)}
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {sorted.map(m => <MovieCard key={m.id} movie={m} view="list" />)}
                    </div>
                  )
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        html, body { background: #080808; color: #fff; margin: 0; padding: 0; overflow: hidden; }
        #movies-scroll-col::-webkit-scrollbar { display: none; }
        #movies-scroll-col { scrollbar-width: none; }
        @keyframes djShimmer {
          0%   { background-position: -700px 0; }
          100% { background-position:  700px 0; }
        }
        .dj-shimmer {
          position: absolute; inset: 0;
          background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0) 100%);
          background-size: 700px 100%;
          animation: djShimmer 1.6s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}