import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DjAfro Cinema — East Africa's Movies",
    short_name: "DjAfro Cinema",
    description: "Stream DJ Afro dubbed movies, Bollywood & African cinema. Kenya's #1 platform.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#e50914",
    orientation: "portrait",
    categories: ["entertainment"],
    icons: [
      {
        src: "/logos/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/logos/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/logos/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}