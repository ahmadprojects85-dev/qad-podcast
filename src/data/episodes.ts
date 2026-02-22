// QAD Podcast - Episodes Data
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

export interface Episode {
  id: string;
  number: number;
  season: number;
  title: {
    ckb: string;
    ar: string;
    en: string;
  };
  description: {
    ckb: string;
    ar: string;
    en: string;
  };
  guestId: string;
  guestName: {
    ckb: string;
    ar: string;
    en: string;
  };
  date: string;
  duration: string;
  youtubeId: string;
  spotifyUrl?: string;
  applePodcastUrl?: string;
  themes: string[];
  chapters: {
    time: string;
    title: {
      ckb: string;
      ar: string;
      en: string;
    };
  }[];
  thumbnail?: string;
}

const getDataPath = () => {
  try {
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = dirname(__filename)
    return resolve(__dirname, 'episodes.json')
  } catch {
    return resolve(process.cwd(), 'src', 'data', 'episodes.json')
  }
}

export const loadEpisodes = (): Episode[] => {
  try {
    const data = readFileSync(getDataPath(), 'utf-8')
    return JSON.parse(data)
  } catch (e) {
    console.error('Failed to load episodes.json:', e)
    return []
  }
}

export const saveEpisodes = (eps: Episode[]): void => {
  writeFileSync(getDataPath(), JSON.stringify(eps, null, 2), 'utf-8')
}

// Live-read on every access
export const getEpisodes = (): Episode[] => loadEpisodes()

// Keep backward compat - but now reads fresh data
export let episodes: Episode[] = loadEpisodes()

// Refresh the in-memory reference
export const refreshEpisodes = () => {
  episodes = loadEpisodes()
  return episodes
}

export const getEpisodesByTheme = (theme: string): Episode[] =>
  getEpisodes().filter(ep => ep.themes.includes(theme));

export const getEpisodesBySeason = (season: number): Episode[] =>
  getEpisodes().filter(ep => ep.season === season);

export const getEpisodeBySlug = (slug: string): Episode | undefined =>
  getEpisodes().find(ep => ep.id === slug);

export const getLatestEpisode = (): Episode => getEpisodes()[0];

export const getAllThemes = (): string[] =>
  [...new Set(getEpisodes().flatMap(ep => ep.themes))];

export const getAllSeasons = (): number[] =>
  [...new Set(getEpisodes().map(ep => ep.season))].sort((a, b) => b - a);
