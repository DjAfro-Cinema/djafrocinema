import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  cacheOnNavigation: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cloud.appwrite.io" },
      { protocol: "https", hostname: "resizing.flixster.com" },
      { protocol: "https", hostname: "image.tmdb.org" },
      { protocol: "https", hostname: "www.themoviedb.org" },
      { protocol: "https", hostname: "m.media-amazon.com" },
      { protocol: "https", hostname: "posters.movieposterdb.com" },
      { protocol: "https", hostname: "*.b-cdn.net" },
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "www.impawards.com" },
    ],
  },
};

export default withSerwist(nextConfig);