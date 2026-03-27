"use client";

import { useState, useEffect, useRef } from "react";

const TRENDING = [
  {
    rank: 1,
    title: "The Iron Fist",
    genre: "Action",
    year: 2023,
    rating: 9.2,
    views: "142K",
    duration: "2h 18m",
    isPremium: true,
    poster: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=600&q=80",
    trend: "+24%",
    desc: "A relentless warrior fights through the underworld to reclaim what was stolen.",
    tags: ["Brutal", "Intense", "Edge-of-seat"],
  },
  {
    rank: 2,
    title: "Kampala Queen",
    genre: "Drama",
    year: 2023,
    rating: 8.9,
    views: "98K",
    duration: "1h 54m",
    isPremium: false,
    poster: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=600&q=80",
    trend: "+18%",
    desc: "A powerful woman navigates love, betrayal and empire in East Africa's most vibrant city.",
    tags: ["Bold", "Emotional", "Gripping"],
  },
  {
    rank: 3,
    title: "Mombasa Nights",
    genre: "Romance",
    year: 2024,
    rating: 8.5,
    views: "87K",
    duration: "2h 02m",
    isPremium: true,
    poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&q=80",
    trend: "+15%",
    desc: "Under the Indian Ocean stars, two strangers discover a love that defies all reason.",
    tags: ["Passionate", "Cinematic", "Unforgettable"],
  },
  {
    rank: 4,
    title: "Last Soldier",
    genre: "War",
    year: 2023,
    rating: 8.3,
    views: "75K",
    duration: "2h 31m",
    isPremium: false,
    poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80",
    trend: "+11%",
    desc: "One man. One mission. An entire nation's fate resting on a single heartbeat.",
    tags: ["Heroic", "Raw", "Gut-wrenching"],
  },
  {
    rank: 5,
    title: "Shadow Empire",
    genre: "Crime",
    year: 2024,
    rating: 8.1,
    views: "64K",
    duration: "2h 09m",
    isPremium: true,
    poster: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&q=80",
    trend: "+9%",
    desc: "In the shadows of the city's neon glow, a criminal empire rises — and must fall.",
    tags: ["Stylish", "Dark", "Atmospheric"],
  },
];

export default function TrendingRow() {
  const [hovered, setHovered] = useState<number | null>(null);
  const [inView, setInView] = useState(false);
  const [counters, setCounters] = useState(TRENDING.map(() => 0));
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.12 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    TRENDING.forEach((movie, i) => {
      const target = movie.rating * 10;
      let cur = 0;
      const step = target / 32;
      const iv = setInterval(() => {
        cur += step;
        if (cur >= target) { cur = target; clearInterval(iv); }
        setCounters((prev) => { const n = [...prev]; n[i] = cur / 10; return n; });
      }, 22 + i * 8);
    });
  }, [inView]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        /* ── FIXED BACKGROUND ──
           background-attachment:fixed keeps the image locked to the
           viewport while the section scrolls over it — no JS needed   */
        #trending-section {
          position: relative;
          background-image: url('/images/bg.jpg');
          background-size: cover;
          background-position: center center;
          background-attachment: fixed;
          font-family: 'DM Sans', sans-serif;
          overflow: hidden;
        }

        /* Dark overlay so content is always readable */
        #trending-section .tr-veil {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            linear-gradient(to bottom,
              rgba(7,7,7,0.97)  0%,
              rgba(7,7,7,0.80) 15%,
              rgba(7,7,7,0.80) 85%,
              rgba(7,7,7,0.97) 100%),
            radial-gradient(ellipse 100% 60% at 50% 50%,
              transparent 25%,
              rgba(7,7,7,0.45) 100%);
        }

        /* Grain */
        #trending-section .tr-grain {
          position: absolute; inset: 0; pointer-events: none;
          opacity: 0.042;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 180px 180px;
        }

        /* Subtle scan lines */
        #trending-section .tr-lines {
          position: absolute; inset: 0; pointer-events: none; opacity: 0.022;
          background-image: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,1) 2px, rgba(255,255,255,1) 3px);
        }

        /* Red ambient top glow */
        #trending-section .tr-glow {
          position: absolute;
          top: -140px; left: 50%; transform: translateX(-50%);
          width: 1000px; height: 320px;
          background: radial-gradient(ellipse, rgba(229,9,20,0.13) 0%, transparent 62%);
          pointer-events: none;
        }

        /* ── ROW ── */
        .tr-row {
          display: grid;
          grid-template-columns: 72px 1fr;
          align-items: stretch;
          position: relative;
          cursor: pointer;
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 3px;
          border: 1px solid rgba(255,255,255,0.04);
          border-left: 2px solid transparent;
          transition:
            background 0.4s ease,
            border-color 0.4s ease,
            border-left-color 0.4s ease,
            opacity 0.6s ease,
            transform 0.55s cubic-bezier(0.22,1,0.36,1);
        }
        .tr-row.tr-hov {
          background: linear-gradient(90deg, rgba(229,9,20,0.07) 0%, rgba(255,255,255,0.015) 100%);
          border-color: rgba(229,9,20,0.16);
          border-left-color: #e50914;
        }
        .tr-row.tr-in  { opacity: 1; transform: translateX(0); }
        .tr-row.tr-out { opacity: 0; transform: translateX(-26px); }

        /* Rank watermark */
        .tr-wm {
          position: absolute;
          left: 52px; top: 50%; transform: translateY(-50%);
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(90px, 13vw, 148px);
          letter-spacing: -0.04em;
          line-height: 1;
          pointer-events: none;
          user-select: none;
          transition: color 0.4s, opacity 0.4s;
        }

        /* Poster */
        .tr-poster {
          flex-shrink: 0;
          overflow: hidden;
          border-radius: 2px;
          position: relative;
          transition:
            transform 0.45s cubic-bezier(0.22,1,0.36,1),
            box-shadow 0.45s ease;
        }
        .tr-poster.tr-ph {
          transform: scale(1.07) translateY(-2px);
          box-shadow: 0 14px 44px rgba(0,0,0,0.85), 0 0 0 1px rgba(229,9,20,0.35);
        }
        .tr-poster img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .tr-poster-g {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 50%);
        }
        .tr-dot {
          position: absolute; top: 5px; right: 5px;
          width: 6px; height: 6px; border-radius: 50%;
          background: #e50914; box-shadow: 0 0 7px #e50914;
        }

        /* Desc / tags slide */
        .tr-desc {
          font-size: 11px; color: rgba(255,255,255,0.36);
          line-height: 1.55; max-width: 440px; overflow: hidden;
          transition: max-height 0.42s cubic-bezier(0.22,1,0.36,1), opacity 0.38s;
        }
        .tr-tags {
          display: flex; gap: 6px; flex-wrap: wrap; overflow: hidden;
          transition: max-height 0.42s 0.05s cubic-bezier(0.22,1,0.36,1), opacity 0.38s 0.05s;
        }
        .tr-tag {
          font-size: 7px; letter-spacing: 0.28em; text-transform: uppercase;
          color: rgba(255,255,255,0.26); border: 1px solid rgba(255,255,255,0.07);
          padding: 2px 8px; border-radius: 1px;
        }

        /* Rating pips */
        .tr-pip {
          width: 10px; height: 2px; border-radius: 1px;
          transition: background 0.3s;
        }

        /* Play btn */
        .tr-play {
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          border-radius: 50%; outline: none;
          transition: all 0.35s cubic-bezier(0.22,1,0.36,1);
        }
        .tr-play:hover { transform: scale(1.15) !important; }

        /* CTA */
        .tr-cta {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 20px; padding: 28px 36px;
          border-radius: 3px; position: relative; overflow: hidden;
          border: 1px solid rgba(229,9,20,0.16);
          background: linear-gradient(135deg,
            rgba(229,9,20,0.07) 0%,
            rgba(255,255,255,0.01) 55%,
            rgba(229,9,20,0.04) 100%);
        }
        .tr-cta-btn {
          display: inline-flex; align-items: center; gap: 10px;
          text-decoration: none; background: #e50914; color: #fff;
          font-size: 9px; letter-spacing: 0.45em; text-transform: uppercase;
          font-weight: 700; padding: 14px 32px; border-radius: 2px;
          font-family: 'DM Sans', sans-serif;
          box-shadow: 0 0 32px rgba(229,9,20,0.26);
          transition: box-shadow 0.3s, transform 0.3s;
        }
        .tr-cta-btn:hover {
          box-shadow: 0 0 52px rgba(229,9,20,0.54);
          transform: translateY(-2px);
        }

        /* Live pulse */
        @keyframes trPulse {
          0%,100% { opacity:1; transform:scale(1);   box-shadow:0 0 8px #e50914; }
          50%      { opacity:.5; transform:scale(.8); box-shadow:0 0 3px #e50914; }
        }
        .tr-live-dot {
          width:6px; height:6px; border-radius:50%; background:#e50914;
          animation: trPulse 1.6s ease-in-out infinite;
        }

        /* Row separator */
        .tr-sep {
          position:absolute; bottom:0; left:72px; right:0;
          height:1px; background:rgba(255,255,255,0.038);
        }
      `}</style>

      <section
        id="trending-section"
        ref={sectionRef}
      >
        {/* Atmospheric layers */}
        <div className="tr-veil" />
        <div className="tr-grain" />
        <div className="tr-lines" />
        <div className="tr-glow" />

        {/* All content sits above the layers */}
        <div style={{ position: "relative", zIndex: 10, padding: "96px 0 108px" }}>

          {/* ── HEADER ── */}
          <div style={{ padding: "0 48px", marginBottom: "60px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "18px" }}>
              <div style={{ width: "1px", height: "38px", background: "linear-gradient(to bottom, transparent, #e50914, transparent)" }} />
              <div>
                <span style={{ fontSize: "9px", letterSpacing: "0.55em", textTransform: "uppercase", color: "#e50914", fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>
                  ◈ LIVE RANKINGS ◈
                </span>
                <div style={{ height: "1px", marginTop: "3px", background: "linear-gradient(90deg, #e50914, transparent)", width: "110px" }} />
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
              <h2 style={{
                margin: 0, fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "clamp(54px, 8vw, 88px)",
                lineHeight: 0.88, letterSpacing: "0.05em", color: "#fff",
              }}>
                TRENDING<br />
                <span style={{ color: "transparent", WebkitTextStroke: "1.5px rgba(229,9,20,0.42)", fontSize: "0.82em" }}>
                  THIS WEEK
                </span>
              </h2>

              <div style={{
                display: "flex", alignItems: "center", gap: "10px",
                background: "rgba(229,9,20,0.07)",
                border: "1px solid rgba(229,9,20,0.18)",
                borderRadius: "3px", padding: "10px 18px", marginBottom: "6px",
              }}>
                <div className="tr-live-dot" />
                <span style={{ fontSize: "9px", letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(255,255,255,0.42)", fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                  LIVE
                </span>
              </div>
            </div>

            <div style={{
              marginTop: "22px", height: "1px",
              background: "linear-gradient(90deg, #e50914 0%, rgba(229,9,20,0.22) 35%, transparent 70%)",
            }} />
          </div>

          {/* ── ROWS ── */}
          <div style={{ padding: "0 48px" }}>
            {TRENDING.map((movie, idx) => {
              const isH = hovered === movie.rank;
              return (
                <div
                  key={movie.rank}
                  className={`tr-row${isH ? " tr-hov" : ""} ${inView ? "tr-in" : "tr-out"}`}
                  style={{ transitionDelay: `${idx * 72}ms` }}
                  onMouseEnter={() => setHovered(movie.rank)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => (window.location.href = "/login")}
                >
                  {/* Watermark */}
                  <div className="tr-wm" style={{ color: isH ? "#e50914" : "#fff", opacity: isH ? 0.055 : 0.026 }}>
                    {String(movie.rank).padStart(2, "0")}
                  </div>

                  {/* Rank column */}
                  <div style={{
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    position: "relative", zIndex: 2, padding: "22px 0",
                  }}>
                    <div style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: "clamp(20px, 2.8vw, 30px)", letterSpacing: "0.04em",
                      color: isH ? "#e50914" : "rgba(255,255,255,0.2)",
                      transition: "color 0.3s", lineHeight: 1,
                    }}>
                      {String(movie.rank).padStart(2, "0")}
                    </div>
                    <div style={{
                      width: "18px", height: "1px", margin: "5px auto",
                      background: isH ? "#e50914" : "rgba(255,255,255,0.1)",
                      transition: "background 0.3s",
                    }} />
                    <div style={{
                      fontSize: "7px", letterSpacing: "0.28em", textTransform: "uppercase",
                      color: isH ? "rgba(229,9,20,0.55)" : "rgba(255,255,255,0.12)",
                      transition: "color 0.3s", fontFamily: "'DM Sans', sans-serif",
                    }}>RANK</div>
                  </div>

                  {/* Content */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "auto 1fr auto",
                    alignItems: "center",
                    position: "relative", zIndex: 2,
                  }}>
                    {/* Poster */}
                    <div
                      className={`tr-poster${isH ? " tr-ph" : ""}`}
                      style={{ width: "clamp(48px, 5.2vw, 66px)", aspectRatio: "2/3", margin: "14px 18px 14px 0" }}
                    >
                      <img src={movie.poster} alt={movie.title} />
                      <div className="tr-poster-g" />
                      {movie.isPremium && <div className="tr-dot" />}
                    </div>

                    {/* Info */}
                    <div style={{ padding: "18px 0", minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "8px", letterSpacing: "0.45em", textTransform: "uppercase", color: "#e50914", fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>
                          {movie.genre}
                        </span>
                        <span style={{ color: "rgba(255,255,255,0.1)", fontSize: "8px" }}>◆</span>
                        <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.26)", letterSpacing: "0.1em", fontFamily: "'DM Sans', sans-serif" }}>
                          {movie.year}
                        </span>
                        {movie.isPremium && (
                          <span style={{
                            fontSize: "7px", letterSpacing: "0.3em", textTransform: "uppercase",
                            color: "#e50914", border: "1px solid rgba(229,9,20,0.26)",
                            background: "rgba(229,9,20,0.07)", padding: "2px 7px", borderRadius: "1px",
                            fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
                          }}>Premium</span>
                        )}
                      </div>

                      <div style={{
                        fontFamily: "'Bebas Neue', sans-serif",
                        fontSize: "clamp(17px, 2.4vw, 25px)", letterSpacing: "0.05em",
                        color: isH ? "#ffffff" : "rgba(255,255,255,0.72)",
                        lineHeight: 1, marginBottom: "7px",
                        transition: "color 0.3s",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>
                        {movie.title}
                      </div>

                      <div className="tr-desc" style={{ maxHeight: isH ? "36px" : "0px", opacity: isH ? 1 : 0, marginBottom: isH ? "7px" : "0" }}>
                        {movie.desc}
                      </div>
                      <div className="tr-tags" style={{ maxHeight: isH ? "26px" : "0px", opacity: isH ? 1 : 0 }}>
                        {movie.tags.map((t) => <span key={t} className="tr-tag">{t}</span>)}
                      </div>
                    </div>

                    {/* Stats + play */}
                    <div style={{
                      display: "flex", flexDirection: "column",
                      alignItems: "flex-end", gap: "10px",
                      padding: "18px 22px", flexShrink: 0,
                    }}>
                      <div>
                        <div style={{
                          fontFamily: "'Bebas Neue', sans-serif",
                          fontSize: "clamp(22px, 2.8vw, 33px)", letterSpacing: "0.02em",
                          color: isH ? "#fff" : "rgba(255,255,255,0.48)",
                          lineHeight: 1, transition: "color 0.3s", textAlign: "right",
                        }}>
                          {counters[idx].toFixed(1)}
                        </div>
                        <div style={{ display: "flex", gap: "2px", marginTop: "3px", justifyContent: "flex-end" }}>
                          {[...Array(5)].map((_, si) => (
                            <div key={si} className="tr-pip" style={{
                              background: si < Math.round(movie.rating / 2) ? "#e50914" : "rgba(255,255,255,0.1)",
                            }} />
                          ))}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.2em", marginBottom: "2px", fontFamily: "'DM Sans', sans-serif" }}>
                          {movie.views} views
                        </div>
                        <div style={{ fontSize: "10px", fontWeight: 700, color: "#4ade80", letterSpacing: "0.05em", fontFamily: "'DM Sans', sans-serif" }}>
                          ↑ {movie.trend}
                        </div>
                      </div>
                      <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.16)", letterSpacing: "0.28em", fontFamily: "'DM Sans', sans-serif" }}>
                        {movie.duration}
                      </div>
                      <button
                        className="tr-play"
                        onClick={(e) => { e.stopPropagation(); window.location.href = "/login"; }}
                        style={{
                          width: "42px", height: "42px",
                          background: isH ? "#e50914" : "rgba(255,255,255,0.05)",
                          border: isH ? "none" : "1px solid rgba(255,255,255,0.09)",
                          transform: isH ? "scale(1.08)" : "scale(0.88)",
                          opacity: isH ? 1 : 0.38,
                          boxShadow: isH ? "0 0 26px rgba(229,9,20,0.5), 0 0 60px rgba(229,9,20,0.16)" : "none",
                        }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="white">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="tr-sep" />
                </div>
              );
            })}
          </div>

          {/* ── CTA ── */}
          <div style={{ margin: "58px 48px 0" }}>
            <div className="tr-cta">
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: "1px",
                background: "linear-gradient(90deg, transparent, rgba(229,9,20,0.38), transparent)",
              }} />
              <div>
                <div style={{ fontSize: "8px", letterSpacing: "0.55em", textTransform: "uppercase", color: "#e50914", marginBottom: "6px", fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>
                  ◈ DJ AFRO STREAMING
                </div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(18px, 2.8vw, 26px)", color: "#fff", letterSpacing: "0.06em" }}>
                  DISCOVER YOUR NEXT OBSESSION
                </div>
              </div>
              <a href="/login" className="tr-cta-btn">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
                Stream Now — Free
              </a>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}