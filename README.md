# 東愛璃Lovely - 非官方应援站

[![Astro](https://img.shields.io/badge/Astro-5.17.1-BC52EE?style=flat-square&logo=astro)](https://astro.build)
[![React](https://img.shields.io/badge/React-18.0+-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0+-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Deploy](https://img.shields.io/badge/Deploy-Cloudflare_Pages-F38020?style=flat-square&logo=cloudflare)](https://pages.cloudflare.com)

[中文文档](./README.zh-CN.md) | [Live Site](https://lovely.yuanbimu.top)

A fan-made support site for 东爱璀Lovely (东爱璀Lovely), a VTuber from PSPLive.

## 🎯 Features

- 🖼️ **Profile Showcase** - Display avatar, bio, and social links
- 📊 **Real-time Statistics** - Live fan count from Bilibili
- 📹 **Live Status** - Real-time live streaming status detection *(coming soon)*
- 🖼️ **Showcase Gallery** - 32 different outfit/model showcases
- 📱 **Responsive Design** - Optimized for all devices
- ⚡ **Fast Performance** - Static site with edge deployment

## 🚀 Tech Stack

### Frontend
- **Framework**: [Astro](https://astro.build) - Static site generator
- **UI Framework**: [React](https://react.dev) - Interactive components (islands)
- **Language**: [TypeScript](https://www.typescriptlang.org)
- **Styling**: 
  - [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS
  - Custom CSS Design System (OKLCH-based color palettes)
- **State Management**: Native React hooks (Zustand ready)

### Backend & Data
- **Edge Functions**: [Hono](https://hono.dev) on Cloudflare Pages
- **Database**: JSON files (static data) + IndexedDB (client-side, coming soon)
- **APIs**: Bilibili API integration

### DevOps & Deployment
- **Hosting**: [Cloudflare Pages](https://pages.cloudflare.com)
- **CDN**: Cloudflare R2 (images)
- **CI/CD**: GitHub Actions (daily data updates)
- **Package Manager**: npm (Bun compatible)

## 📁 Project Structure

```
lovely-site/
├── functions/                    # Cloudflare Pages Functions
│   └── api/
│       └── live.ts              # Live status API endpoint
├── public/                     # Static assets
│   ├── images/
│   └── favicon.ico
├── scripts/                    # Build & data automation
│   ├── fetch-bilibili-data.js  # Fetch Bilibili user data
│   ├── check-live.py           # Check live streaming status
│   └── ...
├── src/
│   ├── components/             # Reusable components
│   │   ├── home/
│   │   ├── ui/
│   │   └── LiveStatus.tsx    # ⭐ Real-time live status component
│   ├── data/                   # JSON data files
│   │   ├── config.json
│   │   ├── dynamics.json
│   │   └── site-data.json
│   ├── layouts/                # Page layouts
│   ├── pages/                  # Route pages
│   │   ├── index.astro
│   │   ├── showcase.astro
│   │   └── ...
│   ├── styles/                 # CSS styles
│   │   ├── design-system.css
│   │   └── global.css
│   └── types/                  # TypeScript definitions
│       └── index.ts
├── astro.config.mjs
├── package.json
├── tsconfig.json
└── README.md
```

## 🎁 Getting Started

### Prerequisites
- Node.js 18+ (or Bun 1.0+)
- npm / yarn / pnpm / bun

### Installation

```bash
# Clone the repository
git clone https://github.com/yourname/lovely-site.git
cd lovely-site

# Install dependencies
npm install
# or: bun install

# Start development server
npm run dev
# or: bun run dev

# Open http://localhost:4321
```

### Available Commands

| Command | Action |
| :------ | :----- |
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server at `localhost:4321` |
| `npm run fetch-data` | Fetch latest Bilibili data |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## 📝 Configuration

### Environment Variables

Create `.env` file for local development:

```env
# Bilibili API credentials (optional for public data)
BILI_JCT=your_jct_cookie
BUVID3=your_buvid3_cookie
BUVID4=your_buvid4_cookie
SESSDATA=your_sessdata_cookie

# Bilibili UID (default: 3821157)
BILIBILI_UID=3821157

# CDN Configuration
CDN_DOMAIN=cdn.yuanbimu.top
```

### Site Data

Edit `src/data/site-data.json` to customize:
- Profile information
- Social links
- Statistics display settings

## 🔧 Development Roadmap

### ✅ Completed
- [x] Basic site structure
- [x] Profile and social links
- [x] Showcase gallery (32 outfits)
- [x] Bilibili data integration
- [x] Responsive design
- [x] Custom design system

### 🚛 In Progress
- [ ] Real-time live status detection
  - [ ] Edge function API (`/api/live`)
  - [ ] React component (`LiveStatus.tsx`)
  - [ ] Auto-refresh every 15 minutes
  - [ ] Documentation: [docs/live-status-plan.md](./docs/live-status-plan.md)

### 📜 Planned
- [ ] Offline support (IndexedDB)
- [ ] Favorites/collections feature
- [ ] Search functionality
- [ ] Dark mode toggle
- [ ] Analytics dashboard
- [ ] Multi-language support

### 💭 Future Ideas
- [ ] User comments system (Cloudflare D1)
- [ ] Push notifications for live streams
- [ ] Historical live statistics
- [ ] Interactive timeline

## 📚 Documentation

- [Live Status Development Plan](./docs/live-status-plan.md) - Detailed technical plan
- [Contributing Guide](./CONTRIBUTING.md) - How to contribute *(coming soon)*
- [Changelog](./CHANGELOG.md) - Version history *(coming soon)*

## 💾 Data Sources

- **Bilibili API**: [api.bilibili.com](https://api.bilibili.com)
  - User info
  - Live streaming status
  - Fan count
  - Dynamics/posts

## 🌐 Deployment

### Cloudflare Pages

This project is configured for automatic deployment on Cloudflare Pages:

1. Connect GitHub repository to Cloudflare Pages
2. Build command: `npm run build`
3. Build output: `dist`
4. Environment variables: Add secrets in Cloudflare Dashboard

### Manual Deployment

```bash
# Build the project
npm run build

# Deploy dist/ folder to any static hosting
# (Cloudflare Pages, Vercel, Netlify, etc.)
```

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) for details.

### Quick Start for Contributors

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](./LICENSE).

## 💝 Acknowledgments

- **東愛璃Lovely** - The amazing VTuber this site is for
- **PSPLive** - The talent agency
- **Bilibili** - For the open API
- **Cloudflare** - For generous free tier hosting

## 📱 Connect

- **Site**: [lovely.yuanbimu.top](https://lovely.yuanbimu.top)
- **Bilibili**: [space.bilibili.com/3821157](https://space.bilibili.com/3821157)
- **Weibo**: [weibo.com/u/7802960328](https://weibo.com/u/7802960328)

---

⭐ **Star this repository if you find it helpful!**

Made with ❤️ by fans, for fans.
