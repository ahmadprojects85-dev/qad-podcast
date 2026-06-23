import { Hono } from 'hono'
import { env } from 'hono/adapter'

import { translations, type Language, isRTL, getDirection, getLangName } from './data/translations'
import { getEpisodes, getLatestEpisode, getAllThemes, getAllSeasons, saveEpisode, deleteEpisode, getEpisodeBySlug, getEpisodesByTheme, getEpisodesBySeason, type Episode } from './data/episodes'
import { getGuests, getGuestById, saveGuest, deleteGuest, getGuestsByEpisode, type Guest } from './data/guests'
import { socialLinks } from './data/socials'
import { socialLinks } from './data/socials'

type Bindings = { DATABASE_URL: string; };
const app = new Hono<{ Bindings: Bindings }>()

// Serve static files


// Brand tokens
const brand = {
  colors: {
    charcoal: '#26211E',
    beige: '#E4E1D6',
    warmGray: '#A4A199',
    secondaryGray: '#5F5B55',
    white: '#FEFEFE',
    accent: '#3D3630'
  },
  fonts: {
    heading: "'Noto Kufi Arabic', 'Noto Sans Arabic', sans-serif",
    body: "'Noto Naskh Arabic', 'Noto Sans Arabic', sans-serif"
  }
}

// Helper to get current language
const getLang = (c: any): Language => {
  const lang = c.req.query('lang') || 'ckb'
  return ['ckb', 'ar', 'en'].includes(lang) ? lang as Language : 'ckb'
}

// Helper to format date
const formatDate = (dateStr: string, lang: Language): string => {
  const date = new Date(dateStr)
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
  const locale = lang === 'ckb' ? 'ckb' : lang === 'ar' ? 'ar' : 'en'
  return date.toLocaleDateString(locale, options)
}

// Helper to extract YouTube video ID from URL or plain ID
const extractYoutubeId = (input: string): string => {
  if (!input) return ''
  // Already a plain ID (no slashes or dots)
  if (!/[\/\.]/.test(input)) return input
  try {
    const url = new URL(input)
    // youtube.com/watch?v=ID
    if (url.searchParams.has('v')) return url.searchParams.get('v') || input
    // youtu.be/ID or youtube.com/embed/ID
    const parts = url.pathname.split('/').filter(Boolean)
    if (parts.length > 0) return parts[parts.length - 1]
  } catch { }
  return input
}

// Common head with fonts and styles
const getHead = (title: string, lang: Language, description?: string) => `
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | QAD Podcast</title>
  <meta name="description" content="${description || 'QAD Podcast - History In One Page'}">
  
  <!-- OG Tags -->
  <meta property="og:title" content="${title} | QAD Podcast">
  <meta property="og:description" content="${description || 'QAD Podcast - History In One Page'}">
  <meta property="og:type" content="website">
  <meta property="og:image" content="/static/images/qad-logo.png">
  
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;500;600;700;800&family=Noto+Naskh+Arabic:wght@400;500;600;700&family=Noto+Sans+Arabic:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  
  <!-- Icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossorigin="anonymous" referrerpolicy="no-referrer" />
  
  <!-- Favicon -->
  <link rel="icon" type="image/png" href="/static/images/qad-logo.png">
`

// Navigation component
const getNav = (lang: Language, t: typeof translations.ckb, currentPage: string) => `
  <nav class="nav" id="mainNav">
    <div class="nav-container">
      <a href="/?lang=${lang}" class="nav-logo">
        <img src="/static/images/qad-logo.png" alt="QAD Podcast" class="logo-img">
        <span class="logo-text">QAD</span>
      </a>
      
      <button class="nav-toggle" onclick="toggleMenu()" aria-label="Toggle menu">
        <span class="hamburger"></span>
      </button>
      
      <div class="nav-menu" id="navMenu">
        <a href="/?lang=${lang}" class="nav-link ${currentPage === 'home' ? 'active' : ''}">${t.nav.home}</a>
        <a href="/episodes?lang=${lang}" class="nav-link ${currentPage === 'episodes' ? 'active' : ''}">${t.nav.episodes}</a>
        <a href="/guests?lang=${lang}" class="nav-link ${currentPage === 'guests' ? 'active' : ''}">${t.nav.guests}</a>
        <a href="/about?lang=${lang}" class="nav-link ${currentPage === 'about' ? 'active' : ''}">${t.nav.about}</a>
        <a href="/contact?lang=${lang}" class="nav-link ${currentPage === 'contact' ? 'active' : ''}">${t.nav.contact}</a>
        
        <div class="lang-switcher">
          <button class="lang-btn" onclick="toggleLangMenu()">
            <i class="fas fa-globe"></i>
            <span>${getLangName(lang)}</span>
          </button>
          <div class="lang-dropdown" id="langDropdown">
            <a href="?lang=ckb" class="${lang === 'ckb' ? 'active' : ''}">کوردی</a>
            <a href="?lang=ar" class="${lang === 'ar' ? 'active' : ''}">العربية</a>
            <a href="?lang=en" class="${lang === 'en' ? 'active' : ''}">English</a>
          </div>
        </div>
      </div>
    </div>
  </nav>
`

// Footer component
const getFooter = (lang: Language, t: typeof translations.ckb) => `
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-main">
        <div class="footer-brand">
          <img src="/static/images/qad-logo.png" alt="QAD Podcast" class="footer-logo">
          <p class="footer-tagline">${t.hero.tagline}</p>
        </div>
        
        <div class="footer-links">
          <div class="footer-col">
            <h4>${t.nav.home}</h4>
            <a href="/?lang=${lang}">${t.nav.home}</a>
            <a href="/episodes?lang=${lang}">${t.nav.episodes}</a>
            <a href="/guests?lang=${lang}">${t.nav.guests}</a>
          </div>
          <div class="footer-col">
            <h4>${t.nav.about}</h4>
            <a href="/about?lang=${lang}">${t.nav.about}</a>
            <a href="/contact?lang=${lang}">${t.nav.contact}</a>
          </div>
          <div class="footer-col">
            <h4>${t.footer.followUs}</h4>
            <div class="footer-socials">
              ${socialLinks.map(s => `
                <a href="${s.url}" target="_blank" rel="noopener" aria-label="${s.label[lang]}">
                  <i class="${s.icon}"></i>
                </a>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p>&copy; ${new Date().getFullYear()} QAD Podcast. ${t.footer.rights}.</p>
        <p>${t.footer.foundation}</p>
      </div>
    </div>
  </footer>
`

// Loading animation
const getLoader = () => `
  <div class="loader" id="loader">
    <div class="loader-vinyl">
      <div class="vinyl-outer"></div>
      <div class="vinyl-inner"></div>
      <div class="vinyl-center">
        <img src="/static/images/qad-logo.png" alt="Loading">
      </div>
    </div>
  </div>
`

// Main CSS styles
const getStyles = (lang: Language) => `
<style>
  :root {
    --charcoal: ${brand.colors.charcoal};
    --beige: ${brand.colors.beige};
    --warm-gray: ${brand.colors.warmGray};
    --secondary-gray: ${brand.colors.secondaryGray};
    --white: ${brand.colors.white};
    --accent: ${brand.colors.accent};
    --font-heading: ${brand.fonts.heading};
    --font-body: ${brand.fonts.body};
  }
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  html {
    scroll-behavior: smooth;
  }
  
  body {
    font-family: var(--font-body);
    background: var(--white);
    color: var(--charcoal);
    line-height: 1.7;
    direction: ${getDirection(lang)};
    overflow-x: hidden;
  }
  
  /* Typography */
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-heading);
    font-weight: 700;
    line-height: 1.3;
  }
  
  h1 { font-size: clamp(2.5rem, 5vw, 4.5rem); }
  h2 { font-size: clamp(2rem, 4vw, 3rem); }
  h3 { font-size: clamp(1.5rem, 3vw, 2rem); }
  h4 { font-size: clamp(1.25rem, 2vw, 1.5rem); }
  
  a {
    color: inherit;
    text-decoration: none;
    transition: all 0.3s ease;
  }
  
  img {
    max-width: 100%;
    height: auto;
  }
  
  /* Loader */
  .loader {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--charcoal);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    transition: opacity 0.5s ease, visibility 0.5s ease;
  }
  
  .loader.hidden {
    opacity: 0;
    visibility: hidden;
  }
  
  .loader-vinyl {
    width: 150px;
    height: 150px;
    position: relative;
    animation: spin 2s linear infinite;
  }
  
  .vinyl-outer {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: linear-gradient(135deg, #1a1715 0%, #3d3630 50%, #1a1715 100%);
    box-shadow: 0 0 40px rgba(0,0,0,0.5);
  }
  
  .vinyl-inner {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 60%;
    height: 60%;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    background: var(--beige);
  }
  
  .vinyl-center {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 40%;
    height: 40%;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .vinyl-center img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  /* Navigation */
  .nav {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 1000;
    background: transparent;
    padding: 1.5rem 0;
    transition: all 0.3s ease;
  }
  
  .nav.scrolled {
    background: rgba(38, 33, 30, 0.95);
    backdrop-filter: blur(10px);
    padding: 1rem 0;
    box-shadow: 0 4px 30px rgba(0,0,0,0.1);
  }
  
  .nav-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .nav-logo {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  .logo-img {
    width: 50px;
    height: 50px;
    object-fit: contain;
    transition: transform 0.3s ease;
  }
  
  .nav-logo:hover .logo-img {
    transform: rotate(15deg);
  }
  
  .logo-text {
    font-family: var(--font-heading);
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--beige);
  }
  
  .nav-menu {
    display: flex;
    align-items: center;
    gap: 2rem;
  }
  
  .nav-link {
    color: var(--beige);
    font-family: var(--font-heading);
    font-weight: 500;
    font-size: 1rem;
    position: relative;
    padding: 0.5rem 0;
  }
  
  .nav-link::after {
    content: '';
    position: absolute;
    bottom: 0;
    ${isRTL(lang) ? 'right' : 'left'}: 0;
    width: 0;
    height: 2px;
    background: var(--beige);
    transition: width 0.3s ease;
  }
  
  .nav-link:hover::after,
  .nav-link.active::after {
    width: 100%;
  }
  
  .nav-toggle {
    display: none;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
  }
  
  .hamburger {
    display: block;
    width: 25px;
    height: 3px;
    background: var(--beige);
    position: relative;
    transition: all 0.3s ease;
  }
  
  .hamburger::before,
  .hamburger::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background: var(--beige);
    transition: all 0.3s ease;
  }
  
  .hamburger::before { top: -8px; }
  .hamburger::after { bottom: -8px; }
  
  .lang-switcher {
    position: relative;
  }
  
  .lang-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(228, 225, 214, 0.1);
    border: 1px solid rgba(228, 225, 214, 0.3);
    color: var(--beige);
    padding: 0.5rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    font-family: var(--font-body);
    font-size: 0.9rem;
    transition: all 0.3s ease;
  }
  
  .lang-btn:hover {
    background: rgba(228, 225, 214, 0.2);
  }
  
  .lang-dropdown {
    position: absolute;
    top: calc(100% + 0.5rem);
    ${isRTL(lang) ? 'left' : 'right'}: 0;
    background: var(--charcoal);
    border: 1px solid rgba(228, 225, 214, 0.2);
    border-radius: 8px;
    overflow: hidden;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-10px);
    transition: all 0.3s ease;
    min-width: 120px;
  }
  
  .lang-dropdown.show {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
  
  .lang-dropdown a {
    display: block;
    padding: 0.75rem 1rem;
    color: var(--beige);
    transition: background 0.2s ease;
  }
  
  .lang-dropdown a:hover,
  .lang-dropdown a.active {
    background: rgba(228, 225, 214, 0.1);
  }
  
  /* Hero Section */
  .hero {
    min-height: 100vh;
    background: var(--charcoal);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }
  
  .hero::before {
    content: '';
    position: absolute;
    width: 800px;
    height: 800px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(228, 225, 214, 0.05) 0%, transparent 70%);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  
  .hero-content {
    text-align: center;
    max-width: 900px;
    padding: 2rem;
    position: relative;
    z-index: 1;
  }
  
  .hero-logo {
    width: 180px;
    height: 180px;
    margin: 0 auto 2rem;
    animation: float 6s ease-in-out infinite;
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
  }
  
  .hero-title {
    color: var(--beige);
    margin-bottom: 1rem;
    letter-spacing: -0.02em;
  }
  
  .hero-tagline {
    font-family: var(--font-heading);
    font-size: clamp(1.5rem, 3vw, 2.5rem);
    color: var(--warm-gray);
    margin-bottom: 1.5rem;
    font-weight: 500;
  }
  
  .hero-mission {
    color: var(--secondary-gray);
    font-size: 1.1rem;
    max-width: 600px;
    margin: 0 auto 2.5rem;
    line-height: 1.8;
  }
  
  .hero-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 2rem;
    border-radius: 50px;
    font-family: var(--font-heading);
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: transform 0.1s ease-out, background 0.3s ease, color 0.3s ease, box-shadow 0.3s ease;
    border: none;
  }
  
  .btn-primary {
    background: var(--beige);
    color: var(--charcoal);
  }
  
  .btn-primary:hover {
    background: var(--white);
    transform: translateY(-3px);
    box-shadow: 0 10px 30px rgba(228, 225, 214, 0.3);
  }
  
  .btn-secondary {
    background: transparent;
    color: var(--beige);
    border: 2px solid var(--beige);
  }
  
  .btn-secondary:hover {
    background: var(--beige);
    color: var(--charcoal);
    transform: translateY(-3px);
  }
  
  /* Sections */
  .section {
    padding: 6rem 2rem;
  }
  
  .section-dark {
    background: var(--charcoal);
    color: var(--beige);
  }
  
  .section-beige {
    background: var(--beige);
  }
  
  .container {
    max-width: 1400px;
    margin: 0 auto;
  }
  
  .section-header {
    text-align: center;
    margin-bottom: 4rem;
  }
  
  .section-title {
    margin-bottom: 1rem;
  }
  
  .section-subtitle {
    color: var(--secondary-gray);
    font-size: 1.1rem;
  }
  
  .section-dark .section-subtitle {
    color: var(--warm-gray);
  }
  
  /* Latest Episode */
  .latest-episode {
    display: grid;
    grid-template-columns: 1.5fr 1fr;
    gap: 4rem;
    align-items: center;
  }
  
  .video-wrapper {
    position: relative;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 30px 60px rgba(0,0,0,0.3);
    aspect-ratio: 16/9;
    background: var(--charcoal);
  }
  
  .video-wrapper iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
  }
  
  .episode-info {
    background: var(--beige);
    padding: 3rem;
    border-radius: 16px;
    position: relative;
  }
  
  .episode-number {
    font-family: var(--font-heading);
    font-size: 0.9rem;
    color: var(--secondary-gray);
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
  
  .episode-title {
    color: var(--charcoal);
    margin-bottom: 1rem;
  }
  
  .episode-guest {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .guest-avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: var(--charcoal);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--beige);
    font-size: 1.5rem;
  }
  
  .guest-details h4 {
    color: var(--charcoal);
    font-size: 1.1rem;
  }
  
  .guest-details span {
    color: var(--secondary-gray);
    font-size: 0.9rem;
  }
  
  .episode-description {
    color: var(--secondary-gray);
    margin-bottom: 2rem;
    line-height: 1.8;
  }
  
  .episode-meta {
    display: flex;
    gap: 2rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
  }
  
  .meta-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--secondary-gray);
    font-size: 0.9rem;
  }
  
  .meta-item i {
    color: var(--charcoal);
  }
  
  /* Episodes Grid */
  .episodes-timeline {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 2rem;
  }
  
  .episode-card {
    background: var(--white);
    border-radius: 16px;
    overflow: hidden;
    transition: all 0.3s ease;
    border: 1px solid rgba(38, 33, 30, 0.1);
  }
  
  .episode-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(38, 33, 30, 0.15);
  }
  
  .episode-card-img {
    aspect-ratio: 16/9;
    background: var(--charcoal);
    position: relative;
    overflow: hidden;
  }
  
  .episode-card-img img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .episode-card-play {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 60px;
    height: 60px;
    background: var(--beige);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--charcoal);
    font-size: 1.25rem;
    opacity: 0;
    transition: all 0.3s ease;
  }
  
  .episode-card:hover .episode-card-play {
    opacity: 1;
  }
  
  .episode-card-content {
    padding: 1.5rem;
  }
  
  .episode-card-number {
    font-family: var(--font-heading);
    font-size: 0.8rem;
    color: var(--secondary-gray);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 0.5rem;
  }
  
  .episode-card-title {
    font-size: 1.25rem;
    margin-bottom: 0.75rem;
    color: var(--charcoal);
  }
  
  .episode-card-guest {
    color: var(--secondary-gray);
    font-size: 0.95rem;
    margin-bottom: 1rem;
  }
  
  .episode-card-meta {
    display: flex;
    justify-content: space-between;
    color: var(--warm-gray);
    font-size: 0.85rem;
  }
  
  /* Guests Section */
  .guests-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 2rem;
  }
  
  .guest-card {
    background: var(--beige);
    border-radius: 16px;
    padding: 2rem;
    text-align: center;
    transition: all 0.3s ease;
  }
  
  .guest-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(38, 33, 30, 0.15);
  }
  
  .guest-card-img {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: var(--charcoal);
    margin: 0 auto 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--beige);
    font-size: 3rem;
    overflow: hidden;
  }
  
  .guest-card-img img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .guest-card-name {
    color: var(--charcoal);
    margin-bottom: 0.5rem;
  }
  
  .guest-card-title {
    color: var(--secondary-gray);
    font-size: 0.95rem;
    margin-bottom: 1rem;
  }
  
  .guest-card-episodes {
    color: var(--warm-gray);
    font-size: 0.85rem;
  }
  
  /* About Section */
  .about-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    align-items: center;
  }
  
  .about-image {
    position: relative;
  }
  
  .about-image img {
    border-radius: 16px;
    box-shadow: 0 30px 60px rgba(0,0,0,0.2);
  }
  
  .about-content h2 {
    margin-bottom: 1.5rem;
  }
  
  .about-content p {
    color: var(--secondary-gray);
    margin-bottom: 1.5rem;
    line-height: 1.8;
  }
  
  .values-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    margin-top: 2rem;
  }
  
  .value-item {
    background: var(--beige);
    padding: 1.5rem;
    border-radius: 12px;
    text-align: center;
  }
  
  .value-item i {
    font-size: 2rem;
    color: var(--charcoal);
    margin-bottom: 1rem;
  }
  
  .value-item h4 {
    color: var(--charcoal);
    margin-bottom: 0.5rem;
  }
  
  /* Contact Form */
  .contact-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
  }
  
  .contact-form {
    background: var(--white);
    padding: 3rem;
    border-radius: 16px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: var(--charcoal);
  }
  
  .form-group input,
  .form-group textarea,
  .form-group select {
    width: 100%;
    padding: 1rem;
    border: 2px solid var(--beige);
    border-radius: 8px;
    font-family: var(--font-body);
    font-size: 1rem;
    transition: all 0.3s ease;
    background: var(--white);
  }
  
  .form-group input:focus,
  .form-group textarea:focus,
  .form-group select:focus {
    outline: none;
    border-color: var(--charcoal);
  }
  
  .form-group textarea {
    min-height: 150px;
    resize: vertical;
  }
  
  .contact-info {
    padding: 2rem;
  }
  
  .contact-info h3 {
    margin-bottom: 1.5rem;
  }
  
  .contact-socials {
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
    flex-wrap: wrap;
  }
  
  .contact-social-link {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: var(--beige);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--charcoal);
    font-size: 1.25rem;
    transition: all 0.3s ease;
  }
  
  .contact-social-link:hover {
    background: var(--charcoal);
    color: var(--beige);
    transform: translateY(-5px);
  }
  
  /* Footer */
  .footer {
    background: var(--charcoal);
    color: var(--beige);
    padding: 4rem 2rem 2rem;
  }
  
  .footer-container {
    max-width: 1400px;
    margin: 0 auto;
  }
  
  .footer-main {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 4rem;
    padding-bottom: 3rem;
    border-bottom: 1px solid rgba(228, 225, 214, 0.1);
  }
  
  .footer-brand {
    text-align: ${isRTL(lang) ? 'right' : 'left'};
  }
  
  .footer-logo {
    width: 80px;
    height: 80px;
    margin-bottom: 1rem;
  }
  
  .footer-tagline {
    color: var(--warm-gray);
  }
  
  .footer-links {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }
  
  .footer-col h4 {
    margin-bottom: 1rem;
    font-size: 1rem;
  }
  
  .footer-col a {
    display: block;
    color: var(--warm-gray);
    margin-bottom: 0.5rem;
    transition: color 0.2s ease;
  }
  
  .footer-col a:hover {
    color: var(--beige);
  }
  
  .footer-socials {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }
  
  .footer-socials a {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(228, 225, 214, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
  }
  
  .footer-socials a:hover {
    background: var(--beige);
    color: var(--charcoal);
  }
  
  .footer-bottom {
    padding-top: 2rem;
    display: flex;
    justify-content: space-between;
    color: var(--secondary-gray);
    font-size: 0.9rem;
  }
  
  /* Filters */
  .filters {
    display: flex;
    gap: 1rem;
    margin-bottom: 3rem;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .filter-btn {
    padding: 0.75rem 1.5rem;
    border: 2px solid var(--charcoal);
    background: transparent;
    border-radius: 50px;
    font-family: var(--font-heading);
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.3s ease;
    color: var(--charcoal);
  }
  
  .filter-btn:hover,
  .filter-btn.active {
    background: var(--charcoal);
    color: var(--beige);
  }
  
  /* Page Headers */
  .page-header {
    background: var(--charcoal);
    padding: 10rem 2rem 5rem;
    text-align: center;
  }
  
  .page-header h1 {
    color: var(--beige);
    margin-bottom: 1rem;
  }
  
  .page-header p {
    color: var(--warm-gray);
    max-width: 600px;
    margin: 0 auto;
  }
  
  /* Guest Detail Page */
  .guest-detail-header {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 3rem;
    margin-bottom: 4rem;
  }
  
  .guest-detail-img {
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: var(--charcoal);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--beige);
    font-size: 6rem;
    overflow: hidden;
  }
  
  .guest-detail-info h1 {
    margin-bottom: 0.5rem;
  }
  
  .guest-detail-title {
    color: var(--secondary-gray);
    font-size: 1.25rem;
    margin-bottom: 2rem;
  }
  
  .guest-bio {
    line-height: 1.8;
    margin-bottom: 2rem;
  }
  
  .guest-highlights {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: 2rem;
  }
  
  .highlight-tag {
    background: var(--beige);
    padding: 0.5rem 1rem;
    border-radius: 50px;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .guest-quotes {
    background: var(--beige);
    padding: 2rem;
    border-radius: 16px;
    margin-bottom: 2rem;
  }
  
  .quote-item {
    font-style: italic;
    font-size: 1.1rem;
    padding: 1rem 0;
    border-bottom: 1px solid rgba(38, 33, 30, 0.1);
    position: relative;
    padding-${isRTL(lang) ? 'right' : 'left'}: 2rem;
  }
  
  .quote-item:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
  
  .quote-item::before {
    content: '"';
    position: absolute;
    ${isRTL(lang) ? 'right' : 'left'}: 0;
    top: 1rem;
    font-size: 2rem;
    color: var(--charcoal);
    font-family: Georgia, serif;
  }
  
  /* Episode Detail */
  .episode-detail-hero {
    background: var(--charcoal);
    padding: 10rem 2rem 5rem;
  }
  
  .episode-detail-content {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 3rem;
  }
  
  .episode-detail-main h1 {
    color: var(--beige);
    margin-bottom: 1rem;
  }
  
  .episode-detail-sidebar {
    background: var(--beige);
    padding: 2rem;
    border-radius: 16px;
    height: fit-content;
  }
  
  .chapters-list {
    list-style: none;
  }
  
  .chapters-list li {
    padding: 1rem 0;
    border-bottom: 1px solid rgba(38, 33, 30, 0.1);
    display: flex;
    gap: 1rem;
    align-items: flex-start;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .chapters-list li:hover {
    color: var(--charcoal);
    padding-${isRTL(lang) ? 'right' : 'left'}: 0.5rem;
  }
  
  .chapter-time {
    background: var(--charcoal);
    color: var(--beige);
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
    font-family: monospace;
    white-space: nowrap;
  }
  
  /* Navigation Buttons */
  .episode-nav {
    display: flex;
    justify-content: space-between;
    gap: 2rem;
    margin-top: 3rem;
    padding-top: 3rem;
    border-top: 1px solid var(--beige);
  }
  
  .episode-nav-btn {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    background: rgba(228, 225, 214, 0.1);
    border-radius: 12px;
    transition: all 0.3s ease;
  }
  
  .episode-nav-btn:hover {
    background: rgba(228, 225, 214, 0.2);
  }
  
  .episode-nav-btn.next {
    flex-direction: row-reverse;
    text-align: ${isRTL(lang) ? 'left' : 'right'};
  }
  
  .episode-nav-btn span {
    color: var(--warm-gray);
    font-size: 0.9rem;
  }
  
  .episode-nav-btn strong {
    display: block;
    color: var(--beige);
    margin-top: 0.25rem;
  }
  
  /* Share Buttons */
  .share-buttons {
    display: flex;
    gap: 0.75rem;
    margin-top: 1.5rem;
  }
  
  .share-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 1px solid var(--charcoal);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    cursor: pointer;
    background: transparent;
    color: var(--charcoal);
  }
  
  .share-btn:hover {
    background: var(--charcoal);
    color: var(--beige);
  }
  
  /* Responsive */
  @media (max-width: 1024px) {
    .latest-episode {
      grid-template-columns: 1fr;
    }
    
    .about-grid,
    .contact-grid {
      grid-template-columns: 1fr;
    }
    
    .footer-main {
      grid-template-columns: 1fr;
      gap: 2rem;
    }
    
    .guest-detail-header {
      grid-template-columns: 1fr;
      text-align: center;
    }
    
    .guest-detail-img {
      margin: 0 auto;
    }
    
    .episode-detail-content {
      grid-template-columns: 1fr;
    }
  }
  
  @media (max-width: 768px) {
    .nav-menu {
      position: fixed;
      top: 0;
      ${isRTL(lang) ? 'left' : 'right'}: 0;
      width: 80%;
      max-width: 300px;
      height: 100vh;
      background: var(--charcoal);
      flex-direction: column;
      padding: 5rem 2rem;
      transform: translateX(${isRTL(lang) ? '-100%' : '100%'});
      transition: transform 0.3s ease;
      gap: 1rem;
    }
    
    .nav-menu.open {
      transform: translateX(0);
    }
    
    .nav-link {
      font-size: 1.25rem;
    }
    
    .nav-toggle {
      display: block;
    }
    
    .hero-logo {
      width: 140px;
      height: 140px;
    }
    
    .footer-links {
      grid-template-columns: 1fr;
      text-align: center;
    }
    
    .footer-bottom {
      flex-direction: column;
      text-align: center;
      gap: 0.5rem;
    }
    
    .episodes-timeline {
      grid-template-columns: 1fr;
    }
    
    .guests-grid {
      grid-template-columns: 1fr;
    }
    
    .values-grid {
      grid-template-columns: 1fr;
    }
    
    .episode-nav {
      flex-direction: column;
    }
    
    .guest-detail-img {
      width: 200px;
      height: 200px;
      font-size: 4rem;
    }
  }
  
  /* Animation Classes */
  .fade-in {
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.6s ease;
  }
  
  .fade-in.visible {
    opacity: 1;
    transform: translateY(0);
  }
  
  .slide-in-left {
    opacity: 0;
    transform: translateX(-50px);
    transition: all 0.6s ease;
  }
  
  .slide-in-left.visible {
    opacity: 1;
    transform: translateX(0);
  }
  
  .slide-in-right {
    opacity: 0;
    transform: translateX(50px);
    transition: all 0.6s ease;
  }
  
  .slide-in-right.visible {
    opacity: 1;
    transform: translateX(0);
  }
</style>
`

// JavaScript for interactions
const getScripts = () => `
<script>
  // Hide loader when page is loaded
  window.addEventListener('load', () => {
    setTimeout(() => {
      document.getElementById('loader')?.classList.add('hidden');
    }, 800);
  });
  
  // Navbar scroll effect
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const nav = document.getElementById('mainNav');
    if (window.scrollY > 50) {
      nav?.classList.add('scrolled');
    } else {
      nav?.classList.remove('scrolled');
    }
    lastScroll = window.scrollY;
  });
  
  // Mobile menu toggle
  function toggleMenu() {
    document.getElementById('navMenu')?.classList.toggle('open');
  }
  
  // Language dropdown toggle
  function toggleLangMenu() {
    document.getElementById('langDropdown')?.classList.toggle('show');
  }
  
  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.lang-switcher')) {
      document.getElementById('langDropdown')?.classList.remove('show');
    }
    if (!e.target.closest('.nav-toggle') && !e.target.closest('.nav-menu')) {
      document.getElementById('navMenu')?.classList.remove('open');
    }
  });
  
  // Intersection Observer for animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);
  
  document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right').forEach(el => {
    observer.observe(el);
  });
  
  // Filter functionality
  function filterEpisodes(theme) {
    const cards = document.querySelectorAll('.episode-card');
    const buttons = document.querySelectorAll('.filter-btn');
    
    buttons.forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.theme === theme) {
        btn.classList.add('active');
      }
    });
    
    cards.forEach(card => {
      if (theme === 'all') {
        card.style.display = 'block';
      } else {
        const cardThemes = (card.dataset.themes || '').split(',').map(s => s.trim());
        card.style.display = cardThemes.includes(theme) ? 'block' : 'none';
      }
    });
  }
  
  // Share functionality
  function shareEpisode(platform, url, title) {
    let shareUrl = '';
    switch(platform) {
      case 'twitter':
        shareUrl = 'https://twitter.com/intent/tweet?url=' + encodeURIComponent(url) + '&text=' + encodeURIComponent(title);
        break;
      case 'facebook':
        shareUrl = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url);
        break;
      case 'linkedin':
        shareUrl = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url);
        break;
      case 'whatsapp':
        shareUrl = 'https://wa.me/?text=' + encodeURIComponent(title + ' ' + url);
        break;
    }
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  }
  
  // Contact form handling
  function handleSubmit(e) {
    e.preventDefault();
    // Here you would typically send the form data to an API
    alert('Thank you! Your message has been sent.');
    e.target.reset();
    return false;
  }
</script>
`

// ==================== ROUTES ====================

// Home Page
app.get('/', async (c) => {
  const lang = getLang(c)
  const t = translations[lang]
  const allEpisodes = await getEpisodes(env<{DATABASE_URL: string}>(c).DATABASE_URL)
  const latestEp = allEpisodes[0]
  const guest = latestEp ? await getGuestById(env<{DATABASE_URL: string}>(c).DATABASE_URL, latestEp.guestId) : null

  return c.html(`
    <!DOCTYPE html>
    <html lang="${lang}" dir="${getDirection(lang)}">
    <head>
      ${getHead(t.hero.title, lang, t.hero.mission)}
      ${getStyles(lang)}
    </head>
    <body>
      ${getLoader()}
      ${getNav(lang, t, 'home')}
      
      <!-- Hero Section -->
      <section class="hero">
        <div class="hero-content">
          <img src="/static/images/qad-logo.png" alt="QAD Podcast" class="hero-logo">
          <h1 class="hero-title">${t.hero.title}</h1>
          <p class="hero-tagline">${t.hero.tagline}</p>
          <p class="hero-mission">${t.hero.mission}</p>
          <div class="hero-buttons">
            <a href="https://youtube.com/@qadpodcast" target="_blank" class="btn btn-primary">
              <i class="fab fa-youtube"></i>
              ${t.hero.watchYoutube}
            </a>
            <a href="https://www.youtube.com/watch?v=YLGS-aJp_iY&t=5s" target="_blank" class="btn btn-secondary">
              <i class="fas fa-play"></i>
              ${t.hero.latestEpisode}
            </a>
          </div>
        </div>
      </section>
      
      <!-- Latest Episode Section -->
      <section class="section section-dark">
        <div class="container">
          <div class="section-header fade-in">
            <h2 class="section-title">${t.hero.latestEpisode}</h2>
          </div>
          
          ${(await Promise.all([latestEp].filter(Boolean).map(async (ep, idx) => {
    const epGuest = await getGuestById(env<{DATABASE_URL: string}>(c).DATABASE_URL, ep.guestId);
    const ytId = extractYoutubeId(ep.youtubeId);
    return `
          <div class="latest-episode fade-in" style="margin-bottom: ${idx < allEpisodes.length - 1 ? '3rem' : '0'};">
            <div class="video-wrapper">
              <iframe 
                src="https://www.youtube.com/embed/${ytId}"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
                loading="lazy"
              ></iframe>
            </div>
            
            <div class="episode-info slide-in-right">
              <span class="episode-number">${t.episodes.episode} ${ep.number}</span>
              <h3 class="episode-title">${ep.title[lang]}</h3>
              
              <div class="episode-guest">
                <div class="guest-avatar">
                  <i class="fas fa-user"></i>
                </div>
                <div class="guest-details">
                  <h4>${ep.guestName[lang]}</h4>
                  ${epGuest ? `<span>${epGuest.title[lang]}</span>` : ''}
                </div>
              </div>
              
              <p class="episode-description">${ep.description[lang]}</p>
              
              <div class="episode-meta">
                <span class="meta-item">
                  <i class="far fa-calendar"></i>
                  ${formatDate(ep.date, lang)}
                </span>
                <span class="meta-item">
                  <i class="far fa-clock"></i>
                  ${ep.duration}
                </span>
              </div>
              
              <a href="/episode/${ep.id}?lang=${lang}" class="btn btn-primary">
                <i class="fas fa-play"></i>
                ${t.episodes.watch}
              </a>
            </div>
          </div>
          `;
  }))).join('')}
        </div>
      </section>
      
      <!-- Episodes Timeline Section -->
      <section class="section section-beige">
        <div class="container">
          <div class="section-header fade-in">
            <h2 class="section-title">${t.episodes.title}</h2>
            <p class="section-subtitle">${t.episodes.subtitle}</p>
          </div>
          
          <div class="episodes-timeline">
            ${allEpisodes.slice(0, 6).map((ep, i) => `
              <a href="/episode/${ep.id}?lang=${lang}" class="episode-card fade-in" style="transition-delay: ${i * 0.1}s" data-themes="${ep.themes.join(',')}">
                <div class="episode-card-img">
                  <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;">
                    <img src="/static/images/qad-logo.png" alt="${ep.title[lang]}" style="width:60%;height:auto;opacity:0.5;">
                  </div>
                  <div class="episode-card-play">
                    <i class="fas fa-play"></i>
                  </div>
                </div>
                <div class="episode-card-content">
                  <span class="episode-card-number">${t.episodes.episode} ${ep.number}</span>
                  <h3 class="episode-card-title">${ep.title[lang]}</h3>
                  <p class="episode-card-guest">${ep.guestName[lang]}</p>
                  <div class="episode-card-meta">
                    <span>${formatDate(ep.date, lang)}</span>
                    <span>${ep.duration}</span>
                  </div>
                </div>
              </a>
            `).join('')}
          </div>
          
          <div style="text-align:center;margin-top:3rem;">
            <a href="/episodes?lang=${lang}" class="btn btn-primary">
              ${t.common.viewAll}
              <i class="fas fa-arrow-${isRTL(lang) ? 'left' : 'right'}"></i>
            </a>
          </div>
        </div>
      </section>
      
      <!-- Guests Spotlight Section -->
      <section class="section">
        <div class="container">
          <div class="section-header fade-in">
            <h2 class="section-title">${t.guests.title}</h2>
            <p class="section-subtitle">${t.guests.subtitle}</p>
          </div>
          
          <div class="guests-grid">
            ${(await getGuests(env<{DATABASE_URL: string}>(c).DATABASE_URL)).slice(0, 6).map((g, i) => `
              <a href="/guest/${g.id}?lang=${lang}" class="guest-card fade-in" style="transition-delay: ${i * 0.1}s">
                <div class="guest-card-img">
                  <i class="fas fa-user"></i>
                </div>
                <h3 class="guest-card-name">${g.name[lang]}</h3>
                <p class="guest-card-title">${g.title[lang]}</p>
                <p class="guest-card-episodes">${g.episodeIds.length} ${t.guests.episodes}</p>
              </a>
            `).join('')}
          </div>
          
          <div style="text-align:center;margin-top:3rem;">
            <a href="/guests?lang=${lang}" class="btn btn-secondary" style="border-color:var(--charcoal);color:var(--charcoal);">
              ${t.common.viewAll}
              <i class="fas fa-arrow-${isRTL(lang) ? 'left' : 'right'}"></i>
            </a>
          </div>
        </div>
      </section>
      
      <!-- About Preview Section -->
      <section class="section section-dark">
        <div class="container">
          <div class="about-grid">
            <div class="about-image slide-in-left">
              <img src="/static/images/qad-logo.png" alt="QAD Podcast" style="width:80%;margin:0 auto;display:block;">
            </div>
            <div class="about-content slide-in-right">
              <h2>${t.about.whyQad}</h2>
              <p>${t.about.whyQadDesc}</p>
              <a href="/about?lang=${lang}" class="btn btn-primary">
                ${t.common.readMore}
                <i class="fas fa-arrow-${isRTL(lang) ? 'left' : 'right'}"></i>
              </a>
            </div>
          </div>
        </div>
      </section>
      
      ${getFooter(lang, t)}
      ${getScripts()}
    </body>
    </html>
  `)
})

// Episodes Archive Page
app.get('/episodes', async (c) => {
  const lang = getLang(c)
  const t = translations[lang]
  const themes = ['culture', 'history', 'religion']
  const allEpisodes = await getEpisodes(env<{DATABASE_URL: string}>(c).DATABASE_URL)

  return c.html(`
    <!DOCTYPE html>
    <html lang="${lang}" dir="${getDirection(lang)}">
    <head>
      ${getHead(t.episodes.title, lang, t.episodes.subtitle)}
      ${getStyles(lang)}
    </head>
    <body>
      ${getLoader()}
      ${getNav(lang, t, 'episodes')}
      
      <header class="page-header">
        <h1>${t.episodes.title}</h1>
        <p>${t.episodes.subtitle}</p>
      </header>
      
      <section class="section section-beige">
        <div class="container">
          <div class="filters fade-in">
            <button class="filter-btn active" data-theme="all" onclick="filterEpisodes('all')">${t.episodes.filter.all}</button>
            ${themes.map(theme => `
              <button class="filter-btn" data-theme="${theme}" onclick="filterEpisodes('${theme}')">${theme.charAt(0).toUpperCase() + theme.slice(1)}</button>
            `).join('')}
          </div>
          
          <div class="episodes-timeline">
            ${allEpisodes.map((ep, i) => `
              <a href="/episode/${ep.id}?lang=${lang}" class="episode-card fade-in" style="transition-delay: ${i * 0.05}s" data-themes="${ep.themes.join(',')}">
                <div class="episode-card-img">
                  <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;">
                    ${ep.thumbnail ? `<img src="${ep.thumbnail}" alt="${ep.title[lang]}" style="width:100%;height:100%;object-fit:cover;">` : `<img src="/static/images/qad-logo.png" alt="${ep.title[lang]}" style="width:60%;height:auto;opacity:0.5;">`}
                  </div>
                  <div class="episode-card-play">
                    <i class="fas fa-play"></i>
                  </div>
                </div>
                <div class="episode-card-content">
                  <span class="episode-card-number">${t.episodes.episode} ${ep.number} • ${t.episodes.filter.season} ${ep.season}</span>
                  <h3 class="episode-card-title">${ep.title[lang]}</h3>
                  <p class="episode-card-guest">${ep.guestName[lang]}</p>
                  <div class="episode-card-meta">
                    <span>${formatDate(ep.date, lang)}</span>
                    <span>${ep.duration}</span>
                  </div>
                </div>
              </a>
            `).join('')}
          </div>
        </div>
      </section>
      
      ${getFooter(lang, t)}
      ${getScripts()}
    </body>
    </html>
  `)
})

// Episode Detail Page
app.get('/episode/:id', async (c) => {
  const lang = getLang(c)
  const t = translations[lang]
  const id = c.req.param('id')
  const allEpisodes = await getEpisodes(env<{DATABASE_URL: string}>(c).DATABASE_URL)
  const ep = allEpisodes.find(e => e.id === id)

  if (!ep) {
    return c.notFound()
  }

  const guest = await getGuestById(env<{DATABASE_URL: string}>(c).DATABASE_URL, ep.guestId)
  const epIndex = allEpisodes.findIndex(e => e.id === id)
  const prevEp = epIndex < allEpisodes.length - 1 ? allEpisodes[epIndex + 1] : null
  const nextEp = epIndex > 0 ? allEpisodes[epIndex - 1] : null

  return c.html(`
    <!DOCTYPE html>
    <html lang="${lang}" dir="${getDirection(lang)}">
    <head>
      ${getHead(ep.title[lang], lang, ep.description[lang])}
      ${getStyles(lang)}
      <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "PodcastEpisode",
        "name": "${ep.title[lang]}",
        "description": "${ep.description[lang]}",
        "datePublished": "${ep.date}",
        "duration": "${ep.duration}",
        "episodeNumber": ${ep.number},
        "partOfSeries": {
          "@type": "PodcastSeries",
          "name": "QAD Podcast"
        }
      }
      </script>
    </head>
    <body>
      ${getLoader()}
      ${getNav(lang, t, 'episodes')}
      
      <header class="episode-detail-hero">
        <div class="episode-detail-content">
          <div class="episode-detail-main">
            <span class="episode-number" style="color:var(--warm-gray);">${t.episodes.episode} ${ep.number} • ${t.episodes.filter.season} ${ep.season}</span>
            <h1>${ep.title[lang]}</h1>
            
            <div class="episode-guest" style="margin:1.5rem 0;">
              <div class="guest-avatar">
                <i class="fas fa-user"></i>
              </div>
              <div class="guest-details">
                <h4 style="color:var(--beige);">${ep.guestName[lang]}</h4>
                ${guest ? `<span style="color:var(--warm-gray);">${guest.title[lang]}</span>` : ''}
              </div>
            </div>
            
            <div class="episode-meta" style="margin-bottom:2rem;">
              <span class="meta-item" style="color:var(--warm-gray);">
                <i class="far fa-calendar" style="color:var(--beige);"></i>
                ${formatDate(ep.date, lang)}
              </span>
              <span class="meta-item" style="color:var(--warm-gray);">
                <i class="far fa-clock" style="color:var(--beige);"></i>
                ${ep.duration}
              </span>
            </div>
            
            <div class="video-wrapper" style="margin-bottom:2rem;">
              <iframe 
                src="https://www.youtube.com/embed/${extractYoutubeId(ep.youtubeId)}"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
                loading="lazy"
              ></iframe>
            </div>
            
            <p style="color:var(--warm-gray);line-height:1.8;margin-bottom:2rem;">${ep.description[lang]}</p>
            
            <div class="share-buttons">
              <button class="share-btn" onclick="shareEpisode('twitter', window.location.href, '${ep.title[lang]}')" style="border-color:var(--beige);color:var(--beige);">
                <i class="fab fa-x-twitter"></i>
              </button>
              <button class="share-btn" onclick="shareEpisode('facebook', window.location.href, '${ep.title[lang]}')" style="border-color:var(--beige);color:var(--beige);">
                <i class="fab fa-facebook-f"></i>
              </button>
              <button class="share-btn" onclick="shareEpisode('linkedin', window.location.href, '${ep.title[lang]}')" style="border-color:var(--beige);color:var(--beige);">
                <i class="fab fa-linkedin-in"></i>
              </button>
              <button class="share-btn" onclick="shareEpisode('whatsapp', window.location.href, '${ep.title[lang]}')" style="border-color:var(--beige);color:var(--beige);">
                <i class="fab fa-whatsapp"></i>
              </button>
            </div>
            
            <!-- Episode Navigation -->
            <div class="episode-nav">
              ${prevEp ? `
                <a href="/episode/${prevEp.id}?lang=${lang}" class="episode-nav-btn">
                  <i class="fas fa-arrow-${isRTL(lang) ? 'right' : 'left'}" style="color:var(--beige);"></i>
                  <div>
                    <span>${t.episodes.previous}</span>
                    <strong>${prevEp.title[lang]}</strong>
                  </div>
                </a>
              ` : '<div></div>'}
              ${nextEp ? `
                <a href="/episode/${nextEp.id}?lang=${lang}" class="episode-nav-btn next">
                  <i class="fas fa-arrow-${isRTL(lang) ? 'left' : 'right'}" style="color:var(--beige);"></i>
                  <div>
                    <span>${t.episodes.next}</span>
                    <strong>${nextEp.title[lang]}</strong>
                  </div>
                </a>
              ` : '<div></div>'}
            </div>
          </div>
          
          <div class="episode-detail-sidebar">
            <h4 style="margin-bottom:1rem;">${t.episodes.chapters}</h4>
            <ul class="chapters-list">
              ${ep.chapters.map(ch => `
                <li>
                  <span class="chapter-time">${ch.time}</span>
                  <span>${ch.title[lang]}</span>
                </li>
              `).join('')}
            </ul>
            
            ${guest ? `
              <div style="margin-top:2rem;padding-top:2rem;border-top:1px solid rgba(38,33,30,0.1);">
                <h4 style="margin-bottom:1rem;">${t.guests.bio}</h4>
                <a href="/guest/${guest.id}?lang=${lang}" style="display:flex;align-items:center;gap:1rem;">
                  <div style="width:60px;height:60px;border-radius:50%;background:var(--charcoal);display:flex;align-items:center;justify-content:center;color:var(--beige);font-size:1.5rem;">
                    <i class="fas fa-user"></i>
                  </div>
                  <div>
                    <strong style="display:block;">${guest.name[lang]}</strong>
                    <span style="color:var(--secondary-gray);font-size:0.9rem;">${guest.title[lang]}</span>
                  </div>
                </a>
              </div>
            ` : ''}
          </div>
        </div>
      </header>
      
      ${getFooter(lang, t)}
      ${getScripts()}
    </body>
    </html>
  `)
})

// Guests Page
app.get('/guests', async (c) => {
  const lang = getLang(c)
  const t = translations[lang]

  return c.html(`
    <!DOCTYPE html>
    <html lang="${lang}" dir="${getDirection(lang)}">
    <head>
      ${getHead(t.guests.title, lang, t.guests.subtitle)}
      ${getStyles(lang)}
    </head>
    <body>
      ${getLoader()}
      ${getNav(lang, t, 'guests')}
      
      <header class="page-header">
        <h1>${t.guests.title}</h1>
        <p>${t.guests.subtitle}</p>
      </header>
      
      <section class="section">
        <div class="container">
          <div class="guests-grid">
            ${(await getGuests(env<{DATABASE_URL: string}>(c).DATABASE_URL)).map((g, i) => `
              <a href="/guest/${g.id}?lang=${lang}" class="guest-card fade-in" style="transition-delay: ${i * 0.1}s">
                <div class="guest-card-img">
                  <i class="fas fa-user"></i>
                </div>
                <h3 class="guest-card-name">${g.name[lang]}</h3>
                <p class="guest-card-title">${g.title[lang]}</p>
                <p class="guest-card-episodes">${g.episodeIds.length} ${t.guests.episodes}</p>
              </a>
            `).join('')}
          </div>
        </div>
      </section>
      
      ${getFooter(lang, t)}
      ${getScripts()}
    </body>
    </html>
  `)
})

// Guest Detail Page
app.get('/guest/:id', async (c) => {
  const lang = getLang(c)
  const t = translations[lang]
  const id = c.req.param('id')
  const guest = await getGuestById(env<{DATABASE_URL: string}>(c).DATABASE_URL, id)

  if (!guest) {
    return c.notFound()
  }

  const allEpisodes = await getEpisodes(env<{DATABASE_URL: string}>(c).DATABASE_URL)
  const guestEpisodes = allEpisodes.filter(ep => guest.episodeIds.includes(ep.id))

  return c.html(`
    <!DOCTYPE html>
    <html lang="${lang}" dir="${getDirection(lang)}">
    <head>
      ${getHead(guest.name[lang], lang, guest.bio[lang])}
      ${getStyles(lang)}
    </head>
    <body>
      ${getLoader()}
      ${getNav(lang, t, 'guests')}
      
      <header class="page-header">
        <div class="container">
          <div class="guest-detail-header fade-in">
            <div class="guest-detail-img">
              <i class="fas fa-user"></i>
            </div>
            <div class="guest-detail-info">
              <h1>${guest.name[lang]}</h1>
              <p class="guest-detail-title">${guest.title[lang]}</p>
              
              <p class="guest-bio" style="color:var(--warm-gray);">${guest.bio[lang]}</p>
              
              <div class="guest-highlights">
                ${guest.highlights[lang].map(h => `
                  <span class="highlight-tag">
                    <i class="fas fa-check-circle" style="color:var(--charcoal);"></i>
                    ${h}
                  </span>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <section class="section section-beige">
        <div class="container">
          <h2 style="margin-bottom:2rem;">${t.guests.quotes}</h2>
          <div class="guest-quotes fade-in">
            ${guest.quotes[lang].map(q => `
              <div class="quote-item">${q}</div>
            `).join('')}
          </div>
        </div>
      </section>
      
      <section class="section">
        <div class="container">
          <h2 style="margin-bottom:2rem;">${t.guests.episodes}</h2>
          <div class="episodes-timeline">
            ${guestEpisodes.map((ep, i) => `
              <a href="/episode/${ep.id}?lang=${lang}" class="episode-card fade-in" style="transition-delay: ${i * 0.1}s">
                <div class="episode-card-img">
                  <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;">
                    <img src="/static/images/qad-logo.png" alt="${ep.title[lang]}" style="width:60%;height:auto;opacity:0.5;">
                  </div>
                  <div class="episode-card-play">
                    <i class="fas fa-play"></i>
                  </div>
                </div>
                <div class="episode-card-content">
                  <span class="episode-card-number">${t.episodes.episode} ${ep.number}</span>
                  <h3 class="episode-card-title">${ep.title[lang]}</h3>
                  <div class="episode-card-meta">
                    <span>${formatDate(ep.date, lang)}</span>
                    <span>${ep.duration}</span>
                  </div>
                </div>
              </a>
            `).join('')}
          </div>
        </div>
      </section>
      
      ${getFooter(lang, t)}
      ${getScripts()}
    </body>
    </html>
  `)
})

// About Page
app.get('/about', async (c) => {
  const lang = getLang(c)
  const t = translations[lang]

  return c.html(`
    <!DOCTYPE html>
    <html lang="${lang}" dir="${getDirection(lang)}">
    <head>
      ${getHead(t.about.title, lang, t.about.visionDesc)}
      ${getStyles(lang)}
    </head>
    <body>
      ${getLoader()}
      ${getNav(lang, t, 'about')}
      
      <header class="page-header" style="background:var(--charcoal);color:var(--beige);padding:10rem 2rem 5rem;text-align:center;">
        <div class="container" style="max-width:800px;margin:0 auto;">
          <h1 style="margin-bottom:1.5rem;font-size:clamp(2rem, 4vw, 3.5rem);">${t.about.title}</h1>
        </div>
      </header>
      
      <!-- Vision -->
      <section class="section">
        <div class="container">
          <div class="about-grid">
            <div class="about-image slide-in-left">
              <img src="/static/images/qad-logo.png" alt="QAD Podcast Logo" style="width:80%;max-width:400px;margin:0 auto;display:block;border-radius:16px;">
            </div>
            <div class="about-content slide-in-right">
              <h2 style="font-size:clamp(1.8rem, 3vw, 2.5rem);margin-bottom:1.5rem;color:var(--charcoal);">${t.about.vision}</h2>
              <p style="font-size:1.15rem;line-height:1.9;color:var(--secondary-gray);">${t.about.visionDesc}</p>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Mission -->
      <section class="section section-beige">
        <div class="container">
          <div style="text-align:center;margin-bottom:4rem;">
            <h2 style="font-size:clamp(1.8rem, 3vw, 2.5rem);color:var(--charcoal);">${t.about.mission}</h2>
            <div style="width:60px;height:4px;background:var(--charcoal);margin:1rem auto 0;border-radius:2px;"></div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:2.5rem;">
            ${(t.about.missionPoints || []).map((point: any, index: number) => `
              <div class="fade-in" style="background:var(--white);padding:2.5rem;border-radius:20px;box-shadow:0 15px 40px rgba(0,0,0,0.06);transition-delay:${index * 0.1}s;border-top:4px solid var(--charcoal);">
                <div style="width:50px;height:50px;background:var(--beige);border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:1.5rem;">
                  <i class="fas fa-check" style="color:var(--charcoal);font-size:1.2rem;"></i>
                </div>
                <h3 style="margin-bottom:1rem;color:var(--charcoal);font-size:1.3rem;">
                  ${point.title}
                </h3>
                <p style="color:var(--secondary-gray);line-height:1.8;font-size:1.05rem;">${point.desc}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
      
      <!-- Projects -->
      <section class="section">
        <div class="container" style="max-width:900px;margin:0 auto;">
          <div style="text-align:center;margin-bottom:3rem;">
            <h2 style="font-size:clamp(1.8rem, 3vw, 2.5rem);color:var(--charcoal);margin-bottom:1.5rem;">${t.about.projects}</h2>
            <p style="color:var(--secondary-gray);font-size:1.15rem;line-height:1.8;">${t.about.projectsDesc}</p>
          </div>
          
          <div class="projects-list" style="display:flex;flex-direction:column;gap:1.5rem;">
            ${(t.about.projectsPoints || []).map((item: string, index: number) => `
              <div class="fade-in" style="display:flex;align-items:center;gap:1.5rem;background:var(--beige);padding:1.5rem 2rem;border-radius:16px;transition-delay:${index * 0.1}s;box-shadow:0 10px 30px rgba(0,0,0,0.03);">
                <div style="background:var(--charcoal);color:var(--beige);width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:1.2rem;flex-shrink:0;">
                  ${index + 1}
                </div>
                <p style="color:var(--charcoal);margin:0;line-height:1.7;font-size:1.1rem;font-weight:500;">${item}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
      
      <!-- Why QAD -->
      <section class="section section-dark">
        <div class="container" style="text-align:center;max-width:900px;padding:2rem 0;">
          <h2 style="font-size:clamp(1.8rem, 3vw, 2.5rem);margin-bottom:1.5rem;color:var(--beige);">${t.about.whyQad}</h2>
          <p style="color:var(--warm-gray);margin:0 auto 3rem;line-height:1.9;font-size:1.15rem;">${t.about.whyQadDesc}</p>
          <a href="https://qadfoundation.org" target="_blank" class="btn btn-primary" style="padding:1rem 2.5rem;font-size:1.1rem;">
            ${t.common.readMore}
            <i class="fas fa-external-link-alt" style="margin-${isRTL(lang) ? 'right' : 'left'}:0.75rem;"></i>
          </a>
        </div>
      </section>
      
      ${getFooter(lang, t)}
      ${getScripts()}
    </body>
    </html>
  `)
})

// Contact Page
app.get('/contact', async (c) => {
  const lang = getLang(c)
  const t = translations[lang]

  return c.html(`
    <!DOCTYPE html>
  <html lang="${lang}" dir="${getDirection(lang)}">
    <head>
      ${getHead(t.contact.title, lang, t.contact.subtitle)}
      ${getStyles(lang)}
    </head>
    <body>
      ${getLoader()}
      ${getNav(lang, t, 'contact')}

      <header class="page-header">
        <h1>${t.contact.title}</h1>
        <p>${t.contact.subtitle}</p>
      </header>

      <section class="section">
        <div class="container">
          <div class="contact-grid">
            <form class="contact-form fade-in" onsubmit="return handleSubmit(event)">
              <div class="form-group">
                <label for="name">${t.contact.name}</label>
                <input type="text" id="name" name="name" required>
              </div>
              <div class="form-group">
                <label for="email">${t.contact.email}</label>
                <input type="email" id="email" name="email" required>
              </div>
              <div class="form-group">
                <label for="subject">${t.contact.subject}</label>
                <select id="subject" name="subject" required>
                  <option value="general">General</option>
                  <option value="guest">${t.contact.suggestGuest}</option>
                  <option value="topic">${t.contact.suggestTopic}</option>
                </select>
              </div>
              <div class="form-group">
                <label for="message">${t.contact.message}</label>
                <textarea id="message" name="message" required></textarea>
              </div>
              <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center;">
                <i class="fas fa-paper-plane"></i>
                ${t.contact.send}
              </button>
            </form>

            <div class="contact-info slide-in-right">
              <h3>${t.footer.followUs}</h3>
              <p style="color:var(--secondary-gray);margin-bottom:1.5rem;line-height:1.8;">
                ${t.contact.subtitle}
              </p>

              <div class="contact-socials">
                ${socialLinks.map(s => `
                  <a href="${s.url}" target="_blank" rel="noopener" class="contact-social-link" aria-label="${s.label[lang]}">
                    <i class="${s.icon}"></i>
                  </a>
                `).join('')}
              </div>

              <div style="margin-top:3rem;padding:2rem;background:var(--beige);border-radius:16px;">
                <h4 style="margin-bottom:1rem;"><i class="fas fa-lightbulb" style="margin-${isRTL(lang) ? 'left' : 'right'}:0.5rem;"></i>${t.contact.suggestGuest}</h4>
                <p style="color:var(--secondary-gray);font-size:0.95rem;line-height:1.7;">
                  ${lang === 'en'
      ? 'Have someone in mind who would make a great guest? We\'d love to hear your suggestions!'
      : lang === 'ar'
        ? 'هل لديك شخص في ذهنك سيكون ضيفاً رائعاً؟ نحب سماع اقتراحاتك!'
        : 'کەسێکت هەیە لە بیرتدا کە میوانێکی باش دەبێت؟ حەز دەکەین پێشنیارەکانت ببیستین!'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      ${getFooter(lang, t)}
      ${getScripts()}
    </body>
  </html>
  `)
})

// ==================== API ENDPOINTS ====================


app.get('/api/episodes', async (c) => {
  return c.json(await getEpisodes(env<{DATABASE_URL: string}>(c).DATABASE_URL))
})

app.get('/api/guests', async (c) => {
  return c.json(await getGuests(env<{DATABASE_URL: string}>(c).DATABASE_URL))
})

app.get('/api/episode/:id', async (c) => {
  const id = c.req.param('id')
  const ep = await getEpisodeBySlug(env<{DATABASE_URL: string}>(c).DATABASE_URL, id)
  if (!ep) return c.json({ error: 'Not found' }, 404)
  return c.json(ep)
})

app.get('/api/guest/:id', async (c) => {
  const id = c.req.param('id')
  const g = await getGuestById(env<{DATABASE_URL: string}>(c).DATABASE_URL, id)
  if (!g) return c.json({ error: 'Not found' }, 404)
  return c.json(g)
})

// Create episode
app.post('/api/episodes', async (c) => {
  try {
    const body = await c.req.json()
    const eps = await getEpisodes(env<{DATABASE_URL: string}>(c).DATABASE_URL)
    const newEp: Episode = {
      id: body.id || `ep-${String(eps.length + 1).padStart(3, '0')}`,
      number: body.number || eps.length + 1,
      season: body.season || 1,
      title: body.title || { ckb: '', ar: '', en: '' },
      description: body.description || { ckb: '', ar: '', en: '' },
      guestId: body.guestId || '',
      guestName: body.guestName || { ckb: '', ar: '', en: '' },
      date: body.date || new Date().toISOString().split('T')[0],
      duration: body.duration || '0:00',
      youtubeId: body.youtubeId || '',
      themes: body.themes || [],
      chapters: body.chapters || [],
      thumbnail: body.thumbnail || ''
    }
    await saveEpisode(env<{DATABASE_URL: string}>(c).DATABASE_URL, newEp)
    return c.json({ success: true, episode: newEp })
  } catch (e: any) {
    return c.json({ error: e.message }, 400)
  }
})

// Update episode
app.put('/api/episodes/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.json()
    const ep = await getEpisodeBySlug(env<{DATABASE_URL: string}>(c).DATABASE_URL, id)
    if (!ep) return c.json({ error: 'Not found' }, 404)
    const updatedEp = { ...ep, ...body, id }
    await saveEpisode(env<{DATABASE_URL: string}>(c).DATABASE_URL, updatedEp)
    return c.json({ success: true, episode: updatedEp })
  } catch (e: any) {
    return c.json({ error: e.message }, 400)
  }
})

// Delete episode
app.delete('/api/episodes/:id', async (c) => {
  try {
    const id = c.req.param('id')
    await deleteEpisode(env<{DATABASE_URL: string}>(c).DATABASE_URL, id)
    return c.json({ success: true })
  } catch (e: any) {
    return c.json({ error: e.message }, 400)
  }
})

// Image upload (Disabled in production/serverless)
app.post('/api/upload', async (c) => {
  return c.json({ error: 'Image upload is disabled in production (serverless environment)' }, 403)
})

// ==================== GUEST API ENDPOINTS ====================

// List guests
app.get('/api/guests-list', async (c) => {
  return c.json(await getGuests(env<{DATABASE_URL: string}>(c).DATABASE_URL))
})

// Get single guest
app.get('/api/guest-detail/:id', async (c) => {
  const id = c.req.param('id')
  const g = await getGuestById(env<{DATABASE_URL: string}>(c).DATABASE_URL, id)
  if (!g) return c.json({ error: 'Not found' }, 404)
  return c.json(g)
})

// Create guest
app.post('/api/guests', async (c) => {
  try {
    const body = await c.req.json()
    const newGuest: Guest = {
      id: body.id || `guest-${Date.now()}`,
      name: body.name || { ckb: '', ar: '', en: '' },
      title: body.title || { ckb: '', ar: '', en: '' },
      bio: body.bio || { ckb: '', ar: '', en: '' },
      highlights: body.highlights || { ckb: [], ar: [], en: [] },
      quotes: body.quotes || { ckb: [], ar: [], en: [] },
      episodeIds: body.episodeIds || [],
      image: body.image || '',
      socialLinks: body.socialLinks || {}
    }
    await saveGuest(env<{DATABASE_URL: string}>(c).DATABASE_URL, newGuest)
    return c.json({ success: true, guest: newGuest })
  } catch (e: any) {
    return c.json({ error: e.message }, 400)
  }
})

// Update guest
app.put('/api/guests/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.json()
    const g = await getGuestById(env<{DATABASE_URL: string}>(c).DATABASE_URL, id)
    if (!g) return c.json({ error: 'Not found' }, 404)
    const updatedGuest = { ...g, ...body, id }
    await saveGuest(env<{DATABASE_URL: string}>(c).DATABASE_URL, updatedGuest)
    return c.json({ success: true, guest: updatedGuest })
  } catch (e: any) {
    return c.json({ error: e.message }, 400)
  }
})

// Delete guest
app.delete('/api/guests/:id', async (c) => {
  try {
    const id = c.req.param('id')
    await deleteGuest(env<{DATABASE_URL: string}>(c).DATABASE_URL, id)
    return c.json({ success: true })
  } catch (e: any) {
    return c.json({ error: e.message }, 400)
  }
})

// ==================== ADMIN PAGE ====================

app.get('/admin', async (c) => {
  const eps = await getEpisodes(env<{DATABASE_URL: string}>(c).DATABASE_URL)
  const themes = await getAllThemes(env<{DATABASE_URL: string}>(c).DATABASE_URL)
  const allGuests = await getGuests(env<{DATABASE_URL: string}>(c).DATABASE_URL)
  return c.html(`
<!DOCTYPE html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>QAD Admin — Episode Management</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
              <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossorigin="anonymous" referrerpolicy="no-referrer" />
                <link rel="icon" type="image/png" href="/static/images/qad-logo.png">
                  <style>
                    *, *::before, *::after {margin: 0; padding: 0; box-sizing: border-box; }
                    :root {
                      --bg: #0f0f0f;
                    --surface: #1a1a1a;
                    --surface-2: #242424;
                    --surface-3: #2e2e2e;
                    --border: #333;
                    --text: #e4e1d6;
                    --text-dim: #888;
                    --accent: #c8a97e;
                    --accent-hover: #dbbf96;
                    --danger: #e74c3c;
                    --danger-hover: #c0392b;
                    --success: #27ae60;
                    --radius: 12px;
                    --font: 'Inter', sans-serif;
        }
                    body {
                      font - family: var(--font);
                    background: var(--bg);
                    color: var(--text);
                    min-height: 100vh;
        }
                    /* Top Bar */
                    .topbar {
                      background: var(--surface);
                    border-bottom: 1px solid var(--border);
                    padding: 1rem 2rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    position: sticky;
                    top: 0;
                    z-index: 100;
                    backdrop-filter: blur(12px);
        }
                    .topbar-left {
                      display: flex;
                    align-items: center;
                    gap: 1rem;
        }
                    .topbar-logo {
                      width: 40px;
                    height: 40px;
                    border-radius: 8px;
        }
                    .topbar h1 {
                      font - size: 1.25rem;
                    font-weight: 600;
                    background: linear-gradient(135deg, var(--accent), #e8d5b7);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
        }
                    .topbar-right a {
                      color: var(--text-dim);
                    text-decoration: none;
                    font-size: 0.9rem;
                    transition: color 0.2s;
        }
                    .topbar-right a:hover {color: var(--accent); }

                    /* Layout */
                    .admin-container {
                      max - width: 1400px;
                    margin: 0 auto;
                    padding: 2rem;
        }
                    .admin-header {
                      display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
        }
                    .admin-header h2 {
                      font - size: 1.5rem;
                    font-weight: 600;
        }
                    .stats-row {
                      display: flex;
                    gap: 1rem;
                    margin-bottom: 2rem;
        }
                    .stat-card {
                      background: var(--surface);
                    border: 1px solid var(--border);
                    border-radius: var(--radius);
                    padding: 1.5rem;
                    flex: 1;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
        }
                    .stat-icon {
                      width: 48px;
                    height: 48px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.25rem;
                    background: rgba(200, 169, 126, 0.15);
                    color: var(--accent);
        }
                    .stat-value {
                      font - size: 1.5rem;
                    font-weight: 700;
        }
                    .stat-label {
                      font - size: 0.8rem;
                    color: var(--text-dim);
                    margin-top: 0.25rem;
        }

                    /* Episode Cards Grid */
                    .episodes-grid {
                      display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 2rem;
        }
                    .ep-card {
                      background: var(--surface);
                    border: 1px solid var(--border);
                    border-radius: var(--radius);
                    overflow: hidden;
                    transition: all 0.3s ease;
        }
                    .ep-card:hover {
                      border - color: var(--accent);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 30px rgba(0,0,0,0.3);
        }
                    .ep-card-thumb {
                      width: 100%;
                    height: 200px;
                    object-fit: cover;
                    background: var(--surface-2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--text-dim);
                    font-size: 3rem;
                    position: relative;
        }
                    .ep-card-thumb img {
                      width: 100%;
                    height: 100%;
                    object-fit: cover;
        }
                    .ep-card-yt {
                      position: absolute;
                    bottom: 8px;
                    right: 8px;
                    background: rgba(0,0,0,0.7);
                    color: #fff;
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-size: 0.75rem;
        }
                    .ep-card-body {
                      padding: 1.25rem;
        }
                    .ep-card-number {
                      font - size: 0.75rem;
                    color: var(--accent);
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
        }
                    .ep-card-title {
                      font - size: 1.1rem;
                    font-weight: 600;
                    margin: 0.5rem 0;
                    line-height: 1.4;
        }
                    .ep-card-guest {
                      font - size: 0.85rem;
                    color: var(--text-dim);
        }
                    .ep-card-meta {
                      display: flex;
                    gap: 1rem;
                    margin-top: 0.75rem;
                    font-size: 0.8rem;
                    color: var(--text-dim);
        }
                    .ep-card-actions {
                      display: flex;
                    gap: 0.5rem;
                    padding: 0 1.25rem 1.25rem;
        }

                    /* Buttons */
                    .btn {
                      padding: 0.6rem 1.25rem;
                    border: none;
                    border-radius: 8px;
                    font-family: var(--font);
                    font-size: 0.85rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
        }
                    .btn-accent {
                      background: var(--accent);
                    color: #1a1a1a;
        }
                    .btn-accent:hover {background: var(--accent-hover); }
                    .btn-outline {
                      background: transparent;
                    border: 1px solid var(--border);
                    color: var(--text);
        }
                    .btn-outline:hover {
                      border - color: var(--accent);
                    color: var(--accent);
        }
                    .btn-danger {
                      background: transparent;
                    border: 1px solid var(--danger);
                    color: var(--danger);
        }
                    .btn-danger:hover {
                      background: var(--danger);
                    color: #fff;
        }
                    .btn-sm {
                      padding: 0.4rem 0.75rem;
                    font-size: 0.8rem;
        }

                    /* Modal */
                    .modal-overlay {
                      display: none;
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.7);
                    z-index: 1000;
                    backdrop-filter: blur(4px);
                    overflow-y: auto;
                    padding: 2rem;
        }
                    .modal-overlay.active {display: flex; justify-content: center; align-items: flex-start; }
                    .modal {
                      background: var(--surface);
                    border: 1px solid var(--border);
                    border-radius: 16px;
                    width: 100%;
                    max-width: 800px;
                    margin: 2rem auto;
                    animation: slideUp 0.3s ease;
        }
                    @keyframes slideUp {
                      from {opacity: 0; transform: translateY(20px); }
                    to {opacity: 1; transform: translateY(0); }
        }
                    .modal-header {
                      padding: 1.5rem 2rem;
                    border-bottom: 1px solid var(--border);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
        }
                    .modal-header h3 {
                      font - size: 1.2rem;
                    font-weight: 600;
        }
                    .modal-close {
                      width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    border: 1px solid var(--border);
                    background: transparent;
                    color: var(--text-dim);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1rem;
                    transition: all 0.2s;
        }
                    .modal-close:hover {
                      border - color: var(--danger);
                    color: var(--danger);
        }
                    .modal-body {
                      padding: 2rem;
                    max-height: 70vh;
                    overflow-y: auto;
        }
                    .modal-footer {
                      padding: 1.5rem 2rem;
                    border-top: 1px solid var(--border);
                    display: flex;
                    justify-content: flex-end;
                    gap: 0.75rem;
        }

                    /* Form */
                    .form-section {
                      margin - bottom: 2rem;
        }
                    .form-section-title {
                      font - size: 0.85rem;
                    font-weight: 600;
                    color: var(--accent);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 1rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 1px solid var(--border);
        }
                    .form-row {
                      display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    gap: 1rem;
                    margin-bottom: 1rem;
        }
                    .form-row-2 {
                      display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                    margin-bottom: 1rem;
        }
                    .form-group {
                      display: flex;
                    flex-direction: column;
                    gap: 0.4rem;
        }
                    .form-group label {
                      font - size: 0.8rem;
                    color: var(--text-dim);
                    font-weight: 500;
        }
                    .form-group input,
                    .form-group textarea {
                      background: var(--surface-2);
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    padding: 0.65rem 0.85rem;
                    color: var(--text);
                    font-family: var(--font);
                    font-size: 0.9rem;
                    transition: border-color 0.2s;
        }
                    .form-group input:focus,
                    .form-group textarea:focus {
                      outline: none;
                    border-color: var(--accent);
        }
                    .form-group textarea {
                      resize: vertical;
                    min-height: 70px;
        }

                    /* Upload area */
                    .upload-area {
                      border: 2px dashed var(--border);
                    border-radius: var(--radius);
                    padding: 2rem;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.3s;
                    background: var(--surface-2);
        }
                    .upload-area:hover {
                      border - color: var(--accent);
                    background: rgba(200, 169, 126, 0.05);
        }
                    .upload-area.dragover {
                      border - color: var(--accent);
                    background: rgba(200, 169, 126, 0.1);
        }
                    .upload-area i {
                      font - size: 2rem;
                    color: var(--text-dim);
                    margin-bottom: 1rem;
        }
                    .upload-area p {
                      color: var(--text-dim);
                    font-size: 0.9rem;
        }
                    .upload-preview {
                      margin - top: 1rem;
                    position: relative;
                    display: inline-block;
        }
                    .upload-preview img {
                      max - width: 200px;
                    border-radius: 8px;
                    border: 1px solid var(--border);
        }
                    .upload-preview .remove-img {
                      position: absolute;
                    top: -8px;
                    right: -8px;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: var(--danger);
                    color: #fff;
                    border: none;
                    cursor: pointer;
                    font-size: 0.7rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
        }

                    /* Toast */
                    .toast {
                      position: fixed;
                    bottom: 2rem;
                    right: 2rem;
                    background: var(--surface-2);
                    border: 1px solid var(--border);
                    border-radius: 10px;
                    padding: 1rem 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    font-size: 0.9rem;
                    z-index: 2000;
                    transform: translateY(100px);
                    opacity: 0;
                    transition: all 0.3s ease;
        }
                    .toast.show {
                      transform: translateY(0);
                    opacity: 1;
        }
                    .toast.success {border - color: var(--success); }
                    .toast.error {border - color: var(--danger); }

                    /* Tabs */
                    .admin-tabs {
                      display: flex;
                      gap: 0.5rem;
                      margin-bottom: 2rem;
                      border-bottom: 1px solid var(--border);
                      padding-bottom: 0;
                    }
                    .admin-tab {
                      display: flex;
                      align-items: center;
                      gap: 0.5rem;
                      padding: 0.75rem 1.5rem;
                      border: none;
                      background: transparent;
                      color: var(--text-dim);
                      font-family: var(--font);
                      font-size: 0.95rem;
                      font-weight: 500;
                      cursor: pointer;
                      border-bottom: 2px solid transparent;
                      margin-bottom: -1px;
                      transition: all 0.2s ease;
                      border-radius: 8px 8px 0 0;
                    }
                    .admin-tab:hover { color: var(--accent); }
                    .admin-tab.active {
                      color: var(--accent);
                      border-bottom-color: var(--accent);
                      background: rgba(200,169,126,0.07);
                    }

                    /* Guest card */
                    .guest-admin-card {
                      background: var(--surface);
                      border: 1px solid var(--border);
                      border-radius: var(--radius);
                      padding: 1.5rem;
                      display: flex;
                      align-items: center;
                      gap: 1rem;
                    }
                    .guest-admin-avatar {
                      width: 56px;
                      height: 56px;
                      border-radius: 50%;
                      background: var(--surface-2);
                      border: 1px solid var(--border);
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      color: var(--accent);
                      font-size: 1.4rem;
                      flex-shrink: 0;
                      overflow: hidden;
                    }
                    .guest-admin-avatar img { width:100%; height:100%; object-fit:cover; }
                    .guest-admin-info { flex: 1; min-width: 0; }
                    .guest-admin-name { font-weight: 600; font-size: 1rem; color: var(--text); margin-bottom: 0.2rem; }
                    .guest-admin-title { font-size: 0.82rem; color: var(--text-dim); margin-bottom: 0.4rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                    .guest-admin-eps { font-size: 0.78rem; color: var(--accent); }

                    /* Category Chips */
                    .category-chips {
                      display: flex;
                      gap: 0.6rem;
                      flex-wrap: wrap;
                      margin-top: 0.4rem;
                    }
                    .category-chip {
                      display: inline-flex;
                      align-items: center;
                      gap: 0.45rem;
                      padding: 0.45rem 1rem;
                      border-radius: 50px;
                      border: 1.5px solid var(--border);
                      background: var(--surface-2);
                      color: var(--text-dim);
                      font-size: 0.85rem;
                      font-weight: 500;
                      cursor: pointer;
                      transition: all 0.2s ease;
                      user-select: none;
                      letter-spacing: 0.3px;
                    }
                    .category-chip:hover {
                      border-color: var(--accent);
                      color: var(--accent);
                      background: rgba(200, 169, 126, 0.08);
                    }
                    .category-chip.selected {
                      border-color: var(--accent);
                      background: rgba(200, 169, 126, 0.15);
                      color: var(--accent);
                      box-shadow: 0 0 0 1px rgba(200,169,126,0.3);
                    }
                    .category-chip .chip-icon {
                      font-size: 0.75rem;
                      opacity: 0;
                      transform: scale(0.5);
                      transition: all 0.2s ease;
                    }
                    .category-chip.selected .chip-icon {
                      opacity: 1;
                      transform: scale(1);
                    }
                    /* Responsive */
                    @media (max-width: 768px) {
          .episodes - grid {grid - template - columns: 1fr; }
                    .stats-row {flex - direction: column; }
                    .form-row {grid - template - columns: 1fr; }
                    .form-row-2 {grid - template - columns: 1fr; }
                    .admin-header {flex - direction: column; gap: 1rem; align-items: stretch; }
        }
                  </style>
                </head>
                <body>
                  <!-- Top Bar -->
                  <div class="topbar">
                    <div class="topbar-left">
                      <img src="/static/images/qad-logo.png" alt="QAD" class="topbar-logo">
                        <h1>QAD Admin</h1>
                    </div>
                    <div class="topbar-right">
                      <a href="/?lang=ckb"><i class="fas fa-external-link-alt"></i> View Site</a>
                    </div>
                  </div>

                  <div class="admin-container">
                    <!-- Stats -->
                    <div class="stats-row">
                      <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-podcast"></i></div>
                        <div>
                          <div class="stat-value" id="statEpCount">${eps.length}</div>
                          <div class="stat-label">Total Episodes</div>
                        </div>
                      </div>
                      <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-users"></i></div>
                        <div>
                          <div class="stat-value" id="statGuestCount">${allGuests.length}</div>
                          <div class="stat-label">Total Guests</div>
                        </div>
                      </div>
                      <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-tags"></i></div>
                        <div>
                          <div class="stat-value">3</div>
                          <div class="stat-label">Categories</div>
                        </div>
                      </div>
                    </div>

                    <!-- Tab Navigation -->
                    <div class="admin-tabs">
                      <button class="admin-tab active" id="tabEpisodes" onclick="switchTab('episodes')">
                        <i class="fas fa-podcast"></i> Episodes
                      </button>
                      <button class="admin-tab" id="tabGuests" onclick="switchTab('guests')">
                        <i class="fas fa-users"></i> Guests
                      </button>
                    </div>

                    <!-- Episodes Panel -->
                    <div id="panelEpisodes">
                      <div class="admin-header">
                        <h2><i class="fas fa-th-list"></i> Episodes</h2>
                        <button class="btn btn-accent" onclick="openModal()">
                          <i class="fas fa-plus"></i> Add New Episode
                        </button>
                      </div>
                      <div class="episodes-grid" id="episodesGrid">
                        <!-- Filled by JS -->
                      </div>
                    </div>

                    <!-- Guests Panel -->
                    <div id="panelGuests" style="display:none">
                      <div class="admin-header">
                        <h2><i class="fas fa-users"></i> Guests</h2>
                        <button class="btn btn-accent" onclick="openGuestModal()">
                          <i class="fas fa-plus"></i> Add New Guest
                        </button>
                      </div>
                      <div class="episodes-grid" id="guestsGrid">
                        <!-- Filled by JS -->
                      </div>
                    </div>
                  </div>

                  <!-- Modal -->
                  <div class="modal-overlay" id="modalOverlay">
                    <div class="modal">
                      <div class="modal-header">
                        <h3 id="modalTitle">Add New Episode</h3>
                        <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                      </div>
                      <div class="modal-body">
                        <form id="episodeForm">
                          <input type="hidden" id="editId" value="">

                            <!-- Thumbnail -->
                            <div class="form-section">
                              <div class="form-section-title"><i class="fas fa-image"></i> Episode Thumbnail</div>
                              <div class="upload-area" id="uploadArea" onclick="document.getElementById('fileInput').click()">
                                <i class="fas fa-cloud-upload-alt"></i>
                                <p>Click or drag an image here to upload</p>
                                <input type="file" id="fileInput" accept="image/*" style="display:none" onchange="handleFileSelect(event)">
                              </div>
                              <div class="upload-preview" id="uploadPreview" style="display:none">
                                <img id="previewImg" src="" alt="Preview">
                                  <button type="button" class="remove-img" onclick="removeImage()"><i class="fas fa-times"></i></button>
                              </div>
                              <input type="hidden" id="thumbnailUrl" value="">
                            </div>

                            <!-- Basic Info -->
                            <div class="form-section">
                              <div class="form-section-title"><i class="fas fa-info-circle"></i> Basic Info</div>
                              <div class="form-row-2">
                                <div class="form-group">
                                  <label>YouTube Video ID</label>
                                  <input type="text" id="youtubeId" placeholder="e.g. NjBNyeM3HPo" required>
                                </div>
                                <div class="form-group">
                                  <label>Date</label>
                                  <input type="date" id="epDate" required>
                                </div>
                              </div>
                              <div class="form-row-2">
                                <div class="form-group">
                                  <label>Duration</label>
                                  <input type="text" id="duration" placeholder="e.g. 1:15:00" required>
                                </div>
                                <div class="form-group">
                                  <label>Categories</label>
                                  <div class="category-chips" id="categoryChips">
                                    <div class="category-chip" data-value="culture" onclick="toggleChip(this)">
                                      <i class="fas fa-check chip-icon"></i>
                                      <i class="fas fa-globe-asia"></i> Culture
                                    </div>
                                    <div class="category-chip" data-value="history" onclick="toggleChip(this)">
                                      <i class="fas fa-check chip-icon"></i>
                                      <i class="fas fa-landmark"></i> History
                                    </div>
                                    <div class="category-chip" data-value="religion" onclick="toggleChip(this)">
                                      <i class="fas fa-check chip-icon"></i>
                                      <i class="fas fa-moon"></i> Religion
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <!-- Titles -->
                            <div class="form-section">
                              <div class="form-section-title"><i class="fas fa-heading"></i> Title</div>
                              <div class="form-row">
                                <div class="form-group">
                                  <label>Kurdish (کوردی)</label>
                                  <input type="text" id="titleCkb" placeholder="ناوی ئەلقە" required>
                                </div>
                                <div class="form-group">
                                  <label>Arabic (عربي)</label>
                                  <input type="text" id="titleAr" placeholder="عنوان الحلقة">
                                </div>
                                <div class="form-group">
                                  <label>English</label>
                                  <input type="text" id="titleEn" placeholder="Episode title">
                                </div>
                              </div>
                            </div>

                            <!-- Guest Name -->
                            <div class="form-section">
                              <div class="form-section-title"><i class="fas fa-user"></i> Guest Name</div>
                              <div class="form-row">
                                <div class="form-group">
                                  <label>Kurdish (کوردی)</label>
                                  <input type="text" id="guestCkb" placeholder="ناوی میوان">
                                </div>
                                <div class="form-group">
                                  <label>Arabic (عربي)</label>
                                  <input type="text" id="guestAr" placeholder="اسم الضيف">
                                </div>
                                <div class="form-group">
                                  <label>English</label>
                                  <input type="text" id="guestEn" placeholder="Guest name">
                                </div>
                              </div>
                            </div>

                            <!-- Description -->
                            <div class="form-section">
                              <div class="form-section-title"><i class="fas fa-align-left"></i> Description</div>
                              <div class="form-group" style="margin-bottom:1rem">
                                <label>Kurdish (کوردی)</label>
                                <textarea id="descCkb" placeholder="وەسفی ئەلقە"></textarea>
                              </div>
                              <div class="form-group" style="margin-bottom:1rem">
                                <label>Arabic (عربي)</label>
                                <textarea id="descAr" placeholder="وصف الحلقة"></textarea>
                              </div>
                              <div class="form-group">
                                <label>English</label>
                                <textarea id="descEn" placeholder="Episode description"></textarea>
                              </div>
                            </div>
                        </form>
                      </div>
                      <div class="modal-footer">
                        <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
                        <button class="btn btn-accent" onclick="saveEpisode()">
                          <i class="fas fa-save"></i> Save Episode
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Guest Modal -->
                  <div class="modal-overlay" id="guestModalOverlay">
                    <div class="modal">
                      <div class="modal-header">
                        <h3 id="guestModalTitle">Add New Guest</h3>
                        <button class="modal-close" onclick="closeGuestModal()"><i class="fas fa-times"></i></button>
                      </div>
                      <div class="modal-body">
                        <form id="guestForm">
                          <input type="hidden" id="gEditId" value="">

                          <!-- Photo Upload -->
                          <div class="form-section">
                            <div class="form-section-title"><i class="fas fa-camera"></i> Guest Photo</div>
                            <div style="display:flex;align-items:center;gap:1.5rem;">
                              <!-- Avatar Preview -->
                              <div id="gPhotoPreviewWrap" style="width:90px;height:90px;border-radius:50%;background:var(--surface-2);border:2px solid var(--border);display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;font-size:2.5rem;color:var(--text-dim);transition:border-color 0.2s;">
                                <i class="fas fa-user" id="gPhotoIcon"></i>
                                <img id="gPhotoPreviewImg" src="" alt="Preview" style="display:none;width:100%;height:100%;object-fit:cover;">
                              </div>
                              <!-- Upload area -->
                              <div style="flex:1;">
                                <div class="upload-area" id="gPhotoUploadArea" onclick="document.getElementById('gPhotoInput').click()" style="padding:1rem;">
                                  <i class="fas fa-cloud-upload-alt"></i>
                                  <p>Click or drag a photo here</p>
                                  <input type="file" id="gPhotoInput" accept="image/*" style="display:none" onchange="handleGuestPhoto(event)">
                                </div>
                                <button type="button" id="gPhotoRemoveBtn" onclick="removeGuestPhoto()" style="display:none;margin-top:0.5rem;background:transparent;border:1px solid var(--danger);color:var(--danger);padding:0.3rem 0.75rem;border-radius:6px;cursor:pointer;font-size:0.8rem;"><i class="fas fa-times"></i> Remove photo</button>
                              </div>
                            </div>
                          </div>

                          <!-- Name -->
                          <div class="form-section">
                            <div class="form-section-title"><i class="fas fa-user"></i> Guest Name</div>
                            <div class="form-row">
                              <div class="form-group">
                                <label>Kurdish (کوردی)</label>
                                <input type="text" id="gNameCkb" placeholder="ناوی میوان" required>
                              </div>
                              <div class="form-group">
                                <label>Arabic (عربي)</label>
                                <input type="text" id="gNameAr" placeholder="اسم الضيف">
                              </div>
                              <div class="form-group">
                                <label>English</label>
                                <input type="text" id="gNameEn" placeholder="Guest full name">
                              </div>
                            </div>
                          </div>

                          <!-- Title / Role -->
                          <div class="form-section">
                            <div class="form-section-title"><i class="fas fa-id-badge"></i> Title / Role</div>
                            <div class="form-row">
                              <div class="form-group">
                                <label>Kurdish (کوردی)</label>
                                <input type="text" id="gTitleCkb" placeholder="بوار یان ناونیشان">
                              </div>
                              <div class="form-group">
                                <label>Arabic (عربي)</label>
                                <input type="text" id="gTitleAr" placeholder="المجال أو اللقب">
                              </div>
                              <div class="form-group">
                                <label>English</label>
                                <input type="text" id="gTitleEn" placeholder="Field or title">
                              </div>
                            </div>
                          </div>

                          <!-- Bio -->
                          <div class="form-section">
                            <div class="form-section-title"><i class="fas fa-align-left"></i> Biography</div>
                            <div class="form-group" style="margin-bottom:1rem">
                              <label>Kurdish (کوردی)</label>
                              <textarea id="gBioCkb" placeholder="زانیاری دەربارەی میوان"></textarea>
                            </div>
                            <div class="form-group" style="margin-bottom:1rem">
                              <label>Arabic (عربي)</label>
                              <textarea id="gBioAr" placeholder="معلومات عن الضيف"></textarea>
                            </div>
                            <div class="form-group">
                              <label>English</label>
                              <textarea id="gBioEn" placeholder="Guest biography"></textarea>
                            </div>
                          </div>

                          <!-- Social Links -->
                          <div class="form-section">
                            <div class="form-section-title"><i class="fas fa-link"></i> Social Links (optional)</div>
                            <div class="form-row">
                              <div class="form-group">
                                <label><i class="fab fa-twitter" style="color:#1da1f2"></i> Twitter / X</label>
                                <input type="url" id="gTwitter" placeholder="https://twitter.com/...">
                              </div>
                              <div class="form-group">
                                <label><i class="fab fa-linkedin" style="color:#0a66c2"></i> LinkedIn</label>
                                <input type="url" id="gLinkedin" placeholder="https://linkedin.com/in/...">
                              </div>
                              <div class="form-group">
                                <label><i class="fas fa-globe" style="color:var(--accent)"></i> Website</label>
                                <input type="url" id="gWebsite" placeholder="https://...">
                              </div>
                            </div>
                          </div>
                        </form>
                      </div>
                      <div class="modal-footer">
                        <button class="btn btn-outline" onclick="closeGuestModal()">Cancel</button>
                        <button class="btn btn-accent" onclick="saveGuest()">
                          <i class="fas fa-save"></i> Save Guest
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Toast -->
                  <div class="toast" id="toast">
                    <i class="fas fa-check-circle" id="toastIcon"></i>
                    <span id="toastMsg">Success!</span>
                  </div>

                  <script>
                    let currentThumbnail = '';

                    // Toggle category chip
                    function toggleChip(chip) {
                      chip.classList.toggle('selected');
                    }

                    // Toast
                    function showToast(msg, type = 'success') {
          const toast = document.getElementById('toast');
                    const icon = document.getElementById('toastIcon');
                    const msgEl = document.getElementById('toastMsg');
                    toast.className = 'toast ' + type;
                    icon.className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
                    msgEl.textContent = msg;
                    toast.classList.add('show');
          setTimeout(() => toast.classList.remove('show'), 3000);
        }

                    // Load episodes
                    async function loadEpisodes() {
          const res = await fetch('/api/episodes');
                    const eps = await res.json();
                    renderEpisodes(eps);
                    document.getElementById('statEpCount').textContent = eps.length;
        }

                    function renderEpisodes(eps) {
          const grid = document.getElementById('episodesGrid');
                    if (eps.length === 0) {
                      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:4rem;color:var(--text-dim)"><i class="fas fa-inbox" style="font-size:3rem;margin-bottom:1rem;display:block"></i>No episodes yet. Click "Add New Episode" to get started.</div>';
                    return;
          }
          grid.innerHTML = eps.map(ep => {
            const thumbHtml = ep.thumbnail
                    ? '<img src="' + ep.thumbnail + '" alt="' + (ep.title.en || '') + '">'
                      : '<i class="fas fa-play-circle"></i>';
                      return '<div class="ep-card">'
                        + '<div class="ep-card-thumb">' + thumbHtml
                          + '<span class="ep-card-yt"><i class="fab fa-youtube"></i> ' + ep.youtubeId + '</span>'
                          + '</div>'
                        + '<div class="ep-card-body">'
                          + '<div class="ep-card-number">Episode ' + ep.number + ' &bull; Season ' + ep.season + '</div>'
                          + '<div class="ep-card-title">' + (ep.title.ckb || ep.title.en) + '</div>'
                          + '<div class="ep-card-guest"><i class="fas fa-user"></i> ' + (ep.guestName.ckb || ep.guestName.en || '&mdash;') + '</div>'
                          + '<div class="ep-card-meta"><span><i class="far fa-calendar"></i> ' + ep.date + '</span><span><i class="far fa-clock"></i> ' + ep.duration + '</span></div>'
                          + '</div>'
                        + '<div class="ep-card-actions">'
                          + '<button class="btn btn-outline btn-sm edit-btn" data-id="' + ep.id + '"><i class="fas fa-edit"></i> Edit</button>'
                          + '<button class="btn btn-danger btn-sm delete-btn" data-id="' + ep.id + '"><i class="fas fa-trash"></i> Delete</button>'
                          + '</div>'
                        + '</div>';
          }).join('');

          // Attach event listeners
          grid.querySelectorAll('.edit-btn').forEach(btn => {
                        btn.addEventListener('click', () => editEpisode(btn.dataset.id));
          });
          grid.querySelectorAll('.delete-btn').forEach(btn => {
                        btn.addEventListener('click', () => deleteEpisode(btn.dataset.id));
          });
        }

                      // Modal
                      function openModal(editData) {
                        document.getElementById('modalOverlay').classList.add('active');
                      if (editData) {
                        document.getElementById('modalTitle').textContent = 'Edit Episode';
                      document.getElementById('editId').value = editData.id;
                      document.getElementById('youtubeId').value = editData.youtubeId || '';
                      document.getElementById('epDate').value = editData.date || '';
                      document.getElementById('duration').value = editData.duration || '';
                      document.querySelectorAll('#categoryChips .category-chip').forEach(chip => {
                        const val = chip.dataset.value;
                        if ((editData.themes || []).includes(val)) {
                          chip.classList.add('selected');
                        } else {
                          chip.classList.remove('selected');
                        }
                      });
                      document.getElementById('titleCkb').value = editData.title?.ckb || '';
                      document.getElementById('titleAr').value = editData.title?.ar || '';
                      document.getElementById('titleEn').value = editData.title?.en || '';
                      document.getElementById('guestCkb').value = editData.guestName?.ckb || '';
                      document.getElementById('guestAr').value = editData.guestName?.ar || '';
                      document.getElementById('guestEn').value = editData.guestName?.en || '';
                      document.getElementById('descCkb').value = editData.description?.ckb || '';
                      document.getElementById('descAr').value = editData.description?.ar || '';
                      document.getElementById('descEn').value = editData.description?.en || '';
                      currentThumbnail = editData.thumbnail || '';
                      if (currentThumbnail) {
                        document.getElementById('previewImg').src = currentThumbnail;
                      document.getElementById('uploadPreview').style.display = 'inline-block';
                      document.getElementById('uploadArea').style.display = 'none';
            }
          } else {
                        document.getElementById('modalTitle').textContent = 'Add New Episode';
                      document.getElementById('episodeForm').reset();
                      document.getElementById('editId').value = '';
                      currentThumbnail = '';
                      document.getElementById('uploadPreview').style.display = 'none';
                      document.getElementById('uploadArea').style.display = 'block';
                      document.querySelectorAll('#categoryChips .category-chip').forEach(chip => chip.classList.remove('selected'));
          }
        }

                      function closeModal() {
                        document.getElementById('modalOverlay').classList.remove('active');
        }

                      // Image upload
                      const uploadArea = document.getElementById('uploadArea');
        uploadArea.addEventListener('dragover', (e) => {e.preventDefault(); uploadArea.classList.add('dragover'); });
        uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
        uploadArea.addEventListener('drop', (e) => {
                        e.preventDefault();
                      uploadArea.classList.remove('dragover');
                      if (e.dataTransfer.files.length) uploadFile(e.dataTransfer.files[0]);
        });

                      function handleFileSelect(e) {
          if (e.target.files.length) uploadFile(e.target.files[0]);
        }

                      async function uploadFile(file) {
          const formData = new FormData();
                      formData.append('image', file);
                      try {
            const res = await fetch('/api/upload', {method: 'POST', body: formData });
                      const data = await res.json();
                      if (data.success) {
                        currentThumbnail = data.url;
                      document.getElementById('previewImg').src = data.url;
                      document.getElementById('uploadPreview').style.display = 'inline-block';
                      document.getElementById('uploadArea').style.display = 'none';
                      showToast('Image uploaded!');
            } else {
                        showToast(data.error || 'Upload failed', 'error');
            }
          } catch (err) {
                        showToast('Upload failed: ' + err.message, 'error');
          }
        }

                      function removeImage() {
                        currentThumbnail = '';
                      document.getElementById('uploadPreview').style.display = 'none';
                      document.getElementById('uploadArea').style.display = 'block';
                      document.getElementById('fileInput').value = '';
        }

                      // Save
                      async function saveEpisode() {
          const editId = document.getElementById('editId').value;
                      const payload = {
                        title: {
                        ckb: document.getElementById('titleCkb').value,
                      ar: document.getElementById('titleAr').value,
                      en: document.getElementById('titleEn').value
            },
                      description: {
                        ckb: document.getElementById('descCkb').value,
                      ar: document.getElementById('descAr').value,
                      en: document.getElementById('descEn').value
            },
                      guestName: {
                        ckb: document.getElementById('guestCkb').value,
                      ar: document.getElementById('guestAr').value,
                      en: document.getElementById('guestEn').value
            },
                      youtubeId: document.getElementById('youtubeId').value,
                      date: document.getElementById('epDate').value,
                      duration: document.getElementById('duration').value,
            themes: [...document.querySelectorAll('#categoryChips .category-chip.selected')].map(c => c.dataset.value),
                      thumbnail: currentThumbnail,
                      chapters: []
          };

                      if (!payload.youtubeId) {
                        showToast('YouTube ID is required', 'error');
                      return;
          }

                      try {
                        let res;
                      if (editId) {
                        res = await fetch('/api/episodes/' + editId, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(payload)
                        });
            } else {
                        res = await fetch('/api/episodes', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(payload)
                        });
            }
                      const data = await res.json();
                      if (data.success) {
                        showToast(editId ? 'Episode updated!' : 'Episode added!');
                      closeModal();
                      loadEpisodes();
            } else {
                        showToast(data.error || 'Save failed', 'error');
            }
          } catch (err) {
                        showToast('Save failed: ' + err.message, 'error');
          }
        }

                      // Edit
                      async function editEpisode(id) {
          const res = await fetch('/api/episode/' + id);
                      const ep = await res.json();
                      openModal(ep);
        }

                      // Delete
                      async function deleteEpisode(id) {
          if (!confirm('Are you sure you want to delete this episode?')) return;
                      try {
            const res = await fetch('/api/episodes/' + id, {method: 'DELETE' });
                      const data = await res.json();
                      if (data.success) {
                        showToast('Episode deleted!');
                      loadEpisodes();
            } else {
                        showToast(data.error || 'Delete failed', 'error');
            }
          } catch (err) {
                        showToast('Delete failed: ' + err.message, 'error');
          }
        }

                      // Init
                      loadEpisodes();
                      loadGuestsList();

                      // Guest photo state
                      let currentGuestPhoto = '';

                      function handleGuestPhoto(e) {
                        const file = e.target.files[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                          currentGuestPhoto = evt.target.result;
                          document.getElementById('gPhotoPreviewImg').src = currentGuestPhoto;
                          document.getElementById('gPhotoPreviewImg').style.display = 'block';
                          document.getElementById('gPhotoIcon').style.display = 'none';
                          document.getElementById('gPhotoRemoveBtn').style.display = 'inline-block';
                          document.getElementById('gPhotoUploadArea').style.display = 'none';
                          document.getElementById('gPhotoPreviewWrap').style.borderColor = 'var(--accent)';
                        };
                        reader.readAsDataURL(file);
                      }

                      function removeGuestPhoto() {
                        currentGuestPhoto = '';
                        document.getElementById('gPhotoPreviewImg').style.display = 'none';
                        document.getElementById('gPhotoPreviewImg').src = '';
                        document.getElementById('gPhotoIcon').style.display = '';
                        document.getElementById('gPhotoRemoveBtn').style.display = 'none';
                        document.getElementById('gPhotoUploadArea').style.display = '';
                        document.getElementById('gPhotoInput').value = '';
                        document.getElementById('gPhotoPreviewWrap').style.borderColor = '';
                      }

                      // Drag & drop for guest photo
                      const gUpload = document.getElementById('gPhotoUploadArea');
                      gUpload.addEventListener('dragover', (e) => { e.preventDefault(); gUpload.classList.add('dragover'); });
                      gUpload.addEventListener('dragleave', () => gUpload.classList.remove('dragover'));
                      gUpload.addEventListener('drop', (e) => {
                        e.preventDefault();
                        gUpload.classList.remove('dragover');
                        if (e.dataTransfer.files.length) {
                          const fakeEvent = { target: { files: e.dataTransfer.files } };
                          handleGuestPhoto(fakeEvent);
                        }
                      });

                      // Tab switcher
                      function switchTab(tab) {
                        document.getElementById('panelEpisodes').style.display = tab === 'episodes' ? '' : 'none';
                        document.getElementById('panelGuests').style.display = tab === 'guests' ? '' : 'none';
                        document.getElementById('tabEpisodes').classList.toggle('active', tab === 'episodes');
                        document.getElementById('tabGuests').classList.toggle('active', tab === 'guests');
                      }

                      // ===== GUESTS =====
                      async function loadGuestsList() {
                        const res = await fetch('/api/guests-list');
                        const gs = await res.json();
                        renderGuests(gs);
                        document.getElementById('statGuestCount').textContent = gs.length;
                      }

                      function renderGuests(gs) {
                        const grid = document.getElementById('guestsGrid');
                        if (!gs.length) {
                          grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:4rem;color:var(--text-dim)"><i class="fas fa-users" style="font-size:3rem;margin-bottom:1rem;display:block"></i>No guests yet. Click "Add New Guest" to get started.</div>';
                          return;
                        }
                        grid.innerHTML = gs.map(g => {
                          const avatar = g.image
                            ? '<img src="' + g.image + '" alt="' + (g.name.en || '') + '">'
                            : '<i class="fas fa-user"></i>';
                          return '<div class="guest-admin-card">'
                            + '<div class="guest-admin-avatar">' + avatar + '</div>'
                            + '<div class="guest-admin-info">'
                              + '<div class="guest-admin-name">' + (g.name.en || g.name.ckb || '—') + '</div>'
                              + '<div class="guest-admin-title">' + (g.title.en || g.title.ckb || '—') + '</div>'
                              + '<div class="guest-admin-eps"><i class="fas fa-podcast"></i> ' + (g.episodeIds || []).length + ' episode(s)</div>'
                            + '</div>'
                            + '<div class="ep-card-actions">'
                              + '<button class="btn btn-outline btn-sm g-edit-btn" data-id="' + g.id + '"><i class="fas fa-edit"></i> Edit</button>'
                              + '<button class="btn btn-danger btn-sm g-del-btn" data-id="' + g.id + '"><i class="fas fa-trash"></i> Delete</button>'
                            + '</div>'
                          + '</div>';
                        }).join('');

                        grid.querySelectorAll('.g-edit-btn').forEach(btn => btn.addEventListener('click', () => editGuest(btn.dataset.id)));
                        grid.querySelectorAll('.g-del-btn').forEach(btn => btn.addEventListener('click', () => deleteGuest(btn.dataset.id)));
                      }

                      function openGuestModal(data) {
                        document.getElementById('guestModalOverlay').classList.add('active');
                        // Reset photo
                        currentGuestPhoto = '';
                        document.getElementById('gPhotoPreviewImg').style.display = 'none';
                        document.getElementById('gPhotoPreviewImg').src = '';
                        document.getElementById('gPhotoIcon').style.display = '';
                        document.getElementById('gPhotoRemoveBtn').style.display = 'none';
                        document.getElementById('gPhotoUploadArea').style.display = '';
                        if (data) {
                          document.getElementById('guestModalTitle').textContent = 'Edit Guest';
                          document.getElementById('gEditId').value = data.id;
                          document.getElementById('gNameCkb').value = data.name?.ckb || '';
                          document.getElementById('gNameAr').value = data.name?.ar || '';
                          document.getElementById('gNameEn').value = data.name?.en || '';
                          document.getElementById('gTitleCkb').value = data.title?.ckb || '';
                          document.getElementById('gTitleAr').value = data.title?.ar || '';
                          document.getElementById('gTitleEn').value = data.title?.en || '';
                          document.getElementById('gBioCkb').value = data.bio?.ckb || '';
                          document.getElementById('gBioAr').value = data.bio?.ar || '';
                          document.getElementById('gBioEn').value = data.bio?.en || '';
                          document.getElementById('gTwitter').value = data.socialLinks?.twitter || '';
                          document.getElementById('gLinkedin').value = data.socialLinks?.linkedin || '';
                          document.getElementById('gWebsite').value = data.socialLinks?.website || '';
                          if (data.image) {
                            currentGuestPhoto = data.image;
                            document.getElementById('gPhotoPreviewImg').src = data.image;
                            document.getElementById('gPhotoPreviewImg').style.display = 'block';
                            document.getElementById('gPhotoIcon').style.display = 'none';
                            document.getElementById('gPhotoRemoveBtn').style.display = 'inline-block';
                            document.getElementById('gPhotoUploadArea').style.display = 'none';
                          }
                        } else {
                          document.getElementById('guestModalTitle').textContent = 'Add New Guest';
                          document.getElementById('guestForm').reset();
                          document.getElementById('gEditId').value = '';
                        }
                      }

                      function closeGuestModal() {
                        document.getElementById('guestModalOverlay').classList.remove('active');
                      }

                      async function saveGuest() {
                        const editId = document.getElementById('gEditId').value;
                        const payload = {
                          name: { ckb: document.getElementById('gNameCkb').value, ar: document.getElementById('gNameAr').value, en: document.getElementById('gNameEn').value },
                          title: { ckb: document.getElementById('gTitleCkb').value, ar: document.getElementById('gTitleAr').value, en: document.getElementById('gTitleEn').value },
                          bio: { ckb: document.getElementById('gBioCkb').value, ar: document.getElementById('gBioAr').value, en: document.getElementById('gBioEn').value },
                          highlights: { ckb: [], ar: [], en: [] },
                          quotes: { ckb: [], ar: [], en: [] },
                          image: currentGuestPhoto,
                          socialLinks: {
                            twitter: document.getElementById('gTwitter').value,
                            linkedin: document.getElementById('gLinkedin').value,
                            website: document.getElementById('gWebsite').value
                          }
                        };
                        if (!payload.name.ckb && !payload.name.en) { showToast('Guest name is required', 'error'); return; }
                        try {
                          let res;
                          if (editId) {
                            res = await fetch('/api/guests/' + editId, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                          } else {
                            res = await fetch('/api/guests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                          }
                          const data = await res.json();
                          if (data.success) {
                            showToast(editId ? 'Guest updated!' : 'Guest added!');
                            closeGuestModal();
                            loadGuestsList();
                          } else { showToast(data.error || 'Save failed', 'error'); }
                        } catch (err) { showToast('Save failed: ' + err.message, 'error'); }
                      }

                      async function editGuest(id) {
                        const res = await fetch('/api/guest-detail/' + id);
                        const g = await res.json();
                        openGuestModal(g);
                      }

                      async function deleteGuest(id) {
                        if (!confirm('Delete this guest?')) return;
                        try {
                          const res = await fetch('/api/guests/' + id, { method: 'DELETE' });
                          const data = await res.json();
                          if (data.success) { showToast('Guest deleted!'); loadGuestsList(); }
                          else { showToast(data.error || 'Delete failed', 'error'); }
                        } catch (err) { showToast('Delete failed: ' + err.message, 'error'); }
                      }
                  </script>
                </body>
              </html>
              `)
})

export default app
