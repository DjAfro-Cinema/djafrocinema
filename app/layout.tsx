import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { DashboardLayout } from "@/components/dashboard";
import { AuthProvider } from "@/context/AuthContext";


const clashDisplay = localFont({
  src: [
    { path: "../public/fonts/ClashDisplay/ClashDisplay-Semibold.woff2", weight: "600" },
    { path: "../public/fonts/ClashDisplay/ClashDisplay-Bold.woff2",     weight: "700" },
  ],
  variable: "--font-display",
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "DjAfro Cinema- Dj Afro movies, your way",
    template: "%s | DjAfro Cinema",
  },
  description:
    "Stream and download DJ Afro dubbed movies, Bollywood, and African cinema. Kenya's #1 movie streaming platform. Watch online or install as an app on any device.",
  keywords: [
    "DJ Afro movies",
    "DJ Afro cinema",
    "Kenyan movies online",
    "watch DJ Afro",
    "African movies streaming",
    "Bollywood Kenya",
    "East Africa streaming",
    "dubbed movies Kenya",
    "DJ Afro online",
    "Kenya streaming platform",
  ],
  authors: [{ name: "DjAfro Cinema", url: "https://djafrocinema.com" }],
  creator: "DjAfro Cinema",
  publisher: "DjAfro Cinema",
  metadataBase: new URL("https://djafrocinema.com"),
  openGraph: {
    type: "website",
    locale: "en_KE",
    url: "https://djafrocinema.com",
    siteName: "DjAfro Cinema",
    title: "DjAfro Cinema — Enjoy timeless movies, your way",
    description:
      "Stream and download DJ Afro dubbed movies, Bollywood, and African cinema. Kenya's #1 movie streaming platform.",
    images: [
      {
        url: "/logos/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "DjAfro Cinema Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DjAfro Cinema — East Africa's Movies, Your Way",
    description:
      "Stream and download DJ Afro dubbed movies, Bollywood, and African cinema. Kenya's #1 movie streaming platform.",
    images: ["/logos/android-chrome-512x512.png"],
  },
  manifest: "/logos/site.webmanifest",
  icons: {
    icon: [
      { url: "/logos/favicon.ico" },
      { url: "/logos/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/logos/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/logos/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/logos/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/logos/apple-touch-icon.png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DjAfro Cinema",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export const viewport: Viewport = {
  themeColor: "#e50914",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${clashDisplay.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0a0a0a] text-white">
      <AuthProvider>
        {children}
        </AuthProvider>
      </body>
    </html>
  );
}