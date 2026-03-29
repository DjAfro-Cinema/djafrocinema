// =============================================================================
// types/movie.types.ts
// =============================================================================

export type VideoQuality = "360p" | "480p" | "720p" | "1080p" | "4K";

export type MovieSortField =
  | "view_count"
  | "rating"
  | "download_count"
  | "$createdAt"
  | "release_year"
  | "title";

export interface Movie {
  $id: string;
  title: string;
  description: string | null;
  ai_summary: string | null;
  genre: string[];
  poster_url: string | null;
  quality_options: VideoQuality[];
  premium_only: boolean;
  download_enabled: boolean;
  view_count: number;
  rating: number;
  download_count: number;
  is_featured: boolean;
  is_trending: boolean;
  tags: string[];
  release_year: string | null;
  duration: string | null;
  video_url: string | null;
  telegram_file_id: string | null;
  channel_id: string | null;
  message_id: string | null;
  $createdAt: string;
  $updatedAt: string;
}

export interface MovieFilters {
  genre?: string;
  search?: string;
  is_featured?: boolean;
  is_trending?: boolean;
  premium_only?: boolean;
  release_year?: string;
  sortBy?: MovieSortField;
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export interface MoviePage {
  movies: Movie[];
  total: number;
  hasMore: boolean;
  nextOffset: number;
}

export interface SearchResult {
  movies: Movie[];
  query: string;
  total: number;
}