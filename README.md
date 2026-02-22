# QAD Podcast - History In One Page

**مێژوو لە یەک لاپەڕەدا**

A premium, culturally-rooted podcast website for QAD Podcast, featuring a luxury editorial documentary design inspired by the iconic vinyl-record logo aesthetic.

## 🌐 Live Preview

**Production URL**: https://3000-iggjeruwykg0yzthhhxb4-2e77fc33.sandbox.novita.ai

### Language Versions
- **Kurdish (Sorani)**: `/?lang=ckb` (default)
- **Arabic**: `/?lang=ar`
- **English**: `/?lang=en`

## ✨ Completed Features

### Pages
- **Home Page** - Cinematic hero with floating logo, latest episode spotlight, episodes timeline, guests grid, about preview
- **Episodes Archive** - Searchable/filterable grid with theme-based filtering
- **Episode Detail** - Full episode view with embedded YouTube video, chapters navigation, share buttons, guest bio, previous/next navigation
- **Guests Page** - Grid of all guests with profile cards
- **Guest Detail** - Full guest profile with bio, highlights, quotes, and associated episodes
- **About Page** - QAD Foundation story, vision, mission, values
- **Contact Page** - Elegant contact form with social links and guest suggestion feature

### Design System (Brand Tokens)
- **Primary Charcoal**: `#26211E` - Main UI & typography
- **Warm Light Beige**: `#E4E1D6` - Backgrounds, content areas
- **Warm Mid Gray**: `#A4A199` - Borders, secondary text
- **Secondary Gray**: `#5F5B55` - Meta text
- **Clean White**: `#FEFEFE` - Page background

### Typography
- **Headlines**: Noto Kufi Arabic (bold, editorial)
- **Body**: Noto Naskh Arabic (readable, elegant)

### Features
- ✅ Full multilingual support (Kurdish, Arabic, English)
- ✅ RTL layout for Kurdish and Arabic
- ✅ Responsive design (mobile-first)
- ✅ Vinyl-inspired loading animation
- ✅ Smooth scroll animations
- ✅ Intersection Observer for fade-in effects
- ✅ Language switcher with dropdown
- ✅ Mobile hamburger menu
- ✅ Scroll-aware sticky navigation
- ✅ SEO optimized with OG tags
- ✅ PodcastEpisode schema markup
- ✅ Share buttons (Twitter, Facebook, LinkedIn, WhatsApp)
- ✅ Episode chapters with timestamps
- ✅ Episode filter by theme
- ✅ Guest profiles with quotes

## 📂 Project Structure

```
webapp/
├── src/
│   ├── index.tsx          # Main Hono application with all routes
│   ├── data/
│   │   ├── translations.ts # Multilingual text (Kurdish, Arabic, English)
│   │   ├── episodes.ts     # Episodes data
│   │   ├── guests.ts       # Guests data
│   │   └── socials.ts      # Social media links
│   ├── components/         # (Reserved for future components)
│   ├── pages/              # (Reserved for page components)
│   └── styles/             # (Reserved for style files)
├── public/
│   └── static/
│       └── images/
│           └── qad-logo.png
├── dist/                   # Build output
├── ecosystem.config.cjs    # PM2 configuration
├── package.json
├── vite.config.ts
├── wrangler.jsonc
└── README.md
```

## 🚀 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/episodes` | GET | Get all episodes |
| `/api/episode/:id` | GET | Get single episode by ID |
| `/api/guests` | GET | Get all guests |
| `/api/guest/:id` | GET | Get single guest by ID |

## 🛠️ Tech Stack

- **Framework**: Hono (lightweight, fast)
- **Runtime**: Cloudflare Workers/Pages
- **Build**: Vite
- **Styling**: Custom CSS with CSS Variables
- **Fonts**: Google Fonts (Noto Kufi Arabic, Noto Naskh Arabic)
- **Icons**: Font Awesome 6

## 📦 Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start development server (sandbox)
npm run dev:sandbox

# Or use PM2
pm2 start ecosystem.config.cjs

# Deploy to Cloudflare Pages
npm run deploy:prod
```

## 🌍 Deployment

### Cloudflare Pages
```bash
# Build and deploy
npm run deploy:prod

# Manual deploy
npm run build
npx wrangler pages deploy dist --project-name qad-podcast
```

## 📋 Future Enhancements

1. **Content Management** - Admin panel for managing episodes and guests
2. **Search Functionality** - Full-text search across episodes
3. **Newsletter Subscription** - Email subscription integration
4. **Comments System** - Episode discussion/comments
5. **Analytics** - View tracking and engagement metrics
6. **Podcast RSS Feed** - Auto-generated RSS for podcast apps
7. **Audio Player** - Embedded audio player for podcast episodes
8. **Transcripts** - Episode transcripts with search

## 📝 Content Placeholders

To update content, edit the data files in `src/data/`:

- `translations.ts` - All UI text in three languages
- `episodes.ts` - Episode information (title, description, YouTube ID, chapters)
- `guests.ts` - Guest profiles (bio, highlights, quotes)
- `socials.ts` - Social media links

## 🎨 Design Philosophy

- **Timeless + Modern**: Museum catalog meets cinematic podcast
- **Warm Monochrome**: Documentary-editorial color palette from logo
- **Vinyl Record Aesthetic**: Circular motifs, archival feel
- **Cultural Roots**: Proper RTL support, Kurdish typography
- **Minimal & Elegant**: No flashy gradients, refined spacing

---

© 2024 QAD Podcast | QAD Foundation

**History In One Page | مێژوو لە یەک لاپەڕەدا | التاريخ في صفحة واحدة**
