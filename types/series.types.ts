// =============================================================================
// types/series.types.ts
// =============================================================================

export interface Series {
    $id:              string;
    title:            string;
    description:      string | null;
    ai_summary:       string | null;
    genre:            string[];
    poster_url:       string | null;
    banner_url:       string | null;
    premium_only:     boolean;
    download_enabled: boolean;
    view_count:       number;
    rating:           number;
    is_featured:      boolean;
    is_trending:      boolean;
    tags:             string[];
    release_year:     string | null;
    total_seasons:    number;
    total_episodes:   number;
    status:           "ongoing" | "completed" | "hiatus";
    $createdAt:       string;
    $updatedAt:       string;
  }
  
  export interface Episode {
    $id:              string;
    series_id:        string;
    title:            string;
    description:      string | null;
    episode_number:   number;
    season_number:    number;
    duration:         string | null;
    video_url:        string | null;
    telegram_file_id: string | null;
    channel_id:       string | null;
    message_id:       string | null;
    thumbnail_url:    string | null;
    premium_only:     boolean;
    download_enabled: boolean;
    view_count:       number;
    tags:             string[];
    $createdAt:       string;
    $updatedAt:       string;
  }
  
  export type SeriesSortField = "$createdAt" | "$updatedAt" | "rating" | "view_count" | "title" | "release_year";
  
  export interface SeriesFilters {
    genre?:       string;
    is_featured?: boolean;
    is_trending?: boolean;
    premium_only?: boolean;
    release_year?: string;
    status?:      "ongoing" | "completed" | "hiatus";
    search?:      string;
    sortBy?:      SeriesSortField;
    sortOrder?:   "asc" | "desc";
    limit?:       number;
    offset?:      number;
  }
  
  export interface SeriesPage {
    series:     Series[];
    total:      number;
    hasMore:    boolean;
    nextOffset: number;
  }
  
  export interface EpisodePage {
    episodes:   Episode[];
    total:      number;
    hasMore:    boolean;
    nextOffset: number;
  }
  
  export interface SeriesSearchResult {
    series: Series[];
    query:  string;
    total:  number;
  }
  
  // ── Appwrite collection attributes to create ──────────────────────────────────
  //
  // SERIES COLLECTION  (Collection ID: "series")
  // ─────────────────────────────────────────────
  //  title             string  size:500    required
  //  description       string  size:2000   optional
  //  ai_summary        string  size:1000   optional
  //  genre[]           string  size:1000   optional  (array)
  //  poster_url        string  size:1000   optional
  //  banner_url        string  size:1000   optional
  //  premium_only      boolean             default:false
  //  download_enabled  boolean             default:true
  //  view_count        integer             default:0
  //  rating            double              default:0
  //  is_featured       boolean             default:false
  //  is_trending       boolean             default:false
  //  tags[]            string  size:500    optional  (array)
  //  release_year      string  size:200    optional
  //  total_seasons     integer             default:1
  //  total_episodes    integer             default:0
  //  status            string  size:50     default:"ongoing"
  //  (+ $id, $createdAt, $updatedAt auto)
  //
  //
  // EPISODES COLLECTION  (Collection ID: "episodes")
  // ──────────────────────────────────────────────────
  //  series_id         string  size:200    required  ← index this!
  //  title             string  size:500    required
  //  description       string  size:2000   optional
  //  episode_number    integer             default:1
  //  season_number     integer             default:1
  //  duration          string  size:250    optional
  //  video_url         string  size:1000   optional
  //  drive_file_id     string  size:200    optional
  //  telegram_file_id  string  size:200    optional
  //  channel_id        string  size:200    optional
  //  message_id        string  size:200    optional
  //  thumbnail_url     string  size:1000   optional
  //  premium_only      boolean             default:false
  //  download_enabled  boolean             default:true
  //  view_count        integer             default:0
  //  tags[]            string  size:500    optional  (array)
  //  (+ $id, $createdAt, $updatedAt auto)
  //
  // INDEX to create on episodes collection:
  //   Key: series_id_idx   Attribute: series_id   Type: Key   Order: ASC