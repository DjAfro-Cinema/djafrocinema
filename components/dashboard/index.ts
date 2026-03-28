// ── DjAfro Cinema — Dashboard Component Exports ──────────────────────────────
// Drop the folders into /components/dashboard/ and import from here

export { default as DashboardSidebar } from "./sidebar/DashboardSidebar";
export { default as DashboardLayout, useLayout } from "./layout/DashboardLayout";
export { default as MovieCard, MovieRow, MovieGrid } from "./movie-card/MovieCard";
export type { MovieCardData } from "./movie-card/MovieCard";
export { default as MovieBanner } from "./movie-banner/MovieBanner";
export type { BannerMovie } from "./movie-banner/MovieBanner";
export { default as VideoPlayer, useVideoPlayer } from "./video-player/VideoPlayer";
export type { VideoPlayerProps } from "./video-player/VideoPlayer";