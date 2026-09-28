# Game Realm 🎮

A bilingual (English / Chinese, English by default) gaming website — final project for the Web Design course (Chapter 10 comprehensive project).

**Live structure:** 3 core channels × (channel home + 3 sub-pages) = 13 content pages + About, 14 pages total, all responsive.

## Channels

| Channel | Pages |
|---|---|
| **News** | Channel home + Black Myth: Wukong · Genshin Impact · Elden Ring |
| **Guides** | Channel home + Elden Ring · Genshin Impact · Cyberpunk 2077 |
| **Research** | Channel home + Narrative · Mechanics · Industry |

## Features

- 🌐 Site-wide bilingual **search** (Ctrl+K / `/` / 🔍 button) with live results in both languages
- 🌓 **Light / dark theme** toggle, persisted in `localStorage`
- 📊 **Reading progress bar** and ⭐ **1–5 star article ratings** (per-page memory)
- 🎲 **"Surprise me"** random article button on the homepage
- 🔢 Animated **stat counters** and **channel filter chips**
- ✉️ **Newsletter sign-up** form with email validation
- 🍔 Hamburger menu, back-to-top, scroll-reveal animations, nav highlighting
- 📱 Fully responsive (1024 / 768 / 420 px breakpoints)

## Tech

Vanilla **HTML5 · CSS3 · JavaScript** (no frameworks). CSS variables design system, Grid/Flexbox layouts, IntersectionObserver, a hand-rolled i18n dictionary (~470 keys), and a hand-rolled full-site search index.

## Files

```
index.html          about.html
css/style.css
js/i18n.js          js/main.js        js/search.js
news/   (index + 3 detail pages)
guides/ (index + 3 guide pages)
research/ (index + 3 essay pages)
```

Built as an educational demo. © Game Realm — for course use only.
