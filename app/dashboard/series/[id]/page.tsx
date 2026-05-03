"use client";

// app/dashboard/series/[id]/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Series detail page — shows all episodes grouped by season.
// User can switch seasons, click an episode to play it (with premium gate),
// and the VideoPlayer opens inline (same as the movie dashboard).
//
// CHANGE: Hero now shows a smaller poster/thumbnail card using banner_url
// instead of a full-bleed banner image. All episode cards fall back to
// series.banner_url when they have no thumbnail_url of their own.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import {
  ChevronLeft, Play, Lock, Star, Clock, Tv,
  Calendar, Layers, CheckCircle2, AlertCircle, Pause,
  Eye,
} from "lucide-react";

import { useDashboardLayout }  from "@/hooks/useDashboardLayout";
import { useAuth }             from "@/hooks/useAuth";
import { useTheme }            from "@/context/ThemeContext";
import { usePremiumGate }      from "@/context/PremiumGateContext";

import DashboardSidebar   from "@/components/dashboard/sidebar/DashboardSidebar";
import MobileBottomNav    from "@/components/dashboard/mobile/MobileBottomNav";
import VideoPlayer, { useVideoPlayer } from "@/components/dashboard/video-player/VideoPlayer";
import { MovieRow }       from "@/components/dashboard/movie-card/MovieCard";

import {
  useSeriesById,
  useEpisodes,
  useRelatedSeries,
  useEpisodeTrackView,
} from "@/hooks/useSeries";
import { seriesService }  from "@/services/series.service";
import { getStreamUrl }   from "@/services/movie.service";
import type { Episode, Series } from "@/types/series.types";
import type { MovieCardData }   from "@/components/dashboard/movie-card/MovieCard";

// ── Helpers ───────────────────────────────────────────────────────────────────

function statusLabel(s: Series["status"]) {
  if (s === "completed") return { text: "Completed",     color: "#4ade80" };
  if (s === "hiatus")    return { text: "On Hiatus",     color: "#fb923c" };
  return                        { text: "Ongoing",       color: "#60a5fa" };
}

function toRelatedCard(s: Series): MovieCardData {
  return {
    id:       s.$id,
    title:    s.title,
    genre:    s.genre[0] ?? "Series",
    year:     parseInt(s.release_year ?? "2024"),
    rating:   s.rating.toFixed(1),
    duration: `${s.total_episodes} eps`,
    premium:  s.premium_only,
    img:      s.poster_url ?? "/images/placeholder.jpg",
  };
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonDetail() {
  const { t } = useTheme();
  return (
    <div style={{ padding: "0" }}>
      {/* Hero skeleton */}
      <div style={{ padding: "40px 28px 32px", display: "flex", gap: 28, alignItems: "flex-start", background: t.bgSurface, position: "relative", overflow: "hidden" }}>
        <div className="dj-shimmer" />
        {/* Poster skeleton */}
        <div className="dj-sk" style={{ width: 180, minWidth: 180, height: 260, borderRadius: 10 }} />
        {/* Meta skeleton */}
        <div style={{ flex: 1 }}>
          <div className="dj-sk" style={{ width: 80, height: 12, marginBottom: 16 }} />
          <div className="dj-sk" style={{ width: 320, height: 36, marginBottom: 16 }} />
          <div className="dj-sk" style={{ width: "70%", height: 14, marginBottom: 8 }} />
          <div className="dj-sk" style={{ width: "50%", height: 14, marginBottom: 24 }} />
          <div style={{ display: "flex", gap: 10 }}>
            {[1,2,3,4].map(i => (
              <div key={i} className="dj-sk" style={{ width: 80, height: 28, borderRadius: 4 }} />
            ))}
          </div>
        </div>
      </div>
      {/* Episodes skeleton */}
      <div style={{ padding: "32px 28px" }}>
        <div className="dj-sk" style={{ width: 200, height: 24, marginBottom: 24 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} style={{ position: "relative", height: 98, background: t.bgSurface, borderRadius: 8, overflow: "hidden" }}>
              <div className="dj-shimmer" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Season Tab Bar ────────────────────────────────────────────────────────────

function SeasonTabs({ seasons, active, onChange }: { seasons: number[]; active: number; onChange: (s: number) => void }) {
  const { t } = useTheme();
  return (
    <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
      {seasons.map(s => (
        <button key={s} onClick={() => onChange(s)} style={{
          flexShrink: 0, padding: "8px 20px",
          border: `1px solid ${active === s ? t.accent : t.borderSubtle}`,
          background: active === s ? t.accent : "transparent",
          color: active === s ? t.textOnAccent : t.textSecondary,
          fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase",
          fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
          cursor: "pointer", borderRadius: 4, transition: "all 0.18s",
        }}>
          Season {s}
        </button>
      ))}
    </div>
  );
}

// ── Episode Card ──────────────────────────────────────────────────────────────

function EpisodeCard({
  episode, index, isPlaying, onPlay, seriesBannerUrl,
}: {
  episode: Episode;
  index: number;
  isPlaying: boolean;
  onPlay: (ep: Episode) => void;
  seriesBannerUrl?: string | null;
}) {
  const { t } = useTheme();
  const [hovered, setHovered] = useState(false);

  // Use episode thumbnail, fall back to series banner_url, then null
  const thumbnailSrc = seriesBannerUrl ?? seriesBannerUrl ?? null;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        gap: 16,
        padding: "14px 16px",
        borderRadius: 8,
        background: isPlaying
          ? `${t.accent}18`
          : hovered ? t.navHoverBg : "transparent",
        border: `1px solid ${isPlaying ? t.accent : hovered ? t.borderAccent : t.borderSubtle}`,
        cursor: "pointer",
        transition: "all 0.15s",
        alignItems: "flex-start",
      }}
      onClick={() => onPlay(episode)}
    >
      {/* Thumbnail / Number */}
      <div style={{
        position: "relative",
        width: 120, minWidth: 120,
        height: 70,
        borderRadius: 6,
        overflow: "hidden",
        background: t.bgSurface,
        flexShrink: 0,
      }}>
        {thumbnailSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailSrc}
            alt={episode.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", color: t.textMuted, letterSpacing: "0.05em" }}>
              {String(episode.episode_number).padStart(2, "0")}
            </span>
          </div>
        )}
        {/* Play overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: hovered || isPlaying ? 1 : 0,
          transition: "opacity 0.15s",
        }}>
          {isPlaying
            ? <Pause size={20} color="#fff" fill="#fff" />
            : <Play  size={20} color="#fff" fill="#fff" />
          }
        </div>
        {episode.premium_only && (
          <div style={{ position: "absolute", top: 5, right: 5, background: t.accent, borderRadius: 3, padding: "2px 5px", display: "flex", alignItems: "center", gap: 3 }}>
            <Lock size={9} color={t.textOnAccent} />
            <span style={{ fontSize: 8, color: t.textOnAccent, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, letterSpacing: "0.05em" }}>PRO</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 9, letterSpacing: "0.35em", textTransform: "uppercase", color: isPlaying ? t.accent : t.textMuted, fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>
            EP {episode.episode_number}
          </span>
          {isPlaying && (
            <span style={{ fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", color: t.accent, fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 5, height: 5, background: t.accent, borderRadius: "50%", animation: "djPulse 2s ease-in-out infinite", display: "inline-block" }} />
              NOW PLAYING
            </span>
          )}
        </div>
        <p style={{ margin: "0 0 4px", fontFamily: "var(--font-display)", fontSize: "0.95rem", color: t.textPrimary, letterSpacing: "0.04em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {episode.title}
        </p>
        {episode.description && (
          <p style={{ margin: 0, fontSize: 11.5, color: t.textMuted, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {episode.description}
          </p>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
          {episode.duration && (
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: t.textMuted, fontFamily: "'DM Sans', sans-serif" }}>
              <Clock size={10} />
              {episode.duration}
            </span>
          )}
          {episode.view_count > 0 && (
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: t.textMuted, fontFamily: "'DM Sans', sans-serif" }}>
              <Eye size={10} />
              {episode.view_count.toLocaleString()} views
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SeriesDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const layout   = useDashboardLayout();
  const { user } = useAuth();
  const { requestPlay } = usePremiumGate();
  const { t }    = useTheme();

  const userName = user?.name || user?.email?.split("@")[0] || "Guest";
  const userObj  = { name: userName, email: user?.email ?? "" };

  const { isMobile, isSmall, sidebarCollapsed, setSidebarCollapsed } = layout;

  const { series, loading: seriesLoading } = useSeriesById(id);
  const [activeSeason, setActiveSeason]   = useState(1);

  // Reset season when series changes
  useEffect(() => { setActiveSeason(1); }, [id]);

  const { episodes, loading: epLoading, seasons } = useEpisodes(id, activeSeason);
  const { items: relatedSeries }                  = useRelatedSeries(series);

  const { playerState, openPlayer, closePlayer }   = useVideoPlayer();
  const [playingEpisodeId, setPlayingEpisodeId]    = useState<string | null>(null);
  const { trackView }                              = useEpisodeTrackView(id, playingEpisodeId);

  useEffect(() => {
    if (playerState.open && playingEpisodeId) trackView();
  }, [playerState.open, playingEpisodeId, trackView]);

  const openEpisodePlayer = useCallback((ep: Episode) => {
    if (!ep.video_url) return;
    setPlayingEpisodeId(ep.$id);
    const streamUrl = getStreamUrl(ep.video_url) ?? ep.video_url;
    openPlayer(
      streamUrl,
      ep.title,
      `${series?.title ?? ""} · S${ep.season_number} E${ep.episode_number}`,
      ep.thumbnail_url ?? series?.banner_url ?? series?.poster_url ?? undefined,
    );
  }, [series, openPlayer]);

  const handlePlayEpisode = useCallback((ep: Episode) => {
    requestPlay({
      movieId:    ep.$id,
      movieTitle: ep.title,
      posterUrl:  ep.thumbnail_url ?? series?.banner_url ?? series?.poster_url ?? undefined,
      isPremium:  ep.premium_only,
      videoUrl:   ep.video_url ?? undefined,
      onUnlocked: () => openEpisodePlayer(ep),
    });
  }, [series, requestPlay, openEpisodePlayer]);

  const status = series ? statusLabel(series.status) : null;

  return (
    <>
      {playerState.open && (
        <VideoPlayer
          src={playerState.src}
          title={playerState.title}
          subtitle={playerState.subtitle}
          poster={playerState.poster}
          onClose={closePlayer}
          autoPlay
        />
      )}

      <div style={{ display: "flex", height: "100svh", background: t.bgBase, overflow: "hidden" }}>
        {!isSmall && (
          <DashboardSidebar
            user={userObj}
            collapsed={sidebarCollapsed}
            onCollapsedChange={setSidebarCollapsed}
          />
        )}

        <div
          id="dj-content-col"
          style={{ flex: 1, minWidth: 0, height: "100svh", overflowY: "auto", overflowX: "hidden", display: "flex", flexDirection: "column" }}
        >
          {seriesLoading ? (
            <SkeletonDetail />
          ) : !series ? (
            <div style={{ padding: 40, color: t.textMuted, fontFamily: "'DM Sans', sans-serif", textAlign: "center" }}>
              <p>Series not found.</p>
              <Link href="/dashboard/series" style={{ color: t.accent, textDecoration: "none", fontSize: 13 }}>← Back to Series</Link>
            </div>
          ) : (
            <>
              {/* ── Hero Section (poster card layout, no full-bleed banner) ── */}
              <div style={{
                position: "relative",
                width: "100%",
                flexShrink: 0,
                overflow: "hidden",
                background: t.bgSurface,
                borderBottom: `1px solid ${t.borderSubtle}`,
              }}>
                {/* Subtle blurred bg derived from the poster for atmosphere */}
                {(series.banner_url ?? series.poster_url) && (
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: `url(${series.banner_url ?? series.poster_url})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    filter: "blur(40px) brightness(0.18) saturate(1.4)",
                    transform: "scale(1.1)",
                    zIndex: 0,
                  }} />
                )}
                {/* Dark overlay for readability */}
                <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${t.bgBase}55 0%, ${t.bgBase}cc 100%)`, zIndex: 1 }} />

                {/* Back button */}
                <Link
                  href="/dashboard/series"
                  style={{
                    position: "absolute", top: 16, left: 16, zIndex: 10,
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "7px 14px",
                    background: `${t.bgBase}cc`,
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    border: `1px solid ${t.borderSubtle}`,
                    borderRadius: 8,
                    textDecoration: "none",
                    color: t.textSecondary,
                    fontSize: 12,
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                  }}
                >
                  <ChevronLeft size={14} />
                  Series
                </Link>

                {/* Hero content — poster + meta side by side */}
                <div style={{
                  position: "relative",
                  zIndex: 2,
                  display: "flex",
                  flexDirection: isSmall ? "column" : "row",
                  gap: isSmall ? 16 : 28,
                  alignItems: isSmall ? "center" : "flex-end",
                  padding: isSmall ? "60px 16px 24px" : "64px 28px 28px",
                }}>

                  {/* ── Poster thumbnail (uses banner_url as the thumb) ── */}
                  <div style={{
                    flexShrink: 0,
                    width: isSmall ? 130 : 170,
                    height: isSmall ? 195 : 255,
                    borderRadius: 10,
                    overflow: "hidden",
                    boxShadow: `0 8px 40px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)`,
                    border: `1px solid ${t.borderSubtle}`,
                    background: t.bgSurface,
                    position: "relative",
                  }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={series.banner_url ?? series.poster_url ?? "/images/placeholder.jpg"}
                      alt={series.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                    {series.premium_only && (
                      <div style={{
                        position: "absolute", top: 8, left: 8,
                        background: t.accent, borderRadius: 4,
                        padding: "3px 8px",
                        display: "flex", alignItems: "center", gap: 4,
                      }}>
                        <Lock size={10} color={t.textOnAccent} />
                        <span style={{ fontSize: 9, color: t.textOnAccent, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, letterSpacing: "0.08em" }}>PREMIUM</span>
                      </div>
                    )}
                  </div>

                  {/* ── Series meta ── */}
                  <div style={{ flex: 1, minWidth: 0, textAlign: isSmall ? "center" : "left" }}>
                    {/* Genre tags + status */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12, justifyContent: isSmall ? "center" : "flex-start" }}>
                      {series.genre.slice(0, 3).map(g => (
                        <span key={g} style={{
                          fontSize: 9, letterSpacing: "0.35em", textTransform: "uppercase",
                          padding: "3px 10px",
                          border: `1px solid ${t.borderAccent}`,
                          borderRadius: 3,
                          color: t.textSecondary,
                          fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                          background: `${t.bgBase}88`,
                          backdropFilter: "blur(8px)",
                        }}>{g}</span>
                      ))}
                      {status && (
                        <span style={{
                          fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase",
                          padding: "3px 10px", borderRadius: 3,
                          color: status.color,
                          fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                          background: `${status.color}22`,
                          border: `1px solid ${status.color}55`,
                        }}>
                          {status.text}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h1 style={{
                      fontFamily: "var(--font-display)",
                      fontSize: isSmall ? "clamp(1.4rem,6vw,1.8rem)" : "clamp(1.8rem, 3vw, 2.6rem)",
                      color: t.textPrimary,
                      letterSpacing: "0.06em",
                      lineHeight: 1.1,
                      margin: "0 0 14px",
                    }}>
                      {series.title}
                    </h1>

                    {/* Stats row */}
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16, marginBottom: 16, justifyContent: isSmall ? "center" : "flex-start" }}>
                      {series.rating > 0 && (
                        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#fbbf24", fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>
                          <Star size={13} fill="#fbbf24" />
                          {series.rating.toFixed(1)}
                        </span>
                      )}
                      {series.release_year && (
                        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: t.textSecondary, fontFamily: "'DM Sans', sans-serif" }}>
                          <Calendar size={12} />
                          {series.release_year}
                        </span>
                      )}
                      <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: t.textSecondary, fontFamily: "'DM Sans', sans-serif" }}>
                        <Layers size={12} />
                        {series.total_seasons} Season{series.total_seasons !== 1 ? "s" : ""}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: t.textSecondary, fontFamily: "'DM Sans', sans-serif" }}>
                        <Tv size={12} />
                        {series.total_episodes} Episodes
                      </span>
                      {series.view_count > 0 && (
                        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: t.textSecondary, fontFamily: "'DM Sans', sans-serif" }}>
                          <Eye size={12} />
                          {series.view_count.toLocaleString()} views
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    {(series.description || series.ai_summary) && (
                      <p style={{
                        fontSize: 13.5,
                        lineHeight: 1.65,
                        color: t.textSecondary,
                        fontFamily: "'DM Sans', sans-serif",
                        maxWidth: 620,
                        margin: 0,
                        display: "-webkit-box",
                        WebkitLineClamp: isSmall ? 3 : 4,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}>
                        {series.description ?? series.ai_summary}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Main Content ─────────────────────────────────────────── */}
              <div style={{ padding: isSmall ? "24px 16px 100px" : "32px 28px 80px" }}>

                {/* Divider */}
                <div style={{ width: "100%", height: 1, background: `linear-gradient(90deg, transparent, ${t.borderAccent}, transparent)`, margin: "0 0 28px" }} />

                {/* Season Tabs + Episodes */}
                <div style={{ marginBottom: 52 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                    <div>
                      <span style={{ fontSize: 9, letterSpacing: "0.45em", textTransform: "uppercase", color: t.accent, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", display: "block", marginBottom: 4 }}>
                        Watch Episodes
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 3, height: 18, background: t.accent, boxShadow: `0 0 8px ${t.accentGlow}` }} />
                        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)", letterSpacing: "0.07em", color: t.textPrimary, margin: 0 }}>
                          All Episodes
                        </h2>
                      </div>
                    </div>
                    {seasons.length > 1 && (
                      <SeasonTabs seasons={seasons} active={activeSeason} onChange={setActiveSeason} />
                    )}
                  </div>

                  {epLoading ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} style={{ position: "relative", height: 98, background: t.bgSurface, borderRadius: 8, overflow: "hidden" }}>
                          <div className="dj-shimmer" />
                        </div>
                      ))}
                    </div>
                  ) : episodes.length === 0 ? (
                    <div style={{ padding: "40px 0", textAlign: "center", color: t.textMuted, fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
                      No episodes in Season {activeSeason} yet.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {episodes.map((ep, idx) => (
                        <EpisodeCard
                          key={ep.$id}
                          episode={ep}
                          index={idx}
                          isPlaying={playerState.open && playingEpisodeId === ep.$id}
                          onPlay={handlePlayEpisode}
                          seriesBannerUrl={series.banner_url ?? series.poster_url}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Related Series */}
                {relatedSeries.length > 0 && (
                  <section style={{ marginBottom: 40 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                      <div style={{ width: 3, height: 18, background: t.accent, boxShadow: `0 0 8px ${t.accentGlow}` }} />
                      <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.1rem, 2vw, 1.5rem)", letterSpacing: "0.07em", color: t.textPrimary, margin: 0 }}>
                        More Like This
                      </h2>
                    </div>
                    <MovieRow
                      title=""
                      movies={relatedSeries.map(toRelatedCard)}
                      onPlay={(card) => {
                        window.location.href = `/dashboard/series/${card.id}`;
                      }}
                      userId={user?.$id ?? ""}
                    />
                  </section>
                )}
              </div>
            </>
          )}
        </div>

        {isSmall && <MobileBottomNav />}
      </div>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        html, body { background: var(--dj-bg-base); color: var(--dj-text-primary); margin: 0; padding: 0; overflow: hidden; }
        #dj-content-col::-webkit-scrollbar { display: none; }
        #dj-content-col { scrollbar-width: none; }
        @keyframes djShimmer { 0%{background-position:-700px 0} 100%{background-position:700px 0} }
        .dj-shimmer { position:absolute;inset:0;background:linear-gradient(90deg,rgba(255,255,255,0) 0%,rgba(255,255,255,0.04) 50%,rgba(255,255,255,0) 100%);background-size:700px 100%;animation:djShimmer 1.6s ease-in-out infinite; }
        .dj-sk { background:var(--dj-bg-elevated);position:relative;overflow:hidden;display:block;border-radius:4px; }
        .dj-sk::after { content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(255,255,255,0) 0%,rgba(255,255,255,0.04) 50%,rgba(255,255,255,0) 100%);background-size:700px 100%;animation:djShimmer 1.6s ease-in-out infinite; }
        @keyframes djPulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>
    </>
  );
}