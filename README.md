# 🎬 DjAfroCinema — PWA Movie Streaming Platform

> East Africa's premier movie streaming platform. Built for Kenyans, by a Kenyan.
> Powered by DJ Afro dubbed movies, Bollywood, and African cinema.

---

## 🌍 Project Overview

DjAfroCinema is a Progressive Web App (PWA) built with Next.js that allows users to stream and download movies. The platform targets East African audiences, primarily Kenya, and is optimized for low-bandwidth environments, mobile-first usage, and installability on any device (Android, iPhone, Desktop, Smart TV).

The business model is **freemium** — free movies available to all, premium movies unlocked for **10 KSh** via M-Pesa STK Push. No Google Play, no 30% cut. Direct to customer.

**Current traction:**
- 1,200+ app downloads
- ~10,000 TikTok followers
- Functional streaming already tested on TV box, iPhone, Android, Desktop

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ (App Router, TypeScript) |
| Styling | Tailwind CSS + SASS (for animations & complex styles) |
| Backend/BaaS | Appwrite (Auth, Database, Storage metadata) |
| File Storage | Cloudflare R2 (movies & posters — zero egress fees) |
| Payments | M-Pesa Daraja API (STK Push) |
| Auth | Appwrite Auth + Google OAuth |
| Deployment | Vercel or Cloudflare Pages |
| PWA | next-pwa (service worker, offline support, installable) |

---

## ✅ What's Already Working (Existing App)

- Appwrite Auth — user accounts, login, registration
- M-Pesa STK Push — 10 KSh payment for premium movies
- Movie streaming — tested on TV box, mobile, desktop
- Movie database — titles, posters, descriptions, premium flags
- Cloudflare R2 — movies uploaded and accessible
- Admin panel — add/edit/delete movies (separate internal tool)

---

## 🎨 UI/UX Vision

This is NOT a typical vibe-coded app. The UI must be **world-class, cinematic, and unforgettable.**

### Design Principles
- **Cinematic dark aesthetic** with rich blacks, deep contrast
- **Multiple themes** — Dark (default), Light, Midnight Blue, Warm Amber, Neon (for fun)
- **Smooth animations** — page transitions, skeleton loaders, hover effects, scroll reveals
- **Mobile-first** with bottom navigation bar on mobile
- **Desktop** — sidebar nav, wide movie grid, immersive hero sections
- **Smart TV** — large text, D-pad navigable, full-screen optimized
- **Micro-interactions** everywhere — button presses, card hovers, loading states
- **Typography** — bold, cinematic display fonts paired with clean readable body fonts

### Key Pages & Screens

#### 1. Landing Page (unauthenticated)
- Full-screen hero with movie backdrop/trailer autoplay
- Animated tagline — "East Africa's Movies. Your Way."
- Featured movies carousel
- "Install App" CTA prominent
- Social proof — download count, user count
- How it works section
- Footer with WhatsApp group link, contact

#### 2. Home (authenticated)
- Personalized greeting — "Habari [Name] 👋"
- Continue watching row
- Trending Now row
- New Arrivals row
- Featured/Hero movie banner (full width)
- Genre browsing rows (Action, Comedy, Bollywood, Afro, etc.)

#### 3. Movie Detail Page
- Full backdrop image
- Movie info — title, year, rating, duration, genre tags
- Description
- Watch / Download buttons
- Premium badge + Pay 10 KSh CTA (if premium)
- Related movies

#### 4. Watch/Player Page
- Clean full-screen video player
- Custom controls
- Works on TV, mobile, desktop

#### 5. Search Page
- Instant search with debounce
- Filter by genre, year, premium/free
- Beautiful empty states

#### 6. Profile Page
- User avatar, name, email
- Theme switcher (5 themes)
- Watch history
- Downloaded movies
- Subscription/payment history
- Settings

#### 7. Auth Pages
- Login — Email/Password + **Google Sign-In** (one tap)
- Register — minimal fields (name, email, password)
- Forgot password
- Design: clean, fast, no friction — Kenyans leave if signup is hard

### Navigation

**Mobile (bottom nav):**
```
🏠 Home | 🔍 Search | 🎬 Movies | 👤 Profile
```

**Desktop (sidebar):**
```
Logo
─────
🏠 Home
🎬 Movies
🔍 Search
⭐ Premium
─────
👤 Profile
⚙️ Settings
💬 WhatsApp
```

---

## 📁 Project Structure

```
djafrocinema/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── forgot-password/page.tsx
│   ├── (main)/
│   │   ├── home/page.tsx
│   │   ├── movies/page.tsx
│   │   ├── movies/[id]/page.tsx
│   │   ├── watch/[id]/page.tsx
│   │   ├── search/page.tsx
│   │   └── profile/page.tsx
│   ├── landing/page.tsx (unauthenticated homepage)
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/              # Reusable UI — Button, Card, Modal, Badge, Skeleton
│   ├── movies/          # MovieCard, MovieRow, MovieHero, MoviePlayer
│   ├── layout/          # Navbar, Sidebar, BottomNav, Footer
│   ├── auth/            # LoginForm, GoogleButton, AuthGuard
│   └── payment/         # MpesaModal, PaymentStatus
├── lib/
│   ├── appwrite.ts      # Appwrite client config
│   ├── r2.ts            # Cloudflare R2 URL helpers
│   ├── mpesa.ts         # Daraja STK Push logic
│   └── utils.ts         # Helpers
├── hooks/
│   ├── useAuth.ts       # Auth state, login, logout, Google OAuth
│   ├── useMovies.ts     # Fetch movies, search, filter
│   ├── usePayment.ts    # M-Pesa STK Push flow
│   └── useTheme.ts      # Theme switching
├── store/               # Zustand global state (auth, theme, cart)
├── styles/
│   ├── themes.scss      # All 5 theme CSS variables
│   └── animations.scss  # Reusable animation classes
├── public/
│   ├── manifest.json    # PWA manifest
│   ├── icons/           # App icons all sizes
│   └── sw.js            # Service worker (auto-generated by next-pwa)
├── api/ (Next.js API routes)
│   ├── mpesa/
│   │   ├── stkpush/route.ts     # Initiate STK push
│   │   └── callback/route.ts    # Daraja callback handler
│   └── movies/
│       └── [id]/stream/route.ts # Signed URL generator for R2
└── middleware.ts         # Auth protection for routes
```

---

## 🔐 Appwrite Collections (Database)

### `movies` collection
| Field | Type | Notes |
|---|---|---|
| title | string | Movie title |
| year | number | Release year |
| duration | number | Minutes |
| description | string | Full description |
| genre | string[] | Array of genres |
| posterUrl | string | R2 or external URL |
| videoUrl | string | R2 signed URL |
| isPremium | boolean | Free or 10 KSh |
| price | number | Default 10 |
| rating | number | 0-10 |
| tags | string[] | Search tags |
| viewCount | number | |
| downloadCount | number | |
| isFeatured | boolean | |
| isTrending | boolean | |
| qualityOptions | string[] | 480p, 720p, 1080p |

### `users` collection (extends Appwrite Auth)
| Field | Type | Notes |
|---|---|---|
| userId | string | Appwrite user ID |
| displayName | string | |
| avatar | string | URL |
| theme | string | dark/light/midnight/amber/neon |
| watchHistory | string[] | Movie IDs |
| downloads | string[] | Movie IDs |
| isPremium | boolean | |

### `payments` collection
| Field | Type | Notes |
|---|---|---|
| userId | string | |
| movieId | string | |
| amount | number | KSh |
| mpesaRef | string | Daraja transaction ID |
| status | string | pending/success/failed |
| createdAt | datetime | |

### `purchases` collection
| Field | Type | Notes |
|---|---|---|
| userId | string | |
| movieId | string | |
| paidAt | datetime | |

---

## 💳 M-Pesa Payment Flow

1. User clicks **"Watch — 10 KSh"** on premium movie
2. Modal opens — user enters their phone number (07xx...)
3. App calls `/api/mpesa/stkpush` → triggers Daraja STK Push
4. User gets M-Pesa prompt on their phone → enters PIN
5. Daraja calls `/api/mpesa/callback` with result
6. On success → record in `payments` + `purchases` collections
7. User gets access to movie instantly
8. UI updates — Watch button unlocked

---

## 🔑 Google Sign-In Flow

1. User clicks "Continue with Google"
2. Appwrite OAuth2 → Google consent screen
3. Callback → Appwrite creates/finds user
4. Redirect to home
5. If new user → create profile doc in `users` collection

---

## 🎨 Themes

```scss
// 5 themes via CSS variables on :root / [data-theme]
dark        → #0a0a0a bg, #ffffff text, #e50914 accent (Netflix-like)
light       → #f5f5f5 bg, #111111 text, #e50914 accent
midnight    → #0d0d2b bg, #e0e0ff text, #7c6bff accent (deep blue)
amber       → #1a1200 bg, #ffd700 text, #ff8c00 accent (warm gold)
neon        → #050505 bg, #00ff88 text, #ff00ff accent (cyberpunk)
```

---

## 📲 PWA Features

- Installable on Android (Add to Home Screen prompt)
- Installable on iPhone (Safari → Share → Add to Home Screen)
- Installable on Desktop (Chrome install button)
- Offline support — cached pages load without internet
- Push notifications (future feature)
- App icon, splash screen, standalone mode (no browser UI)
- `manifest.json` with full icon set

---

## 📞 Community Features

- **WhatsApp Group button** — floating or in nav — opens wa.me link for ordering movies & support
- **Contact/Message** — form that sends to owner's email/phone
- **No built-in forum** (too complex for now, WhatsApp handles this)

---

## 🚀 Deployment

- **Recommended:** Vercel (seamless Next.js, auto SSL, edge functions)
- Domain: `djafrocinema.com` (buy on Namecheap, point to Vercel)
- Cloudflare in front for CDN + R2 storage access
- Environment variables needed:

```env
# Appwrite
NEXT_PUBLIC_APPWRITE_ENDPOINT=
NEXT_PUBLIC_APPWRITE_PROJECT_ID=
APPWRITE_API_KEY=

# Cloudflare R2
R2_ACCOUNT_ID=ae2ac316c0bbad107f670ec6697706f7
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=movies
R2_PUBLIC_URL=

# M-Pesa Daraja
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_SHORTCODE=
MPESA_PASSKEY=
MPESA_CALLBACK_URL=

# Google OAuth (via Appwrite)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

---

## 📣 Marketing Plan

- TikTok — already 10k followers, post clips of movies available on platform
- Email blast — notify existing 1,200+ users about new web app
- WhatsApp groups — share install link
- SEO — "DJ Afro movies online Kenya", "watch DJ Afro movies", "Kenyan movies streaming"
- PWA install prompt — push install CTA aggressively on first visit

---

## 🗺️ Roadmap

- [x] Appwrite Auth working
- [x] M-Pesa STK Push working  
- [x] Cloudflare R2 storage (5 movies uploaded)
- [x] Basic streaming tested on all devices
- [ ] New UI — this project
- [ ] Google Sign-In
- [ ] Multiple themes
- [ ] PWA manifest + service worker
- [ ] Migrate Bunny CDN movies → Cloudflare R2
- [ ] Push notifications
- [ ] Watchlist / Favorites
- [ ] Continue watching (progress tracking)
- [ ] Download for offline viewing

