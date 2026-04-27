# 东爱璃Lovely - 非官方应援站

[![Astro](https://img.shields.io/badge/Astro-5.17.1-BC52EE?style=flat-square&logo=astro)](https://astro.build)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Deploy](https://img.shields.io/badge/Deploy-Cloudflare_Pages-F38020?style=flat-square&logo=cloudflare)](https://pages.cloudflare.com)

[中文文档](./README.zh-CN.md) | [Live Site](https://lovely.yuanbimu.top)

A fan-made support site for 东爱璀Lovely built with Astro, React islands, and Cloudflare Pages.

## Features

- Static Astro pages for profile, showcase, songs, timeline, links, and articles
- React islands for interactive parts such as live status, avatar loading, and dynamic lists
- Cloudflare Pages Functions + Hono routes for runtime APIs
- D1-backed live status cache and R2 image bucket bindings
- Responsive design system for desktop and mobile devices

## Tech Stack

- Astro 5
- React 19
- TypeScript (strict config via Astro)
- Hono on Cloudflare Pages Functions
- Cloudflare D1 + R2

## Project Structure

```text
lovely-site/
├── functions/                 # Cloudflare Pages Functions entry and route aggregation
├── scripts/                   # setup / sync / database helper scripts
├── src/
│   ├── components/            # Astro + React components
│   ├── config/                # site configuration
│   ├── data/                  # static JSON data used at build time
│   ├── pages/                 # Astro pages and API endpoints
│   │   ├── admin/
│   │   └── api/
│   ├── styles/                # design system and global styles
│   └── types/                 # shared TypeScript types
├── docs/                      # active docs and archived doc stubs
├── wrangler.toml
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Cloudflare account access if you need `dev:cf`, D1, or R2 features

### Install

```bash
npm install
```

### Local Development

```bash
# Astro dev server
npm run dev

# Cloudflare Pages local environment with D1/R2 bindings
npm run dev:cf
```

### Common Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Astro development server |
| `npm run dev:cf` | Start Pages Functions local environment |
| `npm run setup` | Configure Wrangler-related local setup |
| `npm run login` | Run Wrangler login |
| `npm run init:db` | Initialize local database |
| `npm run sync:live` | Sync live status to local D1 |
| `npm run build` | Build production output |
| `npm run preview` | Preview built site |

## Data Model

- `src/data/*.json` is used for build-time static content
- D1 stores runtime data such as live status and admin-managed content
- R2 is used for image storage bindings

## Documentation

- `AGENTS.md` - project rules and AI-oriented development constraints
- `CONTRIBUTING.md` - contribution workflow and repository conventions
- `QUICK_START.md` - minimal local setup path
- `docs/database-schema.md` - code-aligned database reference
- `docs/archive/` - archived stubs and historical doc remnants not meant as active guidance

## Deployment Notes

- Build output directory: `dist`
- Cloudflare Pages configuration lives in `wrangler.toml`
- `sync-dynamics.yml` exists but scheduled auto-sync is currently disabled due to Bilibili risk controls
- `sync-live.yml` is used for scheduled live-status synchronization

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) before opening changes.
