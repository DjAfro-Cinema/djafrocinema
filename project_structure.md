# 📁 djafrocinema - Project Structure

*Generated on: 4/2/2026, 9:28:07 AM*

## 📋 Quick Overview

| Metric | Value |
|--------|-------|
| 📄 Total Files | 174 |
| 📁 Total Folders | 41 |
| 🌳 Max Depth | 4 levels |
| 🛠️ Tech Stack | React, Next.js, TypeScript, CSS, Node.js |

## ⭐ Important Files

- 🟡 🚫 **.gitignore** - Git ignore rules
- 🔵 🔍 **eslint.config.mjs** - ESLint config
- 🟡 ▲ **next.config.ts** - Next.js config
- 🔴 📦 **package.json** - Package configuration
- 🔴 📖 **README.md** - Project documentation
- 🟡 🔷 **tsconfig.json** - TypeScript config

## 📊 File Statistics

### By File Type

- ⚛️ **.tsx** (React TypeScript files): 41 files (23.6%)
- 🔷 **.ts** (TypeScript files): 38 files (21.8%)
- 🖼️ **.jpg** (JPEG images): 28 files (16.1%)
- 🖼️ **.png** (PNG images): 12 files (6.9%)
- 📄 **.eot** (Other files): 7 files (4.0%)
- 🔤 **.ttf** (TrueType fonts): 7 files (4.0%)
- 🔤 **.woff** (Web fonts): 7 files (4.0%)
- 🔤 **.woff2** (Web fonts): 7 files (4.0%)
- ⚙️ **.json** (JSON files): 6 files (3.4%)
- 🎨 **.svg** (SVG images): 5 files (2.9%)
- 📖 **.md** (Markdown files): 3 files (1.7%)
- 🖼️ **.ico** (Icon files): 2 files (1.1%)
- 📄 **.webmanifest** (Other files): 2 files (1.1%)
- 📄 **.mjs** (Other files): 2 files (1.1%)
- 📜 **.js** (JavaScript files): 2 files (1.1%)
- 🚫 **.gitignore** (Git ignore): 1 files (0.6%)
- 🎨 **.css** (Stylesheets): 1 files (0.6%)
- 🌐 **.html** (HTML files): 1 files (0.6%)
- ⚙️ **.yaml** (YAML files): 1 files (0.6%)
- 🖼️ **.webp** (WebP images): 1 files (0.6%)

### By Category

- **Assets**: 69 files (39.7%)
- **React**: 41 files (23.6%)
- **TypeScript**: 38 files (21.8%)
- **Other**: 11 files (6.3%)
- **Config**: 7 files (4.0%)
- **Docs**: 3 files (1.7%)
- **JavaScript**: 2 files (1.1%)
- **DevOps**: 1 files (0.6%)
- **Styles**: 1 files (0.6%)
- **Web**: 1 files (0.6%)

### 📁 Largest Directories

- **root**: 174 files
- **public**: 75 files
- **public\fonts\ClashDisplay**: 28 files
- **public\fonts**: 28 files
- **public\images**: 28 files

## 🌳 Directory Structure

```
djafrocinema/
├── 🟡 🚫 **.gitignore**
├── 📖 AGENTS.md
├── 🚀 app/
│   ├── 🖼️ android-chrome-192x192.png
│   ├── 🖼️ android-chrome-512x512.png
│   ├── 🔌 api/
│   │   ├── 📂 payments/
│   │   │   └── 📂 stk-push/
│   │   │   │   └── 🔷 route.ts
│   │   └── 📂 push/
│   │   │   ├── 📂 notify/
│   │   │   │   └── 🔷 route.ts
│   │   │   └── 📂 subscribe/
│   │   │   │   └── 🔷 route.ts
│   ├── 🖼️ apple-touch-icon.png
│   ├── 📂 auth/
│   │   └── ⚛️ page.tsx
│   ├── 📂 dashboard/
│   │   ├── 📂 discover/
│   │   │   └── ⚛️ page.tsx
│   │   ├── ⚛️ layout.tsx
│   │   ├── 📂 library/
│   │   │   └── ⚛️ page.tsx
│   │   ├── 📂 movies/
│   │   │   ├── 📂 [id]/
│   │   │   │   └── ⚛️ page.tsx
│   │   │   └── ⚛️ page.tsx
│   │   ├── ⚛️ page.tsx
│   │   ├── 📂 profile/
│   │   │   └── ⚛️ page.tsx
│   │   └── 📂 settings/
│   │   │   └── ⚛️ page.tsx
│   ├── 🖼️ favicon-16x16.png
│   ├── 🖼️ favicon-32x32.png
│   ├── 🖼️ favicon.ico
│   ├── 🎨 globals.css
│   ├── ⚛️ layout.tsx
│   ├── 🔷 manifest.ts
│   ├── 📂 offline/
│   │   └── ⚛️ page.tsx
│   ├── ⚛️ page.tsx
│   ├── 🔷 robots.ts
│   ├── 📄 site.webmanifest
│   ├── 🔷 sitemap.ts
│   └── 🔷 sw.ts
├── 📖 CLAUDE.md
├── 🧩 components/
│   ├── ⚛️ AuthGuard.tsx
│   ├── 📂 dashboard/
│   │   ├── 🔷 index.ts
│   │   ├── 📂 layout/
│   │   │   └── ⚛️ DashboardLayout.tsx
│   │   ├── 📂 mobile/
│   │   │   └── ⚛️ MobileBottomNav.tsx
│   │   ├── 📂 movie-banner/
│   │   │   └── ⚛️ MovieBanner.tsx
│   │   ├── 📂 movie-card/
│   │   │   └── ⚛️ MovieCard.tsx
│   │   ├── 📂 sidebar/
│   │   │   └── ⚛️ DashboardSidebar.tsx
│   │   ├── 📂 topbar/
│   │   │   ├── ⚛️ DesktopTopBar.tsx
│   │   │   └── ⚛️ MobileTopBar.tsx
│   │   └── 📂 video-player/
│   │   │   └── ⚛️ VideoPlayer.tsx
│   ├── 📂 layout/
│   │   ├── ⚛️ Footer.tsx
│   │   └── ⚛️ Navbar.tsx
│   ├── ⚛️ MobileBottomNav.tsx
│   ├── 📂 payment/
│   │   ├── ⚛️ DashboardGateWrapper.tsx
│   │   ├── ⚛️ PaymentModal.tsx
│   │   └── ⚛️ Premiumplaybutton.tsx
│   ├── ⚛️ PWANotificationPrompt.tsx
│   ├── 📂 sections/
│   │   ├── ⚛️ FeaturedCarousel.tsx
│   │   ├── ⚛️ Hero.tsx
│   │   ├── ⚛️ HowItWorks.tsx
│   │   ├── ⚛️ InstallCTA.tsx
│   │   ├── ⚛️ TrendingRow.tsx
│   │   └── ⚛️ WhatsAppCommunity.tsx
│   └── 🎨 ui/
│   │   ├── ⚛️ Button.tsx
│   │   ├── ⚛️ PWAInstallPrompt.tsx
│   │   └── ⚛️ ThemeToggle.tsx
├── 📂 context/
│   ├── ⚛️ AuthContext.tsx
│   ├── ⚛️ PremiumGateContext.tsx
│   └── ⚛️ ThemeContext.tsx
├── 🌐 djafro-email-blast.html
├── ⚙️ emails.json
├── 🔵 🔍 **eslint.config.mjs**
├── 📜 fetch-emails.js
├── 🎣 hooks/
│   ├── 🔷 useAllGenres.ts
│   ├── 🔷 useAuth.ts
│   ├── 🔷 useByGenre.ts
│   ├── 🔷 useDashboardLayout.ts
│   ├── 🔷 useFeaturedMovies.ts
│   ├── 🔷 useLatestMovies.ts
│   ├── 🔷 useMostViewed.ts
│   ├── 🔷 useMovie.ts
│   ├── 🔷 useMovies.ts
│   ├── 🔷 usePayment.ts
│   ├── ⚛️ Usepaymentguard.tsx
│   ├── 🔷 usePushNotifications.ts
│   ├── 🔷 Usepwainstall.ts
│   ├── 🔷 useSearch.ts
│   ├── 🔷 useTheme.ts
│   ├── 🔷 useTopRated.ts
│   ├── 🔷 useTrendingMovies.ts
│   └── 🔷 useUserLibrary.ts
├── 📚 lib/
│   ├── 🔷 appwrite.ts
│   ├── 🔷 push.ts
│   ├── 🔷 r2.ts
│   ├── 🔷 themes.ts
│   └── 🔷 utils.ts
├── 🔷 next-env.d.ts
├── 🟡 ▲ **next.config.ts**
├── 🔴 📦 **package.json**
├── ⚙️ pnpm-lock.yaml
├── 📄 postcss.config.mjs
├── 🌐 public/
│   ├── 📂 animations/
│   │   ├── ⚙️ install.json
│   │   ├── ⚙️ payment.json
│   │   └── ⚙️ success.json
│   ├── 🎨 file.svg
│   ├── 📂 fonts/
│   │   └── 📂 ClashDisplay/
│   │   │   ├── 📄 ClashDisplay-Bold.eot
│   │   │   ├── 🔤 ClashDisplay-Bold.ttf
│   │   │   ├── 🔤 ClashDisplay-Bold.woff
│   │   │   ├── 🔤 ClashDisplay-Bold.woff2
│   │   │   ├── 📄 ClashDisplay-Extralight.eot
│   │   │   ├── 🔤 ClashDisplay-Extralight.ttf
│   │   │   ├── 🔤 ClashDisplay-Extralight.woff
│   │   │   ├── 🔤 ClashDisplay-Extralight.woff2
│   │   │   ├── 📄 ClashDisplay-Light.eot
│   │   │   ├── 🔤 ClashDisplay-Light.ttf
│   │   │   ├── 🔤 ClashDisplay-Light.woff
│   │   │   ├── 🔤 ClashDisplay-Light.woff2
│   │   │   ├── 📄 ClashDisplay-Medium.eot
│   │   │   ├── 🔤 ClashDisplay-Medium.ttf
│   │   │   ├── 🔤 ClashDisplay-Medium.woff
│   │   │   ├── 🔤 ClashDisplay-Medium.woff2
│   │   │   ├── 📄 ClashDisplay-Regular.eot
│   │   │   ├── 🔤 ClashDisplay-Regular.ttf
│   │   │   ├── 🔤 ClashDisplay-Regular.woff
│   │   │   ├── 🔤 ClashDisplay-Regular.woff2
│   │   │   ├── 📄 ClashDisplay-Semibold.eot
│   │   │   ├── 🔤 ClashDisplay-Semibold.ttf
│   │   │   ├── 🔤 ClashDisplay-Semibold.woff
│   │   │   ├── 🔤 ClashDisplay-Semibold.woff2
│   │   │   ├── 📄 ClashDisplay-Variable.eot
│   │   │   ├── 🔤 ClashDisplay-Variable.ttf
│   │   │   ├── 🔤 ClashDisplay-Variable.woff
│   │   │   └── 🔤 ClashDisplay-Variable.woff2
│   ├── 🎨 globe.svg
│   ├── 🖼️ images/
│   │   ├── 🖼️ footer1.jpg
│   │   ├── 🖼️ footer4.jpg
│   │   ├── 🖼️ hero1.jpg
│   │   ├── 🖼️ hero2.jpg
│   │   ├── 🖼️ hero3.jpg
│   │   ├── 🖼️ hero4.jpg
│   │   ├── 🖼️ hero5.jpg
│   │   ├── 🖼️ hero6.jpg
│   │   ├── 🖼️ login1.jpg
│   │   ├── 🖼️ login2.jpg
│   │   ├── 🖼️ login3.jpg
│   │   ├── 🖼️ login4.jpg
│   │   ├── 🖼️ login5.jpg
│   │   ├── 🖼️ login6.jpg
│   │   ├── 🖼️ movie1.jpg
│   │   ├── 🖼️ movie10.jpg
│   │   ├── 🖼️ movie11.jpg
│   │   ├── 🖼️ movie12.jpg
│   │   ├── 🖼️ movie2.jpg
│   │   ├── 🖼️ movie3.jpg
│   │   ├── 🖼️ movie4.jpg
│   │   ├── 🖼️ movie5.webp
│   │   ├── 🖼️ movie6.jpg
│   │   ├── 🖼️ movie7.jpg
│   │   ├── 🖼️ movie8.jpg
│   │   ├── 🖼️ movie9.jpg
│   │   ├── 🖼️ MV5BNjQzNDYxNDg4NV5BMl5BanBnXkFtZTgwOTEzNjg0MTE@._V1_FMjpg_UX1000_.jpg
│   │   └── 🖼️ wallpaperflare.com_wallpaper (3).jpg
│   ├── 🖼️ logo.png
│   ├── 🖼️ logo2.png
│   ├── 📂 logos/
│   │   ├── 🖼️ android-chrome-192x192.png
│   │   ├── 🖼️ android-chrome-512x512.png
│   │   ├── 🖼️ apple-touch-icon.png
│   │   ├── 🖼️ favicon-16x16.png
│   │   ├── 🖼️ favicon-32x32.png
│   │   ├── 🖼️ favicon.ico
│   │   └── 📄 site.webmanifest
│   ├── 🎨 next.svg
│   ├── 🖼️ og-image.jpg
│   ├── 📜 OneSignalSDKWorker.js
│   ├── 🎨 vercel.svg
│   ├── 📂 videos/
│   └── 🎨 window.svg
├── 🔴 📖 **README.md**
├── 📂 services/
│   ├── 🔷 auth.service.ts
│   ├── 🔷 movie.service.ts
│   ├── 🔷 payment.service.ts
│   └── 🔷 userLibrary.service.ts
├── 🟡 🔷 **tsconfig.json**
└── 📂 types/
│   ├── 🔷 movie.types.ts
│   └── 🔷 theme.types.ts
```

## 📖 Legend

### File Types
- 🚫 DevOps: Git ignore
- 📖 Docs: Markdown files
- 🖼️ Assets: PNG images
- 🔷 TypeScript: TypeScript files
- ⚛️ React: React TypeScript files
- 🖼️ Assets: Icon files
- 🎨 Styles: Stylesheets
- 📄 Other: Other files
- 🌐 Web: HTML files
- ⚙️ Config: JSON files
- 📜 JavaScript: JavaScript files
- ⚙️ Config: YAML files
- 🎨 Assets: SVG images
- 🔤 Assets: TrueType fonts
- 🔤 Assets: Web fonts
- 🔤 Assets: Web fonts
- 🖼️ Assets: JPEG images
- 🖼️ Assets: WebP images

### Importance Levels
- 🔴 Critical: Essential project files
- 🟡 High: Important configuration files
- 🔵 Medium: Helpful but not essential files
