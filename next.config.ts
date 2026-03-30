import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Appwrite Cloud — your poster_url images
      {
        protocol: "https",
        hostname: "cloud.appwrite.io",
      },
      // Flixster / Rotten Tomatoes CDN (showing up in your movie data)
      {
        protocol: "https",
        hostname: "resizing.flixster.com",
      },
      // TMDB posters (common in movie databases)
      {
        protocol: "https",
        hostname: "image.tmdb.org",
      },
      {
        protocol: "https",
        hostname: "www.themoviedb.org",
      },
      // IMDb
      {
        protocol: "https",
        hostname: "m.media-amazon.com",
      },
      {
        protocol: "https",
        hostname: "posters.movieposterdb.com",
      },
      // Bunny CDN (your video CDN, may serve images too)
      {
        protocol: "https",
        hostname: "*.b-cdn.net",
      },
      // Generic fallback — any https image source
      // Remove this once you know all your poster domains
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "www.impawards.com",
      },
    ],
  },
};

export default nextConfig;